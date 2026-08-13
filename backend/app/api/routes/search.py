import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status

logger = logging.getLogger(__name__)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.contact_unlock import ContactUnlockField
from app.models.search_log import SearchLog
from app.models.search_record import PersonSearchRecord, CompanySearchRecord
from app.models.user import User, UserRole
from app.models.technology_intent import TechnologyIntent
from app.schemas.search import (
    AgenticSearchRequest,
    CompanySearchRequest,
    EmailUnlockResponse,
    PersonSearchRequest,
    PhoneUnlockResponse,
    SearchResponse,
    TitleAutocompleteResponse,
)
from app.services import coresignal_service
from app.services.contact_unlock_service import (
    apply_unlock_state,
    get_unlock_map,
    unlock_contact_field,
)
from app.services.credit_service import CREDIT_COSTS, check_credits, deduct_credit

router = APIRouter()


def _log_search(db: AsyncSession, user_id: str, search_type: str) -> None:
    db.add(SearchLog(user_id=user_id, search_type=search_type))


@router.post("/persons", response_model=SearchResponse, summary="Search people")
async def person_search(
    body: PersonSearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    cost = CREDIT_COSTS["search"]
    await check_credits(current_user, db, cost)
    result = await coresignal_service.search_persons(body, db=db)
    await deduct_credit(
        current_user, db,
        reason="People Search",
        description=f"People search — {cost} credits deducted",
        amount=cost,
    )
    _log_search(db, current_user.id, "person")
    await db.flush()
    record_ids = [item.get("id") for item in result.data if item.get("id")]
    unlock_map = await get_unlock_map(db, current_user.id, record_ids)
    for item in result.data:
        if item.get("id"):
            apply_unlock_state(item, item["id"], unlock_map)
    return result


@router.post("/companies", response_model=SearchResponse, summary="Search companies")
async def company_search(
    body: CompanySearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    cost = CREDIT_COSTS["search"]
    await check_credits(current_user, db, cost)
    result = await coresignal_service.search_companies(body, db=db)
    await deduct_credit(
        current_user, db,
        reason="Company Search",
        description=f"Company search — {cost} credits deducted",
        amount=cost,
    )
    _log_search(db, current_user.id, "company")
    await db.flush()
    return result


@router.post(
    "/agentic", response_model=SearchResponse, summary="Natural-language AI search"
)
async def agentic_search(
    body: AgenticSearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    cost = CREDIT_COSTS["search"]
    await check_credits(current_user, db, cost)
    result = await coresignal_service.agentic_search(body, db=db)
    await deduct_credit(
        current_user, db,
        reason="AI Search",
        description=f"AI search — {cost} credits deducted",
        amount=cost,
    )
    _log_search(db, current_user.id, "agentic")
    await db.flush()
    if body.entity == "employee":
        record_ids = [item.get("id") for item in result.data if item.get("id")]
        unlock_map = await get_unlock_map(db, current_user.id, record_ids)
        for item in result.data:
            if item.get("id"):
                apply_unlock_state(item, item["id"], unlock_map)
    return result


@router.get(
    "/persons/{record_id}/unlock/work-email",
    response_model=EmailUnlockResponse,
    summary="Unlock work email for a person record",
)
async def unlock_person_work_email(
    record_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> EmailUnlockResponse:
    res = await unlock_contact_field(
        db, current_user, record_id, ContactUnlockField.WORK_EMAIL
    )
    return EmailUnlockResponse(
        record_id=record_id,
        email=res["value"],
        has_email=bool(res["value"]),
        already_unlocked=res["already_unlocked"],
        credits_charged=res["credits_charged"],
    )


@router.get(
    "/persons/{record_id}/unlock/personal-email",
    response_model=EmailUnlockResponse,
    summary="Unlock personal email for a person record",
)
async def unlock_person_personal_email(
    record_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> EmailUnlockResponse:
    res = await unlock_contact_field(
        db, current_user, record_id, ContactUnlockField.PERSONAL_EMAIL
    )
    return EmailUnlockResponse(
        record_id=record_id,
        email=res["value"],
        has_email=bool(res["value"]),
        already_unlocked=res["already_unlocked"],
        credits_charged=res["credits_charged"],
    )


@router.get(
    "/persons/{record_id}/unlock/mobile",
    response_model=PhoneUnlockResponse,
    summary="Unlock mobile phone number for a person record",
)
async def unlock_person_phone(
    record_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PhoneUnlockResponse:
    res = await unlock_contact_field(
        db, current_user, record_id, ContactUnlockField.MOBILE
    )
    return PhoneUnlockResponse(
        record_id=record_id,
        phone=res["value"],
        has_phone=bool(res["value"]),
        already_unlocked=res["already_unlocked"],
        credits_charged=res["credits_charged"],
    )


@router.get(
    "/persons/{record_id}/detail", summary="Full person detail with work history"
)
async def get_person_detail(
    record_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PersonSearchRecord).where(PersonSearchRecord.coresignal_id == record_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Person not found")

    raw = record.raw_data or {}
    mapped = coresignal_service.map_person_detail(raw)

    unlock_map = await get_unlock_map(db, current_user.id, [record_id])
    apply_unlock_state(mapped, record_id, unlock_map)

    return mapped


@router.get("/companies/{record_id}/detail", summary="Full company detail")
async def get_company_detail(
    record_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CompanySearchRecord).where(
            CompanySearchRecord.coresignal_id == record_id
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Company not found")

    raw = record.raw_data or {}
    return coresignal_service.map_company_detail(raw)


@router.get(
    "/autocomplete/titles",
    response_model=TitleAutocompleteResponse,
    summary="PDL job title autocomplete",
)
async def autocomplete_titles(
    text: str = Query(..., min_length=2, max_length=100),
    size: int = Query(default=10, ge=1, le=25),
) -> TitleAutocompleteResponse:
    if not settings.PDL_API_KEY:
        return TitleAutocompleteResponse(suggestions=[])
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                f"{settings.PDL_BASE_URL}/autocomplete",
                params={"field": "title", "text": text, "size": size},
                headers={"X-Api-Key": settings.PDL_API_KEY},
                timeout=5.0,
            )
            resp.raise_for_status()
        except httpx.TimeoutException:
            logger.warning("PDL autocomplete timed out for text=%r", text)
            return TitleAutocompleteResponse(suggestions=[])
        except httpx.HTTPStatusError as exc:
            logger.warning(
                "PDL autocomplete HTTP %s for text=%r: %s",
                exc.response.status_code,
                text,
                exc.response.text[:200],
            )
            return TitleAutocompleteResponse(suggestions=[])
    names = [item["name"] for item in resp.json().get("data", [])]
    return TitleAutocompleteResponse(suggestions=names)


@router.get(
    "/autocomplete/technologies",
    response_model=TitleAutocompleteResponse,
    summary="Technology autocomplete from DB",
)
async def autocomplete_technologies(
    text: str = Query(..., min_length=1, max_length=100),
    size: int = Query(default=10, ge=1, le=25),
    db: AsyncSession = Depends(get_db),
) -> TitleAutocompleteResponse:
    stmt = (
        select(TechnologyIntent.technology)
        .where(TechnologyIntent.technology.ilike(f"%{text}%"))
        .where(TechnologyIntent.technology.isnot(None))
        .distinct()
        .limit(size)
    )
    result = await db.execute(stmt)
    suggestions = [row[0] for row in result.all() if row[0]]
    return TitleAutocompleteResponse(suggestions=suggestions)


@router.get(
    "/autocomplete/intents",
    response_model=TitleAutocompleteResponse,
    summary="Intent/keyword autocomplete from DB",
)
async def autocomplete_intents(
    text: str = Query(..., min_length=1, max_length=100),
    size: int = Query(default=10, ge=1, le=25),
    db: AsyncSession = Depends(get_db),
) -> TitleAutocompleteResponse:
    stmt = (
        select(TechnologyIntent.intent)
        .where(TechnologyIntent.intent.ilike(f"%{text}%"))
        .where(TechnologyIntent.intent.isnot(None))
        .distinct()
        .limit(size)
    )
    result = await db.execute(stmt)
    suggestions = [row[0] for row in result.all() if row[0]]
    return TitleAutocompleteResponse(suggestions=suggestions)
