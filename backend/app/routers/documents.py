from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_rh
from app.models.candidate import Candidate, CandidateStatus
from app.models.document import Document, DocumentType
from app.models.position import Position
from app.routers.positions import get_position_or_404
from app.schemas.recruitment import ExtractedContact, FiledDocument
from app.services import file_storage
from app.services.candidate_filing import file_document, read_upload
from app.services.cv_extraction import extract_contact, extract_text

router = APIRouter(prefix="/documents", tags=["documents"], dependencies=[Depends(require_rh)])


def document_path(db: Session, document: Document):
    candidate = db.get(Candidate, document.candidate_id)
    position = db.get(Position, candidate.position_id)
    return file_storage.candidate_dir(position.folder, candidate.folder) / document.filename


def get_document_or_404(db: Session, document_id: int) -> Document:
    document = db.get(Document, document_id)
    if document is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document introuvable")
    return document


@router.post("/extract", response_model=ExtractedContact)
async def extract(file: UploadFile = File(...)):
    """Étape 1 du bot : lit le fichier et propose le nom et l'email du candidat (rien n'est enregistré)."""
    content, extension = await read_upload(file)
    return extract_contact(extract_text(content, extension))


@router.post("", response_model=FiledDocument, status_code=status.HTTP_201_CREATED)
async def upload(
    file: UploadFile = File(...),
    position_id: int = Form(...),
    candidate_name: str = Form(..., min_length=1, max_length=120),
    candidate_email: str = Form(""),
    doc_type: DocumentType = Form(...),
    candidate_status: CandidateStatus = Form(...),
    candidate_informed: bool = Form(False),
    db: Session = Depends(get_db),
):
    """Étape 2 du bot : range le fichier dans Poste / Candidat / Fichier.
    Le RH confirme que le candidat a été informé du traitement de ses données (Code du travail, art. L. 1221-8)."""
    if not candidate_informed:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Confirme que le candidat a été informé du traitement de ses données")
    content, extension = await read_upload(file)
    position = get_position_or_404(db, position_id)
    existing_ids = set(db.scalars(select(Candidate.id).where(Candidate.position_id == position.id)))

    candidate, document = file_document(
        db,
        content=content,
        extension=extension,
        original_name=file.filename or f"document{extension}",
        position=position,
        name=candidate_name.strip(),
        email=candidate_email.strip(),
        doc_type=doc_type,
        candidate_status=candidate_status,
    )
    return FiledDocument(
        candidate_id=candidate.id,
        candidate_name=candidate.name,
        path=f"{position.folder} / {candidate.folder} / {document.filename}",
        new_candidate=candidate.id not in existing_ids,
    )


@router.get("/{document_id}/download")
def download(document_id: int, db: Session = Depends(get_db)):
    document = get_document_or_404(db, document_id)
    path = document_path(db, document)
    if not path.exists():
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Le fichier n'existe plus sur le disque")
    return FileResponse(path, filename=document.filename)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: int, db: Session = Depends(get_db)):
    document = get_document_or_404(db, document_id)
    file_storage.delete_path(document_path(db, document))
    db.delete(document)
    db.commit()
