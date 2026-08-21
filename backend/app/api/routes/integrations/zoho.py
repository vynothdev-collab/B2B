import base64
import hashlib
import hmac
import logging
import secrets
import time

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.search_record import CompanySearchRecord, PersonSearchRecord
from app.models.user import User
from app.models.zoho_connection import ZohoConnection
from app.schemas.zoho import (
    ZohoAuthorizeResponse,
    ZohoPushItemResult,
    ZohoPushRequest,
    ZohoPushResponse,
    ZohoStatusResponse,
)
from app.services import zoho_service
from app.services.contact_unlock_service import get_unlock_map
from app.services.coresignal_service import _map_company, _map_person
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


@router.get("/authorize", response_model=ZohoAuthorizeResponse)
async def zoho_authorize(
    current_user: User = Depends(get_current_user),
) -> ZohoAuthorizeResponse:
    state = _make_integration_state(current_user.id)
    return ZohoAuthorizeResponse(url=zoho_service.get_authorize_url(state))


@router.get("/callback")
async def zoho_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    accounts_server: str | None = Query(default=None, alias="accounts-server"),
    db: AsyncSession = Depends(get_db),
) -> RedirectResponse:
    base = (settings.FRONTEND_URL or "http://localhost:3000").rstrip("/")
    frontend_cb = base + "/search/integrations"

    if error:
        logger.warning("Zoho OAuth callback returned error=%s", error)
        return RedirectResponse(url=f"{frontend_cb}?error=auth_failed", status_code=302)

    user_id = _verify_integration_state(state) if state else None
    if not user_id:
        logger.warning("Zoho OAuth callback failed state verification (state=%r)", state)
        return RedirectResponse(url=f"{frontend_cb}?error=invalid_state", status_code=302)

    if not code:
        logger.warning("Zoho OAuth callback missing code (user_id=%s)", user_id)
        return RedirectResponse(url=f"{frontend_cb}?error=auth_failed", status_code=302)

    token_data = await zoho_service.exchange_code_for_token(code, accounts_server)
    if "error" in token_data:
        err_msg = token_data.get("error_description") or token_data.get("error") or "Token exchange failed"
        logger.warning("Zoho OAuth token exchange error for user %s: %s", user_id, err_msg)
        return RedirectResponse(url=f"{frontend_cb}?error=auth_failed&detail={err_msg}", status_code=302)

    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")
    api_domain = token_data.get("api_domain")

    if not access_token or not refresh_token or not api_domain:
        logger.warning(
            "Zoho OAuth token exchange incomplete (user_id=%s, keys=%s)",
            user_id, list(token_data.keys()),
        )
        return RedirectResponse(url=f"{frontend_cb}?error=auth_failed", status_code=302)

    result = await db.execute(
        select(ZohoConnection).where(ZohoConnection.user_id == user_id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        connection = ZohoConnection(
            user_id=user_id, access_token="", refresh_token="", api_domain=api_domain
        )
        db.add(connection)
    else:
        connection.api_domain = api_domain

    zoho_service.set_connection_tokens(connection, access_token, refresh_token)
    connection.zoho_user_email = await zoho_service.fetch_user_email(access_token)
    await db.flush()

    return RedirectResponse(url=f"{frontend_cb}?connected=zoho", status_code=302)


@router.get("/status", response_model=ZohoStatusResponse)
async def zoho_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ZohoStatusResponse:
    result = await db.execute(
        select(ZohoConnection).where(ZohoConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        return ZohoStatusResponse(connected=False)
    return ZohoStatusResponse(
        connected=True,
        zoho_user_email=connection.zoho_user_email,
        connected_at=connection.created_at,
    )


@router.delete("/disconnect")
async def zoho_disconnect(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(
        select(ZohoConnection).where(ZohoConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if connection:
        await db.delete(connection)
    return {"ok": True}


@router.post("/push", response_model=ZohoPushResponse)
async def zoho_push(
    data: ZohoPushRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ZohoPushResponse:
    if not data.items:
        raise HTTPException(status_code=400, detail="No items provided")

    result = await db.execute(
        select(ZohoConnection).where(ZohoConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        raise HTTPException(status_code=400, detail="Zoho is not connected")

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

    results: list[ZohoPushItemResult] = []
    pushed = 0
    failed = 0

    for item in data.items:
        if item.item_type not in ("person", "company"):
            results.append(ZohoPushItemResult(
                record_id=item.record_id, error="Only person and company records can be pushed to Zoho."
            ))
            failed += 1
            continue

        if item.item_type == "person":
            unlocked = unlock_map.get(item.record_id, {})
            unlocked_email = unlocked.get("work_email")
            unlocked_phone = unlocked.get("mobile")

            push_cost = CREDIT_COSTS["crm_push"]
            try:
                await check_credits(current_user, db, push_cost)
            except HTTPException:
                results.append(ZohoPushItemResult(
                    record_id=item.record_id, error="Not enough credits to push this record."
                ))
                failed += 1
                continue

            raw = person_raw_map.get(item.record_id)
            mapped = _map_person(raw) if raw else (item.data if isinstance(item.data, dict) else {})

            lead_fields = zoho_service.map_person_to_lead(mapped, unlocked_email, unlocked_phone)
            try:
                zoho_id = await zoho_service.create_lead(connection, lead_fields)
                await deduct_credit(
                    current_user, db, reason="Zoho Push",
                    description=f"Pushed to Zoho — {push_cost} credit(s) deducted", amount=push_cost,
                )
                results.append(ZohoPushItemResult(record_id=item.record_id, zoho_id=zoho_id))
                pushed += 1
            except HTTPException as e:
                results.append(ZohoPushItemResult(record_id=item.record_id, error=str(e.detail)))
                failed += 1
            continue

        raw = company_raw_map.get(item.record_id)
        mapped = _map_company(raw) if raw else (item.data if isinstance(item.data, dict) else {})
        if not (mapped.get("company_name") or mapped.get("company_legal_name")):
            results.append(ZohoPushItemResult(
                record_id=item.record_id, error="Company record is missing a name."
            ))
            failed += 1
            continue

        push_cost = CREDIT_COSTS["crm_push"]
        try:
            await check_credits(current_user, db, push_cost)
        except HTTPException:
            results.append(ZohoPushItemResult(
                record_id=item.record_id, error="Not enough credits to push this record."
            ))
            failed += 1
            continue

        account_fields = zoho_service.map_company_to_account(mapped)
        try:
            zoho_id = await zoho_service.create_account(connection, account_fields)
            await deduct_credit(
                current_user, db, reason="Zoho Push",
                description=f"Pushed to Zoho — {push_cost} credit(s) deducted", amount=push_cost,
            )
            results.append(ZohoPushItemResult(record_id=item.record_id, zoho_id=zoho_id))
            pushed += 1
        except HTTPException as e:
            results.append(ZohoPushItemResult(record_id=item.record_id, error=str(e.detail)))
            failed += 1

    await db.flush()
    return ZohoPushResponse(pushed=pushed, failed=failed, results=results)
