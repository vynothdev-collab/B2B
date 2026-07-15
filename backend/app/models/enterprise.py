import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class EnterpriseStatus:
    ACTIVE    = "active"
    SUSPENDED = "suspended"
    INACTIVE  = "inactive"
    ALL       = {ACTIVE, SUSPENDED, INACTIVE}


class Enterprise(Base):
    __tablename__ = "enterprises"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name:     Mapped[str]         = mapped_column(String(255), unique=True, index=True, nullable=False)
    industry: Mapped[str | None]  = mapped_column(String(120), nullable=True)
    website:  Mapped[str | None]  = mapped_column(String(255), nullable=True)
    country:  Mapped[str | None]  = mapped_column(String(120), nullable=True)
    size:     Mapped[str | None]  = mapped_column(String(50),  nullable=True)
    phone:    Mapped[str | None]  = mapped_column(String(50),  nullable=True)

    plan:    Mapped[str] = mapped_column(String(50), default="Free",                   nullable=False)
    credits: Mapped[int] = mapped_column(Integer,    default=0,                        nullable=False)
    status:  Mapped[str] = mapped_column(String(20), default=EnterpriseStatus.ACTIVE, nullable=False)

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
