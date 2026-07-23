import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import case, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import hash_password, require_super_admin
from app.models.enterprise import Enterprise
from app.models.user import User, UserRole

router = APIRouter(dependencies=[Depends(require_super_admin)])


# ── Schemas ───────────────────────────────────────────────────────────────────

class CustomerResponse(BaseModel):
    id:                str
    name:              str
    email:             str
    role:              str
    phone:             str | None
    is_active:         bool
    enterprise_id:     str | None
    enterprise_name:   str | None
    created_at:        datetime
    allocated_credits: int = 0
    used_credits:      int = 0
    remaining_credits: int = 0


class AllocateCreditsRequest(BaseModel):
    credits: int


class UpdateRoleRequest(BaseModel):
    role:          str
    enterprise_id: str | None = None

    @field_validator("role")
    @classmethod
    def role_valid(cls, v: str) -> str:
        if v not in UserRole.ALL:
            raise ValueError(f"Role must be one of: {', '.join(sorted(UserRole.ALL))}")
        return v


class UpdateStatusRequest(BaseModel):
    is_active: bool


class CreateCustomerRequest(BaseModel):
    name:          str
    email:         EmailStr
    password:      str
    phone:         str | None = None
    role:          str = UserRole.INDIVIDUAL
    enterprise_id: str | None = None

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
        if v not in UserRole.ALL:
            raise ValueError(f"Role must be one of: {', '.join(sorted(UserRole.ALL))}")
        return v


class PagedCustomers(BaseModel):
    items:     list[CustomerResponse]
    total:     int
    page:      int
    page_size: int


class CustomerStats(BaseModel):
    total:     int
    active:    int
    suspended: int


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _load_user(db: AsyncSession, user_id: str) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return user


async def _serialize_many(db: AsyncSession, users: list[User]) -> list[CustomerResponse]:
    if not users:
        return []
    ent_ids = {u.enterprise_id for u in users if u.enterprise_id}
    ent_names: dict[str, str] = {}
    if ent_ids:
        rows = (
            await db.execute(
                select(Enterprise.id, Enterprise.name).where(Enterprise.id.in_(ent_ids))
            )
        ).all()
        ent_names = {row[0]: row[1] for row in rows}
    return [
        CustomerResponse(
            id=u.id,
            name=u.name,
            email=u.email,
            role=u.role,
            phone=u.phone,
            is_active=u.is_active,
            enterprise_id=u.enterprise_id,
            enterprise_name=ent_names.get(u.enterprise_id) if u.enterprise_id else None,
            created_at=u.created_at,
            allocated_credits=u.allocated_credits,
            used_credits=u.used_credits,
            remaining_credits=u.allocated_credits - u.used_credits,
        )
        for u in users
    ]


async def _serialize(db: AsyncSession, user: User) -> CustomerResponse:
    enterprise_name: str | None = None
    if user.enterprise_id:
        ent = (
            await db.execute(select(Enterprise).where(Enterprise.id == user.enterprise_id))
        ).scalar_one_or_none()
        enterprise_name = ent.name if ent else None

    return CustomerResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        phone=user.phone,
        is_active=user.is_active,
        enterprise_id=user.enterprise_id,
        enterprise_name=enterprise_name,
        created_at=user.created_at,
        allocated_credits=user.allocated_credits,
        used_credits=user.used_credits,
        remaining_credits=user.allocated_credits - user.used_credits,
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    payload: CreateCustomerRequest,
    db: AsyncSession = Depends(get_db),
) -> CustomerResponse:
    existing = (
        await db.execute(select(User).where(User.email == payload.email))
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )

    enterprise_id: str | None = None
    if payload.role in {UserRole.ENTERPRISE_ADMIN, UserRole.ENTERPRISE_USER}:
        if not payload.enterprise_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="enterprise_id is required when creating an enterprise user.",
            )
        ent = (
            await db.execute(select(Enterprise).where(Enterprise.id == payload.enterprise_id))
        ).scalar_one_or_none()
        if not ent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Enterprise not found",
            )
        enterprise_id = ent.id

    user = User(
        id=str(uuid.uuid4()),
        email=payload.email,
        name=payload.name,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        phone=payload.phone,
        enterprise_id=enterprise_id,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return await _serialize(db, user)


def _apply_customer_filters(
    stmt,
    *,
    role: str | None,
    roles: list[str] | None,
    enterprise_id: str | None,
    q: str | None,
    status_: str | None,
):
    if role is not None:
        if role not in UserRole.ALL:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Role must be one of: {', '.join(sorted(UserRole.ALL))}",
            )
        stmt = stmt.where(User.role == role)
    if roles:
        invalid = [r for r in roles if r not in UserRole.ALL]
        if invalid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid roles: {', '.join(invalid)}",
            )
        stmt = stmt.where(User.role.in_(roles))
    if enterprise_id is not None and enterprise_id != "all":
        stmt = stmt.where(User.enterprise_id == enterprise_id)
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(or_(User.name.ilike(like), User.email.ilike(like)))
    if status_ == "active":
        stmt = stmt.where(User.is_active.is_(True))
    elif status_ == "suspended":
        stmt = stmt.where(User.is_active.is_(False))
    return stmt


@router.get("", response_model=PagedCustomers)
async def list_customers(
    page:          int = Query(default=1, ge=1),
    page_size:     int = Query(default=8, ge=1, le=100),
    role:          str | None = Query(default=None),
    roles:         list[str] | None = Query(default=None),
    enterprise_id: str | None = Query(default=None),
    q:             str | None = Query(default=None),
    status_:       str | None = Query(default=None, alias="status"),
    db: AsyncSession = Depends(get_db),
) -> PagedCustomers:
    stmt = select(User)
    count_stmt = select(func.count(User.id))
    stmt = _apply_customer_filters(
        stmt, role=role, roles=roles, enterprise_id=enterprise_id, q=q, status_=status_
    )
    count_stmt = _apply_customer_filters(
        count_stmt, role=role, roles=roles, enterprise_id=enterprise_id, q=q, status_=status_
    )

    total = (await db.execute(count_stmt)).scalar_one()
    stmt = (
        stmt.order_by(User.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    users = (await db.execute(stmt)).scalars().all()

    return PagedCustomers(
        items=await _serialize_many(db, list(users)),
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/stats", response_model=CustomerStats)
async def customer_stats(
    role:  str | None = Query(default=None),
    roles: list[str] | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> CustomerStats:
    stmt = select(
        func.count(User.id),
        func.coalesce(func.sum(case((User.is_active.is_(True), 1), else_=0)), 0),
    )
    stmt = _apply_customer_filters(
        stmt, role=role, roles=roles, enterprise_id=None, q=None, status_=None
    )
    row = (await db.execute(stmt)).one()
    total = int(row[0])
    active = int(row[1])
    return CustomerStats(total=total, active=active, suspended=total - active)


@router.get("/{user_id}", response_model=CustomerResponse)
async def get_customer(
    user_id: str,
    db: AsyncSession = Depends(get_db),
) -> CustomerResponse:
    user = await _load_user(db, user_id)
    return await _serialize(db, user)


@router.patch("/{user_id}/role", response_model=CustomerResponse)
async def update_customer_role(
    user_id: str,
    payload: UpdateRoleRequest,
    db: AsyncSession = Depends(get_db),
) -> CustomerResponse:
    user = await _load_user(db, user_id)

    if payload.role == UserRole.INDIVIDUAL:
        user.role = UserRole.INDIVIDUAL
        user.enterprise_id = None
    else:
        if not payload.enterprise_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="enterprise_id is required when assigning an enterprise role.",
            )
        ent = (
            await db.execute(select(Enterprise).where(Enterprise.id == payload.enterprise_id))
        ).scalar_one_or_none()
        if not ent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Enterprise not found",
            )
        user.role = payload.role
        user.enterprise_id = ent.id

    await db.flush()
    await db.refresh(user)
    return await _serialize(db, user)


@router.patch("/{user_id}/status", response_model=CustomerResponse)
async def update_customer_status(
    user_id: str,
    payload: UpdateStatusRequest,
    db: AsyncSession = Depends(get_db),
) -> CustomerResponse:
    user = await _load_user(db, user_id)
    user.is_active = payload.is_active
    await db.flush()
    await db.refresh(user)
    return await _serialize(db, user)


@router.post("/{user_id}/allocate-credits", response_model=CustomerResponse)
async def allocate_credits_to_customer(
    user_id: str,
    payload: AllocateCreditsRequest,
    db: AsyncSession = Depends(get_db),
) -> CustomerResponse:
    if payload.credits <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Credits must be greater than 0",
        )
    user = await _load_user(db, user_id)
    user.allocated_credits += payload.credits
    await db.flush()
    await db.refresh(user)
    return await _serialize(db, user)
