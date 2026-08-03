from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.credit_transaction import CreditTransaction
from app.models.user import User
from app.models.user_plan import UserPlan, UserPlanStatus
from app.models.plan import Plan


def log_credit_tx(
    db: AsyncSession,
    *,
    user_id: str | None,
    enterprise_id: str | None,
    account_name: str,
    account_type: str,
    transaction_type: str,
    reason: str,
    delta: int,
    balance_after: int,
    reference_type: str | None = None,
    reference_id: str | None = None,
    description: str | None = None,
) -> None:
    db.add(
        CreditTransaction(
            user_id=user_id,
            enterprise_id=enterprise_id,
            account_name=account_name,
            account_type=account_type,
            transaction_type=transaction_type,
            reason=reason,
            delta=delta,
            balance_after=balance_after,
            reference_type=reference_type,
            reference_id=reference_id,
            description=description,
        )
    )


async def _maybe_activate_queued_plan(user_id: str, db: AsyncSession) -> None:
    active = (
        await db.execute(
            select(UserPlan).where(
                UserPlan.user_id == user_id,
                UserPlan.plan_type == "validity",
                UserPlan.status == UserPlanStatus.ACTIVE,
            )
        )
    ).scalar_one_or_none()

    if active is not None:
        return

    next_queued = (
        await db.execute(
            select(UserPlan)
            .where(
                UserPlan.user_id == user_id,
                UserPlan.plan_type == "validity",
                UserPlan.status == UserPlanStatus.QUEUED,
            )
            .order_by(UserPlan.queue_position)
            .limit(1)
        )
    ).scalar_one_or_none()

    if next_queued is None:
        return

    plan = (
        await db.execute(select(Plan).where(Plan.id == next_queued.plan_id))
    ).scalar_one_or_none()

    now = datetime.now(timezone.utc)
    next_queued.status = UserPlanStatus.ACTIVE
    next_queued.starts_at = now
    if plan and plan.validity_days:
        next_queued.expires_at = now + timedelta(days=plan.validity_days)
    next_queued.queue_position = None

    remaining_queued = (
        await db.execute(
            select(UserPlan)
            .where(
                UserPlan.user_id == user_id,
                UserPlan.status == UserPlanStatus.QUEUED,
            )
            .order_by(UserPlan.queue_position)
        )
    ).scalars().all()
    for i, qp in enumerate(remaining_queued, start=1):
        qp.queue_position = i


async def deduct_credit(
    user: User,
    db: AsyncSession,
    reason: str,
    description: str,
) -> str:
    now = datetime.now(timezone.utc)

    # Mark expired validity plans
    expired_plans = (
        await db.execute(
            select(UserPlan).where(
                UserPlan.user_id == user.id,
                UserPlan.plan_type == "validity",
                UserPlan.status == UserPlanStatus.ACTIVE,
                UserPlan.expires_at <= now,
            )
        )
    ).scalars().all()
    for ep in expired_plans:
        ep.status = UserPlanStatus.EXPIRED
    if expired_plans:
        await db.flush()
        await _maybe_activate_queued_plan(user.id, db)

    # 1. Validity plan (soonest expiry first)
    validity_plan = (
        await db.execute(
            select(UserPlan)
            .where(
                UserPlan.user_id == user.id,
                UserPlan.plan_type == "validity",
                UserPlan.status == UserPlanStatus.ACTIVE,
                UserPlan.credits_remaining > 0,
            )
            .order_by(UserPlan.expires_at.asc())
            .limit(1)
        )
    ).scalar_one_or_none()

    if validity_plan:
        validity_plan.credits_remaining -= 1
        if validity_plan.credits_remaining == 0:
            validity_plan.status = UserPlanStatus.USED_UP
            await db.flush()
            await _maybe_activate_queued_plan(user.id, db)
        account_type = "individual" if user.enterprise_id is None else "enterprise"
        log_credit_tx(
            db,
            user_id=user.id,
            enterprise_id=user.enterprise_id,
            account_name=user.name,
            account_type=account_type,
            transaction_type="deduction",
            reason=reason,
            delta=-1,
            balance_after=validity_plan.credits_remaining,
            reference_type="user_plan",
            reference_id=validity_plan.id,
            description=description,
        )
        return "validity"

    # 2. PAYG plan (oldest purchased first)
    payg_plan = (
        await db.execute(
            select(UserPlan)
            .where(
                UserPlan.user_id == user.id,
                UserPlan.plan_type == "payg",
                UserPlan.status == UserPlanStatus.ACTIVE,
                UserPlan.credits_remaining > 0,
            )
            .order_by(UserPlan.purchased_at.asc())
            .limit(1)
        )
    ).scalar_one_or_none()

    if payg_plan:
        payg_plan.credits_remaining -= 1
        if payg_plan.credits_remaining == 0:
            payg_plan.status = UserPlanStatus.USED_UP
        account_type = "individual" if user.enterprise_id is None else "enterprise"
        log_credit_tx(
            db,
            user_id=user.id,
            enterprise_id=user.enterprise_id,
            account_name=user.name,
            account_type=account_type,
            transaction_type="deduction",
            reason=reason,
            delta=-1,
            balance_after=payg_plan.credits_remaining,
            reference_type="user_plan",
            reference_id=payg_plan.id,
            description=description,
        )
        return "payg"

    # 3. Legacy admin-allocated credits
    if user.allocated_credits - user.used_credits > 0:
        user.used_credits += 1
        account_type = "individual" if user.enterprise_id is None else "enterprise"
        log_credit_tx(
            db,
            user_id=user.id,
            enterprise_id=user.enterprise_id,
            account_name=user.name,
            account_type=account_type,
            transaction_type="deduction",
            reason=reason,
            delta=-1,
            balance_after=user.allocated_credits - user.used_credits,
            reference_type="legacy",
            description=description,
        )
        return "legacy"

    raise HTTPException(
        status_code=status.HTTP_402_PAYMENT_REQUIRED,
        detail="Insufficient credits. Purchase a plan to continue searching.",
    )
