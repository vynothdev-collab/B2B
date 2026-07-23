from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_super_admin
from app.models.enterprise import Enterprise
from app.models.user import User, UserRole

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


# ── Helpers ───────────────────────────────────────────────────────────────────

def _credit_status(allocated: int, remaining: int) -> str:
    if remaining <= 0:
        return "exceeded"
    if allocated > 0 and remaining / allocated < 0.2:
        return "low"
    return "healthy"


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/individual", response_model=PagedIndividualCredits)
async def list_individual_credits(
    page:      int = Query(default=1, ge=1),
    page_size: int = Query(default=8, ge=1, le=100),
    q:         str | None = Query(default=None),
    status_:   str | None = Query(default=None, alias="status"),
    db: AsyncSession = Depends(get_db),
) -> PagedIndividualCredits:
    stmt = select(User).where(User.role == UserRole.INDIVIDUAL)

    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(or_(User.name.ilike(like), User.email.ilike(like)))

    all_matching = (
        await db.execute(stmt.order_by(User.created_at.desc()))
    ).scalars().all()

    all_records: list[IndividualCreditRecord] = []
    for u in all_matching:
        remaining = u.allocated_credits - u.used_credits
        cstatus = _credit_status(u.allocated_credits, remaining)
        if status_ and cstatus != status_:
            continue
        all_records.append(
            IndividualCreditRecord(
                id=u.id,
                name=u.name,
                email=u.email,
                allocated_credits=u.allocated_credits,
                used_credits=u.used_credits,
                remaining_credits=remaining,
                status=cstatus,
            )
        )

    total = len(all_records)
    items = all_records[(page - 1) * page_size : page * page_size]

    # aggregate stats across all individual users (not just this page)
    all_users = (
        await db.execute(select(User).where(User.role == UserRole.INDIVIDUAL))
    ).scalars().all()
    total_alloc = sum(u.allocated_credits for u in all_users)
    total_used = sum(u.used_credits for u in all_users)

    return PagedIndividualCredits(
        items=items,
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
    stmt = select(Enterprise)

    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(Enterprise.name.ilike(like))

    all_enterprises = (
        await db.execute(stmt.order_by(Enterprise.created_at.desc()))
    ).scalars().all()

    # load per-enterprise user credit aggregates
    ent_ids = [e.id for e in all_enterprises]
    user_aggs: dict[str, dict] = {eid: {"allocated": 0, "used": 0} for eid in ent_ids}
    if ent_ids:
        user_rows = (
            await db.execute(
                select(
                    User.enterprise_id,
                    func.sum(User.allocated_credits),
                    func.sum(User.used_credits),
                ).where(User.enterprise_id.in_(ent_ids)).group_by(User.enterprise_id)
            )
        ).all()
        for row in user_rows:
            user_aggs[row[0]] = {"allocated": int(row[1] or 0), "used": int(row[2] or 0)}

    all_records: list[EnterpriseCreditRecord] = []
    for ent in all_enterprises:
        agg = user_aggs.get(ent.id, {"allocated": 0, "used": 0})
        total_alloc = agg["allocated"]
        total_used = agg["used"]
        total_remaining = total_alloc - total_used
        cstatus = _credit_status(total_alloc, total_remaining)
        if status_ and cstatus != status_:
            continue
        all_records.append(
            EnterpriseCreditRecord(
                id=ent.id,
                name=ent.name,
                plan=ent.plan,
                pool_credits=ent.credits,
                total_allocated=total_alloc,
                total_used=total_used,
                total_remaining=total_remaining,
                status=cstatus,
            )
        )

    total = len(all_records)
    items = all_records[(page - 1) * page_size : page * page_size]

    # global stats
    all_ents = (await db.execute(select(Enterprise))).scalars().all()
    all_ent_ids = [e.id for e in all_ents]
    global_agg_rows = (
        await db.execute(
            select(
                func.sum(User.allocated_credits),
                func.sum(User.used_credits),
            ).where(User.enterprise_id.in_(all_ent_ids))
        )
    ).one()
    g_alloc = int(global_agg_rows[0] or 0)
    g_used = int(global_agg_rows[1] or 0)

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
    return {"id": ent.id, "name": ent.name, "credits": ent.credits}
