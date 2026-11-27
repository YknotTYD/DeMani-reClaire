"""Règles des absences : justificatifs par type, durée en jours ouvrés, rangement des fichiers."""

from datetime import date, datetime, time, timedelta
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.models.absence import Absence, AbsenceDocument, AbsenceKind
from app.models.user import User
from app.schemas.absence import AbsenceDocumentOut, AbsenceOut
from app.services import file_storage
from app.services.candidate_filing import read_upload

# Justificatif demandé selon le type d'absence
PROOF_RULES = {
    AbsenceKind.MALADIE: "obligatoire",
    AbsenceKind.CONGES: "aucun",
    AbsenceKind.AUTRE: "facultatif",
}

# PDF ou photo du document ; on vérifie le début du fichier, pas seulement son extension
PROOF_TYPES = {".pdf": b"%PDF", ".jpg": b"\xff\xd8\xff", ".jpeg": b"\xff\xd8\xff", ".png": b"\x89PNG"}
PROOF_LABEL = "PDF, JPG et PNG"


def check_dates(start: date, start_afternoon: bool, end: date, end_morning: bool) -> None:
    if end < start:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "La date de fin est avant la date de début")
    if end == start and start_afternoon and end_morning:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Une absence d'un seul jour ne peut pas commencer l'après-midi et finir le matin")


def check_proofs(kind: AbsenceKind, files: list[UploadFile]) -> None:
    rule = PROOF_RULES[kind]
    if rule == "obligatoire" and not files:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Un justificatif est obligatoire pour ce type d'absence")
    if rule == "aucun" and files:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Aucun justificatif n'est demandé pour ce type d'absence")


def working_days(absence: Absence) -> float:
    """Jours ouvrés (lundi à vendredi) couverts par l'absence, demi-journées déduites."""
    days = 0.0
    day = absence.start_date
    while day <= absence.end_date:
        if day.weekday() < 5:
            days += 1
        day += timedelta(days=1)
    if absence.start_afternoon and absence.start_date.weekday() < 5:
        days -= 0.5
    if absence.end_morning and absence.end_date.weekday() < 5:
        days -= 0.5
    return days


def period(absence: Absence) -> tuple[datetime, datetime]:
    """Début et fin de l'absence en heures (midi pour les demi-journées), pour l'agenda du RH."""
    start = datetime.combine(absence.start_date, time(12) if absence.start_afternoon else time(0))
    end = datetime.combine(absence.end_date, time(12)) if absence.end_morning else datetime.combine(absence.end_date + timedelta(days=1), time(0))
    return start, end


def absence_dir(absence: Absence) -> Path:
    """<FILES_DIR>/Membres/<id>/Absences/<id de l'absence>/"""
    return file_storage.member_dir(absence.member_id) / "Absences" / str(absence.id)


def document_path(absence: Absence, document: AbsenceDocument) -> Path:
    return absence_dir(absence) / document.filename


async def save_proofs(db: Session, absence: Absence, files: list[UploadFile]) -> None:
    taken: set[str] = set()
    for upload in files:
        content, extension = await read_upload(upload, PROOF_TYPES, PROOF_LABEL)
        filename = file_storage.unique_name(file_storage.safe_name(Path(upload.filename or "justificatif").stem) + extension, taken)
        taken.add(filename)
        file_storage.save_file(absence_dir(absence), filename, content)
        absence.documents.append(AbsenceDocument(filename=filename))


def delete_files(absence: Absence) -> None:
    file_storage.delete_path(absence_dir(absence))


def absence_out(db: Session, absence: Absence) -> AbsenceOut:
    member = db.get(User, absence.member_id)
    return AbsenceOut(
        id=absence.id,
        member_id=absence.member_id,
        member_name=member.name if member else "Collaborateur supprimé",
        kind=absence.kind,
        start_date=absence.start_date,
        start_afternoon=absence.start_afternoon,
        end_date=absence.end_date,
        end_morning=absence.end_morning,
        days=working_days(absence),
        comment=absence.comment,
        status=absence.status,
        rh_comment=absence.rh_comment,
        created_at=absence.created_at,
        decided_at=absence.decided_at,
        documents=[AbsenceDocumentOut(id=d.id, filename=d.filename) for d in absence.documents],
    )
