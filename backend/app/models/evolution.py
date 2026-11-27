import enum
from datetime import datetime, timezone

from sqlalchemy import Enum, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class EvolutionStatus(str, enum.Enum):
    A_DISCUTER = "a_discuter"
    PROPOSE = "propose"
    FAIT = "fait"


class EvolutionRequest(Base):
    """Créée quand un membre répond « oui » à la question d'évolution. Le RH y note le suivi."""

    __tablename__ = "evolution_requests"
    __table_args__ = (UniqueConstraint("questionnaire_id", "member_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    questionnaire_id: Mapped[int] = mapped_column(ForeignKey("questionnaires.id", ondelete="CASCADE"))
    member_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
    status: Mapped[EvolutionStatus] = mapped_column(Enum(EvolutionStatus), default=EvolutionStatus.A_DISCUTER)
    note: Mapped[str] = mapped_column(Text, default="")
