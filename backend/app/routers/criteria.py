from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_rh
from app.models.criterion import Axis, Criterion
from app.routers.questionnaire_models import get_model_or_404
from app.schemas.criterion import CriterionIn, CriterionOut, CriterionUpdate

router = APIRouter(tags=["critères"], dependencies=[Depends(require_rh)])


def get_criterion_or_404(db: Session, criterion_id: int) -> Criterion:
    criterion = db.get(Criterion, criterion_id)
    if criterion is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Critère introuvable")
    return criterion


@router.post(
    "/questionnaire-models/{model_id}/criteria", response_model=CriterionOut, status_code=status.HTTP_201_CREATED
)
def create_criterion(model_id: int, data: CriterionIn, db: Session = Depends(get_db)):
    get_model_or_404(db, model_id)
    last = db.scalar(
        select(func.max(Criterion.position)).where(Criterion.model_id == model_id, Criterion.axis == data.axis)
    )
    criterion = Criterion(model_id=model_id, axis=data.axis, label=data.label, position=(last or 0) + 1)
    if data.axis == Axis.COLUMN:
        criterion.answer_type = data.answer_type
        criterion.options = "\n".join(data.options)
        criterion.min_value = data.min_value
        criterion.max_value = data.max_value
        criterion.required = data.required
    db.add(criterion)
    db.commit()
    return criterion


@router.patch("/criteria/{criterion_id}", response_model=CriterionOut)
def rename_criterion(criterion_id: int, data: CriterionUpdate, db: Session = Depends(get_db)):
    criterion = get_criterion_or_404(db, criterion_id)
    criterion.label = data.label
    if data.required is not None and criterion.axis == Axis.COLUMN:
        criterion.required = data.required
    db.commit()
    return criterion


@router.delete("/criteria/{criterion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_criterion(criterion_id: int, db: Session = Depends(get_db)):
    """Supprime la ligne ou colonne, et les notes données dessus (tous trimestres confondus)."""
    db.delete(get_criterion_or_404(db, criterion_id))
    db.commit()
