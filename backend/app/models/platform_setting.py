from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PlatformSetting(Base):
    """Singleton row (id=1) holding platform-wide General Settings."""

    __tablename__ = "platform_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    platform_name: Mapped[str] = mapped_column(String(255), nullable=False, default="LeadsBuddy")
    support_email: Mapped[str] = mapped_column(String(255), nullable=False, default="support@leadsbuddy.ai")
    default_plan: Mapped[str] = mapped_column(String(100), nullable=False, default="Free")
    new_registrations: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    maintenance_mode: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    maintenance_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
