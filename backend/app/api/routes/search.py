import logging
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query

logger = logging.getLogger(__name__)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.search_record import PersonSearchRecord
from app.schemas.search import (
    AgenticSearchRequest,
    CompanySearchRequest,
    EmailRevealResponse,
    PersonSearchRequest,
    SearchResponse,
    TitleAutocompleteResponse,
)
from app.services import coresignal_service

router = APIRouter()


@router.post("/persons", response_model=SearchResponse, summary="Search people")
async def person_search(
    body: PersonSearchRequest,
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    return await coresignal_service.search_persons(body, db=db)


@router.post("/companies", response_model=SearchResponse, summary="Search companies")
async def company_search(
    body: CompanySearchRequest,
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    return await coresignal_service.search_companies(body, db=db)


@router.post("/agentic", response_model=SearchResponse, summary="Natural-language AI search")
async def agentic_search(body: AgenticSearchRequest) -> SearchResponse:
    return await coresignal_service.agentic_search(body)


@router.get(
    "/persons/{record_id}/email",
    response_model=EmailRevealResponse,
    summary="Reveal stored email for a person record",
)
async def reveal_person_email(
    record_id: str,
    db: AsyncSession = Depends(get_db),
) -> EmailRevealResponse:
    result = await db.execute(
        select(PersonSearchRecord).where(PersonSearchRecord.coresignal_id == record_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(
            status_code=404,
            detail="Record not found. Run a new search to refresh.",
        )
    return EmailRevealResponse(
        record_id=record_id,
        email=record.email,
        has_email=bool(record.email),
    )


@router.get("/autocomplete/titles", response_model=TitleAutocompleteResponse, summary="PDL job title autocomplete")
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
            logger.warning("PDL autocomplete HTTP %s for text=%r: %s", exc.response.status_code, text, exc.response.text[:200])
            return TitleAutocompleteResponse(suggestions=[])
    names = [item["name"] for item in resp.json().get("data", [])]
    return TitleAutocompleteResponse(suggestions=names)
