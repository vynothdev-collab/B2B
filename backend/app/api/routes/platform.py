from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.platform_settings_service import get_platform_settings

router = APIRouter()


class PlatformStatusResponse(BaseModel):
    maintenance_mode: bool
    maintenance_message: str | None
    new_registrations: bool


@router.get("/status", response_model=PlatformStatusResponse)
async def platform_status(db: AsyncSession = Depends(get_db)) -> PlatformStatusResponse:
    row = await get_platform_settings(db)
    return PlatformStatusResponse(
        maintenance_mode=row.maintenance_mode,
        maintenance_message=row.maintenance_message,
        new_registrations=row.new_registrations,
    )
