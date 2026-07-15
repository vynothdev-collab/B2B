import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class UserRole:
    INDIVIDUAL       = "individual"
    ENTERPRISE_ADMIN = "enterprise_admin"
    ENTERPRISE_USER  = "enterprise_user"
    ALL              = {INDIVIDUAL, ENTERPRISE_ADMIN, ENTERPRISE_USER}


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    name:            Mapped[str]         = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str]         = mapped_column(String(255), nullable=False)
    role:            Mapped[str]         = mapped_column(String(50), default=UserRole.INDIVIDUAL, nullable=False)
    is_active:       Mapped[bool]        = mapped_column(Boolean, default=True, nullable=False)
    phone:           Mapped[str | None]  = mapped_column(String(50), nullable=True)

    enterprise_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("enterprises.id"),
        nullable=True,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
