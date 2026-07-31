from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import Float, and_, cast, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.elements import ColumnElement

from app.core.database import get_db
from app.core.security import require_super_admin
from app.models.credit_transaction import CreditTransaction
from app.models.enterprise import Enterprise
from app.models.user import User, UserRole
from app.services.credit_service import log_credit_tx

router = APIRouter(dependencies=[Depends(require_super_admin)])


# ── Schemas ───────────────────────────────────────────────────────────────────

class IndividualCreditRecord(BaseModel):
    id:                str
    name:              str
    email:             str
    allocated_credits: int
    used_credits:      int
    remaining_credits: int
    status:            str


class EnterpriseCreditRecord(BaseModel):
    id:              str
    name:            str
    plan:            str
    pool_credits:    int
    total_allocated: int
    total_used:      int
    total_remaining: int
    status:          str


class CreditStats(BaseModel):
    total_allocated: int
    total_used:      int
    total_remaining: int


class PagedIndividualCredits(BaseModel):
    items:     list[IndividualCreditRecord]
    total:     int
    page:      int
    page_size: int
    stats:     CreditStats


class PagedEnterpriseCredits(BaseModel):
    items:     list[EnterpriseCreditRecord]
    total:     int
    page:      int
    page_size: int
    stats:     CreditStats


class AddCreditsPayload(BaseModel):
    credits: int


class CreditTransactionRecord(BaseModel):
    id:               str
    account_name:     str
    account_type:     str
    transaction_type: str
    reason:           str
    delta:            int
    balance_after:    int
    reference_type:   str | None
    reference_id:     str | None
    description:      str | None
    created_at:       datetime


class PagedCreditTransactions(BaseModel):
    items:     list[CreditTransactionRecord]
    total:     int
    page:      int
    page_size: int
    stats:     CreditStats


# ── Helpers ───────────────────────────────────────────────────────────────────

def _credit_status(allocated: int, remaining: int) -> str:
    if remaining <= 0:
        return "exceeded"
    if allocated > 0 and remaining / allocated < 0.2:
        return "low"
    return "healthy"


def _individual_status_clause(status_: str) -> ColumnElement | None:
    remaining = User.allocated_credits - User.used_credits
    if status_ == "exceeded":
        return remaining <= 0
    if status_ == "low":
        return and_(
            remaining > 0,
            User.allocated_credits > 0,
            cast(remaining, Float) / cast(User.allocated_credits, Float) < 0.2,
        )
    if status_ == "healthy":
        return and_(
            remaining > 0,
            or_(
                User.allocated_credits == 0,
                cast(remaining, Float) / cast(User.allocated_credits, Float) >= 0.2,
            ),
        )
    return None


def _enterprise_status_clause(status_: str, alloc_col: ColumnElement, used_col: ColumnElement) -> ColumnElement | None:
    remaining = alloc_col - used_col
    if status_ == "exceeded":
        return remaining <= 0
    if status_ == "low":
        return and_(
            remaining > 0,
            alloc_col > 0,
            cast(remaining, Float) / cast(alloc_col, Float) < 0.2,
        )
    if status_ == "healthy":
        return and_(
            remaining > 0,
            or_(
                alloc_col == 0,
                cast(remaining, Float) / cast(alloc_col, Float) >= 0.2,
            ),
        )
    return None


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/individual", response_model=PagedIndividualCredits)
async def list_individual_credits(
    page:      int = Query(default=1, ge=1),
    page_size: int = Query(default=8, ge=1, le=100),
    q:         str | None = Query(default=None),
    status_:   str | None = Query(default=None, alias="status"),
    db: AsyncSession = Depends(get_db),
) -> PagedIndividualCredits:
    base = select(User).where(User.role == UserRole.INDIVIDUAL)
    if q:
        like = f"%{q.strip()}%"
        base = base.where(or_(User.name.ilike(like), User.email.ilike(like)))

    status_clause = _individual_status_clause(status_) if status_ else None
    filtered = base.where(status_clause) if status_clause is not None else base

    total = (
        await db.execute(select(func.count(User.id)).select_from(filtered.subquery()))
    ).scalar_one()

    rows = (
        await db.execute(
            filtered.order_by(User.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    ).scalars().all()

    stats_row = (
        await db.execute(
            select(
                func.coalesce(func.sum(User.allocated_credits), 0),
                func.coalesce(func.sum(User.used_credits), 0),
            ).where(User.role == UserRole.INDIVIDUAL)
        )
    ).one()
    total_alloc = int(stats_row[0])
    total_used  = int(stats_row[1])

    return PagedIndividualCredits(
        items=[
            IndividualCreditRecord(
                id=u.id,
                name=u.name,
                email=u.email,
                allocated_credits=u.allocated_credits,
                used_credits=u.used_credits,
                remaining_credits=u.allocated_credits - u.used_credits,
                status=_credit_status(u.allocated_credits, u.allocated_credits - u.used_credits),
            )
            for u in rows
        ],
        total=total,
        page=page,
        page_size=page_size,
        stats=CreditStats(
            total_allocated=total_alloc,
            total_used=total_used,
            total_remaining=total_alloc - total_used,
        ),
    )


@router.get("/enterprises", response_model=PagedEnterpriseCredits)
async def list_enterprise_credits(
    page:      int = Query(default=1, ge=1),
    page_size: int = Query(default=8, ge=1, le=100),
    q:         str | None = Query(default=None),
    status_:   str | None = Query(default=None, alias="status"),
    db: AsyncSession = Depends(get_db),
) -> PagedEnterpriseCredits:
    user_agg = (
        select(
            User.enterprise_id,
            func.sum(User.allocated_credits).label("a"),
            func.sum(User.used_credits).label("u"),
        )
        .where(User.enterprise_id.isnot(None))
        .group_by(User.enterprise_id)
        .subquery()
    )
    alloc_col    = func.coalesce(user_agg.c.a, 0)
    used_col     = func.coalesce(user_agg.c.u, 0)

    base = (
        select(Enterprise, alloc_col.label("total_allocated"), used_col.label("total_used"))
        .outerjoin(user_agg, Enterprise.id == user_agg.c.enterprise_id)
    )
    if q:
        base = base.where(Enterprise.name.ilike(f"%{q.strip()}%"))

    status_clause = _enterprise_status_clause(status_, alloc_col, used_col) if status_ else None
    filtered = base.where(status_clause) if status_clause is not None else base

    total = (
        await db.execute(
            select(func.count(Enterprise.id))
            .select_from(Enterprise)
            .outerjoin(user_agg, Enterprise.id == user_agg.c.enterprise_id)
            .where(*([] if q is None else [Enterprise.name.ilike(f"%{q.strip()}%")]))
            .where(*([] if status_clause is None else [status_clause]))
        )
    ).scalar_one()

    rows = (
        await db.execute(
            filtered.order_by(Enterprise.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    ).all()

    g_row = (
        await db.execute(
            select(
                func.coalesce(func.sum(User.allocated_credits), 0),
                func.coalesce(func.sum(User.used_credits), 0),
            ).where(User.enterprise_id.isnot(None))
        )
    ).one()
    g_alloc = int(g_row[0])
    g_used  = int(g_row[1])

    items = []
    for row in rows:
        ent         = row[0]
        total_alloc = int(row[1])
        total_used  = int(row[2])
        total_rem   = total_alloc - total_used
        items.append(
            EnterpriseCreditRecord(
                id=ent.id,
                name=ent.name,
                plan=ent.plan,
                pool_credits=ent.credits,
                total_allocated=total_alloc,
                total_used=total_used,
                total_remaining=total_rem,
                status=_credit_status(total_alloc, total_rem),
            )
        )

    return PagedEnterpriseCredits(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        stats=CreditStats(
            total_allocated=g_alloc,
            total_used=g_used,
            total_remaining=g_alloc - g_used,
        ),
    )


@router.get("/transactions", response_model=PagedCreditTransactions)
async def list_credit_transactions(
    page:             int = Query(default=1, ge=1),
    page_size:        int = Query(default=20, ge=1, le=100),
    q:                str | None = Query(default=None),
    account_type:     str | None = Query(default=None),
    transaction_type: str | None = Query(default=None, alias="type"),
    db: AsyncSession = Depends(get_db),
) -> PagedCreditTransactions:
    stmt = select(CreditTransaction)

    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(
                CreditTransaction.account_name.ilike(like),
                CreditTransaction.description.ilike(like),
                CreditTransaction.reason.ilike(like),
            )
        )
    if account_type and account_type != "all":
        stmt = stmt.where(CreditTransaction.account_type == account_type)
    if transaction_type and transaction_type != "all":
        stmt = stmt.where(CreditTransaction.transaction_type == transaction_type)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    items_rows = (
        await db.execute(
            stmt.order_by(desc(CreditTransaction.created_at))
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    ).scalars().all()

    # stats: sum across all transactions (unfiltered by type, just by account_type if set)
    base_stat_stmt = select(CreditTransaction)
    if account_type and account_type != "all":
        base_stat_stmt = base_stat_stmt.where(CreditTransaction.account_type == account_type)

    alloc_total = (
        await db.execute(
            select(func.coalesce(func.sum(CreditTransaction.delta), 0)).where(
                CreditTransaction.transaction_type == "allocation",
                *(
                    [CreditTransaction.account_type == account_type]
                    if account_type and account_type != "all"
                    else []
                ),
            )
        )
    ).scalar_one()

    used_total = (
        await db.execute(
            select(func.coalesce(func.abs(func.sum(CreditTransaction.delta)), 0)).where(
                CreditTransaction.transaction_type == "deduction",
                *(
                    [CreditTransaction.account_type == account_type]
                    if account_type and account_type != "all"
                    else []
                ),
            )
        )
    ).scalar_one()

    return PagedCreditTransactions(
        items=[
            CreditTransactionRecord(
                id=tx.id,
                account_name=tx.account_name,
                account_type=tx.account_type,
                transaction_type=tx.transaction_type,
                reason=tx.reason,
                delta=tx.delta,
                balance_after=tx.balance_after,
                reference_type=tx.reference_type,
                reference_id=tx.reference_id,
                description=tx.description,
                created_at=tx.created_at,
            )
            for tx in items_rows
        ],
        total=total,
        page=page,
        page_size=page_size,
        stats=CreditStats(
            total_allocated=int(alloc_total),
            total_used=int(used_total),
            total_remaining=int(alloc_total) - int(used_total),
        ),
    )


@router.post("/enterprises/{enterprise_id}/add-credits")
async def add_credits_to_enterprise(
    enterprise_id: str,
    payload: AddCreditsPayload,
    db: AsyncSession = Depends(get_db),
) -> dict:
    if payload.credits <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Credits must be greater than 0",
        )
    ent = (
        await db.execute(select(Enterprise).where(Enterprise.id == enterprise_id))
    ).scalar_one_or_none()
    if not ent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enterprise not found")

    ent.credits += payload.credits
    await db.flush()
    await db.refresh(ent)

    log_credit_tx(
        db,
        user_id=None,
        enterprise_id=ent.id,
        account_name=ent.name,
        account_type="enterprise",
        transaction_type="allocation",
        reason="Admin Allocation",
        delta=payload.credits,
        balance_after=ent.credits,
        reference_type="admin",
        description=f"Admin added {payload.credits:,} credits to enterprise pool",
    )

    return {"id": ent.id, "name": ent.name, "credits": ent.credits}
