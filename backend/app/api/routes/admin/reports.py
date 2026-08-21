from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_super_admin
from app.models.contact_unlock import ContactUnlock, ContactUnlockField
from app.models.credit_transaction import CreditTransaction
from app.models.enterprise import Enterprise
from app.models.plan import Plan
from app.models.search_log import SearchLog
from app.models.user import User
from app.models.user_plan import UserPlan

router = APIRouter(dependencies=[Depends(require_super_admin)])


SEARCH_TYPE_LABELS = {
    "person": "People Search",
    "company": "Company Search",
    "agentic": "AI Search",
    "api_person": "API People Search",
    "api_company": "API Company Search",
    "api_ai_search": "API AI Search",
}


# ── Schemas ───────────────────────────────────────────────────────────────────

class SearchActivityRecord(BaseModel):
    id:           str
    user_name:    str
    account_type: str
    company:      str | None
    search_type:  str
    created_at:   datetime


class PagedSearchActivity(BaseModel):
    items:     list[SearchActivityRecord]
    total:     int
    page:      int
    page_size: int


class UnlockRecord(BaseModel):
    id:           str
    user_name:    str
    account_type: str
    company:      str | None
    field:        str
    value:        str | None
    unlocked_at:  datetime


class PagedUnlocks(BaseModel):
    items:     list[UnlockRecord]
    total:     int
    page:      int
    page_size: int


class ActivityItem(BaseModel):
    type:      str
    text:      str
    timestamp: datetime


class RecentActivityResponse(BaseModel):
    items: list[ActivityItem]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _period_start(period: str | None) -> datetime | None:
    if not period or period == "all":
        return None
    now = datetime.now(UTC)
    if period == "today":
        return now.replace(hour=0, minute=0, second=0, microsecond=0)
    if period == "week":
        start = now - timedelta(days=now.weekday())
        return start.replace(hour=0, minute=0, second=0, microsecond=0)
    if period == "month":
        return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    return None


async def _account_meta(db: AsyncSession, user_ids: set[str]) -> dict[str, tuple[str, str, str | None]]:
    """user_id -> (name, account_type, company_name)"""
    if not user_ids:
        return {}
    rows = (
        await db.execute(
            select(User.id, User.name, User.enterprise_id).where(User.id.in_(user_ids))
        )
    ).all()

    ent_ids = {row[2] for row in rows if row[2]}
    ent_names: dict[str, str] = {}
    if ent_ids:
        ent_rows = (
            await db.execute(select(Enterprise.id, Enterprise.name).where(Enterprise.id.in_(ent_ids)))
        ).all()
        ent_names = {row[0]: row[1] for row in ent_rows}

    return {
        uid: (
            name,
            "Enterprise" if ent_id else "Individual",
            ent_names.get(ent_id) if ent_id else None,
        )
        for uid, name, ent_id in rows
    }


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/search-activity", response_model=PagedSearchActivity)
async def list_search_activity(
    page:         int = Query(default=1, ge=1),
    page_size:    int = Query(default=20, ge=1, le=100),
    period:       str | None = Query(default=None),
    account_type: str | None = Query(default=None),
    search_type:  str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> PagedSearchActivity:
    stmt = select(SearchLog)

    start = _period_start(period)
    if start:
        stmt = stmt.where(SearchLog.created_at >= start)
    if search_type and search_type != "all":
        stmt = stmt.where(SearchLog.search_type == search_type)
    if account_type and account_type != "all":
        stmt = stmt.join(User, User.id == SearchLog.user_id).where(
            User.enterprise_id.isnot(None) if account_type == "enterprise" else User.enterprise_id.is_(None)
        )

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()

    rows = (
        await db.execute(
            stmt.order_by(SearchLog.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    ).scalars().all()

    meta = await _account_meta(db, {r.user_id for r in rows})

    items = []
    for r in rows:
        name, acct_type, company = meta.get(r.user_id, ("Unknown", "Individual", None))
        items.append(
            SearchActivityRecord(
                id=r.id,
                user_name=name,
                account_type=acct_type,
                company=company,
                search_type=SEARCH_TYPE_LABELS.get(r.search_type, r.search_type),
                created_at=r.created_at,
            )
        )

    return PagedSearchActivity(items=items, total=total, page=page, page_size=page_size)


@router.get("/unlocks", response_model=PagedUnlocks)
async def list_unlocks(
    field:        str = Query(..., pattern="^(email|mobile)$"),
    page:         int = Query(default=1, ge=1),
    page_size:    int = Query(default=20, ge=1, le=100),
    period:       str | None = Query(default=None),
    account_type: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> PagedUnlocks:
    stmt = select(ContactUnlock)

    if field == "mobile":
        stmt = stmt.where(ContactUnlock.field == ContactUnlockField.MOBILE)
    else:
        stmt = stmt.where(
            ContactUnlock.field.in_([ContactUnlockField.WORK_EMAIL, ContactUnlockField.PERSONAL_EMAIL])
        )

    start = _period_start(period)
    if start:
        stmt = stmt.where(ContactUnlock.unlocked_at >= start)
    if account_type and account_type != "all":
        stmt = stmt.join(User, User.id == ContactUnlock.user_id).where(
            User.enterprise_id.isnot(None) if account_type == "enterprise" else User.enterprise_id.is_(None)
        )

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()

    rows = (
        await db.execute(
            stmt.order_by(ContactUnlock.unlocked_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    ).scalars().all()

    meta = await _account_meta(db, {r.user_id for r in rows})

    items = []
    for r in rows:
        name, acct_type, company = meta.get(r.user_id, ("Unknown", "Individual", None))
        items.append(
            UnlockRecord(
                id=r.id,
                user_name=name,
                account_type=acct_type,
                company=company,
                field=r.field,
                value=r.value,
                unlocked_at=r.unlocked_at,
            )
        )

    return PagedUnlocks(items=items, total=total, page=page, page_size=page_size)


@router.get("/recent-activity", response_model=RecentActivityResponse)
async def list_recent_activity(
    limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
) -> RecentActivityResponse:
    fetch_n = limit

    signup_rows = (
        await db.execute(
            select(User.email, User.created_at)
            .where(User.enterprise_id.is_(None))
            .order_by(User.created_at.desc())
            .limit(fetch_n)
        )
    ).all()

    enterprise_rows = (
        await db.execute(
            select(Enterprise.name, Enterprise.created_at)
            .order_by(Enterprise.created_at.desc())
            .limit(fetch_n)
        )
    ).all()

    plan_rows = (
        await db.execute(
            select(User.name, Plan.name, UserPlan.purchased_at)
            .join(User, User.id == UserPlan.user_id)
            .join(Plan, Plan.id == UserPlan.plan_id)
            .order_by(UserPlan.purchased_at.desc())
            .limit(fetch_n)
        )
    ).all()

    credit_rows = (
        await db.execute(
            select(CreditTransaction.account_name, CreditTransaction.delta, CreditTransaction.created_at)
            .where(CreditTransaction.reference_type == "admin")
            .order_by(CreditTransaction.created_at.desc())
            .limit(fetch_n)
        )
    ).all()

    events: list[ActivityItem] = []
    for email, created_at in signup_rows:
        events.append(ActivityItem(type="signup", text=f"New signup: {email}", timestamp=created_at))
    for name, created_at in enterprise_rows:
        events.append(ActivityItem(type="enterprise", text=f"Enterprise account created: {name}", timestamp=created_at))
    for user_name, plan_name, purchased_at in plan_rows:
        events.append(
            ActivityItem(type="plan", text=f"{user_name} purchased the {plan_name} plan", timestamp=purchased_at)
        )
    for account_name, delta, created_at in credit_rows:
        sign = "+" if delta >= 0 else ""
        events.append(
            ActivityItem(
                type="credit",
                text=f"Credits allocated: {sign}{delta:,} to {account_name}",
                timestamp=created_at,
            )
        )

    events.sort(key=lambda e: e.timestamp, reverse=True)

    return RecentActivityResponse(items=events[:limit])
