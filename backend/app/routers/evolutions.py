from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_rh
from app.models.evolution import EvolutionRequest
from app.models.questionnaire import Questionnaire
from app.services.quarters import questionnaire_title
from app.models.user import User
from app.schemas.alerts import EvolutionOut, EvolutionUpdate

router = APIRouter(prefix="/evolutions", tags=["évolutions"], dependencies=[Depends(require_rh)])


def to_out(request: EvolutionRequest, member_name: str, period: str) -> EvolutionOut:
    return EvolutionOut(
        id=request.id,
        member_id=request.member_id,
        member_name=member_name,
        period=period,
        created_at=request.created_at,
        status=request.status,
        note=request.note,
    )


@router.get("", response_model=list[EvolutionOut])
def list_evolutions(db: Session = Depends(get_db)):
    rows = db.execute(
        select(EvolutionRequest, User.name, Questionnaire)
        .join(User, User.id == EvolutionRequest.member_id)
        .join(Questionnaire, Questionnaire.id == EvolutionRequest.questionnaire_id)
        .order_by(EvolutionRequest.created_at.desc())
    ).all()
    return [to_out(request, name, questionnaire_title(db, q)) for request, name, q in rows]


@router.patch("/{request_id}", response_model=EvolutionOut)
def update_evolution(request_id: int, data: EvolutionUpdate, db: Session = Depends(get_db)):
    request = db.get(EvolutionRequest, request_id)
    if request is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Suivi introuvable")
    request.status = data.status
    request.note = data.note
    db.commit()
    return to_out(request, db.get(User, request.member_id).name, questionnaire_title(db, db.get(Questionnaire, request.questionnaire_id)))
