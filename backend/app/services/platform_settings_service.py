from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.platform_setting import PlatformSetting

SETTINGS_ID = 1


async def get_platform_settings(db: AsyncSession) -> PlatformSetting:
    """Fetch the singleton settings row, creating it with defaults if absent."""
    result = await db.execute(select(PlatformSetting).where(PlatformSetting.id == SETTINGS_ID))
    row = result.scalar_one_or_none()
    if row is None:
        row = PlatformSetting(id=SETTINGS_ID)
        db.add(row)
        await db.commit()
        await db.refresh(row)
    return row
