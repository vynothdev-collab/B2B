from fastapi import APIRouter, Query

from app.schemas.search import (
    CompanySearchRequest,
    PersonRevealRequest,
    PersonRevealResponse,
    PersonSearchRequest,
    SearchResponse,
)
from app.services.pdl_service import (
    autocomplete,
    enrich_person,
    search_companies,
    search_persons,
)

router = APIRouter()


@router.post("/persons", response_model=SearchResponse, summary="Search people via PDL")
async def person_search(body: PersonSearchRequest) -> SearchResponse:
    return await search_persons(body)


@router.post("/companies", response_model=SearchResponse, summary="Search companies via PDL")
async def company_search(body: CompanySearchRequest) -> SearchResponse:
    return await search_companies(body)


@router.post("/reveal/person", response_model=PersonRevealResponse, summary="Reveal contact data for a person")
async def reveal_person(body: PersonRevealRequest) -> PersonRevealResponse:
    return await enrich_person(body)


@router.get("/autocomplete", summary="Autocomplete suggestions from PDL")
async def autocomplete_suggestions(
    field: str = Query(..., description="PDL field to autocomplete"),
    text: str = Query("", description="Partial text to complete"),
    size: int = Query(10, ge=1, le=50),
) -> list[dict]:
    return await autocomplete(field, text, size)
