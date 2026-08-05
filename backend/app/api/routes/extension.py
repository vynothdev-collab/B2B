from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.search_log import SearchLog
from app.models.user import User
from app.schemas.extension import (
    ExtensionCompanySearchRequest,
    ExtensionPersonSearchRequest,
)
from app.schemas.search import SearchResponse
from app.services import coresignal_service
from app.services.credit_service import CREDIT_COSTS, check_credits, deduct_credit

router = APIRouter()

COST = CREDIT_COSTS["search"]


def _log_search(db: AsyncSession, user_id: str, search_type: str) -> None:
    db.add(SearchLog(user_id=user_id, search_type=search_type))


@router.post("/person", response_model=SearchResponse, summary="Extension person lookup by LinkedIn URL")
async def extension_person_search(
    body: ExtensionPersonSearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    await check_credits(current_user, db, COST)
    result = await coresignal_service.search_extension_person(
        linkedin_url=body.linkedin_url,
        db=db,
    )
    await deduct_credit(
        current_user,
        db,
        reason="Extension Person Search",
        description=f"Extension person search — {body.linkedin_url}",
        amount=COST,
    )
    _log_search(db, current_user.id, "person")
    await db.flush()
    return result


@router.post("/company", response_model=SearchResponse, summary="Extension company lookup by LinkedIn URL / website / name")
async def extension_company_search(
    body: ExtensionCompanySearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    await check_credits(current_user, db, COST)
    result = await coresignal_service.search_extension_company(
        linkedin_url=body.linkedin_url,
        website=body.website,
        company_name=body.company_name,
        db=db,
    )
    identifier = body.linkedin_url or body.website or body.company_name
    await deduct_credit(
        current_user,
        db,
        reason="Extension Company Search",
        description=f"Extension company search — {identifier}",
        amount=COST,
    )
    _log_search(db, current_user.id, "company")
    await db.flush()
    return result
