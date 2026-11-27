import enum
from datetime import datetime

from sqlalchemy import CheckConstraint, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AppointmentStatus(str, enum.Enum):
    PROPOSE = "propose"    # en attente de la réponse du membre
    ACCEPTE = "accepte"
    REFUSE = "refuse"


class AppointmentCategory(str, enum.Enum):
    SUIVI = "suivi"              # point de suivi
    PARCOURS = "parcours"        # entretien de parcours professionnel (échéance légale)
    INTEGRATION = "integration"  # bilan d'intégration (30 jours, fin de période d'essai)
    RECRUTEMENT = "recrutement"  # entretien avec un candidat


class Appointment(Base):
    """Rendez-vous du RH avec un candidat OU avec un membre.
    Avec un membre, le rendez-vous est d'abord proposé, puis le membre l'accepte ou le refuse."""

    __tablename__ = "appointments"
    __table_args__ = (
        CheckConstraint("(candidate_id IS NULL) != (member_id IS NULL)", name="un_seul_participant"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    candidate_id: Mapped[int | None] = mapped_column(ForeignKey("candidates.id", ondelete="CASCADE"))
    member_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    starts_at: Mapped[datetime]  # heure locale de l'entreprise
    duration_minutes: Mapped[int] = mapped_column(default=60)
    location: Mapped[str] = mapped_column(String(255), default="")
    note: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[AppointmentStatus] = mapped_column(Enum(AppointmentStatus), default=AppointmentStatus.ACCEPTE)
    category: Mapped[AppointmentCategory] = mapped_column(Enum(AppointmentCategory), default=AppointmentCategory.SUIVI)
