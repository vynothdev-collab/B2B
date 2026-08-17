import base64
import hashlib
import hmac
import logging
import secrets
import time
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.hubspot_connection import HubspotConnection
from app.models.search_record import PersonSearchRecord
from app.models.user import User
from app.schemas.hubspot import (
    HubspotAuthorizeResponse,
    HubspotPushItemResult,
    HubspotPushRequest,
    HubspotPushResponse,
    HubspotStatusResponse,
)
from app.services import hubspot_service
from app.services.contact_unlock_service import get_unlock_map
from app.services.coresignal_service import _map_person
from app.services.credit_service import CREDIT_COSTS, check_credits, deduct_credit

router = APIRouter()
logger = logging.getLogger(__name__)


# ── Signed state carrying the authenticated user id (separate from the login
# OAuth state helpers in auth.py, which don't need to identify a user) ──────

def _make_integration_state(user_id: str) -> str:
    nonce = secrets.token_hex(16)
    ts = str(int(time.time()))
    payload = f"{user_id}:{nonce}:{ts}"
    sig = hmac.new(settings.SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
    raw = f"{payload}:{sig}"
    return base64.urlsafe_b64encode(raw.encode()).decode()


def _verify_integration_state(state: str, max_age: int = 600) -> str | None:
    try:
        raw = base64.urlsafe_b64decode(state.encode()).decode()
        user_id, nonce, ts, sig = raw.split(":", 3)
        if int(time.time()) - int(ts) > max_age:
            return None
        payload = f"{user_id}:{nonce}:{ts}"
        expected = hmac.new(settings.SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        return user_id
    except Exception:
        return None


@router.get("/authorize", response_model=HubspotAuthorizeResponse)
async def hubspot_authorize(
    current_user: User = Depends(get_current_user),
) -> HubspotAuthorizeResponse:
    state = _make_integration_state(current_user.id)
    return HubspotAuthorizeResponse(url=hubspot_service.get_authorize_url(state))


@router.get("/callback")
async def hubspot_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> RedirectResponse:
    base = (settings.FRONTEND_URL or "http://localhost:3000").rstrip("/")
    frontend_cb = base + "/search/integrations"

    if error:
        logger.warning("HubSpot OAuth callback returned error=%s", error)
        error_code = "cancelled" if error == "access_denied" else "auth_failed"
        return RedirectResponse(url=f"{frontend_cb}?error={error_code}", status_code=302)

    user_id = _verify_integration_state(state) if state else None
    if not user_id:
        logger.warning("HubSpot OAuth callback failed state verification (state=%r)", state)
        return RedirectResponse(url=f"{frontend_cb}?error=invalid_state", status_code=302)

    if not code:
        logger.warning("HubSpot OAuth callback missing code (user_id=%s)", user_id)
        return RedirectResponse(url=f"{frontend_cb}?error=auth_failed", status_code=302)

    token_data = await hubspot_service.exchange_code_for_token(code)
    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")

    if not access_token or not refresh_token:
        logger.warning(
            "HubSpot OAuth token exchange incomplete (user_id=%s, keys=%s)",
            user_id, list(token_data.keys()),
        )
        return RedirectResponse(url=f"{frontend_cb}?error=auth_failed", status_code=302)

    token_info = await hubspot_service.fetch_token_info(access_token)

    result = await db.execute(
        select(HubspotConnection).where(HubspotConnection.user_id == user_id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        connection = HubspotConnection(user_id=user_id, access_token="", refresh_token="")
        db.add(connection)

    hubspot_service.set_connection_tokens(connection, access_token, refresh_token)
    connection.hubspot_hub_id = str(token_info.get("hub_id")) if token_info.get("hub_id") else None
    connection.hubspot_hub_domain = token_info.get("hub_domain")
    expires_in = token_data.get("expires_in")
    if expires_in:
        connection.token_expires_at = datetime.now(UTC) + timedelta(seconds=int(expires_in))
    await db.flush()

    return RedirectResponse(url=f"{frontend_cb}?connected=hubspot", status_code=302)


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

    person_items = [i for i in data.items if i.item_type == "person"]
    record_ids = [i.record_id for i in person_items]

    raw_result = await db.execute(
        select(PersonSearchRecord.coresignal_id, PersonSearchRecord.raw_data).where(
            PersonSearchRecord.coresignal_id.in_(record_ids)
        )
    )
    raw_data_map = {row[0]: row[1] for row in raw_result.fetchall()}
    unlock_map = await get_unlock_map(db, current_user.id, record_ids)

    results: list[HubspotPushItemResult] = []
    pushed = 0
    failed = 0

    for item in data.items:
        if item.item_type != "person":
            results.append(HubspotPushItemResult(
                record_id=item.record_id, error="Only person records can be pushed to HubSpot."
            ))
            failed += 1
            continue

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

        raw = raw_data_map.get(item.record_id)
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

    await db.flush()
    return HubspotPushResponse(pushed=pushed, failed=failed, results=results)
