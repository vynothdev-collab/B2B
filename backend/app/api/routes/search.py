from fastapi import APIRouter, Query

from app.schemas.search import CompanySearchRequest, PersonSearchRequest, SearchResponse
from app.services.pdl_service import autocomplete, search_companies, search_persons

router = APIRouter()


@router.post("/persons", response_model=SearchResponse, summary="Search people via PDL")
async def person_search(body: PersonSearchRequest) -> SearchResponse:
    return await search_persons(body)


@router.post("/companies", response_model=SearchResponse, summary="Search companies via PDL")
async def company_search(body: CompanySearchRequest) -> SearchResponse:
    return await search_companies(body)


@router.get("/autocomplete", summary="Autocomplete suggestions from PDL")
async def autocomplete_suggestions(
    field: str = Query(..., description="PDL field to autocomplete"),
    text: str = Query("", description="Partial text to complete"),
    size: int = Query(10, ge=1, le=50),
) -> list[dict]:
    return await autocomplete(field, text, size)
