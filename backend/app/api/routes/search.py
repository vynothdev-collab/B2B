from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.search_record import PersonSearchRecord
from app.schemas.search import (
    AgenticSearchRequest,
    CompanySearchRequest,
    EmailRevealResponse,
    PersonSearchRequest,
    SearchResponse,
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
