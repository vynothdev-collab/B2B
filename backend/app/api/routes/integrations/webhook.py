import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.search_record import PersonSearchRecord
from app.models.user import User
from app.models.webhook_connection import WebhookConnection
from app.schemas.webhook import (
    WebhookConnectRequest,
    WebhookConnectResponse,
    WebhookPushItemResult,
    WebhookPushRequest,
    WebhookPushResponse,
    WebhookRegenerateSecretResponse,
    WebhookStatusResponse,
)
from app.services import webhook_service
from app.services.contact_unlock_service import get_unlock_map
from app.services.coresignal_service import _map_person
from app.services.credit_service import CREDIT_COSTS, check_credits, deduct_credit

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/connect", response_model=WebhookConnectResponse)
async def webhook_connect(
    data: WebhookConnectRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WebhookConnectResponse:
    secret = webhook_service.generate_secret()
    await webhook_service.send_ping(data.webhook_url, secret)

    result = await db.execute(
        select(WebhookConnection).where(WebhookConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        connection = WebhookConnection(user_id=current_user.id, webhook_url="", signing_secret="")
        db.add(connection)

    webhook_service.set_connection(connection, data.webhook_url, secret)
    connection.last_delivery_at = None
    connection.last_delivery_status = None
    await db.flush()
    await db.refresh(connection)

    return WebhookConnectResponse(
        connected=True, webhook_url=connection.webhook_url, signing_secret=secret,
        connected_at=connection.created_at,
    )


@router.get("/status", response_model=WebhookStatusResponse)
async def webhook_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WebhookStatusResponse:
    result = await db.execute(
        select(WebhookConnection).where(WebhookConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        return WebhookStatusResponse(connected=False)
    return WebhookStatusResponse(
        connected=True,
        webhook_url=connection.webhook_url,
        connected_at=connection.created_at,
        last_delivery_at=connection.last_delivery_at,
        last_delivery_status=connection.last_delivery_status,
    )


@router.delete("/disconnect")
async def webhook_disconnect(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(
        select(WebhookConnection).where(WebhookConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if connection:
        await db.delete(connection)
    return {"ok": True}


@router.post("/regenerate-secret", response_model=WebhookRegenerateSecretResponse)
async def webhook_regenerate_secret(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WebhookRegenerateSecretResponse:
    result = await db.execute(
        select(WebhookConnection).where(WebhookConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        raise HTTPException(status_code=400, detail="Webhook is not connected")

    secret = webhook_service.generate_secret()
    webhook_service.set_connection(connection, connection.webhook_url, secret)
    await db.flush()

    return WebhookRegenerateSecretResponse(signing_secret=secret)


@router.post("/push", response_model=WebhookPushResponse)
async def webhook_push(
    data: WebhookPushRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WebhookPushResponse:
    if not data.items:
        raise HTTPException(status_code=400, detail="No items provided")

    result = await db.execute(
        select(WebhookConnection).where(WebhookConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        raise HTTPException(status_code=400, detail="Webhook is not connected")

    person_items = [i for i in data.items if i.item_type == "person"]
    record_ids = [i.record_id for i in person_items]

    raw_result = await db.execute(
        select(PersonSearchRecord.coresignal_id, PersonSearchRecord.raw_data).where(
            PersonSearchRecord.coresignal_id.in_(record_ids)
        )
    )
    raw_data_map = {row[0]: row[1] for row in raw_result.fetchall()}
    unlock_map = await get_unlock_map(db, current_user.id, record_ids)

    results: list[WebhookPushItemResult] = []
    pushed = 0
    failed = 0

    for item in data.items:
        if item.item_type != "person":
            results.append(WebhookPushItemResult(
                record_id=item.record_id, error="Only person records can be pushed to this webhook."
            ))
            failed += 1
            continue

        unlocked = unlock_map.get(item.record_id, {})
        unlocked_email = unlocked.get("work_email")
        if not unlocked_email:
            results.append(WebhookPushItemResult(
                record_id=item.record_id, error="Work email must be unlocked before pushing."
            ))
            failed += 1
            continue

        push_cost = CREDIT_COSTS["crm_push"]
        try:
            await check_credits(current_user, db, push_cost)
        except HTTPException:
            results.append(WebhookPushItemResult(
                record_id=item.record_id, error="Not enough credits to push this record."
            ))
            failed += 1
            continue

        raw = raw_data_map.get(item.record_id)
        mapped = _map_person(raw) if raw else (item.data if isinstance(item.data, dict) else {})
        unlocked_phone = unlocked.get("mobile")

        record = webhook_service.map_person_to_payload(mapped, unlocked_email, unlocked_phone)
        try:
            await webhook_service.deliver(connection, record)
            await deduct_credit(
                current_user, db, reason="Webhook Push",
                description=f"Pushed to webhook — {push_cost} credit(s) deducted", amount=push_cost,
            )
            results.append(WebhookPushItemResult(record_id=item.record_id, delivered=True))
            pushed += 1
        except HTTPException as e:
            results.append(WebhookPushItemResult(record_id=item.record_id, error=str(e.detail)))
            failed += 1

    await db.flush()
    return WebhookPushResponse(pushed=pushed, failed=failed, results=results)
