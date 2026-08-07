from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.contact_unlock import ContactUnlock, ContactUnlockField


async def get_unlock_map(
    db: AsyncSession, user_id: str, record_ids: list[str]
) -> dict[str, dict[str, str | None]]:
    """record_id -> {field: unlocked_value} for the given user, fields not present are locked."""
    if not record_ids:
        return {}
    result = await db.execute(
        select(ContactUnlock).where(
            ContactUnlock.user_id == user_id,
            ContactUnlock.record_id.in_(record_ids),
        )
    )
    unlock_map: dict[str, dict[str, str | None]] = {}
    for row in result.scalars().all():
        unlock_map.setdefault(row.record_id, {})[row.field] = row.value
    return unlock_map


def apply_unlock_state(item: dict, record_id: str, unlock_map: dict) -> None:
    """Mutate a mapped person dict so locked fields never carry their real value."""
    fields = unlock_map.get(record_id, {})
    item["work_email"] = fields.get(ContactUnlockField.WORK_EMAIL)
    item["personal_email"] = fields.get(ContactUnlockField.PERSONAL_EMAIL)
    item["mobile_phone"] = fields.get(ContactUnlockField.MOBILE)
    item["email"] = fields.get(ContactUnlockField.WORK_EMAIL)
    item["unlocked"] = {
        "work_email": ContactUnlockField.WORK_EMAIL in fields,
        "personal_email": ContactUnlockField.PERSONAL_EMAIL in fields,
        "mobile": ContactUnlockField.MOBILE in fields,
    }
