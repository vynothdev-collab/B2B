import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import hash_password, require_enterprise_admin, require_enterprise_member
from app.models.enterprise import Enterprise
from app.models.user import User, UserRole

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class EnterpriseMeResponse(BaseModel):
    id:         str
    name:       str
    industry:   str | None
    website:    str | None
    country:    str | None
    size:       str | None
    phone:      str | None
    plan:       str
    credits:    int
    status:     str
    notes:      str | None
    created_at: datetime


class EnterpriseMemberResponse(BaseModel):
    id:                str
    name:              str
    email:             str
    role:              str
    phone:             str | None
    is_active:         bool
    created_at:        datetime
    allocated_credits: int
    used_credits:      int
    remaining_credits: int


class CreateEnterpriseUserRequest(BaseModel):
    name:     str
    email:    EmailStr
    password: str
    phone:    str | None = None

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


class UpdateStatusRequest(BaseModel):
    is_active: bool


class AllocateCreditsRequest(BaseModel):
    credits: int


class EnterpriseCreditMember(BaseModel):
    id:                str
    name:              str
    email:             str
    allocated_credits: int
    used_credits:      int
    remaining_credits: int


class EnterpriseCreditSummary(BaseModel):
    enterprise_pool:          int
    total_allocated_to_users: int
    total_used_by_users:      int
    members:                  list[EnterpriseCreditMember]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _to_member(user: User) -> EnterpriseMemberResponse:
    return EnterpriseMemberResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        phone=user.phone,
        is_active=user.is_active,
        created_at=user.created_at,
        allocated_credits=user.allocated_credits,
        used_credits=user.used_credits,
        remaining_credits=user.allocated_credits - user.used_credits,
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=EnterpriseMeResponse)
async def get_my_enterprise(
    user: User = Depends(require_enterprise_member),
    db: AsyncSession = Depends(get_db),
) -> EnterpriseMeResponse:
    ent = (
        await db.execute(select(Enterprise).where(Enterprise.id == user.enterprise_id))
    ).scalar_one_or_none()
    if not ent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enterprise not found",
        )
    return EnterpriseMeResponse(
        id=ent.id,
        name=ent.name,
        industry=ent.industry,
        website=ent.website,
        country=ent.country,
        size=ent.size,
        phone=ent.phone,
        plan=ent.plan,
        credits=ent.credits,
        status=ent.status,
        notes=ent.notes,
        created_at=ent.created_at,
    )


@router.get("/users", response_model=list[EnterpriseMemberResponse])
async def list_enterprise_users(
    user: User = Depends(require_enterprise_admin),
    db: AsyncSession = Depends(get_db),
) -> list[EnterpriseMemberResponse]:
    stmt = (
        select(User)
        .where(User.enterprise_id == user.enterprise_id)
        .order_by(User.created_at.desc())
    )
    members = (await db.execute(stmt)).scalars().all()
    return [_to_member(m) for m in members]


@router.post(
    "/users",
    response_model=EnterpriseMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_enterprise_user(
    payload: CreateEnterpriseUserRequest,
    user: User = Depends(require_enterprise_admin),
    db: AsyncSession = Depends(get_db),
) -> EnterpriseMemberResponse:
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An account with email '{payload.email}' already exists.",
        )

    member = User(
        id=str(uuid.uuid4()),
        email=payload.email,
        name=payload.name,
        hashed_password=hash_password(payload.password),
        role=UserRole.ENTERPRISE_USER,
        phone=payload.phone,
        enterprise_id=user.enterprise_id,
    )
    db.add(member)
    await db.flush()
    await db.refresh(member)
    return _to_member(member)


@router.patch("/users/{user_id}/status", response_model=EnterpriseMemberResponse)
async def update_enterprise_user_status(
    user_id: str,
    payload: UpdateStatusRequest,
    user: User = Depends(require_enterprise_admin),
    db: AsyncSession = Depends(get_db),
) -> EnterpriseMemberResponse:
    member = (
        await db.execute(
            select(User).where(
                User.id == user_id,
                User.enterprise_id == user.enterprise_id,
            )
        )
    ).scalar_one_or_none()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in your enterprise",
        )

    member.is_active = payload.is_active
    await db.flush()
    await db.refresh(member)
    return _to_member(member)


@router.post("/users/{user_id}/allocate-credits", response_model=EnterpriseMemberResponse)
async def allocate_credits_to_member(
    user_id: str,
    payload: AllocateCreditsRequest,
    current_user: User = Depends(require_enterprise_admin),
    db: AsyncSession = Depends(get_db),
) -> EnterpriseMemberResponse:
    if payload.credits <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Credits must be greater than 0",
        )

    member = (
        await db.execute(
            select(User).where(
                User.id == user_id,
                User.enterprise_id == current_user.enterprise_id,
            )
        )
    ).scalar_one_or_none()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in your enterprise",
        )

    ent = (
        await db.execute(select(Enterprise).where(Enterprise.id == current_user.enterprise_id))
    ).scalar_one_or_none()
    if not ent or ent.credits < payload.credits:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Insufficient enterprise credits",
        )

    ent.credits -= payload.credits
    member.allocated_credits += payload.credits
    await db.flush()
    await db.refresh(member)
    return _to_member(member)


@router.get("/credit-summary", response_model=EnterpriseCreditSummary)
async def get_credit_summary(
    current_user: User = Depends(require_enterprise_member),
    db: AsyncSession = Depends(get_db),
) -> EnterpriseCreditSummary:
    ent = (
        await db.execute(select(Enterprise).where(Enterprise.id == current_user.enterprise_id))
    ).scalar_one_or_none()
    if not ent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enterprise not found",
        )

    members = (
        await db.execute(
            select(User)
            .where(User.enterprise_id == current_user.enterprise_id)
            .order_by(User.created_at.desc())
        )
    ).scalars().all()

    total_allocated = sum(m.allocated_credits for m in members)
    total_used = sum(m.used_credits for m in members)

    return EnterpriseCreditSummary(
        enterprise_pool=ent.credits,
        total_allocated_to_users=total_allocated,
        total_used_by_users=total_used,
        members=[
            EnterpriseCreditMember(
                id=m.id,
                name=m.name,
                email=m.email,
                allocated_credits=m.allocated_credits,
                used_credits=m.used_credits,
                remaining_credits=m.allocated_credits - m.used_credits,
            )
            for m in members
        ],
    )
