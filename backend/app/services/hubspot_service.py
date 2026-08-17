import logging
from datetime import UTC, datetime, timedelta
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.crypto import decrypt_secret, encrypt_secret
from app.models.hubspot_connection import HubspotConnection

logger = logging.getLogger(__name__)

HUBSPOT_AUTH_BASE_URL = "https://app.hubspot.com/oauth/authorize"
HUBSPOT_API_BASE_URL = "https://api.hubapi.com"
HUBSPOT_SCOPES = "crm.objects.contacts.write crm.objects.contacts.read oauth"


def get_authorize_url(state: str) -> str:
    if not settings.HUBSPOT_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="HubSpot integration is not configured on this server.",
        )
    params = urlencode({
        "client_id": settings.HUBSPOT_CLIENT_ID,
        "redirect_uri": settings.HUBSPOT_CALLBACK_URL,
        "scope": HUBSPOT_SCOPES,
        "state": state,
    })
    return f"{HUBSPOT_AUTH_BASE_URL}?{params}"


async def exchange_code_for_token(code: str) -> dict:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            f"{HUBSPOT_API_BASE_URL}/oauth/v1/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "client_id": settings.HUBSPOT_CLIENT_ID,
                "client_secret": settings.HUBSPOT_CLIENT_SECRET,
                "redirect_uri": settings.HUBSPOT_CALLBACK_URL,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
    if resp.status_code != 200:
        logger.error("HubSpot token exchange failed (%s): %s", resp.status_code, resp.text)
        return {}
    return resp.json()


async def fetch_token_info(access_token: str) -> dict:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(f"{HUBSPOT_API_BASE_URL}/oauth/v1/access-tokens/{access_token}")
    if resp.status_code != 200:
        logger.error("HubSpot token info fetch failed (%s): %s", resp.status_code, resp.text)
        return {}
    return resp.json()


def set_connection_tokens(
    connection: HubspotConnection, access_token: str, refresh_token: str
) -> None:
    """Encrypt and store a fresh access/refresh token pair on the connection."""
    connection.access_token = encrypt_secret(access_token, settings.HUBSPOT_ENCRYPTION_KEY)
    connection.refresh_token = encrypt_secret(refresh_token, settings.HUBSPOT_ENCRYPTION_KEY)


async def refresh_access_token(connection: HubspotConnection) -> bool:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            f"{HUBSPOT_API_BASE_URL}/oauth/v1/token",
            data={
                "grant_type": "refresh_token",
                "refresh_token": decrypt_secret(connection.refresh_token, settings.HUBSPOT_ENCRYPTION_KEY),
                "client_id": settings.HUBSPOT_CLIENT_ID,
                "client_secret": settings.HUBSPOT_CLIENT_SECRET,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
    if resp.status_code != 200:
        return False
    data = resp.json()
    new_access_token = data.get("access_token")
    new_refresh_token = data.get("refresh_token")
    if new_access_token:
        connection.access_token = encrypt_secret(new_access_token, settings.HUBSPOT_ENCRYPTION_KEY)
    if new_refresh_token:
        connection.refresh_token = encrypt_secret(new_refresh_token, settings.HUBSPOT_ENCRYPTION_KEY)
    expires_in = data.get("expires_in")
    if expires_in:
        connection.token_expires_at = datetime.now(UTC) + timedelta(seconds=int(expires_in))
    return True


def map_person_to_contact(mapped_person: dict, unlocked_email: str | None, unlocked_phone: str | None) -> dict:
    properties: dict = {}
    if mapped_person.get("first_name"):
        properties["firstname"] = mapped_person["first_name"]
    last_name = mapped_person.get("last_name") or mapped_person.get("full_name")
    if last_name:
        properties["lastname"] = last_name
    if unlocked_email:
        properties["email"] = unlocked_email
    if unlocked_phone:
        properties["phone"] = unlocked_phone
    if mapped_person.get("active_experience_title"):
        properties["jobtitle"] = mapped_person["active_experience_title"]
    if mapped_person.get("active_experience_company_name"):
        properties["company"] = mapped_person["active_experience_company_name"]
    if mapped_person.get("location_city"):
        properties["city"] = mapped_person["location_city"]
    if mapped_person.get("location_state"):
        properties["state"] = mapped_person["location_state"]
    if mapped_person.get("location_country"):
        properties["country"] = mapped_person["location_country"]
    if mapped_person.get("active_experience_company_website"):
        properties["website"] = mapped_person["active_experience_company_website"]
    return {"properties": properties}


async def create_or_update_contact(connection: HubspotConnection, contact_fields: dict, email: str) -> str:
    async def _put(access_token: str) -> httpx.Response:
        async with httpx.AsyncClient(timeout=10) as client:
            return await client.put(
                f"{HUBSPOT_API_BASE_URL}/crm/v3/objects/contacts/{email}",
                params={"idProperty": "email"},
                json=contact_fields,
                headers={"Authorization": f"Bearer {access_token}"},
            )

    resp = await _put(decrypt_secret(connection.access_token, settings.HUBSPOT_ENCRYPTION_KEY))
    if resp.status_code == 401:
        if not await refresh_access_token(connection):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="HubSpot connection expired. Please reconnect.",
            )
        resp = await _put(decrypt_secret(connection.access_token, settings.HUBSPOT_ENCRYPTION_KEY))

    if resp.status_code not in (200, 201):
        detail = resp.text
        try:
            body = resp.json()
            if isinstance(body, dict) and body.get("message"):
                detail = body["message"]
        except Exception:
            pass
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"HubSpot error: {detail}")

    return resp.json().get("id", "")
