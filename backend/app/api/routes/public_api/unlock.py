from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.api_key_auth import get_api_key_user
from app.core.database import get_db
from app.models.contact_unlock import ContactUnlockField
from app.models.user import User
from app.schemas.search import EmailUnlockResponse, PhoneUnlockResponse
from app.services.contact_unlock_service import unlock_contact_field

router = APIRouter()


@router.get(
    "/persons/{record_id}/unlock/work-email",
    response_model=EmailUnlockResponse,
    summary="Unlock work email for a person record",
)
async def public_unlock_person_work_email(
    record_id: str,
    current_user: User = Depends(get_api_key_user),
    db: AsyncSession = Depends(get_db),
) -> EmailUnlockResponse:
    res = await unlock_contact_field(
        db, current_user, record_id, ContactUnlockField.WORK_EMAIL
    )
    return EmailUnlockResponse(
        record_id=record_id,
        email=res["value"],
        has_email=bool(res["value"]),
        already_unlocked=res["already_unlocked"],
        credits_charged=res["credits_charged"],
    )


@router.get(
    "/persons/{record_id}/unlock/personal-email",
    response_model=EmailUnlockResponse,
    summary="Unlock personal email for a person record",
)
async def public_unlock_person_personal_email(
    record_id: str,
    current_user: User = Depends(get_api_key_user),
    db: AsyncSession = Depends(get_db),
) -> EmailUnlockResponse:
    res = await unlock_contact_field(
        db, current_user, record_id, ContactUnlockField.PERSONAL_EMAIL
    )
    return EmailUnlockResponse(
        record_id=record_id,
        email=res["value"],
        has_email=bool(res["value"]),
        already_unlocked=res["already_unlocked"],
        credits_charged=res["credits_charged"],
    )


@router.get(
    "/persons/{record_id}/unlock/mobile",
    response_model=PhoneUnlockResponse,
    summary="Unlock mobile phone number for a person record",
)
async def public_unlock_person_phone(
    record_id: str,
    current_user: User = Depends(get_api_key_user),
    db: AsyncSession = Depends(get_db),
) -> PhoneUnlockResponse:
    res = await unlock_contact_field(
        db, current_user, record_id, ContactUnlockField.MOBILE
    )
    return PhoneUnlockResponse(
        record_id=record_id,
        phone=res["value"],
        has_phone=bool(res["value"]),
        already_unlocked=res["already_unlocked"],
        credits_charged=res["credits_charged"],
    )
