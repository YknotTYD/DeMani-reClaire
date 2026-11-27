from sqlalchemy import CheckConstraint, Column, ForeignKey, Table, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.team import Team

# Équipes auxquelles un questionnaire est envoyé
questionnaire_teams = Table(
    "questionnaire_teams",
    Base.metadata,
    Column("questionnaire_id", ForeignKey("questionnaires.id", ondelete="CASCADE"), primary_key=True),
    Column("team_id", ForeignKey("teams.id", ondelete="CASCADE"), primary_key=True),
)


class Questionnaire(Base):
    """Envoi d'un modèle pour un trimestre donné, à certaines équipes. Ex. « Ambiance », Oct – Déc 2026."""

    __tablename__ = "questionnaires"
    __table_args__ = (
        UniqueConstraint("model_id", "year", "quarter"),
        CheckConstraint("quarter BETWEEN 1 AND 4"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    model_id: Mapped[int] = mapped_column(ForeignKey("questionnaire_models.id", ondelete="CASCADE"))
    year: Mapped[int]
    quarter: Mapped[int]  # 1 = Jan – Mar, 2 = Avr – Juin, 3 = Juil – Sep, 4 = Oct – Déc

    teams: Mapped[list[Team]] = relationship(secondary=questionnaire_teams, order_by=Team.name)


class Answer(Base):
    """Réponse d'un membre pour une case (ligne x colonne) d'un questionnaire.
    Étoiles, nombre et oui/non (1 ou 0) vont dans `number` ; choix et texte libre dans `text`."""

    __tablename__ = "answers"
    __table_args__ = (UniqueConstraint("questionnaire_id", "member_id", "row_id", "column_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    questionnaire_id: Mapped[int] = mapped_column(ForeignKey("questionnaires.id", ondelete="CASCADE"))
    member_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    row_id: Mapped[int] = mapped_column(ForeignKey("criteria.id", ondelete="CASCADE"))
    column_id: Mapped[int] = mapped_column(ForeignKey("criteria.id", ondelete="CASCADE"))
    number: Mapped[float | None]
    text: Mapped[str | None] = mapped_column(Text)
