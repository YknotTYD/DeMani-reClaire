from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import Role, User

bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Non authentifié")
    user_id = decode_token(credentials.credentials)
    user = db.get(User, user_id) if user_id else None
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session invalide")
    return user


def require_rh(user: User = Depends(get_current_user)) -> User:
    if user.role != Role.RH:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Réservé aux RH")
    return user


def require_membre(user: User = Depends(get_current_user)) -> User:
    if user.role != Role.MEMBRE:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Réservé aux membres")
    return user
