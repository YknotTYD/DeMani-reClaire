from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class QuestionnaireModel(Base):
    """Modèle de questionnaire (ex. « Ambiance », « Intégration ») avec son propre tableau de critères.
    Le même modèle peut être envoyé chaque trimestre : c'est ce qui permet de suivre l'évolution."""

    __tablename__ = "questionnaire_models"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)
