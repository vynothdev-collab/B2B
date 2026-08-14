from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.api_key_auth import get_api_key_user
from app.core.database import get_db
from app.models.search_log import SearchLog
from app.models.user import User
from app.schemas.search import AgenticSearchRequest, SearchResponse
from app.services import coresignal_service
from app.services.contact_unlock_service import apply_unlock_state, get_unlock_map
from app.services.credit_service import CREDIT_COSTS, check_credits, deduct_credit

router = APIRouter()


@router.post(
    "/ai-search",
    response_model=SearchResponse,
    summary="Natural-language AI search for people or companies",
)
async def public_ai_search(
    body: AgenticSearchRequest,
    current_user: User = Depends(get_api_key_user),
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    cost = CREDIT_COSTS["search"]
    await check_credits(current_user, db, cost)
    result = await coresignal_service.agentic_search(body, db=db, full_detail=True)
    await deduct_credit(
        current_user, db,
        reason="API AI Search",
        description=f"Developer API AI search — {cost} credits deducted",
        amount=cost,
    )
    db.add(SearchLog(user_id=current_user.id, search_type="api_ai_search"))
    await db.flush()

    if body.entity == "employee":
        record_ids = [item.get("id") for item in result.data if item.get("id")]
        unlock_map = await get_unlock_map(db, current_user.id, record_ids)
        for item in result.data:
            if item.get("id"):
                apply_unlock_state(item, item["id"], unlock_map)
    return result
