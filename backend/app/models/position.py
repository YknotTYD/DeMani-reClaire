from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Position(Base):
    """Poste visé (ex. « Développeur »). Correspond à un dossier sur le disque."""

    __tablename__ = "positions"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)
    folder: Mapped[str] = mapped_column(String(160), unique=True)
