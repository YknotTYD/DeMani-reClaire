from sqlalchemy import select, tuple_
from sqlalchemy.orm import Session

from app.core.config import CRITICAL_DROP
from app.models.criterion import Criterion
from app.services.questionnaire_stats import star_column_ids
from app.models.questionnaire import Answer, Questionnaire
from app.models.submission import Submission
from app.services.quarters import quarter_label


def previous_answered(db: Session, questionnaire: Questionnaire, member_id: int) -> Questionnaire | None:
    """Le dernier questionnaire du même modèle, d'un trimestre antérieur, auquel le membre a répondu."""
    return db.scalar(
        select(Questionnaire)
        .join(Submission, Submission.questionnaire_id == Questionnaire.id)
        .where(
            Questionnaire.model_id == questionnaire.model_id,
            Submission.member_id == member_id,
            tuple_(Questionnaire.year, Questionnaire.quarter) < (questionnaire.year, questionnaire.quarter),
        )
        .order_by(Questionnaire.year.desc(), Questionnaire.quarter.desc())
        .limit(1)
    )


def _stars_by_cell(db: Session, questionnaire: Questionnaire, member_id: int) -> dict[tuple[int, int], int]:
    """Réponses en étoiles du membre (seul ce type de réponse peut « baisser »)."""
    answers = db.scalars(
        select(Answer).where(
            Answer.questionnaire_id == questionnaire.id,
            Answer.member_id == member_id,
            Answer.column_id.in_(star_column_ids(db, questionnaire.model_id)),
        )
    )
    return {(a.row_id, a.column_id): int(a.number) for a in answers}


def detect_drops(db: Session, questionnaire: Questionnaire, member_id: int) -> list[str]:
    """
    Compare les réponses du membre avec celles de son questionnaire précédent (même modèle).
    Retourne une ligne lisible par case ayant perdu au moins CRITICAL_DROP étoiles.
    """
    previous = previous_answered(db, questionnaire, member_id)
    if previous is None:
        return []

    before = _stars_by_cell(db, previous, member_id)
    now = _stars_by_cell(db, questionnaire, member_id)
    labels = {c.id: c.label for c in db.scalars(select(Criterion).where(Criterion.model_id == questionnaire.model_id))}
    previous_label = quarter_label(previous.year, previous.quarter)
    current_label = quarter_label(questionnaire.year, questionnaire.quarter)

    drops = []
    for cell, stars in now.items():
        old = before.get(cell)
        if old is not None and old - stars >= CRITICAL_DROP:
            row_id, column_id = cell
            drops.append(
                f"{labels[row_id]} / {labels[column_id]} : {old} → {stars} étoiles ({previous_label} → {current_label})"
            )
    return drops
