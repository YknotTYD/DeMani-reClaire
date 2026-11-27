from datetime import datetime

from sqlalchemy import CheckConstraint, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class BusySlot(Base):
    """Indisponibilité saisie par un membre. Le RH ne voit que « occupé », jamais le libellé."""

    __tablename__ = "busy_slots"
    __table_args__ = (CheckConstraint("ends_at > starts_at"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    member_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    starts_at: Mapped[datetime]
    ends_at: Mapped[datetime]
    label: Mapped[str] = mapped_column(String(120), default="")  # visible par le membre uniquement
