import enum

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Axis(str, enum.Enum):
    ROW = "row"        # lignes du tableau : Mon poste, Mon équipe, ...
    COLUMN = "column"  # colonnes du tableau : chaque colonne fixe la façon de répondre


class AnswerType(str, enum.Enum):
    STARS = "stars"      # 1 à 5 étoiles
    NUMBER = "number"    # un nombre, avec minimum et maximum facultatifs
    YES_NO = "yes_no"    # oui / non
    CHOICE = "choice"    # un choix dans une liste
    TEXT = "text"        # texte libre


class Criterion(Base):
    """Une ligne ou une colonne du tableau d'un modèle de questionnaire.
    Le type de réponse, les options et le caractère obligatoire ne concernent que les colonnes."""

    __tablename__ = "criteria"

    id: Mapped[int] = mapped_column(primary_key=True)
    model_id: Mapped[int] = mapped_column(ForeignKey("questionnaire_models.id", ondelete="CASCADE"))
    axis: Mapped[Axis] = mapped_column(Enum(Axis))
    label: Mapped[str] = mapped_column(String(120))
    position: Mapped[int] = mapped_column(default=0)

    answer_type: Mapped[AnswerType] = mapped_column(Enum(AnswerType), default=AnswerType.STARS)
    options: Mapped[str] = mapped_column(Text, default="")  # choix possibles, un par ligne
    min_value: Mapped[float | None]
    max_value: Mapped[float | None]
    required: Mapped[bool] = mapped_column(default=True)

    @property
    def option_list(self) -> list[str]:
        return [o for o in self.options.split("\n") if o]
