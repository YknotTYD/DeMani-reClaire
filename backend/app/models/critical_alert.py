from datetime import datetime, timezone

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CriticalAlert(Base):
    """Créée quand une case du questionnaire perd au moins 2 étoiles par rapport au trimestre précédent."""

    __tablename__ = "critical_alerts"
    __table_args__ = (UniqueConstraint("questionnaire_id", "member_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    questionnaire_id: Mapped[int] = mapped_column(ForeignKey("questionnaires.id", ondelete="CASCADE"))
    member_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    # Une ligne par case en baisse, ex. « Travail / Moral : 4 → 1 »
    details: Mapped[str] = mapped_column(String(2000))
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
    seen: Mapped[bool] = mapped_column(default=False)
