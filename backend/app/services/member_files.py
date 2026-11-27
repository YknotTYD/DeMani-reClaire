"""PDF déposés par les membres : <FILES_DIR>/Membres/<id>/<fichier>."""

from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.member_document import MemberDocument
from app.services import file_storage
from app.services.candidate_filing import PDF_ONLY, read_upload


def document_path(document: MemberDocument) -> Path:
    return file_storage.member_dir(document.member_id) / document.filename


async def save_member_pdf(db: Session, member_id: int, upload: UploadFile, appointment_id: int | None) -> MemberDocument:
    content, extension = await read_upload(upload, PDF_ONLY)
    original = upload.filename or "document.pdf"
    taken = set(db.scalars(select(MemberDocument.filename).where(MemberDocument.member_id == member_id)))
    filename = file_storage.unique_name(file_storage.safe_name(Path(original).stem) + extension, taken)

    document = MemberDocument(
        member_id=member_id, appointment_id=appointment_id, filename=filename, original_name=original
    )
    db.add(document)
    file_storage.save_file(file_storage.member_dir(member_id), filename, content)
    db.commit()
    return document


def get_member_document_or_404(db: Session, document_id: int) -> MemberDocument:
    document = db.get(MemberDocument, document_id)
    if document is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document introuvable")
    return document
