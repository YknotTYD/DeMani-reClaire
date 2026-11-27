from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Submission(Base):
    """Envoi d'un questionnaire par un membre, avec sa réponse à la question d'évolution.
    Les réponses individuelles restent privées tant que le membre ne choisit pas de les partager."""

    __tablename__ = "submissions"

    questionnaire_id: Mapped[int] = mapped_column(
        ForeignKey("questionnaires.id", ondelete="CASCADE"), primary_key=True
    )
    member_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    wants_evolution: Mapped[bool]
    shared: Mapped[bool] = mapped_column(default=False)
