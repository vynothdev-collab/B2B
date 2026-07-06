from fastapi import APIRouter

from app.schemas.search import (
    AgenticSearchRequest,
    CompanySearchRequest,
    PersonSearchRequest,
    SearchResponse,
)
from app.services import coresignal_service

router = APIRouter()


@router.post("/persons", response_model=SearchResponse, summary="Search people")
async def person_search(body: PersonSearchRequest) -> SearchResponse:
    return await coresignal_service.search_persons(body)


@router.post("/companies", response_model=SearchResponse, summary="Search companies")
async def company_search(body: CompanySearchRequest) -> SearchResponse:
    return await coresignal_service.search_companies(body)


@router.post("/agentic", response_model=SearchResponse, summary="Natural-language AI search")
async def agentic_search(body: AgenticSearchRequest) -> SearchResponse:
    return await coresignal_service.agentic_search(body)
