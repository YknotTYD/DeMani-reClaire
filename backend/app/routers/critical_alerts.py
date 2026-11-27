"""Compteur affiché à côté du lien « Alertes ».

Dans cette version, les baisses de réponses ne remontent plus au RH : elles sont montrées
au collaborateur lui-même, qui décide de demander un échange (rapport, section 6.1)."""

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_rh
from app.models.contact_request import ContactRequest, RequestStatus
from app.models.evolution import EvolutionRequest, EvolutionStatus
from app.schemas.alerts import AlertSummary
from app.services.reminders import compute_reminders

router = APIRouter(prefix="/alerts", tags=["alertes"], dependencies=[Depends(require_rh)])


@router.get("/summary", response_model=AlertSummary)
def summary(db: Session = Depends(get_db)):
    return AlertSummary(
        reminders=len(compute_reminders(db).reminders),
        requests=db.scalar(select(func.count()).where(ContactRequest.status == RequestStatus.NOUVELLE)),
        evolution_to_discuss=db.scalar(
            select(func.count()).where(EvolutionRequest.status == EvolutionStatus.A_DISCUTER)
        ),
    )
