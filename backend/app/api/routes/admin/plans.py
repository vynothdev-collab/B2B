from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_super_admin
from app.models.plan import Plan
from app.schemas.plan import CreatePlanPayload, EditPlanPayload, PlanOut

router = APIRouter(dependencies=[Depends(require_super_admin)])


class PagedPlansResponse(BaseModel):
    items: list[PlanOut]
    total: int
    page: int
    page_size: int


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


def _base_stmt(target: str | None):
    stmt = select(Plan).where(Plan.deleted_at.is_(None))
    if target:
        stmt = stmt.where(Plan.target == target)
    return stmt.order_by(Plan.created_at.desc())


@router.get("", response_model=PagedPlansResponse)
async def list_plans(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    target: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> PagedPlansResponse:
    stmt = _base_stmt(target)
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
