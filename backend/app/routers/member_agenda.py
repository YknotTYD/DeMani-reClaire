"""Vue RH sur un membre : créneaux libres / occupés et documents déposés."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_rh
from app.models.member_document import MemberDocument
from app.models.user import Role, User
from app.routers.members import get_member_or_404
from app.schemas.agenda import BusyPeriod, MemberDocumentOut
from app.services.agenda import busy_periods
from app.services.access_log import log_access
from app.services.member_files import document_path, get_member_document_or_404

router = APIRouter(tags=["agenda des membres"])


@router.get("/members/{member_id}/busy", response_model=list[BusyPeriod], dependencies=[Depends(require_rh)])
def member_busy(
    member_id: int,
    start: datetime = Query(...),
    end: datetime = Query(...),
    exclude_appointment_id: int | None = Query(None, description="Rendez-vous en cours de modification, à ignorer"),
    db: Session = Depends(get_db),
):
    """Créneaux occupés du membre, sans leur contenu (respect de la vie privée)."""
    get_member_or_404(db, member_id)
    return busy_periods(db, member_id, start, end, exclude_appointment_id)


@router.get("/members/{member_id}/documents", response_model=list[MemberDocumentOut], dependencies=[Depends(require_rh)])
def member_documents(member_id: int, db: Session = Depends(get_db)):
    get_member_or_404(db, member_id)
    return db.scalars(
        select(MemberDocument).where(MemberDocument.member_id == member_id).order_by(MemberDocument.uploaded_at.desc())
    ).all()


@router.get("/member-documents/{document_id}/download")
def download_member_document(document_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Le membre peut télécharger ses propres documents, les RH ceux de tous les membres."""
    document = get_member_document_or_404(db, document_id)
    if user.role != Role.RH and document.member_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Accès refusé")
    path = document_path(document)
    if user.role == Role.RH:
        log_access(db, document.member_id, user, f"Téléchargement de « {document.filename} »")
    if not path.exists():
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Le fichier n'existe plus sur le disque")
    return FileResponse(path, filename=document.filename, media_type="application/pdf")
