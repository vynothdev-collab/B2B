import base64
import hashlib
import logging
from datetime import UTC, datetime, timedelta
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.crypto import decrypt_secret, encrypt_secret
from app.models.salesforce_connection import SalesforceConnection

logger = logging.getLogger(__name__)

def _get_login_base_url() -> str:
    return (getattr(settings, "SALESFORCE_LOGIN_URL", None) or "https://login.salesforce.com").rstrip("/")


def make_code_challenge(code_verifier: str) -> str:
    digest = hashlib.sha256(code_verifier.encode()).digest()
    return base64.urlsafe_b64encode(digest).decode().rstrip("=")


def get_authorize_url(state: str, code_challenge: str) -> str:
    if not settings.SALESFORCE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Salesforce integration is not configured on this server.",
        )
    params = urlencode({
        "response_type": "code",
        "client_id": settings.SALESFORCE_CLIENT_ID,
        "redirect_uri": settings.SALESFORCE_CALLBACK_URL,
        "state": state,
        "scope": "api refresh_token id openid",
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
    })
    return f"{_get_login_base_url()}/services/oauth2/authorize?{params}"


async def exchange_code_for_token(code: str, code_verifier: str) -> dict:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            f"{_get_login_base_url()}/services/oauth2/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "client_id": settings.SALESFORCE_CLIENT_ID,
                "client_secret": settings.SALESFORCE_CLIENT_SECRET,
                "redirect_uri": settings.SALESFORCE_CALLBACK_URL,
                "code_verifier": code_verifier,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
    if resp.status_code != 200:
        logger.error("Salesforce token exchange failed (%s): %s", resp.status_code, resp.text)
        try:
            return resp.json()
        except Exception:
            return {"error": f"HTTP {resp.status_code}", "error_description": resp.text}
    return resp.json()


async def fetch_identity(instance_url: str, access_token: str, identity_url: str) -> dict:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            identity_url,
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if resp.status_code != 200:
        logger.error("Salesforce identity fetch failed (%s): %s", resp.status_code, resp.text)
        return {}
    return resp.json()


def set_connection_tokens(
    connection: SalesforceConnection, access_token: str, refresh_token: str | None = None
) -> None:
    """Encrypt and store a fresh access/refresh token pair on the connection."""
    connection.access_token = encrypt_secret(access_token, settings.SALESFORCE_ENCRYPTION_KEY)
    connection.refresh_token = encrypt_secret(refresh_token or "", settings.SALESFORCE_ENCRYPTION_KEY)


async def refresh_access_token(connection: SalesforceConnection) -> bool:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            f"{_get_login_base_url()}/services/oauth2/token",
            data={
                "grant_type": "refresh_token",
                "refresh_token": decrypt_secret(connection.refresh_token, settings.SALESFORCE_ENCRYPTION_KEY),
                "client_id": settings.SALESFORCE_CLIENT_ID,
                "client_secret": settings.SALESFORCE_CLIENT_SECRET,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
    if resp.status_code != 200:
        return False
    data = resp.json()
    new_access_token = data.get("access_token")
    if new_access_token:
        connection.access_token = encrypt_secret(new_access_token, settings.SALESFORCE_ENCRYPTION_KEY)
    connection.instance_url = data.get("instance_url", connection.instance_url)
    connection.token_expires_at = datetime.now(UTC) + timedelta(hours=2)
    return True


def map_person_to_lead(
    mapped_person: dict,
    unlocked_email: str | None,
    unlocked_phone: str | None,
    calendly_url: str | None = None,
) -> dict:
    last_name = mapped_person.get("last_name") or mapped_person.get("full_name") or "Unknown"
    company = mapped_person.get("active_experience_company_name") or "Unknown Company"

    lead: dict = {
        "LastName": last_name,
        "Company": company,
        "LeadSource": "LeadsBuddy",
    }
    if mapped_person.get("first_name"):
        lead["FirstName"] = mapped_person["first_name"]
    if unlocked_email:
        lead["Email"] = unlocked_email
    if unlocked_phone:
        lead["Phone"] = unlocked_phone
        lead["MobilePhone"] = unlocked_phone
    if mapped_person.get("active_experience_title"):
        lead["Title"] = mapped_person["active_experience_title"]
    if mapped_person.get("location_city"):
        lead["City"] = mapped_person["location_city"]
    if mapped_person.get("location_state"):
        lead["State"] = mapped_person["location_state"]
    if mapped_person.get("location_country"):
        lead["Country"] = mapped_person["location_country"]
    if mapped_person.get("active_experience_company_website"):
        lead["Website"] = mapped_person["active_experience_company_website"]
    if calendly_url:
        lead["Description"] = f"Book a meeting: {calendly_url}"
    return lead


async def create_lead(connection: SalesforceConnection, lead_fields: dict) -> str:
    async def _post(access_token: str, instance_url: str) -> httpx.Response:
        async with httpx.AsyncClient(timeout=10) as client:
            return await client.post(
                f"{instance_url}/services/data/{settings.SALESFORCE_API_VERSION}/sobjects/Lead",
                json=lead_fields,
                headers={"Authorization": f"Bearer {access_token}"},
            )

    resp = await _post(decrypt_secret(connection.access_token, settings.SALESFORCE_ENCRYPTION_KEY), connection.instance_url)
    if resp.status_code == 401:
        if not await refresh_access_token(connection):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Salesforce connection expired. Please reconnect.",
            )
        resp = await _post(decrypt_secret(connection.access_token, settings.SALESFORCE_ENCRYPTION_KEY), connection.instance_url)

    if resp.status_code not in (200, 201):
        detail = resp.text
        try:
            body = resp.json()
            if isinstance(body, list) and body:
                detail = body[0].get("message", detail)
        except Exception:
            pass
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Salesforce error: {detail}")

    return resp.json().get("id", "")
