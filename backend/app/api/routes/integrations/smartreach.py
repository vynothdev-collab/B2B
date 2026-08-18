import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.search_record import PersonSearchRecord
from app.models.smartreach_connection import SmartreachConnection
from app.models.user import User
from app.schemas.smartreach import (
    SmartreachCampaign,
    SmartreachCampaignsResponse,
    SmartreachConnectRequest,
    SmartreachPushItemResult,
    SmartreachPushRequest,
    SmartreachPushResponse,
    SmartreachStatusResponse,
)
from app.services import smartreach_service
from app.services.contact_unlock_service import get_unlock_map
from app.services.coresignal_service import _map_person
from app.services.credit_service import CREDIT_COSTS, check_credits, deduct_credit

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/connect", response_model=SmartreachStatusResponse)
async def smartreach_connect(
    data: SmartreachConnectRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SmartreachStatusResponse:
    await smartreach_service.validate_key_and_list_campaigns(data.api_key, data.team_id)

    result = await db.execute(
        select(SmartreachConnection).where(SmartreachConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        connection = SmartreachConnection(user_id=current_user.id, api_key="")
        db.add(connection)

    smartreach_service.set_connection_key(connection, data.api_key, data.team_id)
    await db.flush()
    await db.refresh(connection)

    return SmartreachStatusResponse(connected=True, connected_at=connection.created_at)


@router.get("/status", response_model=SmartreachStatusResponse)
async def smartreach_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SmartreachStatusResponse:
    result = await db.execute(
        select(SmartreachConnection).where(SmartreachConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        return SmartreachStatusResponse(connected=False)
    return SmartreachStatusResponse(connected=True, connected_at=connection.created_at)


@router.delete("/disconnect")
async def smartreach_disconnect(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(
        select(SmartreachConnection).where(SmartreachConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if connection:
        await db.delete(connection)
    return {"ok": True}


@router.get("/campaigns", response_model=SmartreachCampaignsResponse)
async def smartreach_campaigns(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SmartreachCampaignsResponse:
    result = await db.execute(
        select(SmartreachConnection).where(SmartreachConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        raise HTTPException(status_code=400, detail="Smartreach is not connected")

    campaigns = await smartreach_service.list_campaigns(connection)
    return SmartreachCampaignsResponse(
        campaigns=[SmartreachCampaign(id=c["id"], name=c["name"]) for c in campaigns]
    )


@router.post("/push", response_model=SmartreachPushResponse)
async def smartreach_push(
    data: SmartreachPushRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SmartreachPushResponse:
    if not data.items:
        raise HTTPException(status_code=400, detail="No items provided")
    if not data.campaign_id:
        raise HTTPException(status_code=400, detail="A campaign must be selected")

    result = await db.execute(
        select(SmartreachConnection).where(SmartreachConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        raise HTTPException(status_code=400, detail="Smartreach is not connected")

    person_items = [i for i in data.items if i.item_type == "person"]
    record_ids = [i.record_id for i in person_items]

    raw_result = await db.execute(
        select(PersonSearchRecord.coresignal_id, PersonSearchRecord.raw_data).where(
            PersonSearchRecord.coresignal_id.in_(record_ids)
        )
    )
    raw_data_map = {row[0]: row[1] for row in raw_result.fetchall()}
    unlock_map = await get_unlock_map(db, current_user.id, record_ids)

    results: list[SmartreachPushItemResult] = []
    pushed = 0
    failed = 0

    for item in data.items:
        if item.item_type != "person":
            results.append(SmartreachPushItemResult(
                record_id=item.record_id, error="Only person records can be pushed to Smartreach."
            ))
            failed += 1
            continue

        unlocked = unlock_map.get(item.record_id, {})
        unlocked_email = unlocked.get("work_email")
        if not unlocked_email:
            results.append(SmartreachPushItemResult(
                record_id=item.record_id, error="Work email must be unlocked before pushing."
            ))
            failed += 1
            continue

        push_cost = CREDIT_COSTS["crm_push"]
        try:
            await check_credits(current_user, db, push_cost)
        except HTTPException:
            results.append(SmartreachPushItemResult(
                record_id=item.record_id, error="Not enough credits to push this record."
            ))
            failed += 1
            continue

        raw = raw_data_map.get(item.record_id)
        mapped = _map_person(raw) if raw else (item.data if isinstance(item.data, dict) else {})
        unlocked_phone = unlocked.get("mobile")

        prospect_fields = smartreach_service.map_person_to_prospect(mapped, unlocked_email, unlocked_phone)
        try:
            smartreach_prospect_id = await smartreach_service.add_prospect_to_campaign(
                connection, data.campaign_id, prospect_fields
            )
            await deduct_credit(
                current_user, db, reason="Smartreach Push",
                description=f"Pushed to Smartreach — {push_cost} credit(s) deducted", amount=push_cost,
            )
            results.append(SmartreachPushItemResult(
                record_id=item.record_id, smartreach_prospect_id=smartreach_prospect_id
            ))
            pushed += 1
        except HTTPException as e:
            results.append(SmartreachPushItemResult(record_id=item.record_id, error=str(e.detail)))
            failed += 1

    await db.flush()
    return SmartreachPushResponse(pushed=pushed, failed=failed, results=results)
