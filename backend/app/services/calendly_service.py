import logging

import httpx
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.crypto import encrypt_secret
from app.models.calendly_connection import CalendlyConnection

logger = logging.getLogger(__name__)

CALENDLY_API_BASE = "https://api.calendly.com"


async def validate_key_and_fetch_user(api_key: str) -> dict:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{CALENDLY_API_BASE}/users/me",
            headers={"Authorization": f"Bearer {api_key}"},
        )

    if resp.status_code in (401, 403):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Calendly API key.")
    if resp.status_code != 200:
        logger.error("Calendly user fetch failed (%s): %s", resp.status_code, resp.text)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach Calendly. Please try again.",
        )

    resource = resp.json().get("resource", {})
    return {
        "name": resource.get("name"),
        "email": resource.get("email"),
        "scheduling_url": resource.get("scheduling_url"),
    }


def set_connection_key(connection: CalendlyConnection, api_key: str) -> None:
    connection.api_key = encrypt_secret(api_key, settings.CALENDLY_ENCRYPTION_KEY)


async def get_scheduling_url(user_id: str, db: AsyncSession) -> str | None:
    result = await db.execute(
        select(CalendlyConnection.scheduling_url).where(CalendlyConnection.user_id == user_id)
    )
    row = result.first()
    return row[0] if row else None
