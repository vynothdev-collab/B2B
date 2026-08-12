from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.api_key_auth import get_api_key_user
from app.core.database import get_db
from app.models.search_log import SearchLog
from app.models.user import User
from app.schemas.search import CompanySearchRequest, PersonSearchRequest, SearchResponse
from app.services import coresignal_service
from app.services.contact_unlock_service import apply_unlock_state, get_unlock_map
from app.services.credit_service import CREDIT_COSTS, check_credits, deduct_credit

router = APIRouter()


@router.post("/persons/search", response_model=SearchResponse, summary="Search people")
async def public_person_search(
    body: PersonSearchRequest,
    current_user: User = Depends(get_api_key_user),
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    cost = CREDIT_COSTS["search"]
    await check_credits(current_user, db, cost)
    result = await coresignal_service.search_persons(body, db=db)
    await deduct_credit(
        current_user, db,
        reason="API People Search",
        description=f"Developer API people search — {cost} credits deducted",
        amount=cost,
    )
    db.add(SearchLog(user_id=current_user.id, search_type="api_person"))
    await db.flush()

    record_ids = [item.get("id") for item in result.data if item.get("id")]
    unlock_map = await get_unlock_map(db, current_user.id, record_ids)
    for item in result.data:
        if item.get("id"):
            apply_unlock_state(item, item["id"], unlock_map)
    return result


@router.post(
    "/companies/search", response_model=SearchResponse, summary="Search companies"
)
async def public_company_search(
    body: CompanySearchRequest,
    current_user: User = Depends(get_api_key_user),
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    cost = CREDIT_COSTS["search"]
    await check_credits(current_user, db, cost)
    result = await coresignal_service.search_companies(body, db=db)
    await deduct_credit(
        current_user, db,
        reason="API Company Search",
        description=f"Developer API company search — {cost} credits deducted",
        amount=cost,
    )
    db.add(SearchLog(user_id=current_user.id, search_type="api_company"))
    await db.flush()
    return result
