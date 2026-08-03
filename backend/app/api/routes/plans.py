from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.plan import Plan
from app.models.user import User, UserRole
from app.models.user_plan import UserPlan, UserPlanStatus
from app.schemas.plan import MyPlansResponse, PlanOut, UserPlanOut, CreditSummary
from app.services.credit_service import _maybe_activate_queued_plan

router = APIRouter()


def _user_plan_out(up: UserPlan, plan_name: str) -> UserPlanOut:
    return UserPlanOut(
        id=up.id,
        plan_id=up.plan_id,
        plan_name=plan_name,
        plan_type=up.plan_type,
        credits_total=up.credits_total,
        credits_remaining=up.credits_remaining,
        status=up.status,
        starts_at=up.starts_at,
        expires_at=up.expires_at,
        queue_position=up.queue_position,
        purchased_at=up.purchased_at,
    )


async def _sweep_expired(user_id: str, db: AsyncSession) -> None:
    now = datetime.now(timezone.utc)
    expired = (
        await db.execute(
            select(UserPlan).where(
                UserPlan.user_id == user_id,
                UserPlan.plan_type == "validity",
                UserPlan.status == UserPlanStatus.ACTIVE,
                UserPlan.expires_at <= now,
            )
        )
    ).scalars().all()
    for ep in expired:
        ep.status = UserPlanStatus.EXPIRED
    if expired:
        await db.flush()
        await _maybe_activate_queued_plan(user_id, db)


@router.get("/available", response_model=list[PlanOut])
async def list_available_plans(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[PlanOut]:
    if current_user.role == UserRole.ENTERPRISE_USER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Enterprise members cannot purchase plans directly.",
        )
    target = "enterprise" if current_user.role == UserRole.ENTERPRISE_ADMIN else "individual"
    rows = (
        await db.execute(
            select(Plan)
            .where(Plan.is_active == True, Plan.target == target, Plan.deleted_at.is_(None))
            .order_by(Plan.created_at.asc())
        )
    ).scalars().all()
    return [
        PlanOut(
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
        for p in rows
    ]


@router.get("/my", response_model=MyPlansResponse)
async def get_my_plans(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MyPlansResponse:
    await _sweep_expired(current_user.id, db)

    user_plans = (
        await db.execute(
            select(UserPlan, Plan.name)
            .join(Plan, Plan.id == UserPlan.plan_id)
            .where(UserPlan.user_id == current_user.id)
            .order_by(UserPlan.purchased_at.desc())
        )
    ).all()

    active_validity: UserPlanOut | None = None
    queued_validity: list[UserPlanOut] = []
    active_payg: list[UserPlanOut] = []

    now = datetime.now(timezone.utc)
    for up, plan_name in user_plans:
        if up.plan_type == "validity" and up.status == UserPlanStatus.ACTIVE:
            if active_validity is None:
                active_validity = _user_plan_out(up, plan_name)
        elif up.plan_type == "validity" and up.status == UserPlanStatus.QUEUED:
            queued_validity.append(_user_plan_out(up, plan_name))
        elif up.plan_type == "payg" and up.status == UserPlanStatus.ACTIVE:
            active_payg.append(_user_plan_out(up, plan_name))

    queued_validity.sort(key=lambda x: x.queue_position or 0)

    validity_rem = active_validity.credits_remaining if active_validity else 0
    payg_rem = sum(p.credits_remaining for p in active_payg)
    legacy_rem = max(0, current_user.allocated_credits - current_user.used_credits)

    return MyPlansResponse(
        active_validity=active_validity,
        queued_validity=queued_validity,
        active_payg=active_payg,
        summary=CreditSummary(
            validity_credits_remaining=validity_rem,
            payg_credits_remaining=payg_rem,
            legacy_credits_remaining=legacy_rem,
            total_remaining=validity_rem + payg_rem + legacy_rem,
        ),
    )


@router.post("/purchase/{plan_id}", response_model=UserPlanOut)
async def purchase_plan(
    plan_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserPlanOut:
    if current_user.role == UserRole.ENTERPRISE_USER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Enterprise members cannot purchase plans directly.",
        )

    plan = (await db.execute(select(Plan).where(Plan.id == plan_id))).scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    if not plan.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Plan is not available")

    expected_target = "enterprise" if current_user.role == UserRole.ENTERPRISE_ADMIN else "individual"
    if plan.target != expected_target:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This plan is not available for your account type",
        )

    now = datetime.now(timezone.utc)

    if plan.plan_type == "payg":
        user_plan = UserPlan(
            user_id=current_user.id,
            plan_id=plan.id,
            plan_type="payg",
            credits_total=plan.credits,
            credits_remaining=plan.credits,
            status=UserPlanStatus.ACTIVE,
            starts_at=now,
            expires_at=None,
            queue_position=None,
        )
        db.add(user_plan)
        await db.flush()
        await db.refresh(user_plan)
        return _user_plan_out(user_plan, plan.name)

    # validity plan
    existing_active = (
        await db.execute(
            select(UserPlan).where(
                UserPlan.user_id == current_user.id,
                UserPlan.plan_type == "validity",
                UserPlan.status == UserPlanStatus.ACTIVE,
            )
        )
    ).scalar_one_or_none()

    if existing_active:
        max_pos_row = (
            await db.execute(
                select(UserPlan.queue_position)
                .where(
                    UserPlan.user_id == current_user.id,
                    UserPlan.plan_type == "validity",
                    UserPlan.status == UserPlanStatus.QUEUED,
                )
                .order_by(UserPlan.queue_position.desc())
                .limit(1)
            )
        ).scalar_one_or_none()
        next_pos = (max_pos_row or 0) + 1
        user_plan = UserPlan(
            user_id=current_user.id,
            plan_id=plan.id,
            plan_type="validity",
            credits_total=plan.credits,
            credits_remaining=plan.credits,
            status=UserPlanStatus.QUEUED,
            starts_at=None,
            expires_at=None,
            queue_position=next_pos,
        )
    else:
        user_plan = UserPlan(
            user_id=current_user.id,
            plan_id=plan.id,
            plan_type="validity",
            credits_total=plan.credits,
            credits_remaining=plan.credits,
            status=UserPlanStatus.ACTIVE,
            starts_at=now,
            expires_at=now + timedelta(days=plan.validity_days),
            queue_position=None,
        )

    db.add(user_plan)

    # Log the purchase as an allocation
    from app.api.routes.admin.credits import log_credit_tx
    account_type = "individual" if current_user.enterprise_id is None else "enterprise"
    log_credit_tx(
        db,
        user_id=current_user.id,
        enterprise_id=current_user.enterprise_id,
        account_name=current_user.name,
        account_type=account_type,
        transaction_type="allocation",
        reason="Plan Purchase",
        delta=plan.credits,
        balance_after=plan.credits,
        reference_type="plan",
        reference_id=plan.id,
        description=f"Purchased plan '{plan.name}' — {plan.credits} credits",
    )

    await db.flush()
    await db.refresh(user_plan)
    return _user_plan_out(user_plan, plan.name)
