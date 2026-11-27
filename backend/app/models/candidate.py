import enum
from datetime import datetime, timezone

from sqlalchemy import Enum, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CandidateStatus(str, enum.Enum):
    NOUVEAU = "nouveau"
    ENTRETIEN = "entretien"
    RETENU = "retenu"
    REFUSE = "refuse"


class Candidate(Base):
    """Candidat à un poste. Correspond au dossier Poste / Candidat sur le disque."""

    __tablename__ = "candidates"
    __table_args__ = (UniqueConstraint("position_id", "folder"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    position_id: Mapped[int] = mapped_column(ForeignKey("positions.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), default="")
    status: Mapped[CandidateStatus] = mapped_column(Enum(CandidateStatus), default=CandidateStatus.NOUVEAU)
    folder: Mapped[str] = mapped_column(String(160))
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
    # Dernier contact (dépôt, changement de statut, rendez-vous) : point de départ de la durée de conservation
    last_contact_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
    # Le candidat a été informé du traitement de ses données (Code du travail, art. L. 1221-8)
    informed: Mapped[bool] = mapped_column(default=False)
