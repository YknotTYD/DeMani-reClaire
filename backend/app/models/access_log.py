from datetime import datetime, timezone

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AccessLog(Base):
    """Journal des consultations : chaque accès d'un RH aux données d'un collaborateur est tracé (annexe C)."""

    __tablename__ = "access_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    member_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    viewer_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    viewer_name: Mapped[str] = mapped_column(String(120))  # conservé même si le compte est supprimé
    action: Mapped[str] = mapped_column(String(120))
    at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
