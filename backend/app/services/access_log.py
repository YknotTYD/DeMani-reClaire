"""Journal des consultations (rapport, annexe C) : chaque accès d'un RH aux données d'un collaborateur est tracé."""

from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.access_log import AccessLog
from app.models.user import User


SAME_VISIT = timedelta(minutes=2)


def log_access(db: Session, member_id: int, viewer: User, action: str) -> None:
    """Inscrit la consultation. Une même action répétée dans les 2 minutes (même visite) n'est notée qu'une fois."""
    last = db.scalar(
        select(AccessLog)
        .where(AccessLog.member_id == member_id, AccessLog.viewer_id == viewer.id, AccessLog.action == action)
        .order_by(AccessLog.at.desc())
        .limit(1)
    )
    now = datetime.now(timezone.utc)
    if last is not None and now - last.at.replace(tzinfo=timezone.utc) < SAME_VISIT:
        return
    db.add(AccessLog(member_id=member_id, viewer_id=viewer.id, viewer_name=viewer.name, action=action))
    db.commit()
