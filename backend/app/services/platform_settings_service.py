from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.platform_setting import PlatformSetting

SETTINGS_ID = 1


async def get_platform_settings(db: AsyncSession) -> PlatformSetting:
    """Fetch the singleton settings row.

    The row is normally seeded at startup (see lifespan in app/main.py), so
    this is a plain SELECT on the hot path. The insert-if-missing branch is
    just a defensive fallback for out-of-band DB states (e.g. a manually
    truncated table); it tolerates a concurrent insert of the same row
    winning the race instead of raising.
    """
    result = await db.execute(select(PlatformSetting).where(PlatformSetting.id == SETTINGS_ID))
    row = result.scalar_one_or_none()
    if row is not None:
        return row

    try:
        row = PlatformSetting(id=SETTINGS_ID)
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row
    except IntegrityError:
        await db.rollback()
        result = await db.execute(select(PlatformSetting).where(PlatformSetting.id == SETTINGS_ID))
        return result.scalar_one()
