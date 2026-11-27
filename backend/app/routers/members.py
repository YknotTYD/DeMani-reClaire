from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_rh
from app.core.security import hash_password
from app.models.user import Role, User
from app.schemas.user import MemberCreate, MemberUpdate, UserOut
from app.services.access_log import log_access
from app.services import file_storage

router = APIRouter(prefix="/members", tags=["membres"], dependencies=[Depends(require_rh)])


def get_member_or_404(db: Session, member_id: int) -> User:
    member = db.get(User, member_id)
    if member is None or member.role != Role.MEMBRE:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Membre introuvable")
    return member


@router.get("", response_model=list[UserOut])
def list_members(db: Session = Depends(get_db)):
    return db.scalars(select(User).where(User.role == Role.MEMBRE).order_by(User.name)).all()


@router.get("/{member_id}", response_model=UserOut)
def get_member(member_id: int, db: Session = Depends(get_db), viewer: User = Depends(get_current_user)):
    """Ouvrir le rapport d'un collaborateur : la consultation est inscrite dans son journal."""
    member = get_member_or_404(db, member_id)
    log_access(db, member.id, viewer, "Consultation du profil")
    return member


@router.patch("/{member_id}", response_model=UserOut)
def update_member(member_id: int, data: MemberUpdate, db: Session = Depends(get_db), viewer: User = Depends(get_current_user)):
    member = get_member_or_404(db, member_id)
    member.hired_on = data.hired_on
    db.commit()
    log_access(db, member.id, viewer, "Modification de la date d'embauche")
    return member


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_member(data: MemberCreate, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.email == data.email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Cet email est déjà utilisé")
    member = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=Role.MEMBRE,
        hired_on=data.hired_on,
    )
    db.add(member)
    db.commit()
    return member


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(member_id: int, db: Session = Depends(get_db)):
    """Supprime le membre, ses réponses, ses rendez-vous et ses documents."""
    db.delete(get_member_or_404(db, member_id))
    db.commit()
    file_storage.delete_path(file_storage.member_dir(member_id))
