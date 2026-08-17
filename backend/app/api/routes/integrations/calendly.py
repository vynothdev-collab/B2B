import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.calendly_connection import CalendlyConnection
from app.models.user import User
from app.schemas.calendly import CalendlyConnectRequest, CalendlyStatusResponse
from app.services import calendly_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/connect", response_model=CalendlyStatusResponse)
async def calendly_connect(
    data: CalendlyConnectRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CalendlyStatusResponse:
    profile = await calendly_service.validate_key_and_fetch_user(data.api_key)

    result = await db.execute(
        select(CalendlyConnection).where(CalendlyConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        connection = CalendlyConnection(user_id=current_user.id, api_key="")
        db.add(connection)

    calendly_service.set_connection_key(connection, data.api_key)
    connection.scheduling_url = profile.get("scheduling_url")
    connection.calendly_name = profile.get("name")
    connection.calendly_email = profile.get("email")
    await db.flush()
    await db.refresh(connection)

    return CalendlyStatusResponse(
        connected=True, scheduling_url=connection.scheduling_url, connected_at=connection.created_at
    )


@router.get("/status", response_model=CalendlyStatusResponse)
async def calendly_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CalendlyStatusResponse:
    result = await db.execute(
        select(CalendlyConnection).where(CalendlyConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if not connection:
        return CalendlyStatusResponse(connected=False)
    return CalendlyStatusResponse(
        connected=True, scheduling_url=connection.scheduling_url, connected_at=connection.created_at
    )


@router.delete("/disconnect")
async def calendly_disconnect(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(
        select(CalendlyConnection).where(CalendlyConnection.user_id == current_user.id)
    )
    connection = result.scalar_one_or_none()
    if connection:
        await db.delete(connection)
    return {"ok": True}
