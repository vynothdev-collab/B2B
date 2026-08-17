import logging

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.crypto import decrypt_secret, encrypt_secret
from app.models.instantly_connection import InstantlyConnection

logger = logging.getLogger(__name__)

INSTANTLY_API_BASE = "https://api.instantly.ai/api/v2"


def _auth_headers(api_key: str) -> dict:
    return {"Authorization": f"Bearer {api_key}"}


async def validate_key_and_list_campaigns(api_key: str) -> list[dict]:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(f"{INSTANTLY_API_BASE}/campaigns", headers=_auth_headers(api_key))

    if resp.status_code in (401, 403):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Instantly API key.")
    if resp.status_code != 200:
        logger.error("Instantly campaign list failed (%s): %s", resp.status_code, resp.text)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach Instantly. Please try again.",
        )

    body = resp.json()
    items = body.get("items", body if isinstance(body, list) else [])
    return [{"id": c.get("id"), "name": c.get("name")} for c in items]


def set_connection_key(connection: InstantlyConnection, api_key: str) -> None:
    connection.api_key = encrypt_secret(api_key, settings.INSTANTLY_ENCRYPTION_KEY)


async def list_campaigns(connection: InstantlyConnection) -> list[dict]:
    api_key = decrypt_secret(connection.api_key, settings.INSTANTLY_ENCRYPTION_KEY)
    return await validate_key_and_list_campaigns(api_key)


def map_person_to_lead(mapped_person: dict, unlocked_email: str | None, unlocked_phone: str | None) -> dict:
    lead: dict = {}
    if unlocked_email:
        lead["email"] = unlocked_email
    if mapped_person.get("first_name"):
        lead["first_name"] = mapped_person["first_name"]
    last_name = mapped_person.get("last_name") or mapped_person.get("full_name")
    if last_name:
        lead["last_name"] = last_name
    if mapped_person.get("active_experience_company_name"):
        lead["company_name"] = mapped_person["active_experience_company_name"]
    if unlocked_phone:
        lead["phone"] = unlocked_phone
    return lead


async def add_lead_to_campaign(connection: InstantlyConnection, campaign_id: str, lead_fields: dict) -> str:
    api_key = decrypt_secret(connection.api_key, settings.INSTANTLY_ENCRYPTION_KEY)
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            f"{INSTANTLY_API_BASE}/leads",
            json={"campaign": campaign_id, **lead_fields},
            headers=_auth_headers(api_key),
        )

    if resp.status_code not in (200, 201):
        detail = resp.text
        try:
            body = resp.json()
            if isinstance(body, dict) and body.get("message"):
                detail = body["message"]
        except Exception:
            pass
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Instantly error: {detail}")

    return resp.json().get("id", "")
