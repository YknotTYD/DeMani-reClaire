from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.candidate import CandidateStatus
from app.models.document import DocumentType

# ---------- Postes ----------


class PositionIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class PositionOut(BaseModel):
    id: int
    name: str
    candidate_count: int


# ---------- Documents ----------


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    doc_type: DocumentType
    filename: str
    original_name: str
    uploaded_at: datetime


class ExtractedContact(BaseModel):
    name: str
    email: str


class FiledDocument(BaseModel):
    """Réponse du bot après rangement."""

    candidate_id: int
    candidate_name: str
    path: str  # ex. « Développeur / Alice Martin / CV.pdf »
    new_candidate: bool


# ---------- Candidats ----------


class CandidateOut(BaseModel):
    id: int
    position_id: int
    position_name: str
    name: str
    email: str
    status: CandidateStatus
    created_at: datetime
    last_contact_at: datetime
    expires_at: datetime | None  # suppression automatique prévue (None : candidat retenu)
    informed: bool


class PurgeResult(BaseModel):
    deleted: int


class CandidateDetail(CandidateOut):
    documents: list[DocumentOut]


class CandidateUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr | None = None
    status: CandidateStatus


class CandidateSearchResult(CandidateDetail):
    """Résultat de la recherche rapide : tout ce qui concerne le candidat."""

    next_appointment: datetime | None
