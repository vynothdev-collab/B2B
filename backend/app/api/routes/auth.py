import uuid

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User

router = APIRouter()


# ── Schemas ────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class GoogleAuthRequest(BaseModel):
    credential: str  # Google ID token (JWT) returned by GoogleLogin GIS component


class UserInfo(BaseModel):
    id: str
    email: str
    name: str
    role: str
    enterprise_id:     str | None = None
    allocated_credits: int = 0
    used_credits:      int = 0
    remaining_credits: int = 0


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserInfo


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── Helpers ────────────────────────────────────────────────────────────────────

def _token_response(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=UserInfo(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            enterprise_id=user.enterprise_id,
            allocated_credits=user.allocated_credits,
            used_credits=user.used_credits,
            remaining_credits=user.allocated_credits - user.used_credits,
        ),
    )


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest, db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )

    user = User(
        id=str(uuid.uuid4()),
        email=payload.email,
        name=payload.name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    await db.flush()
    return _token_response(user)


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest, db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    # OAuth-only accounts have no password — give a clear hint
    if user and user.oauth_provider and not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This account was created with {user.oauth_provider.title()}. Please use the Google sign-in button.",
        )

    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled. Please contact support.",
        )

    return _token_response(user)


@router.post("/google", response_model=TokenResponse)
async def google_auth(
    payload: GoogleAuthRequest, db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    """
    Verify a Google ID token issued by @react-oauth/google on the frontend,
    then find-or-create the user and return our own JWT pair.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google sign-in is not configured on this server.",
        )

    # Verify the Google ID token (credential) via Google's tokeninfo endpoint.
    # This validates the JWT signature, expiry, and audience without needing google-auth lib.
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": payload.credential},
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Google token. Please try signing in again.",
        )

    info = resp.json()

    # Confirm the token was issued for OUR application — prevents token substitution attacks
    if info.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google token was not issued for this application.",
        )

    google_id: str | None = info.get("sub")
    email: str | None = info.get("email")
    email_verified: bool = info.get("email_verified") in (True, "true")
    name: str = info.get("name") or info.get("given_name") or ""

    if not google_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google token is missing user identifier.",
        )

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your Google account does not have an email address.",
        )

    if not email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your Google account email is not verified.",
        )

    # 1) Look up by Google provider ID (fastest — returning user)
    result = await db.execute(
        select(User).where(
            User.oauth_provider == "google",
            User.oauth_provider_id == google_id,
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        # 2) Look up by email — existing email/password account → link to Google
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if user:
            user.oauth_provider = "google"
            user.oauth_provider_id = google_id
            user.email_verified = True
            await db.flush()
        else:
            # 3) Brand-new user — create account via Google
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                name=name or email.split("@")[0],
                hashed_password=None,
                oauth_provider="google",
                oauth_provider_id=google_id,
                email_verified=True,
            )
            db.add(user)
            await db.flush()

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled. Please contact support.",
        )

    return _token_response(user)


@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh_access_token(
    payload: RefreshRequest, db: AsyncSession = Depends(get_db)
) -> AccessTokenResponse:
    data = decode_token(payload.refresh_token)
    if not data or data.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user_id: str | None = data.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    return AccessTokenResponse(access_token=create_access_token(user.id))


@router.post("/logout")
async def logout() -> dict:
    return {"message": "Logged out successfully"}
