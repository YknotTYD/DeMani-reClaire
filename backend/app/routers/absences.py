"""Absences : le collaborateur les déclare (avec justificatif si besoin), le RH les consulte et les valide ou refuse.

Aucun email n'est envoyé : le RH retrouve les absences dans l'onglet Absences et sur son agenda.
"""

from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_membre, require_rh
from app.models.absence import Absence, AbsenceDocument, AbsenceKind, AbsenceStatus
from app.models.user import Role, User
from app.schemas.absence import AbsenceDecision, AbsenceOut
from app.services.absences import absence_out, check_dates, check_proofs, delete_files, document_path, save_proofs
from app.services.access_log import log_access

router = APIRouter(tags=["absences"])

MEDIA_TYPES = {".pdf": "application/pdf", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png"}


def get_absence_or_404(db: Session, absence_id: int) -> Absence:
    absence = db.get(Absence, absence_id)
    if absence is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Absence introuvable")
    return absence


# ---------- Côté collaborateur ----------


@router.get("/me/absences", response_model=list[AbsenceOut])
def my_absences(db: Session = Depends(get_db), user: User = Depends(require_membre)):
    absences = db.scalars(select(Absence).where(Absence.member_id == user.id).order_by(Absence.start_date.desc()))
    return [absence_out(db, a) for a in absences]


@router.post("/me/absences", response_model=AbsenceOut, status_code=status.HTTP_201_CREATED)
async def declare_absence(
    kind: AbsenceKind = Form(...),
    start_date: date = Form(...),
    end_date: date = Form(...),
    start_afternoon: bool = Form(False),
    end_morning: bool = Form(False),
    comment: str = Form(""),
    files: list[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    user: User = Depends(require_membre),
):
    files = [f for f in files if f.filename]
    check_dates(start_date, start_afternoon, end_date, end_morning)
    check_proofs(kind, files)
    absence = Absence(
        member_id=user.id,
        kind=kind,
        start_date=start_date,
        start_afternoon=start_afternoon,
        end_date=end_date,
        end_morning=end_morning,
        comment=comment.strip(),
    )
    db.add(absence)
    db.flush()  # donne un id à l'absence, utilisé pour le dossier des justificatifs
    try:
        await save_proofs(db, absence, files)
    except HTTPException:
        db.rollback()
        delete_files(absence)
        raise
    db.commit()
    return absence_out(db, absence)


@router.delete("/me/absences/{absence_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_absence(absence_id: int, db: Session = Depends(get_db), user: User = Depends(require_membre)):
    """Le collaborateur peut annuler une absence tant que le RH ne l'a pas traitée."""
    absence = get_absence_or_404(db, absence_id)
    if absence.member_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Accès refusé")
    if absence.status != AbsenceStatus.EN_ATTENTE:
        raise HTTPException(status.HTTP_409_CONFLICT, "Cette absence a déjà été traitée par le RH")
    delete_files(absence)
    db.delete(absence)
    db.commit()


# ---------- Côté RH ----------


@router.get("/absences", response_model=list[AbsenceOut], dependencies=[Depends(require_rh)])
def list_absences(
    start: date | None = Query(None, description="Absences qui se terminent à partir de ce jour"),
    end: date | None = Query(None, description="Absences qui commencent avant ce jour"),
    status_filter: AbsenceStatus | None = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    query = select(Absence).order_by(Absence.start_date.desc())
    if start:
        query = query.where(Absence.end_date >= start)
    if end:
        query = query.where(Absence.start_date < end)
    if status_filter:
        query = query.where(Absence.status == status_filter)
    return [absence_out(db, a) for a in db.scalars(query)]


@router.patch("/absences/{absence_id}", response_model=AbsenceOut, dependencies=[Depends(require_rh)])
def decide_absence(absence_id: int, decision: AbsenceDecision, db: Session = Depends(get_db)):
    absence = get_absence_or_404(db, absence_id)
    absence.status = decision.status
    absence.rh_comment = decision.rh_comment.strip()
    absence.decided_at = None if decision.status == AbsenceStatus.EN_ATTENTE else datetime.now(timezone.utc)
    db.commit()
    return absence_out(db, absence)


# ---------- Justificatifs ----------


@router.get("/absence-documents/{document_id}/download")
def download_proof(document_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Le collaborateur voit ses justificatifs ; le RH aussi, et chaque consultation est inscrite dans le journal."""
    document = db.get(AbsenceDocument, document_id)
    if document is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Justificatif introuvable")
    absence = get_absence_or_404(db, document.absence_id)
    if user.role != Role.RH and absence.member_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Accès refusé")
    path = document_path(absence, document)
    if not path.exists():
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Le fichier n'existe plus sur le disque")
    if user.role == Role.RH:
        log_access(db, absence.member_id, user, "Consultation d'un justificatif d'absence")
    return FileResponse(path, filename=document.filename, media_type=MEDIA_TYPES.get(path.suffix.lower(), "application/octet-stream"))
