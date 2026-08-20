from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_admin, require_super_admin
from app.services.platform_settings_service import get_platform_settings

router = APIRouter()


class PlatformSettingsResponse(BaseModel):
    platform_name: str
    support_email: str
    default_plan: str
    new_registrations: bool
    maintenance_mode: bool
    maintenance_message: str | None
    updated_at: datetime


class UpdatePlatformSettingsRequest(BaseModel):
    platform_name: str | None = None
    support_email: EmailStr | None = None
    default_plan: str | None = None
    new_registrations: bool | None = None
    maintenance_mode: bool | None = None
    maintenance_message: str | None = None

    @field_validator("platform_name", "default_plan")
    @classmethod
    def not_blank(cls, v: str | None) -> str | None:
        if v is not None and not v.strip():
            raise ValueError("Value cannot be empty")
        return v.strip() if v is not None else v


def _serialize(row) -> PlatformSettingsResponse:
    return PlatformSettingsResponse(
        platform_name=row.platform_name,
        support_email=row.support_email,
        default_plan=row.default_plan,
        new_registrations=row.new_registrations,
        maintenance_mode=row.maintenance_mode,
        maintenance_message=row.maintenance_message,
        updated_at=row.updated_at,
    )


@router.get("/", response_model=PlatformSettingsResponse)
async def get_settings(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> PlatformSettingsResponse:
    row = await get_platform_settings(db)
    return _serialize(row)


@router.patch("/", response_model=PlatformSettingsResponse)
async def update_settings(
    payload: UpdatePlatformSettingsRequest,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_super_admin),
) -> PlatformSettingsResponse:
    row = await get_platform_settings(db)

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(row, field, str(value) if isinstance(value, str) else value)

    await db.commit()
    await db.refresh(row)
    return _serialize(row)
