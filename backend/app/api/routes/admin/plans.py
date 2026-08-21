from datetime import UTC, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_super_admin
from app.models.plan import Plan
from app.models.user_plan import UserPlan, UserPlanStatus
from app.schemas.plan import CreatePlanPayload, EditPlanPayload, PlanOut

router = APIRouter(dependencies=[Depends(require_super_admin)])


class PagedPlansResponse(BaseModel):
    items: list[PlanOut]
    total: int
    page: int
    page_size: int


class PlansSummaryResponse(BaseModel):
    total: int
    active_count: int
    inactive_count: int


class RevenueSummaryResponse(BaseModel):
    revenue_cents:        int
    active_subscriptions: int


def _period_start(period: str | None) -> datetime | None:
    if not period or period == "all":
        return None
    now = datetime.now(UTC)
    if period == "week":
        start = now - timedelta(days=now.weekday())
        return start.replace(hour=0, minute=0, second=0, microsecond=0)
    if period == "month":
        return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    return None


def _plan_out(p: Plan) -> PlanOut:
    return PlanOut(
        id=p.id,
        name=p.name,
        description=p.description,
        plan_type=p.plan_type,
        target=p.target,
        credits=p.credits,
        validity_days=p.validity_days,
        price_cents=p.price_cents,
        is_active=p.is_active,
        created_at=p.created_at,
    )


def _base_stmt(target: str | None, search: str | None = None, is_active: bool | None = None):
    stmt = select(Plan).where(Plan.deleted_at.is_(None))
    if target:
        stmt = stmt.where(Plan.target == target)
    if search:
        stmt = stmt.where(Plan.name.ilike(f"%{search}%"))
    if is_active is not None:
        stmt = stmt.where(Plan.is_active == is_active)
    return stmt.order_by(Plan.created_at.desc())


@router.get("/summary", response_model=PlansSummaryResponse)
async def get_plans_summary(
    target: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> PlansSummaryResponse:
    base = select(Plan).where(Plan.deleted_at.is_(None))
    if target:
        base = base.where(Plan.target == target)
    total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
    active_count = (
        await db.execute(select(func.count()).select_from(base.where(Plan.is_active.is_(True)).subquery()))
    ).scalar_one()
    inactive_count = (
        await db.execute(select(func.count()).select_from(base.where(Plan.is_active.is_(False)).subquery()))
    ).scalar_one()
    return PlansSummaryResponse(total=total, active_count=active_count, inactive_count=inactive_count)


@router.get("/revenue-summary", response_model=RevenueSummaryResponse)
async def get_revenue_summary(
    period: str | None = Query(default="month", description="'week', 'month', or 'all' — revenue window"),
    db: AsyncSession = Depends(get_db),
) -> RevenueSummaryResponse:
    revenue_stmt = (
        select(func.coalesce(func.sum(Plan.price_cents), 0))
        .select_from(UserPlan)
        .join(Plan, Plan.id == UserPlan.plan_id)
        .where(Plan.price_cents > 0)
    )
    start = _period_start(period)
    if start:
        revenue_stmt = revenue_stmt.where(UserPlan.purchased_at >= start)
    revenue_cents = (await db.execute(revenue_stmt)).scalar_one()

    active_stmt = (
        select(func.count(UserPlan.id))
        .select_from(UserPlan)
        .join(Plan, Plan.id == UserPlan.plan_id)
        .where(UserPlan.status == UserPlanStatus.ACTIVE, Plan.price_cents > 0)
    )
    active_subscriptions = (await db.execute(active_stmt)).scalar_one()

    return RevenueSummaryResponse(
        revenue_cents=int(revenue_cents),
        active_subscriptions=int(active_subscriptions),
    )


@router.get("", response_model=PagedPlansResponse)
async def list_plans(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    target: str | None = Query(default=None),
    search: str | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> PagedPlansResponse:
    stmt = _base_stmt(target, search, is_active)
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    rows = (
        await db.execute(stmt.offset((page - 1) * page_size).limit(page_size))
    ).scalars().all()
    return PagedPlansResponse(items=[_plan_out(p) for p in rows], total=total, page=page, page_size=page_size)


@router.post("", response_model=PlanOut, status_code=status.HTTP_201_CREATED)
async def create_plan(
    payload: CreatePlanPayload,
    db: AsyncSession = Depends(get_db),
) -> PlanOut:
    plan = Plan(
        name=payload.name,
        description=payload.description,
        plan_type=payload.plan_type,
        target=payload.target,
        credits=payload.credits,
        validity_days=payload.validity_days,
        price_cents=payload.price_cents,
    )
    db.add(plan)
    await db.flush()
    await db.refresh(plan)
    return _plan_out(plan)


@router.patch("/{plan_id}", response_model=PlanOut)
async def edit_plan(
    plan_id: str,
    payload: EditPlanPayload,
    db: AsyncSession = Depends(get_db),
) -> PlanOut:
    plan = (
        await db.execute(select(Plan).where(Plan.id == plan_id, Plan.deleted_at.is_(None)))
    ).scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    if payload.name is not None:
        plan.name = payload.name
    if payload.description is not None:
        plan.description = payload.description
    if payload.price_cents is not None:
        plan.price_cents = payload.price_cents
    if payload.credits is not None:
        plan.credits = payload.credits
    if payload.validity_days is not None:
        plan.validity_days = payload.validity_days

    await db.flush()
    await db.refresh(plan)
    return _plan_out(plan)


@router.patch("/{plan_id}/toggle", response_model=PlanOut)
async def toggle_plan(
    plan_id: str,
    db: AsyncSession = Depends(get_db),
) -> PlanOut:
    plan = (
        await db.execute(select(Plan).where(Plan.id == plan_id, Plan.deleted_at.is_(None)))
    ).scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    plan.is_active = not plan.is_active
    await db.flush()
    await db.refresh(plan)
    return _plan_out(plan)


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan(
    plan_id: str,
    db: AsyncSession = Depends(get_db),
) -> None:
    plan = (
        await db.execute(select(Plan).where(Plan.id == plan_id, Plan.deleted_at.is_(None)))
    ).scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    plan.deleted_at = datetime.now(timezone.utc)
    plan.is_active = False
    await db.flush()
