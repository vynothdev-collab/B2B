import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.hubspot_connection import HubspotConnection
from app.models.search_record import CompanySearchRecord, PersonSearchRecord
from app.models.user import User
from app.schemas.hubspot import (
    HubspotConnectRequest,
    HubspotPushItemResult,
    HubspotPushRequest,
    HubspotPushResponse,
    HubspotStatusResponse,
)
from app.services import hubspot_service
from app.services.contact_unlock_service import get_unlock_map
from app.services.coresignal_service import _map_company, _map_person
from app.services.credit_service import CREDIT_COSTS, check_credits, deduct_credit

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/connect", response_model=HubspotStatusResponse)
async def hubspot_connect(
    data: HubspotConnectRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HubspotStatusResponse:
    token_info = await hubspot_service.validate_api_key(data.api_key)

    result = await db.execute(
        select(HubspotConnection).where(HubspotConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        connection = HubspotConnection(user_id=current_user.id, api_key="")
        db.add(connection)

    hubspot_service.set_connection_key(connection, data.api_key)
    connection.hubspot_hub_id = str(token_info.get("hub_id")) if token_info.get("hub_id") else None
    connection.hubspot_hub_domain = token_info.get("hub_domain")
    await db.flush()
    await db.refresh(connection)

    return HubspotStatusResponse(
        connected=True,
        hubspot_hub_id=connection.hubspot_hub_id,
        hubspot_hub_domain=connection.hubspot_hub_domain,
        connected_at=connection.created_at,
    )


@router.get("/status", response_model=HubspotStatusResponse)
async def hubspot_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HubspotStatusResponse:
    result = await db.execute(
        select(HubspotConnection).where(HubspotConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        return HubspotStatusResponse(connected=False)
    return HubspotStatusResponse(
        connected=True,
        hubspot_hub_id=connection.hubspot_hub_id,
        hubspot_hub_domain=connection.hubspot_hub_domain,
        connected_at=connection.created_at,
    )


@router.delete("/disconnect")
async def hubspot_disconnect(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(
        select(HubspotConnection).where(HubspotConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if connection:
        await db.delete(connection)
    return {"ok": True}


@router.post("/push", response_model=HubspotPushResponse)
async def hubspot_push(
    data: HubspotPushRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HubspotPushResponse:
    if not data.items:
        raise HTTPException(status_code=400, detail="No items provided")

    result = await db.execute(
        select(HubspotConnection).where(HubspotConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        raise HTTPException(status_code=400, detail="HubSpot is not connected")

    person_record_ids = [i.record_id for i in data.items if i.item_type == "person"]
    company_record_ids = [i.record_id for i in data.items if i.item_type == "company"]

    person_raw_result = await db.execute(
        select(PersonSearchRecord.coresignal_id, PersonSearchRecord.raw_data).where(
            PersonSearchRecord.coresignal_id.in_(person_record_ids)
        )
    )
    person_raw_map = {row[0]: row[1] for row in person_raw_result.fetchall()}
    unlock_map = await get_unlock_map(db, current_user.id, person_record_ids)

    company_raw_result = await db.execute(
        select(CompanySearchRecord.coresignal_id, CompanySearchRecord.raw_data).where(
            CompanySearchRecord.coresignal_id.in_(company_record_ids)
        )
    )
    company_raw_map = {row[0]: row[1] for row in company_raw_result.fetchall()}

    results: list[HubspotPushItemResult] = []
    pushed = 0
    failed = 0

    for item in data.items:
        if item.item_type not in ("person", "company"):
            results.append(HubspotPushItemResult(
                record_id=item.record_id, error="Only person and company records can be pushed to HubSpot."
            ))
            failed += 1
            continue

        if item.item_type == "person":
            unlocked = unlock_map.get(item.record_id, {})
            unlocked_email = unlocked.get("work_email")
            if not unlocked_email:
                results.append(HubspotPushItemResult(
                    record_id=item.record_id, error="Work email must be unlocked before pushing."
                ))
                failed += 1
                continue

            push_cost = CREDIT_COSTS["crm_push"]
            try:
                await check_credits(current_user, db, push_cost)
            except HTTPException:
                results.append(HubspotPushItemResult(
                    record_id=item.record_id, error="Not enough credits to push this record."
                ))
                failed += 1
                continue

            raw = person_raw_map.get(item.record_id)
            mapped = _map_person(raw) if raw else (item.data if isinstance(item.data, dict) else {})
            unlocked_phone = unlocked.get("mobile")

            contact_fields = hubspot_service.map_person_to_contact(mapped, unlocked_email, unlocked_phone)
            try:
                hubspot_id = await hubspot_service.create_or_update_contact(connection, contact_fields, unlocked_email)
                await deduct_credit(
                    current_user, db, reason="HubSpot Push",
                    description=f"Pushed to HubSpot — {push_cost} credit(s) deducted", amount=push_cost,
                )
                results.append(HubspotPushItemResult(record_id=item.record_id, hubspot_id=hubspot_id))
                pushed += 1
            except HTTPException as e:
                results.append(HubspotPushItemResult(record_id=item.record_id, error=str(e.detail)))
                failed += 1
            continue

        raw = company_raw_map.get(item.record_id)
        mapped = _map_company(raw) if raw else (item.data if isinstance(item.data, dict) else {})
        if not (mapped.get("company_name") or mapped.get("company_legal_name")):
            results.append(HubspotPushItemResult(
                record_id=item.record_id, error="Company record is missing a name."
            ))
            failed += 1
            continue

        push_cost = CREDIT_COSTS["crm_push"]
        try:
            await check_credits(current_user, db, push_cost)
        except HTTPException:
            results.append(HubspotPushItemResult(
                record_id=item.record_id, error="Not enough credits to push this record."
            ))
            failed += 1
            continue

        company_fields = hubspot_service.map_company_to_company(mapped)
        domain = company_fields["properties"].get("domain")
        try:
            hubspot_id = await hubspot_service.create_or_update_company(connection, company_fields, domain)
            await deduct_credit(
                current_user, db, reason="HubSpot Push",
                description=f"Pushed to HubSpot — {push_cost} credit(s) deducted", amount=push_cost,
            )
            results.append(HubspotPushItemResult(record_id=item.record_id, hubspot_id=hubspot_id))
            pushed += 1
        except HTTPException as e:
            results.append(HubspotPushItemResult(record_id=item.record_id, error=str(e.detail)))
            failed += 1

    await db.flush()
    return HubspotPushResponse(pushed=pushed, failed=failed, results=results)
