import base64
import hashlib
import hmac
import secrets
import time
import uuid
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
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
    access_token: str  # Google OAuth access token from useGoogleLogin implicit flow


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
            detail=f"This account was created with {user.oauth_provider.title()}. Please use the {user.oauth_provider.title()} sign-in button.",
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
    Verify a Google OAuth access token (from useGoogleLogin implicit flow),
    fetch the user profile from Google's userinfo endpoint,
    then find-or-create the user and return our own JWT pair.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google sign-in is not configured on this server.",
        )

    # Fetch user profile via Google's userinfo endpoint — validates the access token implicitly.
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {payload.access_token}"},
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Google token. Please try signing in again.",
        )

    info = resp.json()

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


# ── LinkedIn OAuth helpers ──────────────────────────────────────────────────────

def _linkedin_make_state() -> str:
    nonce = secrets.token_hex(16)
    ts = str(int(time.time()))
    sig = hmac.new(settings.SECRET_KEY.encode(), f"{nonce}:{ts}".encode(), hashlib.sha256).hexdigest()
    raw = f"{nonce}:{ts}:{sig}"
    return base64.urlsafe_b64encode(raw.encode()).decode()


def _linkedin_verify_state(state: str, max_age: int = 600) -> bool:
    try:
        raw = base64.urlsafe_b64decode(state.encode()).decode()
        nonce, ts, sig = raw.split(":", 2)
        if int(time.time()) - int(ts) > max_age:
            return False
        expected = hmac.new(settings.SECRET_KEY.encode(), f"{nonce}:{ts}".encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(sig, expected)
    except Exception:
        return False


# ── LinkedIn OAuth routes ───────────────────────────────────────────────────────

@router.get("/linkedin")
async def linkedin_auth() -> RedirectResponse:
    if not settings.LINKEDIN_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LinkedIn sign-in is not configured on this server.",
        )
    params = urlencode({
        "response_type": "code",
        "client_id": settings.LINKEDIN_CLIENT_ID,
        "redirect_uri": settings.LINKEDIN_CALLBACK_URL,
        "state": _linkedin_make_state(),
        "scope": "openid profile email",
    })
    return RedirectResponse(
        url=f"https://www.linkedin.com/oauth/v2/authorization?{params}",
        status_code=307,
    )


@router.get("/microsoft")
async def microsoft_auth() -> RedirectResponse:
    if not settings.MICROSOFT_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Microsoft sign-in is not configured on this server.",
        )
    params = urlencode({
        "client_id": settings.MICROSOFT_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": settings.MICROSOFT_CALLBACK_URL,
        "response_mode": "query",
        "scope": "openid profile email offline_access User.Read",
        "state": _linkedin_make_state(),
    })
    return RedirectResponse(
        url=f"https://login.microsoftonline.com/{settings.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize?{params}",
        status_code=307,
    )


@router.get("/microsoft/callback")
async def microsoft_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> RedirectResponse:
    base = (settings.FRONTEND_URL or "http://localhost:3000").rstrip("/")
    frontend_cb = base + "/login"

    if error:
        return RedirectResponse(url=f"{frontend_cb}?error=cancelled", status_code=302)

    if not state or not _linkedin_verify_state(state):
        return RedirectResponse(url=f"{frontend_cb}?error=invalid_state", status_code=302)

    if not code:
        return RedirectResponse(url=f"{frontend_cb}?error=auth_failed", status_code=302)

    # Exchange authorization code for Microsoft tokens
    async with httpx.AsyncClient(timeout=10) as client:
        token_resp = await client.post(
            f"https://login.microsoftonline.com/{settings.MICROSOFT_TENANT_ID}/oauth2/v2.0/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.MICROSOFT_CALLBACK_URL,
                "client_id": settings.MICROSOFT_CLIENT_ID,
                "client_secret": settings.MICROSOFT_CLIENT_SECRET,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

    if token_resp.status_code != 200:
        return RedirectResponse(url=f"{frontend_cb}?error=auth_failed", status_code=302)

    ms_access_token: str = token_resp.json().get("access_token", "")
    if not ms_access_token:
        return RedirectResponse(url=f"{frontend_cb}?error=auth_failed", status_code=302)

    # Fetch user profile from Microsoft Graph
    async with httpx.AsyncClient(timeout=10) as client:
        profile_resp = await client.get(
            "https://graph.microsoft.com/v1.0/me",
            headers={"Authorization": f"Bearer {ms_access_token}"},
        )

    if profile_resp.status_code != 200:
        return RedirectResponse(url=f"{frontend_cb}?error=auth_failed", status_code=302)

    profile = profile_resp.json()
    microsoft_id: str | None = profile.get("id")
    # Microsoft accounts may use "mail" (O365) or "userPrincipalName" (personal/AAD)
    email: str | None = profile.get("mail") or profile.get("userPrincipalName")
    name: str = profile.get("displayName") or ""

    # userPrincipalName can be a federated format; skip if it contains a hash
    if email and "#EXT#" in email:
        email = profile.get("mail")

    if not microsoft_id:
        return RedirectResponse(url=f"{frontend_cb}?error=auth_failed", status_code=302)

    if not email:
        return RedirectResponse(url=f"{frontend_cb}?error=no_email", status_code=302)

    # 1) Look up by Microsoft provider ID (returning user)
    result = await db.execute(
        select(User).where(
            User.oauth_provider == "microsoft",
            User.oauth_provider_id == microsoft_id,
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        # 2) Look up by email — existing account → link to Microsoft
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if user:
            user.oauth_provider = "microsoft"
            user.oauth_provider_id = microsoft_id
            user.email_verified = True
            await db.flush()
        else:
            # 3) Brand-new user — create account via Microsoft
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                name=name or email.split("@")[0],
                hashed_password=None,
                oauth_provider="microsoft",
                oauth_provider_id=microsoft_id,
                email_verified=True,
            )
            db.add(user)
            await db.flush()

    if not user.is_active:
        return RedirectResponse(url=f"{frontend_cb}?error=account_disabled", status_code=302)

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return RedirectResponse(
        url=f"{frontend_cb}?access_token={access_token}&refresh_token={refresh_token}",
        status_code=302,
    )


@router.get("/linkedin/callback")
async def linkedin_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> RedirectResponse:
    base = (settings.FRONTEND_URL or "http://localhost:3000").rstrip("/")
    frontend_cb = base + "/login"

    if error:
        return RedirectResponse(url=f"{frontend_cb}?error=cancelled", status_code=302)

    if not state or not _linkedin_verify_state(state):
        return RedirectResponse(url=f"{frontend_cb}?error=invalid_state", status_code=302)

    if not code:
        return RedirectResponse(url=f"{frontend_cb}?error=auth_failed", status_code=302)

    # Exchange authorization code for LinkedIn access token
    async with httpx.AsyncClient(timeout=10) as client:
        token_resp = await client.post(
            "https://www.linkedin.com/oauth/v2/accessToken",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.LINKEDIN_CALLBACK_URL,
                "client_id": settings.LINKEDIN_CLIENT_ID,
                "client_secret": settings.LINKEDIN_CLIENT_SECRET,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

    if token_resp.status_code != 200:
        return RedirectResponse(url=f"{frontend_cb}?error=auth_failed", status_code=302)

    linkedin_access_token: str = token_resp.json().get("access_token", "")
    if not linkedin_access_token:
        return RedirectResponse(url=f"{frontend_cb}?error=auth_failed", status_code=302)

    # Fetch user profile via LinkedIn OpenID Connect userinfo endpoint
    async with httpx.AsyncClient(timeout=10) as client:
        profile_resp = await client.get(
            "https://api.linkedin.com/v2/userinfo",
            headers={"Authorization": f"Bearer {linkedin_access_token}"},
        )

    if profile_resp.status_code != 200:
        return RedirectResponse(url=f"{frontend_cb}?error=auth_failed", status_code=302)

    profile = profile_resp.json()
    linkedin_id: str | None = profile.get("sub")
    email: str | None = profile.get("email")
    name: str = profile.get("name") or profile.get("given_name") or ""

    if not linkedin_id:
        return RedirectResponse(url=f"{frontend_cb}?error=auth_failed", status_code=302)

    if not email:
        return RedirectResponse(url=f"{frontend_cb}?error=no_email", status_code=302)

    # 1) Look up by LinkedIn provider ID (returning user)
    result = await db.execute(
        select(User).where(
            User.oauth_provider == "linkedin",
            User.oauth_provider_id == linkedin_id,
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        # 2) Look up by email — existing account → link to LinkedIn
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if user:
            user.oauth_provider = "linkedin"
            user.oauth_provider_id = linkedin_id
            user.email_verified = True
            await db.flush()
        else:
            # 3) Brand-new user — create account via LinkedIn
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                name=name or email.split("@")[0],
                hashed_password=None,
                oauth_provider="linkedin",
                oauth_provider_id=linkedin_id,
                email_verified=True,
            )
            db.add(user)
            await db.flush()

    if not user.is_active:
        return RedirectResponse(url=f"{frontend_cb}?error=account_disabled", status_code=302)

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return RedirectResponse(
        url=f"{frontend_cb}?access_token={access_token}&refresh_token={refresh_token}",
        status_code=302,
    )
