import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, model_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import (
    create_admin_access_token,
    create_admin_refresh_token,
    decode_admin_token,
    get_current_admin,
    hash_password,
    verify_password,
)
from app.models.admin_user import AdminUser

router = APIRouter()

ADMIN_ROLES = {"admin", "super_admin", "ADMIN", "SUPER_ADMIN"}


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminRefreshRequest(BaseModel):
    refresh_token: str


class AdminInfo(BaseModel):
    id: str
    email: str
    name: str
    role: str


class AdminProfileUpdateRequest(BaseModel):
    name: str
    current_password: str | None = None
    new_password: str | None = None

    @model_validator(mode="after")
    def check_password_pair(self) -> "AdminProfileUpdateRequest":
        if self.new_password and not self.current_password:
            raise ValueError("Current password is required to set a new password.")
        if self.new_password and len(self.new_password) < 8:
            raise ValueError("New password must be at least 8 characters.")
        return self


class AdminTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: AdminInfo


class AdminAccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=AdminTokenResponse)
async def admin_login(
    payload: AdminLoginRequest, db: AsyncSession = Depends(get_db)
) -> AdminTokenResponse:
    result = await db.execute(select(AdminUser).where(AdminUser.email == payload.email))
    admin = result.scalar_one_or_none()

    if not admin or not verify_password(payload.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled. Please contact support.",
        )
    if admin.role not in ADMIN_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required.",
        )

    return AdminTokenResponse(
        access_token=create_admin_access_token(admin.id),
        refresh_token=create_admin_refresh_token(admin.id),
        user=AdminInfo(id=admin.id, email=admin.email, name=admin.name, role=admin.role),
    )


@router.post("/refresh", response_model=AdminAccessTokenResponse)
async def admin_refresh_token(
    payload: AdminRefreshRequest, db: AsyncSession = Depends(get_db)
) -> AdminAccessTokenResponse:
    data = decode_admin_token(payload.refresh_token)
    if not data or data.get("type") != "admin_refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    admin_id: str | None = data.get("sub")
    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    result = await db.execute(select(AdminUser).where(AdminUser.id == admin_id))
    admin = result.scalar_one_or_none()
    if not admin or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin not found or inactive",
        )

    return AdminAccessTokenResponse(access_token=create_admin_access_token(admin.id))


@router.post("/logout")
async def admin_logout() -> dict:
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=AdminInfo)
async def admin_me(current_admin: AdminUser = Depends(get_current_admin)) -> AdminInfo:
    return AdminInfo(
        id=current_admin.id,
        email=current_admin.email,
        name=current_admin.name,
        role=current_admin.role,
    )


@router.patch("/me", response_model=AdminInfo)
async def update_admin_me(
    payload: AdminProfileUpdateRequest,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> AdminInfo:
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Name cannot be empty.")

    if payload.new_password:
        if not verify_password(payload.current_password or "", current_admin.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect.",
            )
        current_admin.hashed_password = hash_password(payload.new_password)

    current_admin.name = name
    await db.commit()
    await db.refresh(current_admin)

    return AdminInfo(
        id=current_admin.id,
        email=current_admin.email,
        name=current_admin.name,
        role=current_admin.role,
    )
