import hashlib
import hmac
import json
import logging
import secrets
from datetime import UTC, datetime

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.crypto import decrypt_secret, encrypt_secret
from app.models.webhook_connection import WebhookConnection

logger = logging.getLogger(__name__)


def generate_secret() -> str:
    return secrets.token_hex(32)


def set_connection(connection: WebhookConnection, webhook_url: str, secret: str) -> None:
    connection.webhook_url = webhook_url
    connection.signing_secret = encrypt_secret(secret, settings.WEBHOOK_ENCRYPTION_KEY)


def sign_payload(body_bytes: bytes, secret: str) -> str:
    return hmac.new(secret.encode(), body_bytes, hashlib.sha256).hexdigest()


async def _post(webhook_url: str, payload: dict, secret: str) -> httpx.Response:
    body_bytes = json.dumps(payload).encode()
    signature = sign_payload(body_bytes, secret)
    async with httpx.AsyncClient(timeout=10) as client:
        return await client.post(
            webhook_url,
            content=body_bytes,
            headers={
                "Content-Type": "application/json",
                "X-LeadsBuddy-Event": payload.get("event", ""),
                "X-LeadsBuddy-Signature": f"sha256={signature}",
            },
        )


async def send_ping(webhook_url: str, secret: str) -> None:
    payload = {"event": "ping", "pushed_at": datetime.now(UTC).isoformat()}
    try:
        resp = await _post(webhook_url, payload, secret)
    except httpx.HTTPError as e:
        logger.warning("Webhook ping failed for %s: %s", webhook_url, e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not reach that webhook URL. Please check it and try again.",
        ) from e

    if not (200 <= resp.status_code < 300):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Webhook URL responded with status {resp.status_code}, expected 2xx.",
        )


def map_person_to_payload(mapped_person: dict, unlocked_email: str | None, unlocked_phone: str | None) -> dict:
    record: dict = {}
    if unlocked_email:
        record["email"] = unlocked_email
    if mapped_person.get("first_name"):
        record["first_name"] = mapped_person["first_name"]
    last_name = mapped_person.get("last_name") or mapped_person.get("full_name")
    if last_name:
        record["last_name"] = last_name
    if unlocked_phone:
        record["phone"] = unlocked_phone
    if mapped_person.get("active_experience_title"):
        record["job_title"] = mapped_person["active_experience_title"]
    if mapped_person.get("active_experience_company_name"):
        record["company_name"] = mapped_person["active_experience_company_name"]
    if mapped_person.get("active_experience_company_website"):
        record["company_website"] = mapped_person["active_experience_company_website"]
    if mapped_person.get("location_city"):
        record["city"] = mapped_person["location_city"]
    if mapped_person.get("location_state"):
        record["state"] = mapped_person["location_state"]
    if mapped_person.get("location_country"):
        record["country"] = mapped_person["location_country"]
    if mapped_person.get("linkedin_url"):
        record["linkedin_url"] = mapped_person["linkedin_url"]
    return record


async def deliver(connection: WebhookConnection, record: dict) -> None:
    secret = decrypt_secret(connection.signing_secret, settings.WEBHOOK_ENCRYPTION_KEY)
    payload = {
        "event": "person.push",
        "record": record,
        "pushed_at": datetime.now(UTC).isoformat(),
    }

    try:
        resp = await _post(connection.webhook_url, payload, secret)
    except httpx.HTTPError as e:
        connection.last_delivery_status = "failed"
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach your webhook URL.",
        ) from e

    if not (200 <= resp.status_code < 300):
        connection.last_delivery_status = "failed"
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Webhook responded with status {resp.status_code}.",
        )

    connection.last_delivery_status = "success"
    connection.last_delivery_at = datetime.now(UTC)
