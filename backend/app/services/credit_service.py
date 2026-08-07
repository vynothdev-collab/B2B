from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.credit_transaction import CreditTransaction
from app.models.user import User
from app.models.user_plan import UserPlan, UserPlanStatus
from app.models.plan import Plan

# Credit cost per operation type
CREDIT_COSTS = {
    "search": 10,
    "pagination": 10,
    "work_email": 1,
    "personal_email": 1,
    "mobile": 10,
    "company_email": 1,
    "company_phone": 10,
}


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


async def _expire_stale_validity_plans(user_id: str, db: AsyncSession) -> bool:
    """Mark expired validity plans and promote next queued. Returns True if any expired."""
    now = datetime.now(timezone.utc)
    expired_plans = (
        await db.execute(
            select(UserPlan).where(
                UserPlan.user_id == user_id,
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
        await _maybe_activate_queued_plan(user_id, db)
    return bool(expired_plans)


async def get_available_credits(user: User, db: AsyncSession) -> int:
    """
    Compute total credits available to a user across all active plans and legacy balance.
    Uses SQL-level expiry check so it never over-counts plans that are past their expiry
    date but not yet swept in the DB.
    """
    now = datetime.now(timezone.utc)

    validity_total = (
        await db.execute(
            select(func.coalesce(func.sum(UserPlan.credits_remaining), 0)).where(
                UserPlan.user_id == user.id,
                UserPlan.plan_type == "validity",
                UserPlan.status == UserPlanStatus.ACTIVE,
                or_(UserPlan.expires_at.is_(None), UserPlan.expires_at > now),
                UserPlan.credits_remaining > 0,
            )
        )
    ).scalar() or 0

    payg_total = (
        await db.execute(
            select(func.coalesce(func.sum(UserPlan.credits_remaining), 0)).where(
                UserPlan.user_id == user.id,
                UserPlan.plan_type == "payg",
                UserPlan.status == UserPlanStatus.ACTIVE,
                UserPlan.credits_remaining > 0,
            )
        )
    ).scalar() or 0

    legacy_total = max(0, user.allocated_credits - user.used_credits)

    return int(validity_total) + int(payg_total) + legacy_total


async def check_credits(user: User, db: AsyncSession, required: int) -> None:
    """
    Validate that the user has at least `required` credits available.
    Raises HTTP 402 with a structured body if insufficient.
    Must be called BEFORE any paid external API call.
    """
    available = await get_available_credits(user, db)
    if available < required:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "success": False,
                "error": "INSUFFICIENT_CREDITS",
                "message": "You do not have enough credits to perform this action.",
                "requiredCredits": required,
                "availableCredits": available,
            },
        )


async def deduct_credit(
    user: User,
    db: AsyncSession,
    reason: str,
    description: str,
    amount: int = 1,
) -> None:
    """
    Deduct `amount` credits from the user's balance in priority order:
      1. Active validity plans (soonest expiry first, may span multiple plans)
      2. Active PAYG plans (oldest purchase first, may span multiple plans)
      3. Legacy admin-allocated credits

    Each source touched generates its own CreditTransaction log entry.
    Raises HTTP 402 if credits are exhausted before the full amount is deducted
    (should not happen if check_credits was called first).
    """
    account_type = "individual" if user.enterprise_id is None else "enterprise"

    await _expire_stale_validity_plans(user.id, db)

    remaining = amount

    # ── Phase 1: validity plans ──────────────────────────────────────────────
    while remaining > 0:
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

        if validity_plan is None:
            break

        take = min(remaining, validity_plan.credits_remaining)
        validity_plan.credits_remaining -= take
        remaining -= take

        if validity_plan.credits_remaining == 0:
            validity_plan.status = UserPlanStatus.USED_UP
            await db.flush()
            await _maybe_activate_queued_plan(user.id, db)

        log_credit_tx(
            db,
            user_id=user.id,
            enterprise_id=user.enterprise_id,
            account_name=user.name,
            account_type=account_type,
            transaction_type="deduction",
            reason=reason,
            delta=-take,
            balance_after=validity_plan.credits_remaining,
            reference_type="user_plan",
            reference_id=validity_plan.id,
            description=description,
        )

    # ── Phase 2: PAYG plans ──────────────────────────────────────────────────
    while remaining > 0:
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

        if payg_plan is None:
            break

        take = min(remaining, payg_plan.credits_remaining)
        payg_plan.credits_remaining -= take
        remaining -= take

        if payg_plan.credits_remaining == 0:
            payg_plan.status = UserPlanStatus.USED_UP

        log_credit_tx(
            db,
            user_id=user.id,
            enterprise_id=user.enterprise_id,
            account_name=user.name,
            account_type=account_type,
            transaction_type="deduction",
            reason=reason,
            delta=-take,
            balance_after=payg_plan.credits_remaining,
            reference_type="user_plan",
            reference_id=payg_plan.id,
            description=description,
        )

    # ── Phase 3: legacy admin-allocated credits ──────────────────────────────
    if remaining > 0:
        legacy_available = user.allocated_credits - user.used_credits
        take = min(remaining, legacy_available)
        if take > 0:
            user.used_credits += take
            remaining -= take
            log_credit_tx(
                db,
                user_id=user.id,
                enterprise_id=user.enterprise_id,
                account_name=user.name,
                account_type=account_type,
                transaction_type="deduction",
                reason=reason,
                delta=-take,
                balance_after=user.allocated_credits - user.used_credits,
                reference_type="legacy",
                description=description,
            )

    if remaining > 0:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "success": False,
                "error": "INSUFFICIENT_CREDITS",
                "message": "You do not have enough credits to perform this action.",
                "requiredCredits": amount,
                "availableCredits": amount - remaining,
            },
        )
