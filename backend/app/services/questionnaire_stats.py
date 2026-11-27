"""Calculs autour des questionnaires : destinataires, moyennes, évolution par trimestre."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from collections import Counter

from app.core.config import MIN_GROUP_SIZE
from app.models.criterion import AnswerType, Axis, Criterion
from app.models.questionnaire import Answer, Questionnaire
from app.models.questionnaire_model import QuestionnaireModel
from app.models.submission import Submission
from app.models.team import team_members
from app.models.user import Role, User
from app.schemas.questionnaire import CellAverage, CellStat, EvolutionPoint, ModelEvolution, QuestionnaireOut, TeamRef
from app.services.quarters import quarter_label


def model_criteria(db: Session, model_id: int) -> list[Criterion]:
    return db.scalars(
        select(Criterion).where(Criterion.model_id == model_id).order_by(Criterion.axis, Criterion.position, Criterion.id)
    ).all()


def targeted_members(db: Session, questionnaire: Questionnaire) -> list[User]:
    """Membres des équipes destinataires (sans doublon si un membre est dans plusieurs équipes)."""
    team_ids = [t.id for t in questionnaire.teams]
    if not team_ids:
        return []
    member_ids = select(team_members.c.user_id).where(team_members.c.team_id.in_(team_ids))
    return db.scalars(
        select(User).where(User.id.in_(member_ids), User.role == Role.MEMBRE).order_by(User.name)
    ).all()


def is_targeted(db: Session, questionnaire: Questionnaire, member_id: int) -> bool:
    return any(m.id == member_id for m in targeted_members(db, questionnaire))


def answered_ids(db: Session, questionnaire_id: int) -> set[int]:
    return set(db.scalars(select(Submission.member_id).where(Submission.questionnaire_id == questionnaire_id)))


def star_column_ids(db: Session, model_id: int) -> list[int]:
    return list(
        db.scalars(
            select(Criterion.id).where(
                Criterion.model_id == model_id, Criterion.axis == Axis.COLUMN, Criterion.answer_type == AnswerType.STARS
            )
        )
    )


def cell_averages(db: Session, questionnaire: Questionnaire, member_id: int | None = None) -> list[CellAverage]:
    """Moyennes des cases en étoiles (les autres types ne se moyennent pas entre eux)."""
    query = (
        select(Answer.row_id, Answer.column_id, func.avg(Answer.number), func.count())
        .where(Answer.questionnaire_id == questionnaire.id, Answer.column_id.in_(star_column_ids(db, questionnaire.model_id)))
        .group_by(Answer.row_id, Answer.column_id)
    )
    if member_id is not None:
        query = query.where(Answer.member_id == member_id)
    return [
        CellAverage(row_id=r, column_id=c, average=round(avg, 2), count=n) for r, c, avg, n in db.execute(query)
    ]


def overall_average(db: Session, questionnaire: Questionnaire, member_id: int | None = None) -> float | None:
    """Moyenne générale : toutes les réponses en étoiles."""
    query = select(func.avg(Answer.number)).where(
        Answer.questionnaire_id == questionnaire.id, Answer.column_id.in_(star_column_ids(db, questionnaire.model_id))
    )
    if member_id is not None:
        query = query.where(Answer.member_id == member_id)
    value = db.scalar(query)
    return round(value, 2) if value is not None else None


def cell_stats(db: Session, questionnaire: Questionnaire) -> list[CellStat]:
    """Résultat de chaque case selon le type de sa colonne. Les textes sont rendus sans le nom de leur auteur."""
    columns = {c.id: c for c in model_criteria(db, questionnaire.model_id) if c.axis == Axis.COLUMN}
    grouped: dict[tuple[int, int], list[Answer]] = {}
    for a in db.scalars(select(Answer).where(Answer.questionnaire_id == questionnaire.id).order_by(Answer.id)):
        grouped.setdefault((a.row_id, a.column_id), []).append(a)

    stats = []
    for (row_id, column_id), answers in grouped.items():
        column = columns.get(column_id)
        if column is None:
            continue
        stat = CellStat(row_id=row_id, column_id=column_id, count=len(answers))
        numbers = [a.number for a in answers if a.number is not None]
        match column.answer_type:
            case AnswerType.STARS | AnswerType.NUMBER:
                stat.average = round(sum(numbers) / len(numbers), 2)
            case AnswerType.YES_NO:
                stat.yes_percent = round(100 * sum(numbers) / len(numbers))
            case AnswerType.CHOICE:
                counts = Counter(a.text for a in answers)
                stat.choices = {option: counts.get(option, 0) for option in column.option_list}
            case AnswerType.TEXT:
                stat.texts = [a.text for a in answers]
        stats.append(stat)
    return stats


def is_masked(db: Session, questionnaire: Questionnaire) -> bool:
    """Aucun résultat collectif pour un groupe de moins de MIN_GROUP_SIZE répondants (rapport, section 5.5)."""
    return len(answered_ids(db, questionnaire.id)) < MIN_GROUP_SIZE


def shared_ids(db: Session, questionnaire_id: int) -> set[int]:
    return set(
        db.scalars(
            select(Submission.member_id).where(Submission.questionnaire_id == questionnaire_id, Submission.shared.is_(True))
        )
    )


def questionnaire_out(db: Session, questionnaire: Questionnaire) -> QuestionnaireOut:
    model = db.get(QuestionnaireModel, questionnaire.model_id)
    masked = is_masked(db, questionnaire)
    return QuestionnaireOut(
        id=questionnaire.id,
        model_id=model.id,
        model_name=model.name,
        year=questionnaire.year,
        quarter=questionnaire.quarter,
        label=quarter_label(questionnaire.year, questionnaire.quarter),
        teams=[TeamRef(id=t.id, name=t.name) for t in questionnaire.teams],
        targeted_count=len(targeted_members(db, questionnaire)),
        answered_count=len(answered_ids(db, questionnaire.id)),
        overall_average=None if masked else overall_average(db, questionnaire),
        masked=masked,
    )


def model_evolution(
    db: Session, model: QuestionnaireModel, member_id: int | None = None, only_shared: bool = False
) -> ModelEvolution:
    """
    Moyennes trimestre par trimestre pour un modèle.
    - sans member_id : moyenne de tous, masquée pour les trimestres de moins de MIN_GROUP_SIZE répondants ;
    - avec member_id : les réponses d'un membre ; `only_shared` limite aux trimestres qu'il a choisi de partager (vue RH).
    """
    questionnaires = db.scalars(
        select(Questionnaire)
        .where(Questionnaire.model_id == model.id)
        .order_by(Questionnaire.year, Questionnaire.quarter)
    ).all()

    points = []
    for q in questionnaires:
        label = quarter_label(q.year, q.quarter)
        if member_id is None and is_masked(db, q):
            points.append(
                EvolutionPoint(questionnaire_id=q.id, label=label, year=q.year, quarter=q.quarter, overall_average=None, cells=[], masked=True)
            )
            continue
        if member_id is not None and only_shared and member_id not in shared_ids(db, q.id):
            continue
        average = overall_average(db, q, member_id)
        if member_id is not None and average is None:
            continue  # le membre n'a pas répondu ce trimestre-là
        points.append(
            EvolutionPoint(
                questionnaire_id=q.id,
                label=label,
                year=q.year,
                quarter=q.quarter,
                overall_average=average,
                cells=cell_averages(db, q, member_id),
            )
        )
    return ModelEvolution(model_id=model.id, model_name=model.name, criteria=model_criteria(db, model.id), points=points)
