import unicodedata
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_rh
from app.models.appointment import Appointment
from app.models.candidate import Candidate
from app.models.document import Document
from app.models.position import Position
from app.schemas.recruitment import CandidateDetail, CandidateOut, CandidateSearchResult, CandidateUpdate, PurgeResult
from app.services.retention import expires_at, purge_expired, touch_candidate
from app.services import file_storage

router = APIRouter(prefix="/candidates", tags=["candidats"], dependencies=[Depends(require_rh)])


def get_candidate_or_404(db: Session, candidate_id: int) -> Candidate:
    candidate = db.get(Candidate, candidate_id)
    if candidate is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Candidat introuvable")
    return candidate


def to_out(candidate: Candidate, position: Position) -> CandidateOut:
    return CandidateOut(
        id=candidate.id,
        position_id=position.id,
        position_name=position.name,
        name=candidate.name,
        email=candidate.email,
        status=candidate.status,
        created_at=candidate.created_at,
        last_contact_at=candidate.last_contact_at,
        expires_at=expires_at(candidate),
        informed=candidate.informed,
    )


def to_detail(db: Session, candidate: Candidate) -> CandidateDetail:
    documents = db.scalars(
        select(Document).where(Document.candidate_id == candidate.id).order_by(Document.uploaded_at)
    ).all()
    out = to_out(candidate, db.get(Position, candidate.position_id))
    return CandidateDetail(**out.model_dump(), documents=documents)


@router.get("", response_model=list[CandidateOut])
def list_candidates(position_id: int | None = Query(None), db: Session = Depends(get_db)):
    query = select(Candidate, Position).join(Position).order_by(Position.name, Candidate.name)
    if position_id is not None:
        query = query.where(Candidate.position_id == position_id)
    return [to_out(c, p) for c, p in db.execute(query).all()]


def normalize(text: str) -> str:
    """Minuscules et sans accents : « Chloé » est trouvée en tapant « chloe »."""
    decomposed = unicodedata.normalize("NFD", text.lower())
    return "".join(ch for ch in decomposed if unicodedata.category(ch) != "Mn")


@router.post("/purge-expired", response_model=PurgeResult)
def purge(db: Session = Depends(get_db)):
    """Supprime les dossiers des candidats non retenus dont la durée de conservation est dépassée."""
    return PurgeResult(deleted=purge_expired(db))


@router.get("/search", response_model=list[CandidateSearchResult])
def search_candidates(q: str = Query(..., min_length=1, max_length=120), db: Session = Depends(get_db)):
    """Recherche rapide par nom ou email : renvoie tout ce qui concerne chaque candidat trouvé."""
    words = normalize(q).split()
    results = []
    for candidate in db.scalars(select(Candidate).order_by(Candidate.name)):
        haystack = normalize(f"{candidate.name} {candidate.email}")
        if all(word in haystack for word in words):
            next_appointment = db.scalar(
                select(Appointment.starts_at)
                .where(Appointment.candidate_id == candidate.id, Appointment.starts_at >= datetime.now())
                .order_by(Appointment.starts_at)
                .limit(1)
            )
            results.append(CandidateSearchResult(**to_detail(db, candidate).model_dump(), next_appointment=next_appointment))
        if len(results) == 20:
            break
    return results


@router.get("/{candidate_id}", response_model=CandidateDetail)
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    return to_detail(db, get_candidate_or_404(db, candidate_id))


@router.patch("/{candidate_id}", response_model=CandidateDetail)
def update_candidate(candidate_id: int, data: CandidateUpdate, db: Session = Depends(get_db)):
    """Modifie le candidat ; si le nom change, son dossier est renommé."""
    candidate = get_candidate_or_404(db, candidate_id)
    position = db.get(Position, candidate.position_id)
    name = data.name.strip()

    if name != candidate.name:
        taken = set(
            db.scalars(
                select(Candidate.folder).where(Candidate.position_id == position.id, Candidate.id != candidate.id)
            )
        )
        new_folder = file_storage.unique_name(file_storage.safe_name(name), taken)
        file_storage.rename_dir(
            file_storage.candidate_dir(position.folder, candidate.folder),
            file_storage.candidate_dir(position.folder, new_folder),
        )
        candidate.folder = new_folder

    if data.status != candidate.status:
        touch_candidate(candidate)
    candidate.name = name
    candidate.email = data.email or ""
    candidate.status = data.status
    db.commit()
    return to_detail(db, candidate)


@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    """Supprime le candidat, ses rendez-vous et son dossier de fichiers."""
    candidate = get_candidate_or_404(db, candidate_id)
    position = db.get(Position, candidate.position_id)
    file_storage.delete_path(file_storage.candidate_dir(position.folder, candidate.folder))
    db.delete(candidate)
    db.commit()
