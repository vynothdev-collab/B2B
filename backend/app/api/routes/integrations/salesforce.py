import base64
import hashlib
import hmac
import logging
import secrets
import time

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.salesforce_connection import SalesforceConnection
from app.models.search_record import CompanySearchRecord, PersonSearchRecord
from app.models.user import User
from app.schemas.salesforce import (
    SalesforceAuthorizeResponse,
    SalesforcePushItemResult,
    SalesforcePushRequest,
    SalesforcePushResponse,
    SalesforceStatusResponse,
)
from app.services import calendly_service, salesforce_service
from app.services.contact_unlock_service import get_unlock_map
from app.services.coresignal_service import _map_company, _map_person
from app.services.credit_service import CREDIT_COSTS, check_credits, deduct_credit

router = APIRouter()
logger = logging.getLogger(__name__)


# ── Signed state carrying the authenticated user id + PKCE code_verifier
# (separate from the login OAuth state helpers in auth.py, which don't need to
# identify a user or support PKCE) ──────────────────────────────────────────────

def _make_integration_state(user_id: str) -> tuple[str, str]:
    code_verifier = secrets.token_urlsafe(64)[:128]
    nonce = secrets.token_hex(16)
    ts = str(int(time.time()))
    payload = f"{user_id}:{code_verifier}:{nonce}:{ts}"
    sig = hmac.new(settings.SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
    raw = f"{payload}:{sig}"
    return base64.urlsafe_b64encode(raw.encode()).decode(), code_verifier


def _verify_integration_state(state: str, max_age: int = 600) -> tuple[str, str] | None:
    try:
        raw = base64.urlsafe_b64decode(state.encode()).decode()
        user_id, code_verifier, nonce, ts, sig = raw.split(":", 4)
        if int(time.time()) - int(ts) > max_age:
            return None
        payload = f"{user_id}:{code_verifier}:{nonce}:{ts}"
        expected = hmac.new(settings.SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        return user_id, code_verifier
    except Exception:
        return None


@router.get("/authorize", response_model=SalesforceAuthorizeResponse)
async def salesforce_authorize(
    current_user: User = Depends(get_current_user),
) -> SalesforceAuthorizeResponse:
    state, code_verifier = _make_integration_state(current_user.id)
    code_challenge = salesforce_service.make_code_challenge(code_verifier)
    return SalesforceAuthorizeResponse(
        url=salesforce_service.get_authorize_url(state, code_challenge)
    )


@router.get("/callback")
async def salesforce_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    error_description: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> RedirectResponse:
    base = (settings.FRONTEND_URL or "http://localhost:3000").rstrip("/")
    frontend_cb = base + "/search/integrations"

    if error:
        logger.warning(
            "Salesforce OAuth callback returned error=%s description=%s",
            error, error_description,
        )
        error_code = "cancelled" if error == "access_denied" else "auth_failed"
        detail_param = f"&detail={error_description}" if error_description else f"&detail={error}"
        return RedirectResponse(url=f"{frontend_cb}?error={error_code}{detail_param}", status_code=302)

    verified = _verify_integration_state(state) if state else None
    if not verified:
        logger.warning("Salesforce OAuth callback failed state verification (state=%r)", state)
        return RedirectResponse(url=f"{frontend_cb}?error=invalid_state", status_code=302)
    user_id, code_verifier = verified

    if not code:
        logger.warning("Salesforce OAuth callback missing code (user_id=%s)", user_id)
        return RedirectResponse(url=f"{frontend_cb}?error=auth_failed&detail=Missing+code", status_code=302)

    token_data = await salesforce_service.exchange_code_for_token(code, code_verifier)
    if "error" in token_data:
        err_msg = token_data.get("error_description") or token_data.get("error") or "Token exchange failed"
        logger.warning("Salesforce OAuth token exchange error for user %s: %s", user_id, err_msg)
        return RedirectResponse(url=f"{frontend_cb}?error=auth_failed&detail={err_msg}", status_code=302)

    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token") or ""
    instance_url = token_data.get("instance_url")
    identity_url = token_data.get("id")

    if not access_token or not instance_url:
        logger.warning(
            "Salesforce OAuth token exchange incomplete (user_id=%s, keys=%s)",
            user_id, list(token_data.keys()),
        )
        return RedirectResponse(url=f"{frontend_cb}?error=auth_failed&detail=Incomplete+token+response", status_code=302)

    identity = (
        await salesforce_service.fetch_identity(instance_url, access_token, identity_url)
        if identity_url
        else {}
    )

    result = await db.execute(
        select(SalesforceConnection).where(SalesforceConnection.user_id == user_id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        connection = SalesforceConnection(user_id=user_id, instance_url=instance_url,
                                           access_token="", refresh_token="")
        db.add(connection)
    else:
        connection.instance_url = instance_url

    salesforce_service.set_connection_tokens(connection, access_token, refresh_token)
    connection.salesforce_org_id = identity.get("organization_id")
    connection.salesforce_user_email = identity.get("email")
    await db.flush()

    return RedirectResponse(url=f"{frontend_cb}?connected=salesforce", status_code=302)


@router.get("/status", response_model=SalesforceStatusResponse)
async def salesforce_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SalesforceStatusResponse:
    result = await db.execute(
        select(SalesforceConnection).where(SalesforceConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        return SalesforceStatusResponse(connected=False)
    return SalesforceStatusResponse(
        connected=True,
        salesforce_org_id=connection.salesforce_org_id,
        salesforce_user_email=connection.salesforce_user_email,
        connected_at=connection.created_at,
    )


@router.delete("/disconnect")
async def salesforce_disconnect(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(
        select(SalesforceConnection).where(SalesforceConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if connection:
        await db.delete(connection)
    return {"ok": True}


@router.post("/push", response_model=SalesforcePushResponse)
async def salesforce_push(
    data: SalesforcePushRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SalesforcePushResponse:
    if not data.items:
        raise HTTPException(status_code=400, detail="No items provided")

    result = await db.execute(
        select(SalesforceConnection).where(SalesforceConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        raise HTTPException(status_code=400, detail="Salesforce is not connected")

    person_record_ids = [i.record_id for i in data.items if i.item_type == "person"]
    company_record_ids = [i.record_id for i in data.items if i.item_type == "company"]

    person_raw_result = await db.execute(
        select(PersonSearchRecord.coresignal_id, PersonSearchRecord.raw_data).where(
            PersonSearchRecord.coresignal_id.in_(person_record_ids)
        )
    )
    person_raw_map = {row[0]: row[1] for row in person_raw_result.fetchall()}
    unlock_map = await get_unlock_map(db, current_user.id, person_record_ids)
    calendly_url = await calendly_service.get_scheduling_url(current_user.id, db)

    company_raw_result = await db.execute(
        select(CompanySearchRecord.coresignal_id, CompanySearchRecord.raw_data).where(
            CompanySearchRecord.coresignal_id.in_(company_record_ids)
        )
    )
    company_raw_map = {row[0]: row[1] for row in company_raw_result.fetchall()}

    results: list[SalesforcePushItemResult] = []
    pushed = 0
    failed = 0

    for item in data.items:
        if item.item_type not in ("person", "company"):
            results.append(SalesforcePushItemResult(
                record_id=item.record_id, error="Only person and company records can be pushed to Salesforce."
            ))
            failed += 1
            continue

        if item.item_type == "person":
            unlocked = unlock_map.get(item.record_id, {})
            unlocked_email = unlocked.get("work_email")
            if not unlocked_email:
                results.append(SalesforcePushItemResult(
                    record_id=item.record_id, error="Work email must be unlocked before pushing."
                ))
                failed += 1
                continue

            push_cost = CREDIT_COSTS["crm_push"]
            try:
                await check_credits(current_user, db, push_cost)
            except HTTPException:
                results.append(SalesforcePushItemResult(
                    record_id=item.record_id, error="Not enough credits to push this record."
                ))
                failed += 1
                continue

            raw = person_raw_map.get(item.record_id)
            mapped = _map_person(raw) if raw else (item.data if isinstance(item.data, dict) else {})
            unlocked_phone = unlocked.get("mobile")

            lead_fields = salesforce_service.map_person_to_lead(mapped, unlocked_email, unlocked_phone, calendly_url)
            try:
                salesforce_id = await salesforce_service.create_lead(connection, lead_fields)
                await deduct_credit(
                    current_user, db, reason="Salesforce Push",
                    description=f"Pushed to Salesforce — {push_cost} credit(s) deducted", amount=push_cost,
                )
                results.append(SalesforcePushItemResult(record_id=item.record_id, salesforce_id=salesforce_id))
                pushed += 1
            except HTTPException as e:
                results.append(SalesforcePushItemResult(record_id=item.record_id, error=str(e.detail)))
                failed += 1
            continue

        raw = company_raw_map.get(item.record_id)
        mapped = _map_company(raw) if raw else (item.data if isinstance(item.data, dict) else {})
        if not (mapped.get("company_name") or mapped.get("company_legal_name")):
            results.append(SalesforcePushItemResult(
                record_id=item.record_id, error="Company record is missing a name."
            ))
            failed += 1
            continue

        push_cost = CREDIT_COSTS["crm_push"]
        try:
            await check_credits(current_user, db, push_cost)
        except HTTPException:
            results.append(SalesforcePushItemResult(
                record_id=item.record_id, error="Not enough credits to push this record."
            ))
            failed += 1
            continue

        account_fields = salesforce_service.map_company_to_account(mapped)
        try:
            salesforce_id = await salesforce_service.create_account(connection, account_fields)
            await deduct_credit(
                current_user, db, reason="Salesforce Push",
                description=f"Pushed to Salesforce — {push_cost} credit(s) deducted", amount=push_cost,
            )
            results.append(SalesforcePushItemResult(record_id=item.record_id, salesforce_id=salesforce_id))
            pushed += 1
        except HTTPException as e:
            results.append(SalesforcePushItemResult(record_id=item.record_id, error=str(e.detail)))
            failed += 1

    await db.flush()
    return SalesforcePushResponse(pushed=pushed, failed=failed, results=results)
