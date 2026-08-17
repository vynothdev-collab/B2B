import logging

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.crypto import decrypt_secret, encrypt_secret
from app.models.smartreach_connection import SmartreachConnection

logger = logging.getLogger(__name__)

SMARTREACH_API_BASE = "https://api.smartreach.io/api/v1"


def _auth_headers(api_key: str) -> dict:
    return {"Api-Key": api_key}


async def validate_key_and_list_campaigns(api_key: str) -> list[dict]:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(f"{SMARTREACH_API_BASE}/campaigns/list", headers=_auth_headers(api_key))

    if resp.status_code in (401, 403):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Smartreach API key.")
    if resp.status_code != 200:
        logger.error("Smartreach campaign list failed (%s): %s", resp.status_code, resp.text)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach Smartreach. Please try again.",
        )

    body = resp.json()
    items = body.get("campaigns", body if isinstance(body, list) else [])
    return [{"id": str(c.get("id")), "name": c.get("name")} for c in items]


def set_connection_key(connection: SmartreachConnection, api_key: str) -> None:
    connection.api_key = encrypt_secret(api_key, settings.SMARTREACH_ENCRYPTION_KEY)


async def list_campaigns(connection: SmartreachConnection) -> list[dict]:
    api_key = decrypt_secret(connection.api_key, settings.SMARTREACH_ENCRYPTION_KEY)
    return await validate_key_and_list_campaigns(api_key)


def map_person_to_prospect(mapped_person: dict, unlocked_email: str | None, unlocked_phone: str | None) -> dict:
    prospect: dict = {}
    if unlocked_email:
        prospect["email"] = unlocked_email
    if mapped_person.get("first_name"):
        prospect["first_name"] = mapped_person["first_name"]
    last_name = mapped_person.get("last_name") or mapped_person.get("full_name")
    if last_name:
        prospect["last_name"] = last_name
    if mapped_person.get("active_experience_company_name"):
        prospect["company_name"] = mapped_person["active_experience_company_name"]
    if unlocked_phone:
        prospect["phone"] = unlocked_phone
    return prospect


async def add_prospect_to_campaign(connection: SmartreachConnection, campaign_id: str, prospect_fields: dict) -> str:
    api_key = decrypt_secret(connection.api_key, settings.SMARTREACH_ENCRYPTION_KEY)
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            f"{SMARTREACH_API_BASE}/prospects/add_prospects_to_campaign",
            json={"campaign_id": campaign_id, "prospects": [prospect_fields]},
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
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Smartreach error: {detail}")

    body = resp.json()
    prospects = body.get("prospects") if isinstance(body, dict) else None
    if isinstance(prospects, list) and prospects:
        return str(prospects[0].get("id", ""))
    return str(body.get("id", "")) if isinstance(body, dict) else ""
