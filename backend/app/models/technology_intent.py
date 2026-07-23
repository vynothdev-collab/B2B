from sqlalchemy import BigInteger, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TechnologyIntent(Base):
    __tablename__ = "technology_intent"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    technology: Mapped[str | None] = mapped_column(String(255), nullable=True)
    intent: Mapped[str | None] = mapped_column(String(255), nullable=True)
