import enum
from datetime import date, datetime, timezone

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AbsenceKind(str, enum.Enum):
    MALADIE = "maladie"  # justificatif obligatoire : arrêt de travail, volet employeur
    CONGES = "conges"    # aucun justificatif
    AUTRE = "autre"      # justificatif facultatif


class AbsenceStatus(str, enum.Enum):
    EN_ATTENTE = "en_attente"
    VALIDEE = "validee"
    REFUSEE = "refusee"


class Absence(Base):
    """Absence déclarée par un collaborateur. Le RH la consulte dans l'onglet Absences et sur son agenda, sans email."""

    __tablename__ = "absences"

    id: Mapped[int] = mapped_column(primary_key=True)
    member_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    kind: Mapped[AbsenceKind] = mapped_column(Enum(AbsenceKind))
    start_date: Mapped[date]
    start_afternoon: Mapped[bool] = mapped_column(default=False)  # commence l'après-midi
    end_date: Mapped[date]
    end_morning: Mapped[bool] = mapped_column(default=False)      # se termine à midi
    comment: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[AbsenceStatus] = mapped_column(Enum(AbsenceStatus), default=AbsenceStatus.EN_ATTENTE)
    rh_comment: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
    decided_at: Mapped[datetime | None]

    documents: Mapped[list["AbsenceDocument"]] = relationship(cascade="all, delete-orphan", order_by="AbsenceDocument.id")


class AbsenceDocument(Base):
    """Justificatif joint à une absence : visible par le collaborateur et le RH, chaque consultation RH est journalisée."""

    __tablename__ = "absence_documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    absence_id: Mapped[int] = mapped_column(ForeignKey("absences.id", ondelete="CASCADE"))
    filename: Mapped[str] = mapped_column(String(255))
    uploaded_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
