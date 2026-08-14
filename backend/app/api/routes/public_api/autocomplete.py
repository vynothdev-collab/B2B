from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.api_key_auth import get_api_key_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.search import TitleAutocompleteResponse
from app.services import autocomplete_service, filter_options

router = APIRouter()

AutocompleteField = Literal[
    "job_title",
    "technology",
    "seniority",
    "department",
    "industry",
    "company_status",
    "company_how_they_sell",
    "company_more_flags",
    "company_revenue_model",
    "revenue_bucket",
    "funding_stage",
    "email_provider",
    "certification",
]

@router.get(
    "/autocomplete",
    response_model=TitleAutocompleteResponse,
    summary="Autocomplete suggestions for a filter field",
)
async def public_autocomplete(
    field: AutocompleteField = Query(
        ..., description="Which filter field to get suggestions for."
    ),
    text: str = Query(..., min_length=1, max_length=100),
    size: int = Query(default=10, ge=1, le=25),
    current_user: User = Depends(get_api_key_user),
    db: AsyncSession = Depends(get_db),
) -> TitleAutocompleteResponse:
    if field == "job_title":
        suggestions = await autocomplete_service.suggest_titles(text, size)
    elif field == "technology":
        suggestions = await autocomplete_service.suggest_technologies(text, size, db)
    else:
        suggestions = filter_options.search_options(field, text, size)
    return TitleAutocompleteResponse(suggestions=suggestions)
