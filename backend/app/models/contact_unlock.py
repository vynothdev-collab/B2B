import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ContactUnlockField:
    WORK_EMAIL = "work_email"
    PERSONAL_EMAIL = "personal_email"
    MOBILE = "mobile"
    ALL_PERSON = {WORK_EMAIL, PERSONAL_EMAIL, MOBILE}


class ContactUnlockEntity:
    """Kept as a class (rather than a bare constant) for historical rows and
    forward-compat with the entity_type column — person is currently the
    only supported entity for contact unlocking."""

    PERSON = "person"


class ContactUnlock(Base):
    __tablename__ = "contact_unlocks"
    __table_args__ = (
        UniqueConstraint(
            "user_id", "record_id", "entity_type", "field",
            name="uq_contact_unlock_user_record_entity_field",
        ),
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    record_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    entity_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default=ContactUnlockEntity.PERSON
    )  # ContactUnlockEntity
    field: Mapped[str] = mapped_column(String(50), nullable=False)  # ContactUnlockField
    value: Mapped[str | None] = mapped_column(String(512), nullable=True)
    unlocked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
