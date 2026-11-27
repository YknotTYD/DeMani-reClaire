"""Durée de conservation des dossiers de candidats (référentiel CNIL d'avril 2026, rapport section 5.1).

Un candidat non retenu est supprimé, avec ses fichiers, CANDIDATE_RETENTION_MONTHS mois après le dernier contact.
Les candidats retenus ne sont pas concernés : leur dossier rejoint le suivi du collaborateur."""

from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import CANDIDATE_RETENTION_MONTHS
from app.models.candidate import Candidate, CandidateStatus
from app.models.position import Position
from app.services import file_storage

RETENTION = timedelta(days=round(CANDIDATE_RETENTION_MONTHS * 30.44))


def _aware(moment: datetime) -> datetime:
    return moment if moment.tzinfo else moment.replace(tzinfo=timezone.utc)


def touch_candidate(candidate: Candidate) -> None:
    """Un nouveau contact (dépôt, statut, rendez-vous) relance la durée de conservation."""
    candidate.last_contact_at = datetime.now(timezone.utc)


def expires_at(candidate: Candidate) -> datetime | None:
    if candidate.status == CandidateStatus.RETENU:
        return None
    return _aware(candidate.last_contact_at) + RETENTION


def purge_expired(db: Session) -> int:
    """Supprime les dossiers arrivés à échéance. Retourne le nombre de candidats supprimés."""
    now = datetime.now(timezone.utc)
    deleted = 0
    for candidate in db.scalars(select(Candidate)).all():
        limit = expires_at(candidate)
        if limit is not None and limit <= now:
            position = db.get(Position, candidate.position_id)
            file_storage.delete_path(file_storage.candidate_dir(position.folder, candidate.folder))
            db.delete(candidate)
            deleted += 1
    db.commit()
    return deleted
