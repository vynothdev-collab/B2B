import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import case, func, or_, select
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


class PagedEnterprises(BaseModel):
    items:     list[EnterpriseResponse]
    total:     int
    page:      int
    page_size: int


class EnterpriseStats(BaseModel):
    total:         int
    active:        int
    total_users:   int
    total_credits: int


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


async def _serialize_many(
    db: AsyncSession, ents: list[Enterprise]
) -> list[EnterpriseResponse]:
    if not ents:
        return []
    ent_ids = [e.id for e in ents]

    count_rows = (
        await db.execute(
            select(User.enterprise_id, func.count(User.id))
            .where(User.enterprise_id.in_(ent_ids))
            .group_by(User.enterprise_id)
        )
    ).all()
    counts: dict[str, int] = {row[0]: row[1] for row in count_rows}

    admin_rows = (
        await db.execute(
            select(User)
            .where(
                User.enterprise_id.in_(ent_ids),
                User.role == UserRole.ENTERPRISE_ADMIN,
            )
            .order_by(User.created_at.asc())
        )
    ).scalars().all()
    admins: dict[str, User] = {}
    for u in admin_rows:
        if u.enterprise_id and u.enterprise_id not in admins:
            admins[u.enterprise_id] = u

    return [
        EnterpriseResponse(
            id=e.id,
            name=e.name,
            industry=e.industry,
            website=e.website,
            country=e.country,
            size=e.size,
            phone=e.phone,
            plan=e.plan,
            credits=e.credits,
            status=e.status,
            notes=e.notes,
            created_at=e.created_at,
            user_count=counts.get(e.id, 0),
            admin_name=admins[e.id].name if e.id in admins else None,
            admin_email=admins[e.id].email if e.id in admins else None,
        )
        for e in ents
    ]


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


@router.get("", response_model=PagedEnterprises)
async def list_enterprises(
    page:      int = Query(default=1, ge=1),
    page_size: int = Query(default=8, ge=1, le=100),
    q:         str | None = Query(default=None),
    status_:   str | None = Query(default=None, alias="status"),
    db: AsyncSession = Depends(get_db),
) -> PagedEnterprises:
    stmt = select(Enterprise)
    count_stmt = select(func.count(Enterprise.id))

    if status_ and status_ != "all":
        if status_ not in EnterpriseStatus.ALL:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Status must be one of: {', '.join(sorted(EnterpriseStatus.ALL))}",
            )
        stmt = stmt.where(Enterprise.status == status_)
        count_stmt = count_stmt.where(Enterprise.status == status_)

    if q:
        like = f"%{q.strip()}%"
        pred = or_(
            Enterprise.name.ilike(like),
            Enterprise.industry.ilike(like),
            Enterprise.country.ilike(like),
        )
        stmt = stmt.where(pred)
        count_stmt = count_stmt.where(pred)

    total = (await db.execute(count_stmt)).scalar_one()

    stmt = (
        stmt.order_by(Enterprise.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    enterprises = (await db.execute(stmt)).scalars().all()

    return PagedEnterprises(
        items=await _serialize_many(db, list(enterprises)),
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/stats", response_model=EnterpriseStats)
async def enterprise_stats(db: AsyncSession = Depends(get_db)) -> EnterpriseStats:
    row = (
        await db.execute(
            select(
                func.count(Enterprise.id),
                func.coalesce(
                    func.sum(
                        case((Enterprise.status == EnterpriseStatus.ACTIVE, 1), else_=0)
                    ),
                    0,
                ),
                func.coalesce(func.sum(Enterprise.credits), 0),
            )
        )
    ).one()
    total_users = (
        await db.execute(
            select(func.count(User.id)).where(User.enterprise_id.is_not(None))
        )
    ).scalar_one()

    return EnterpriseStats(
        total=int(row[0]),
        active=int(row[1]),
        total_users=int(total_users),
        total_credits=int(row[2]),
    )


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
