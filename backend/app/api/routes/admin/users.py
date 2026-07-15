from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, field_validator
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_super_admin
from app.models.enterprise import Enterprise
from app.models.user import User, UserRole

router = APIRouter(dependencies=[Depends(require_super_admin)])


# ── Schemas ───────────────────────────────────────────────────────────────────

class CustomerResponse(BaseModel):
    id:              str
    name:            str
    email:           str
    role:            str
    phone:           str | None
    is_active:       bool
    enterprise_id:   str | None
    enterprise_name: str | None
    created_at:      datetime


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


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _load_user(db: AsyncSession, user_id: str) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return user


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
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[CustomerResponse])
async def list_customers(
    role:          str | None = Query(default=None),
    enterprise_id: str | None = Query(default=None),
    q:             str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> list[CustomerResponse]:
    stmt = select(User)

    if role is not None:
        if role not in UserRole.ALL:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Role must be one of: {', '.join(sorted(UserRole.ALL))}",
            )
        stmt = stmt.where(User.role == role)

    if enterprise_id is not None:
        stmt = stmt.where(User.enterprise_id == enterprise_id)

    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(or_(User.name.ilike(like), User.email.ilike(like)))

    stmt = stmt.order_by(User.created_at.desc())
    users = (await db.execute(stmt)).scalars().all()
    return [await _serialize(db, u) for u in users]


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
