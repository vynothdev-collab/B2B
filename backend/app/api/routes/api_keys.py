from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.api_key_auth import generate_api_key
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.api_key import ApiKey
from app.models.user import User
from app.schemas.api_key import ApiKeyCreateRequest, ApiKeyCreateResponse, ApiKeyOut

router = APIRouter()


@router.post("", response_model=ApiKeyCreateResponse, summary="Create a new API key")
async def create_api_key(
    body: ApiKeyCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApiKeyCreateResponse:
    raw_key, key_prefix, key_hash = generate_api_key()
    key_row = ApiKey(
        user_id=current_user.id,
        name=body.name,
        key_prefix=key_prefix,
        key_hash=key_hash,
    )
    db.add(key_row)
    await db.flush()
    await db.refresh(key_row)
    return ApiKeyCreateResponse(
        id=key_row.id,
        name=key_row.name,
        key_prefix=key_row.key_prefix,
        is_active=key_row.is_active,
        created_at=key_row.created_at,
        last_used_at=key_row.last_used_at,
        key=raw_key,
    )


@router.get("", response_model=list[ApiKeyOut], summary="List your API keys")
async def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ApiKey]:
    result = await db.execute(
        select(ApiKey)
        .where(ApiKey.user_id == current_user.id)
        .order_by(ApiKey.created_at.desc())
    )
    return list(result.scalars().all())


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Revoke an API key")
async def revoke_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == current_user.id)
    )
    key_row = result.scalar_one_or_none()
    if not key_row:
        raise HTTPException(status_code=404, detail="API key not found.")

    key_row.is_active = False
    key_row.revoked_at = datetime.now(UTC)
    await db.flush()
