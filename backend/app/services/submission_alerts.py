from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.critical_alert import CriticalAlert
from app.models.evolution import EvolutionRequest, EvolutionStatus
from app.models.questionnaire import Questionnaire
from app.models.user import Role, User
from app.services.drop_detection import detect_drops
from app.services.quarters import questionnaire_title


@dataclass
class Notification:
    subject: str
    body: str


def rh_emails(db: Session) -> list[str]:
    return list(db.scalars(select(User.email).where(User.role == Role.RH)))


def update_critical_alert(db: Session, questionnaire: Questionnaire, member: User) -> Notification | None:
    """Crée, met à jour ou supprime l'alerte de baisse de ce membre pour ce questionnaire."""
    drops = detect_drops(db, questionnaire, member.id)
    alert = db.scalar(
        select(CriticalAlert).where(
            CriticalAlert.questionnaire_id == questionnaire.id, CriticalAlert.member_id == member.id
        )
    )

    if not drops:
        if alert is not None:
            db.delete(alert)
        return None

    details = "\n".join(drops)
    if alert is not None and alert.details == details:
        return None  # rien de nouveau, pas de nouvel email

    if alert is None:
        db.add(CriticalAlert(questionnaire_id=questionnaire.id, member_id=member.id, details=details))
    else:
        alert.details = details
        alert.seen = False

    return Notification(
        subject=f"[Trajectoires] Baisse importante chez {member.name}",
        body=f"Les réponses de {member.name} au questionnaire {questionnaire_title(db, questionnaire)} montrent une baisse :\n\n{details}",
    )


def update_evolution_request(
    db: Session, questionnaire: Questionnaire, member: User, wants_evolution: bool
) -> Notification | None:
    """Crée le suivi d'évolution si le membre répond « oui »."""
    request = db.scalar(
        select(EvolutionRequest).where(
            EvolutionRequest.questionnaire_id == questionnaire.id, EvolutionRequest.member_id == member.id
        )
    )

    if not wants_evolution:
        # Le membre a changé d'avis : on retire le suivi seulement si le RH n'y a pas encore touché
        if request is not None and request.status == EvolutionStatus.A_DISCUTER and not request.note:
            db.delete(request)
        return None

    if request is not None:
        return None

    db.add(EvolutionRequest(questionnaire_id=questionnaire.id, member_id=member.id))
    return Notification(
        subject=f"[Trajectoires] {member.name} souhaite évoluer",
        body=f"{member.name} a indiqué souhaiter évoluer dans son poste ou sa carrière "
        f"(questionnaire {questionnaire_title(db, questionnaire)}).",
    )
