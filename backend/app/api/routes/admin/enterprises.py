import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import hash_password, require_super_admin
from app.models.enterprise import Enterprise, EnterpriseStatus
from app.models.user import User, UserRole

router = APIRouter(dependencies=[Depends(require_super_admin)])


# ── Schemas ───────────────────────────────────────────────────────────────────

class EnterpriseBase(BaseModel):
    name:     str
    industry: str | None = None
    website:  str | None = None
    country:  str | None = None
    size:     str | None = None
    phone:    str | None = None
    plan:     str        = "Free"
    credits:  int        = 0
    status:   str        = EnterpriseStatus.ACTIVE
    notes:    str | None = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()

    @field_validator("status")
    @classmethod
    def status_valid(cls, v: str) -> str:
        if v not in EnterpriseStatus.ALL:
            raise ValueError(f"Status must be one of: {', '.join(sorted(EnterpriseStatus.ALL))}")
        return v


class CreateEnterpriseRequest(EnterpriseBase):
    pass


class UpdateEnterpriseRequest(BaseModel):
    name:     str | None = None
    industry: str | None = None
    website:  str | None = None
    country:  str | None = None
    size:     str | None = None
    phone:    str | None = None
    plan:     str | None = None
    credits:  int | None = None
    status:   str | None = None
    notes:    str | None = None

    @field_validator("status")
    @classmethod
    def status_valid(cls, v: str | None) -> str | None:
        if v is not None and v not in EnterpriseStatus.ALL:
            raise ValueError(f"Status must be one of: {', '.join(sorted(EnterpriseStatus.ALL))}")
        return v


class EnterpriseResponse(BaseModel):
    id:          str
    name:        str
    industry:    str | None
    website:     str | None
    country:     str | None
    size:        str | None
    phone:       str | None
    plan:        str
    credits:     int
    status:      str
    notes:       str | None
    created_at:  datetime
    user_count:  int  = 0
    admin_name:  str | None = None
    admin_email: str | None = None


class CreateEnterpriseAdminRequest(BaseModel):
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


class EnterpriseAdminResponse(BaseModel):
    id:            str
    name:          str
    email:         str
    role:          str
    phone:         str | None
    enterprise_id: str


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _load_enterprise(db: AsyncSession, enterprise_id: str) -> Enterprise:
    result = await db.execute(select(Enterprise).where(Enterprise.id == enterprise_id))
    ent = result.scalar_one_or_none()
    if not ent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enterprise not found")
    return ent


async def _serialize(db: AsyncSession, ent: Enterprise) -> EnterpriseResponse:
    count_q = select(func.count(User.id)).where(User.enterprise_id == ent.id)
    user_count = (await db.execute(count_q)).scalar_one()

    admin_q = select(User).where(
        User.enterprise_id == ent.id,
        User.role == UserRole.ENTERPRISE_ADMIN,
    ).limit(1)
    admin = (await db.execute(admin_q)).scalar_one_or_none()

    return EnterpriseResponse(
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
        user_count=user_count,
        admin_name=admin.name if admin else None,
        admin_email=admin.email if admin else None,
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("", response_model=EnterpriseResponse, status_code=status.HTTP_201_CREATED)
async def create_enterprise(
    payload: CreateEnterpriseRequest,
    db: AsyncSession = Depends(get_db),
) -> EnterpriseResponse:
    ent = Enterprise(
        id=str(uuid.uuid4()),
        name=payload.name,
        industry=payload.industry,
        website=payload.website,
        country=payload.country,
        size=payload.size,
        phone=payload.phone,
        plan=payload.plan,
        credits=payload.credits,
        status=payload.status,
        notes=payload.notes,
    )
    db.add(ent)
    try:
        await db.flush()
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An enterprise with name '{payload.name}' already exists.",
        )
    await db.refresh(ent)
    return await _serialize(db, ent)


@router.get("", response_model=list[EnterpriseResponse])
async def list_enterprises(db: AsyncSession = Depends(get_db)) -> list[EnterpriseResponse]:
    result = await db.execute(select(Enterprise).order_by(Enterprise.created_at.desc()))
    enterprises = result.scalars().all()
    return [await _serialize(db, ent) for ent in enterprises]


@router.get("/{enterprise_id}", response_model=EnterpriseResponse)
async def get_enterprise(
    enterprise_id: str,
    db: AsyncSession = Depends(get_db),
) -> EnterpriseResponse:
    ent = await _load_enterprise(db, enterprise_id)
    return await _serialize(db, ent)


@router.patch("/{enterprise_id}", response_model=EnterpriseResponse)
async def update_enterprise(
    enterprise_id: str,
    payload: UpdateEnterpriseRequest,
    db: AsyncSession = Depends(get_db),
) -> EnterpriseResponse:
    ent = await _load_enterprise(db, enterprise_id)

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(ent, field, value)

    try:
        await db.flush()
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Update violates a uniqueness constraint (name).",
        )
    await db.refresh(ent)
    return await _serialize(db, ent)


@router.post(
    "/{enterprise_id}/admins",
    response_model=EnterpriseAdminResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_enterprise_admin(
    enterprise_id: str,
    payload: CreateEnterpriseAdminRequest,
    db: AsyncSession = Depends(get_db),
) -> EnterpriseAdminResponse:
    ent = await _load_enterprise(db, enterprise_id)

    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An account with email '{payload.email}' already exists.",
        )

    user = User(
        id=str(uuid.uuid4()),
        email=payload.email,
        name=payload.name,
        hashed_password=hash_password(payload.password),
        role=UserRole.ENTERPRISE_ADMIN,
        phone=payload.phone,
        enterprise_id=ent.id,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    return EnterpriseAdminResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        phone=user.phone,
        enterprise_id=user.enterprise_id or ent.id,
    )
