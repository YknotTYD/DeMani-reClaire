from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_rh
from app.models.candidate import Candidate
from app.models.position import Position
from app.schemas.recruitment import PositionIn, PositionOut
from app.services import file_storage

router = APIRouter(prefix="/positions", tags=["postes"], dependencies=[Depends(require_rh)])


def get_position_or_404(db: Session, position_id: int) -> Position:
    position = db.get(Position, position_id)
    if position is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Poste introuvable")
    return position


def count_candidates(db: Session, position_id: int) -> int:
    return db.scalar(select(func.count()).where(Candidate.position_id == position_id))


def to_out(db: Session, position: Position) -> PositionOut:
    return PositionOut(id=position.id, name=position.name, candidate_count=count_candidates(db, position.id))


def check_name_free(db: Session, name: str, exclude_id: int | None = None):
    query = select(Position).where(func.lower(Position.name) == name.lower())
    if exclude_id is not None:
        query = query.where(Position.id != exclude_id)
    if db.scalar(query):
        raise HTTPException(status.HTTP_409_CONFLICT, "Ce poste existe déjà")


def free_folder(db: Session, name: str, exclude_id: int | None = None) -> str:
    query = select(Position.folder)
    if exclude_id is not None:
        query = query.where(Position.id != exclude_id)
    return file_storage.unique_name(file_storage.safe_name(name), set(db.scalars(query)))


@router.get("", response_model=list[PositionOut])
def list_positions(db: Session = Depends(get_db)):
    return [to_out(db, p) for p in db.scalars(select(Position).order_by(Position.name))]


@router.post("", response_model=PositionOut, status_code=status.HTTP_201_CREATED)
def create_position(data: PositionIn, db: Session = Depends(get_db)):
    name = data.name.strip()
    check_name_free(db, name)
    position = Position(name=name, folder=free_folder(db, name))
    db.add(position)
    db.commit()
    return to_out(db, position)


@router.patch("/{position_id}", response_model=PositionOut)
def rename_position(position_id: int, data: PositionIn, db: Session = Depends(get_db)):
    """Renomme le poste et son dossier sur le disque."""
    position = get_position_or_404(db, position_id)
    name = data.name.strip()
    check_name_free(db, name, exclude_id=position.id)
    new_folder = free_folder(db, name, exclude_id=position.id)
    file_storage.rename_dir(file_storage.CANDIDATES_ROOT / position.folder, file_storage.CANDIDATES_ROOT / new_folder)
    position.name, position.folder = name, new_folder
    db.commit()
    return to_out(db, position)


@router.delete("/{position_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_position(position_id: int, db: Session = Depends(get_db)):
    position = get_position_or_404(db, position_id)
    if count_candidates(db, position.id):
        raise HTTPException(status.HTTP_409_CONFLICT, "Ce poste a encore des candidats : supprime-les d'abord")
    file_storage.delete_path(file_storage.CANDIDATES_ROOT / position.folder)
    db.delete(position)
    db.commit()
