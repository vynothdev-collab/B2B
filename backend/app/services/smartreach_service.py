import logging
from urllib.parse import parse_qs, urlparse

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.crypto import decrypt_secret, encrypt_secret
from app.models.smartreach_connection import SmartreachConnection

logger = logging.getLogger(__name__)

SMARTREACH_API_BASE = "https://api.smartreach.io/api/v1"


def _auth_headers(api_key: str) -> dict:
    clean_key = api_key.strip() if api_key else ""
    return {
        "X-API-KEY": clean_key,
        "api-key": clean_key,
        "Api-Key": clean_key,
    }


def _parse_key_and_team(api_key: str, team_id: str | None = None) -> tuple[str, str | None]:
    clean_key = api_key.strip() if api_key else ""
    clean_team = team_id.strip() if team_id and team_id.strip() else None

    if not clean_team and "|" in clean_key:
        parts = clean_key.split("|", 1)
        clean_key = parts[0].strip()
        clean_team = parts[1].strip()
    elif not clean_team and (
        "?team_id=" in clean_key or "&team_id=" in clean_key or "?tid=" in clean_key or "&tid=" in clean_key
    ):
        try:
            parsed = urlparse(clean_key)
            clean_key = parsed.path
            qs = parse_qs(parsed.query)
            tid = qs.get("team_id") or qs.get("tid")
            if tid:
                clean_team = tid[0].strip()
        except Exception:
            pass

    return clean_key, clean_team


async def validate_key_and_list_campaigns(api_key: str, team_id: str | None = None) -> list[dict]:
    key, team = _parse_key_and_team(api_key, team_id)
    headers = _auth_headers(key)
    params = {"team_id": team} if team else {}

    endpoints = [
        "https://api.smartreach.io/api/v1/campaigns",
        "https://api.smartreach.io/api/v3/campaigns",
        "https://api.smartreach.io/api/v1/campaigns/list",
        "https://api.smartreach.io/api/v2/campaigns",
    ]

    last_error_detail = None
    is_invalid_key = False

    async with httpx.AsyncClient(timeout=10) as client:
        for url in endpoints:
            try:
                resp = await client.get(url, headers=headers, params=params)
                if resp.status_code == 200:
                    body = resp.json()
                    if isinstance(body, dict) and (
                        body.get("error")
                        or body.get("message") in ("Invalid API key", "Unauthorized", "Invalid key")
                    ):
                        is_invalid_key = True
                        continue

                    items = []
                    if isinstance(body, list):
                        items = body
                    elif isinstance(body, dict):
                        items = (
                            body.get("campaigns")
                            or body.get("data")
                            or body.get("items")
                            or []
                        )

                    return [
                        {
                            "id": str(c.get("id")),
                            "name": c.get("name") or c.get("title") or "Unnamed Campaign",
                        }
                        for c in items
                        if isinstance(c, dict) and c.get("id") is not None
                    ]

                if resp.status_code in (401, 403, 400, 422):
                    body_text = resp.text.lower()
                    if any(
                        term in body_text
                        for term in ["key", "auth", "unauthorized", "invalid", "token", "forbidden"]
                    ) and "team_id" not in body_text:
                        is_invalid_key = True
                    last_error_detail = resp.text
                elif resp.status_code != 404:
                    last_error_detail = f"Smartreach status {resp.status_code}: {resp.text}"
            except httpx.RequestError as e:
                logger.error("Smartreach connection request error for %s: %s", url, str(e))
                last_error_detail = str(e)

    if is_invalid_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Smartreach API key."
        )

    error_detail = (
        f"Smartreach error: {last_error_detail}"
        if last_error_detail
        else "Could not reach Smartreach. Please verify your API key and Team ID."
    )
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST if is_invalid_key else status.HTTP_502_BAD_GATEWAY,
        detail=error_detail,
    )


def set_connection_key(connection: SmartreachConnection, api_key: str, team_id: str | None = None) -> None:
    key, team = _parse_key_and_team(api_key, team_id)
    connection.api_key = encrypt_secret(key, settings.SMARTREACH_ENCRYPTION_KEY)
    if team:
        connection.team_id = team


async def list_campaigns(connection: SmartreachConnection) -> list[dict]:
    api_key = decrypt_secret(connection.api_key, settings.SMARTREACH_ENCRYPTION_KEY)
    return await validate_key_and_list_campaigns(api_key, connection.team_id)


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
    team_id = connection.team_id
    headers = _auth_headers(api_key)
    params = {"team_id": team_id} if team_id else {}

    endpoints = [
        f"{SMARTREACH_API_BASE}/prospects/add_prospects_to_campaign",
        "https://api.smartreach.io/api/v3/prospects",
    ]

    last_error = ""
    async with httpx.AsyncClient(timeout=10) as client:
        for url in endpoints:
            try:
                payload = (
                    {"campaign_id": campaign_id, "prospects": [prospect_fields]}
                    if "v1" in url
                    else {"campaign_id": campaign_id, "prospect": prospect_fields}
                )
                resp = await client.post(url, json=payload, headers=headers, params=params)
                if resp.status_code in (200, 201):
                    body = resp.json()
                    prospects = body.get("prospects") if isinstance(body, dict) else None
                    if isinstance(prospects, list) and prospects:
                        return str(prospects[0].get("id", ""))
                    return str(body.get("id", "")) if isinstance(body, dict) else ""

                if resp.status_code != 404:
                    detail = resp.text
                    try:
                        b = resp.json()
                        if isinstance(b, dict) and b.get("message"):
                            detail = b["message"]
                    except Exception:
                        pass
                    last_error = detail
            except httpx.RequestError as e:
                last_error = str(e)

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=f"Smartreach error: {last_error}" if last_error else "Failed to push prospect to Smartreach.",
    )
