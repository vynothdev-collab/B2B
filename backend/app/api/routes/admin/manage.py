import uuid

from fastapi import APIRouter, Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import hash_password

router = APIRouter()

VALID_ROLES = {"admin", "super_admin"}

_api_key_header = APIKeyHeader(name="X-Admin-Api-Key", auto_error=False)


async def require_api_key(key: str | None = Security(_api_key_header)) -> None:
    if not settings.ADMIN_CREATE_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin creation API key is not configured on the server.",
        )
    if not key or key != settings.ADMIN_CREATE_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-Admin-Api-Key header.",
        )


class CreateAdminRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "admin"

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("role")
    @classmethod
    def role_valid(cls, v: str) -> str:
        if v not in VALID_ROLES:
            raise ValueError(f"Role must be one of: {', '.join(sorted(VALID_ROLES))}")
        return v


class AdminCreatedResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    message: str


@router.post(
    "/",
    response_model=AdminCreatedResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_api_key)],
    summary="Create an admin account",
    description=(
        "Creates a new admin or super_admin account. "
        "Requires the `X-Admin-Api-Key` header with the server-configured key. "
        "This endpoint is not exposed in the admin frontend."
    ),
)
async def create_admin(
    payload: CreateAdminRequest,
    db: AsyncSession = Depends(get_db),
) -> AdminCreatedResponse:
    from app.models.admin_user import AdminUser

    existing = await db.execute(select(AdminUser).where(AdminUser.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An admin account with email '{payload.email}' already exists.",
        )

    admin = AdminUser(
        id=str(uuid.uuid4()),
        email=payload.email,
        name=payload.name,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(admin)
    await db.commit()
    await db.refresh(admin)

    return AdminCreatedResponse(
        id=admin.id,
        name=admin.name,
        email=admin.email,
        role=admin.role,
        message=f"{admin.role} account created successfully.",
    )
