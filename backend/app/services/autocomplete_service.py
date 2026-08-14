import logging

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.technology_intent import TechnologyIntent

logger = logging.getLogger(__name__)


async def suggest_titles(text: str, size: int) -> list[str]:
    """Job title suggestions from PDL's live autocomplete API."""
    if not settings.PDL_API_KEY:
        return []
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                f"{settings.PDL_BASE_URL}/autocomplete",
                params={"field": "title", "text": text, "size": size},
                headers={"X-Api-Key": settings.PDL_API_KEY},
                timeout=5.0,
            )
            resp.raise_for_status()
        except httpx.TimeoutException:
            logger.warning("PDL autocomplete timed out for text=%r", text)
            return []
        except httpx.HTTPStatusError as exc:
            logger.warning(
                "PDL autocomplete HTTP %s for text=%r: %s",
                exc.response.status_code,
                text,
                exc.response.text[:200],
            )
            return []
    return [item["name"] for item in resp.json().get("data", [])]


async def suggest_technologies(text: str, size: int, db: AsyncSession) -> list[str]:
    """Technology suggestions from the technologies we've seen in search results."""
    stmt = (
        select(TechnologyIntent.technology)
        .where(TechnologyIntent.technology.ilike(f"%{text}%"))
        .where(TechnologyIntent.technology.isnot(None))
        .distinct()
        .limit(size)
    )
    result = await db.execute(stmt)
    return [row[0] for row in result.all() if row[0]]


async def suggest_intents(text: str, size: int, db: AsyncSession) -> list[str]:
    """Buying-intent/keyword suggestions from the intents we've seen in search results."""
    stmt = (
        select(TechnologyIntent.intent)
        .where(TechnologyIntent.intent.ilike(f"%{text}%"))
        .where(TechnologyIntent.intent.isnot(None))
        .distinct()
        .limit(size)
    )
    result = await db.execute(stmt)
    return [row[0] for row in result.all() if row[0]]
