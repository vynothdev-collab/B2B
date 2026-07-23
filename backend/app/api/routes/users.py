from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, hash_password, verify_password
from app.models.search_log import SearchLog
from app.models.user import User

router = APIRouter()


class UserResponse(BaseModel):
    id:                str
    email:             EmailStr
    name:              str
    role:              str
    is_active:         bool
    enterprise_id:     str | None = None
    allocated_credits: int = 0
    used_credits:      int = 0
    remaining_credits: int = 0


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        is_active=current_user.is_active,
        enterprise_id=current_user.enterprise_id,
        allocated_credits=current_user.allocated_credits,
        used_credits=current_user.used_credits,
        remaining_credits=current_user.allocated_credits - current_user.used_credits,
    )


@router.post("/me/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    current_user.hashed_password = hash_password(body.new_password)
    await db.commit()
    return {"message": "Password updated successfully"}


# ── Usage history ─────────────────────────────────────────────────────────────

class DailyUsage(BaseModel):
    date:    str
    total:   int
    person:  int
    company: int
    agentic: int


class RecentSearch(BaseModel):
    id:          str
    search_type: str
    created_at:  datetime


class UsageHistoryResponse(BaseModel):
    daily_usage:  list[DailyUsage]
    recent:       list[RecentSearch]
    total_logs:   int


@router.get("/me/usage-history", response_model=UsageHistoryResponse)
async def get_usage_history(
    days: int = Query(default=30, ge=7, le=90),
    recent_limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UsageHistoryResponse:
    since = datetime.now(timezone.utc) - timedelta(days=days)

    # Daily aggregates — one DB round-trip with GROUP BY date + type
    agg_rows = (
        await db.execute(
            select(
                func.date(SearchLog.created_at).label("day"),
                SearchLog.search_type,
                func.count().label("cnt"),
            )
            .where(SearchLog.user_id == current_user.id)
            .where(SearchLog.created_at >= since)
            .group_by(func.date(SearchLog.created_at), SearchLog.search_type)
            .order_by(func.date(SearchLog.created_at))
        )
    ).all()

    # Build ordered daily buckets covering all `days` days
    day_map: dict[str, dict[str, int]] = {}
    for i in range(days):
        d = (datetime.now(timezone.utc) - timedelta(days=days - 1 - i)).strftime("%Y-%m-%d")
        day_map[d] = {"total": 0, "person": 0, "company": 0, "agentic": 0}
    for row in agg_rows:
        d = str(row.day)
        if d in day_map:
            day_map[d][row.search_type] = row.cnt
            day_map[d]["total"] += row.cnt

    daily_usage = [
        DailyUsage(date=d, total=v["total"], person=v["person"], company=v["company"], agentic=v["agentic"])
        for d, v in day_map.items()
    ]

    # Recent searches (lightweight — id + type + ts only)
    recent_rows = (
        await db.execute(
            select(SearchLog)
            .where(SearchLog.user_id == current_user.id)
            .order_by(SearchLog.created_at.desc())
            .limit(recent_limit)
        )
    ).scalars().all()

    # Total log count (lightweight scalar)
    total_logs = (
        await db.execute(
            select(func.count()).where(SearchLog.user_id == current_user.id)
        )
    ).scalar_one()

    return UsageHistoryResponse(
        daily_usage=daily_usage,
        recent=[RecentSearch(id=r.id, search_type=r.search_type, created_at=r.created_at) for r in recent_rows],
        total_logs=total_logs,
    )
