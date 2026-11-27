from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_rh
from app.models.questionnaire import Questionnaire
from app.models.questionnaire_model import QuestionnaireModel
from app.routers.members import get_member_or_404
from app.schemas.questionnaire import ModelEvolution, ModelIn, ModelOut
from app.services.questionnaire_stats import model_criteria, model_evolution

router = APIRouter(prefix="/questionnaire-models", tags=["modèles de questionnaire"], dependencies=[Depends(require_rh)])


def get_model_or_404(db: Session, model_id: int) -> QuestionnaireModel:
    model = db.get(QuestionnaireModel, model_id)
    if model is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Modèle introuvable")
    return model


def to_out(db: Session, model: QuestionnaireModel) -> ModelOut:
    return ModelOut(
        id=model.id,
        name=model.name,
        criteria=model_criteria(db, model.id),
        questionnaire_count=db.scalar(select(func.count()).where(Questionnaire.model_id == model.id)),
    )


def check_name_free(db: Session, name: str, exclude_id: int | None = None):
    query = select(QuestionnaireModel).where(func.lower(QuestionnaireModel.name) == name.lower())
    if exclude_id is not None:
        query = query.where(QuestionnaireModel.id != exclude_id)
    if db.scalar(query):
        raise HTTPException(status.HTTP_409_CONFLICT, "Un modèle porte déjà ce nom")


@router.get("", response_model=list[ModelOut])
def list_models(db: Session = Depends(get_db)):
    return [to_out(db, m) for m in db.scalars(select(QuestionnaireModel).order_by(QuestionnaireModel.name))]


@router.get("/{model_id}", response_model=ModelOut)
def get_model(model_id: int, db: Session = Depends(get_db)):
    return to_out(db, get_model_or_404(db, model_id))


@router.post("", response_model=ModelOut, status_code=status.HTTP_201_CREATED)
def create_model(data: ModelIn, db: Session = Depends(get_db)):
    name = data.name.strip()
    check_name_free(db, name)
    model = QuestionnaireModel(name=name)
    db.add(model)
    db.commit()
    return to_out(db, model)


@router.patch("/{model_id}", response_model=ModelOut)
def rename_model(model_id: int, data: ModelIn, db: Session = Depends(get_db)):
    model = get_model_or_404(db, model_id)
    name = data.name.strip()
    check_name_free(db, name, exclude_id=model.id)
    model.name = name
    db.commit()
    return to_out(db, model)


@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_model(model_id: int, db: Session = Depends(get_db)):
    """Supprime le modèle, ses questionnaires et toutes leurs réponses."""
    db.delete(get_model_or_404(db, model_id))
    db.commit()


@router.get("/{model_id}/evolution", response_model=ModelEvolution)
def evolution(
    model_id: int,
    member_id: int | None = Query(None, description="Évolution d'un membre, trimestres partagés uniquement (sinon : moyenne de tous)"),
    db: Session = Depends(get_db),
):
    model = get_model_or_404(db, model_id)
    if member_id is not None:
        get_member_or_404(db, member_id)
    # Pour un membre, le RH ne voit que les trimestres que celui-ci a choisi de partager
    return model_evolution(db, model, member_id, only_shared=member_id is not None)
