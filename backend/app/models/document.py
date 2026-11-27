import enum
from datetime import datetime, timezone

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class DocumentType(str, enum.Enum):
    CV = "cv"
    LETTRE = "lettre"
    DIPLOME = "diplome"
    AUTRE = "autre"


class Document(Base):
    """Fichier rangé dans le dossier du candidat."""

    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    candidate_id: Mapped[int] = mapped_column(ForeignKey("candidates.id", ondelete="CASCADE"))
    doc_type: Mapped[DocumentType] = mapped_column(Enum(DocumentType))
    filename: Mapped[str] = mapped_column(String(255))  # nom dans le dossier, ex. « CV.pdf »
    original_name: Mapped[str] = mapped_column(String(255))
    uploaded_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
