from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.contact_unlock import ContactUnlock, ContactUnlockEntity, ContactUnlockField


async def get_unlock_map(
    db: AsyncSession,
    user_id: str,
    record_ids: list[str],
) -> dict[str, dict[str, str | None]]:
    """record_id -> {field: unlocked_value} for the given user, fields not present are locked."""
    if not record_ids:
        return {}
    result = await db.execute(
        select(ContactUnlock).where(
            ContactUnlock.user_id == user_id,
            ContactUnlock.record_id.in_(record_ids),
            ContactUnlock.entity_type == ContactUnlockEntity.PERSON,
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


async def get_existing_unlock(
    db: AsyncSession,
    user_id: str,
    record_id: str,
    field: str,
) -> ContactUnlock | None:
    result = await db.execute(
        select(ContactUnlock).where(
            ContactUnlock.user_id == user_id,
            ContactUnlock.record_id == record_id,
            ContactUnlock.entity_type == ContactUnlockEntity.PERSON,
            ContactUnlock.field == field,
        )
    )
    return result.scalar_one_or_none()


_COST_KEY_BY_FIELD = {
    ContactUnlockField.WORK_EMAIL: "work_email",
    ContactUnlockField.PERSONAL_EMAIL: "personal_email",
    ContactUnlockField.MOBILE: "mobile",
}

_REASON_BY_FIELD = {
    ContactUnlockField.WORK_EMAIL: "Work Email Unlock",
    ContactUnlockField.PERSONAL_EMAIL: "Personal Email Unlock",
    ContactUnlockField.MOBILE: "Mobile Number Unlock",
}


async def unlock_contact_field(
    db: AsyncSession,
    user,
    record_id: str,
    field: str,
) -> dict:
    """
    Shared unlock logic used by both the internal (JWT) search API and the
    public Developer API. Person records only — work email, personal email,
    and mobile. Returns {value, already_unlocked, credits_charged}.
    """
    from app.models.search_record import PersonSearchRecord
    from app.services.credit_service import CREDIT_COSTS, check_credits, deduct_credit

    existing = await get_existing_unlock(db, user.id, record_id, field)
    if existing:
        return {"value": existing.value, "already_unlocked": True, "credits_charged": 0}

    cost_key = _COST_KEY_BY_FIELD[field]
    cost = CREDIT_COSTS[cost_key]
    await check_credits(user, db, cost)

    result = await db.execute(
        select(PersonSearchRecord).where(PersonSearchRecord.coresignal_id == record_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(
            status_code=404,
            detail="Record not found. Run a new search to refresh.",
        )

    raw = record.raw_data or {}
    if field == ContactUnlockField.WORK_EMAIL:
        value = record.email
    elif field == ContactUnlockField.PERSONAL_EMAIL:
        value = raw.get("primary_personal_email") or raw.get("personal_email")
    else:
        value = raw.get("mobile_phone")

    reason = _REASON_BY_FIELD[field]
    await deduct_credit(
        user, db,
        reason=reason,
        description=f"{reason} — {cost} credit(s) deducted",
        amount=cost,
    )
    db.add(
        ContactUnlock(
            user_id=user.id,
            record_id=record_id,
            entity_type=ContactUnlockEntity.PERSON,
            field=field,
            value=value,
        )
    )
    await db.flush()
    return {"value": value, "already_unlocked": False, "credits_charged": cost}
