import hashlib
import secrets
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

if TYPE_CHECKING:
    from app.models.user import User

KEY_PREFIX = "lb_live_"

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def hash_api_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode()).hexdigest()


def generate_api_key() -> tuple[str, str, str]:
    """Returns (raw_key, key_prefix, key_hash)."""
    raw_key = f"{KEY_PREFIX}{secrets.token_urlsafe(32)}"
    return raw_key, raw_key[:16], hash_api_key(raw_key)


async def get_api_key_user(
    api_key: str | None = Security(_api_key_header),
    db: AsyncSession = Depends(get_db),
) -> "User":
    from app.models.api_key import ApiKey
    from app.models.user import User

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-API-Key header.",
        )

    key_hash = hash_api_key(api_key)
    result = await db.execute(select(ApiKey).where(ApiKey.key_hash == key_hash))
    key_row = result.scalar_one_or_none()
    if not key_row or not key_row.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked API key.",
        )

    key_row.last_used_at = datetime.now(UTC)

    result = await db.execute(select(User).where(User.id == key_row.user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key owner not found or inactive.",
        )

    await db.flush()
    return user
