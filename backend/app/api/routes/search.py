from fastapi import APIRouter

from app.schemas.search import CompanySearchRequest, PersonSearchRequest, SearchResponse
from app.services.pdl_service import search_companies, search_persons

router = APIRouter()


@router.post("/persons", response_model=SearchResponse, summary="Search people via PDL")
async def person_search(body: PersonSearchRequest) -> SearchResponse:
    return await search_persons(body)


@router.post("/companies", response_model=SearchResponse, summary="Search companies via PDL")
async def company_search(body: CompanySearchRequest) -> SearchResponse:
    return await search_companies(body)
