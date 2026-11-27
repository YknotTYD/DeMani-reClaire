from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import MIN_GROUP_SIZE
from app.core.database import get_db
from app.core.deps import get_current_user, require_membre, require_rh
from app.models.questionnaire import Answer, Questionnaire
from app.models.questionnaire_model import QuestionnaireModel
from app.models.submission import Submission
from app.models.team import Team
from app.models.user import Role, User
from app.routers.members import get_member_or_404
from app.routers.questionnaire_models import get_model_or_404
from app.schemas.questionnaire import (
    AnsweredQuestionnaire,
    FormOut,
    MyQuestionnaireOut,
    QuestionnaireIn,
    QuestionnaireOut,
    QuestionnaireStats,
    Respondent,
    ShareIn,
    SubmissionIn,
    SubmissionOut,
)
from app.services.access_log import log_access
from app.services.answers import answer_out, build_answers
from app.services.email_sender import send_email
from app.services.quarters import quarter_label
from app.services.questionnaire_stats import (
    answered_ids,
    cell_stats,
    is_masked,
    is_targeted,
    model_criteria,
    overall_average,
    questionnaire_out,
    targeted_members,
)
from app.services.submission_alerts import rh_emails, update_critical_alert, update_evolution_request

router = APIRouter(prefix="/questionnaires", tags=["questionnaires"])

NEWEST_FIRST = (Questionnaire.year.desc(), Questionnaire.quarter.desc())


def get_questionnaire_or_404(db: Session, questionnaire_id: int) -> Questionnaire:
    questionnaire = db.get(Questionnaire, questionnaire_id)
    if questionnaire is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Questionnaire introuvable")
    return questionnaire


def get_for_member(db: Session, questionnaire_id: int, member: User) -> Questionnaire:
    """Un membre n'accède qu'aux questionnaires envoyés à l'une de ses équipes."""
    questionnaire = get_questionnaire_or_404(db, questionnaire_id)
    if not is_targeted(db, questionnaire, member.id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Ce questionnaire n'est pas destiné à tes équipes")
    return questionnaire


def submission_of(db: Session, questionnaire_id: int, member_id: int) -> SubmissionOut:
    questionnaire = db.get(Questionnaire, questionnaire_id)
    columns = {c.id: c for c in model_criteria(db, questionnaire.model_id)}
    answers = db.scalars(
        select(Answer).where(Answer.questionnaire_id == questionnaire_id, Answer.member_id == member_id)
    ).all()
    submission = db.get(Submission, (questionnaire_id, member_id))
    return SubmissionOut(
        answers=[answer_out(a, columns[a.column_id]) for a in answers if a.column_id in columns],
        wants_evolution=submission.wants_evolution if submission else None,
        shared=bool(submission and submission.shared),
    )


# ---------- Gestion (RH) ----------


@router.get("", response_model=list[QuestionnaireOut], dependencies=[Depends(require_rh)])
def list_questionnaires(db: Session = Depends(get_db)):
    return [questionnaire_out(db, q) for q in db.scalars(select(Questionnaire).order_by(*NEWEST_FIRST))]


@router.post("", response_model=QuestionnaireOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_rh)])
def create_questionnaire(data: QuestionnaireIn, db: Session = Depends(get_db)):
    get_model_or_404(db, data.model_id)
    if not model_criteria(db, data.model_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Ce modèle n'a pas encore de tableau (lignes et colonnes)")
    teams = db.scalars(select(Team).where(Team.id.in_(data.team_ids))).all()
    if len(teams) != len(set(data.team_ids)):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Équipe introuvable")

    questionnaire = Questionnaire(model_id=data.model_id, year=data.year, quarter=data.quarter, teams=list(teams))
    db.add(questionnaire)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "Ce modèle a déjà été envoyé pour ce trimestre")
    return questionnaire_out(db, questionnaire)


@router.get("/{questionnaire_id}/stats", response_model=QuestionnaireStats, dependencies=[Depends(require_rh)])
def stats(questionnaire_id: int, db: Session = Depends(get_db)):
    """Moyennes par case, moyenne générale, participation."""
    questionnaire = get_questionnaire_or_404(db, questionnaire_id)
    answered = answered_ids(db, questionnaire.id)
    targeted = targeted_members(db, questionnaire)
    # Un membre qui a répondu puis quitté l'équipe reste compté dans les répondants
    respondents = {m.id: Respondent(member_id=m.id, name=m.name, answered=m.id in answered) for m in targeted}
    for member_id in answered - respondents.keys():
        member = db.get(User, member_id)
        respondents[member_id] = Respondent(member_id=member_id, name=member.name, answered=True)

    masked = is_masked(db, questionnaire)
    return QuestionnaireStats(
        questionnaire=questionnaire_out(db, questionnaire),
        criteria=model_criteria(db, questionnaire.model_id),
        cells=[] if masked else cell_stats(db, questionnaire),
        overall_average=None if masked else overall_average(db, questionnaire),
        masked=masked,
        min_group=MIN_GROUP_SIZE,
        evolution_yes=len(
            db.scalars(
                select(Submission.member_id).where(
                    Submission.questionnaire_id == questionnaire.id, Submission.wants_evolution.is_(True)
                )
            ).all()
        ),
        respondents=sorted(respondents.values(), key=lambda r: r.name.lower()),
    )


@router.delete("/{questionnaire_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_rh)])
def delete_questionnaire(questionnaire_id: int, db: Session = Depends(get_db)):
    db.delete(get_questionnaire_or_404(db, questionnaire_id))
    db.commit()


@router.get("/answered-by/{member_id}", response_model=list[AnsweredQuestionnaire], dependencies=[Depends(require_rh)])
def answered_by(member_id: int, db: Session = Depends(get_db)):
    """Questionnaires auxquels un membre a répondu (pour son rapport)."""
    get_member_or_404(db, member_id)
    rows = db.execute(
        select(Questionnaire, QuestionnaireModel, Submission.shared)
        .join(Submission, Submission.questionnaire_id == Questionnaire.id)
        .join(QuestionnaireModel, QuestionnaireModel.id == Questionnaire.model_id)
        .where(Submission.member_id == member_id)
        .order_by(*NEWEST_FIRST)
    ).all()
    return [
        AnsweredQuestionnaire(
            questionnaire_id=q.id,
            model_id=m.id,
            model_name=m.name,
            label=quarter_label(q.year, q.quarter),
            year=q.year,
            quarter=q.quarter,
            shared=shared,
        )
        for q, m, shared in rows
    ]


@router.get("/{questionnaire_id}/answers/{member_id}", response_model=SubmissionOut, dependencies=[Depends(require_rh)])
def member_answers(questionnaire_id: int, member_id: int, db: Session = Depends(get_db), viewer: User = Depends(get_current_user)):
    """Réponses individuelles : visibles par le RH seulement si le membre a choisi de les partager."""
    get_questionnaire_or_404(db, questionnaire_id)
    get_member_or_404(db, member_id)
    submission = db.get(Submission, (questionnaire_id, member_id))
    if submission is None or not submission.shared:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Le collaborateur n'a pas partagé ses réponses")
    log_access(db, member_id, viewer, "Consultation de réponses partagées")
    return submission_of(db, questionnaire_id, member_id)


# ---------- Tableau à remplir (RH ou membre destinataire) ----------


@router.get("/{questionnaire_id}/form", response_model=FormOut)
def form(questionnaire_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role == Role.RH:
        questionnaire = get_questionnaire_or_404(db, questionnaire_id)
    else:
        questionnaire = get_for_member(db, questionnaire_id, user)
    model = db.get(QuestionnaireModel, questionnaire.model_id)
    return FormOut(
        questionnaire_id=questionnaire.id,
        model_name=model.name,
        label=quarter_label(questionnaire.year, questionnaire.quarter),
        criteria=model_criteria(db, model.id),
    )


# ---------- Vue membre ----------


@router.get("/mine", response_model=list[MyQuestionnaireOut])
def my_questionnaires(db: Session = Depends(get_db), user: User = Depends(require_membre)):
    result = []
    for q in db.scalars(select(Questionnaire).order_by(*NEWEST_FIRST)):
        if is_targeted(db, q, user.id):
            model = db.get(QuestionnaireModel, q.model_id)
            submission = db.get(Submission, (q.id, user.id))
            result.append(
                MyQuestionnaireOut(
                    id=q.id,
                    model_id=model.id,
                    model_name=model.name,
                    year=q.year,
                    quarter=q.quarter,
                    label=quarter_label(q.year, q.quarter),
                    answered=submission is not None,
                    shared=bool(submission and submission.shared),
                )
            )
    return result


@router.get("/{questionnaire_id}/my-answers", response_model=SubmissionOut)
def my_answers(questionnaire_id: int, db: Session = Depends(get_db), user: User = Depends(require_membre)):
    get_for_member(db, questionnaire_id, user)
    return submission_of(db, questionnaire_id, user.id)


@router.put("/{questionnaire_id}/my-answers", response_model=SubmissionOut)
def submit_my_answers(
    questionnaire_id: int,
    data: SubmissionIn,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(require_membre),
):
    """Enregistre (ou remplace) les réponses du membre, puis met à jour les alertes pour le RH."""
    questionnaire = get_for_member(db, questionnaire_id, user)
    answers = build_answers(model_criteria(db, questionnaire.model_id), data.answers, questionnaire_id, user.id)

    db.execute(delete(Answer).where(Answer.questionnaire_id == questionnaire_id, Answer.member_id == user.id))
    db.add_all(answers)
    submission = db.get(Submission, (questionnaire_id, user.id))
    if submission is None:
        db.add(Submission(questionnaire_id=questionnaire_id, member_id=user.id, wants_evolution=data.wants_evolution))
    else:
        submission.wants_evolution = data.wants_evolution  # le choix de partage est conservé
    db.flush()

    # Une baisse devient un signal pour le collaborateur lui-même (pas d'email au RH) ;
    # le souhait d'évolution, que le collaborateur exprime en sachant que le RH en sera informé, reste notifié.
    update_critical_alert(db, questionnaire, user)
    notifications = [update_evolution_request(db, questionnaire, user, data.wants_evolution)]
    db.commit()

    recipients = rh_emails(db)
    for notification in filter(None, notifications):
        background.add_task(send_email, recipients, notification.subject, notification.body)

    return submission_of(db, questionnaire_id, user.id)


@router.put("/{questionnaire_id}/share", response_model=SubmissionOut)
def share_my_answers(
    questionnaire_id: int, data: ShareIn, db: Session = Depends(get_db), user: User = Depends(require_membre)
):
    """Le collaborateur choisit de partager (ou de ne plus partager) ses réponses avec le RH."""
    get_for_member(db, questionnaire_id, user)
    submission = db.get(Submission, (questionnaire_id, user.id))
    if submission is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Réponds d'abord au questionnaire")
    submission.shared = data.shared
    db.commit()
    return submission_of(db, questionnaire_id, user.id)
