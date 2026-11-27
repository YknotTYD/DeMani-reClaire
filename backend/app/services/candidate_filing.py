"""Range un document déposé par le RH : trouve ou crée le candidat, puis enregistre le fichier dans son dossier."""

from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import MAX_UPLOAD_MB
from app.models.candidate import Candidate, CandidateStatus
from app.models.document import Document, DocumentType
from app.models.position import Position
from app.services import file_storage
from app.services.retention import touch_candidate

ALLOWED = {".pdf": b"%PDF", ".docx": b"PK"}  # extension -> début attendu du fichier
PDF_ONLY = {".pdf": b"%PDF"}

FILE_LABELS = {
    DocumentType.CV: "CV",
    DocumentType.LETTRE: "Lettre de motivation",
    DocumentType.DIPLOME: "Diplôme",
}


async def read_upload(upload: UploadFile, allowed: dict[str, bytes] = ALLOWED, kinds: str | None = None) -> tuple[bytes, str]:
    """Lit le fichier et vérifie son type (PDF / Word par défaut). Retourne (contenu, extension)."""
    extension = Path(upload.filename or "").suffix.lower()
    if extension not in allowed:
        kinds = kinds or ("PDF" if allowed is PDF_ONLY else "PDF et Word (.docx)")
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Seuls les fichiers {kinds} sont acceptés")
    content = await upload.read()
    if len(content) > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Fichier trop lourd (max {MAX_UPLOAD_MB} Mo)")
    if not content.startswith(allowed[extension]):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Le fichier ne correspond pas à son extension")
    return content, extension


def find_or_create_candidate(db: Session, position: Position, name: str, email: str) -> Candidate:
    """Même poste + même email (ou même nom si pas d'email) = même candidat."""
    query = select(Candidate).where(Candidate.position_id == position.id)
    if email:
        query = query.where(func.lower(Candidate.email) == email.lower())
    else:
        query = query.where(func.lower(Candidate.name) == name.lower())
    candidate = db.scalar(query)
    if candidate is not None:
        if email and not candidate.email:
            candidate.email = email
        return candidate

    taken = set(db.scalars(select(Candidate.folder).where(Candidate.position_id == position.id)))
    candidate = Candidate(
        position_id=position.id,
        name=name,
        email=email,
        folder=file_storage.unique_name(file_storage.safe_name(name), taken),
    )
    db.add(candidate)
    db.flush()
    return candidate


def file_document(
    db: Session,
    *,
    content: bytes,
    extension: str,
    original_name: str,
    position: Position,
    name: str,
    email: str,
    doc_type: DocumentType,
    candidate_status: CandidateStatus,
) -> tuple[Candidate, Document]:
    candidate = find_or_create_candidate(db, position, name, email)
    candidate.status = candidate_status
    candidate.informed = True
    touch_candidate(candidate)

    base = FILE_LABELS.get(doc_type) or Path(original_name).stem
    taken = set(db.scalars(select(Document.filename).where(Document.candidate_id == candidate.id)))
    filename = file_storage.unique_name(file_storage.safe_name(base) + extension, taken)

    document = Document(candidate_id=candidate.id, doc_type=doc_type, filename=filename, original_name=original_name)
    db.add(document)
    file_storage.save_file(file_storage.candidate_dir(position.folder, candidate.folder), filename, content)
    db.commit()
    return candidate, document
