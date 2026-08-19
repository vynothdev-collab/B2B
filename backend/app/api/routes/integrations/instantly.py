import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.instantly_connection import InstantlyConnection
from app.models.search_record import PersonSearchRecord
from app.models.user import User
from app.schemas.instantly import (
    InstantlyCampaign,
    InstantlyCampaignsResponse,
    InstantlyConnectRequest,
    InstantlyPushItemResult,
    InstantlyPushRequest,
    InstantlyPushResponse,
    InstantlyStatusResponse,
)
from app.services import calendly_service, instantly_service
from app.services.contact_unlock_service import get_unlock_map
from app.services.coresignal_service import _map_person
from app.services.credit_service import CREDIT_COSTS, check_credits, deduct_credit

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/connect", response_model=InstantlyStatusResponse)
async def instantly_connect(
    data: InstantlyConnectRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InstantlyStatusResponse:
    await instantly_service.validate_key_and_list_campaigns(data.api_key)

    result = await db.execute(
        select(InstantlyConnection).where(InstantlyConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        connection = InstantlyConnection(user_id=current_user.id, api_key="")
        db.add(connection)

    instantly_service.set_connection_key(connection, data.api_key)
    await db.flush()
    await db.refresh(connection)

    return InstantlyStatusResponse(connected=True, connected_at=connection.created_at)


@router.get("/status", response_model=InstantlyStatusResponse)
async def instantly_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InstantlyStatusResponse:
    result = await db.execute(
        select(InstantlyConnection).where(InstantlyConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        return InstantlyStatusResponse(connected=False)
    return InstantlyStatusResponse(connected=True, connected_at=connection.created_at)


@router.delete("/disconnect")
async def instantly_disconnect(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(
        select(InstantlyConnection).where(InstantlyConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if connection:
        await db.delete(connection)
    return {"ok": True}


@router.get("/campaigns", response_model=InstantlyCampaignsResponse)
async def instantly_campaigns(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InstantlyCampaignsResponse:
    result = await db.execute(
        select(InstantlyConnection).where(InstantlyConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        raise HTTPException(status_code=400, detail="Instantly is not connected")

    campaigns = await instantly_service.list_campaigns(connection)
    return InstantlyCampaignsResponse(
        campaigns=[InstantlyCampaign(id=c["id"], name=c["name"]) for c in campaigns]
    )


@router.post("/push", response_model=InstantlyPushResponse)
async def instantly_push(
    data: InstantlyPushRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InstantlyPushResponse:
    if not data.items:
        raise HTTPException(status_code=400, detail="No items provided")
    if not data.campaign_id:
        raise HTTPException(status_code=400, detail="A campaign must be selected")

    result = await db.execute(
        select(InstantlyConnection).where(InstantlyConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        raise HTTPException(status_code=400, detail="Instantly is not connected")

    person_items = [i for i in data.items if i.item_type == "person"]
    record_ids = [i.record_id for i in person_items]

    raw_result = await db.execute(
        select(PersonSearchRecord.coresignal_id, PersonSearchRecord.raw_data).where(
            PersonSearchRecord.coresignal_id.in_(record_ids)
        )
    )
    raw_data_map = {row[0]: row[1] for row in raw_result.fetchall()}
    unlock_map = await get_unlock_map(db, current_user.id, record_ids)
    calendly_url = await calendly_service.get_scheduling_url(current_user.id, db)

    results: list[InstantlyPushItemResult] = []
    pushed = 0
    failed = 0

    for item in data.items:
        if item.item_type != "person":
            results.append(InstantlyPushItemResult(
                record_id=item.record_id, error="Only person records can be pushed to Instantly."
            ))
            failed += 1
            continue

        unlocked = unlock_map.get(item.record_id, {})
        unlocked_email = unlocked.get("work_email")
        unlocked_phone = unlocked.get("mobile")

        if not unlocked_email:
            results.append(InstantlyPushItemResult(
                record_id=item.record_id,
                error="Instantly requires an email address to add a lead to a campaign — unlock this record's work email and try again.",
            ))
            failed += 1
            continue

        push_cost = CREDIT_COSTS["crm_push"]
        try:
            await check_credits(current_user, db, push_cost)
        except HTTPException:
            results.append(InstantlyPushItemResult(
                record_id=item.record_id, error="Not enough credits to push this record."
            ))
            failed += 1
            continue

        raw = raw_data_map.get(item.record_id)
        mapped = _map_person(raw) if raw else (item.data if isinstance(item.data, dict) else {})

        lead_fields = instantly_service.map_person_to_lead(mapped, unlocked_email, unlocked_phone, calendly_url)
        try:
            instantly_lead_id = await instantly_service.add_lead_to_campaign(
                connection, data.campaign_id, lead_fields
            )
            await deduct_credit(
                current_user, db, reason="Instantly Push",
                description=f"Pushed to Instantly — {push_cost} credit(s) deducted", amount=push_cost,
            )
            results.append(InstantlyPushItemResult(record_id=item.record_id, instantly_lead_id=instantly_lead_id))
            pushed += 1
        except HTTPException as e:
            results.append(InstantlyPushItemResult(record_id=item.record_id, error=str(e.detail)))
            failed += 1

    await db.flush()
    return InstantlyPushResponse(pushed=pushed, failed=failed, results=results)
