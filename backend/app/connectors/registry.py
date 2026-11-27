from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.connectors.base import Connector
from app.models.candidate import Candidate
from app.models.evolution import EvolutionRequest
from app.models.user import Role, User
from app.services.reminders import compute_reminders


def _members(db: Session) -> int:
    return db.scalar(select(func.count()).select_from(User).where(User.role == Role.MEMBRE)) or 0


def _sirh(db: Session) -> int:
    hired = db.scalar(select(func.count()).select_from(User).where(User.hired_on.is_not(None))) or 0
    wishes = db.scalar(select(func.count()).select_from(EvolutionRequest)) or 0
    return hired + wishes


def _crm(db: Session) -> int:
    return len(compute_reminders(db).reminders)


def _talentlink(db: Session) -> int:
    return db.scalar(select(func.count()).select_from(Candidate)) or 0


CONNECTORS: list[Connector] = [
    Connector(
        id="teams",
        name="Microsoft Teams",
        role="Point d'entrée unique : Trajectoires s'ouvre comme une application dans Teams.",
        reads=["Identité du collaborateur (compte professionnel)"],
        writes=["Aucune donnée"],
        version=1,
        zone="encadree",
        count=_members,
        count_label="collaborateurs",
    ),
    Connector(
        id="crm_rh",
        name="CRM RH",
        role="Portefeuilles et alertes : échéances légales, jalons d'intégration, collaborateurs sans contact.",
        reads=["Portefeuilles des gestionnaires", "Dates des derniers échanges", "Échéances"],
        writes=["Rendez-vous fixés"],
        version=1,
        zone="encadree",
        count=_crm,
        count_label="alertes remontées",
    ),
    Connector(
        id="sirh",
        name="SIRH groupe",
        role="Source du profil : date d'embauche, poste, souhaits d'évolution (champs dédiés).",
        reads=["Dates d'embauche", "Postes", "Souhaits d'évolution"],
        writes=["Corrections demandées par le collaborateur, après validation RH"],
        version=2,
        zone="encadree",
        count=_sirh,
        count_label="informations lues",
    ),
    Connector(
        id="talentlink",
        name="Talentlink (ATS)",
        role="Outil de référence du recrutement : les CV déposés ici y sont renvoyés.",
        reads=["Candidatures", "Offres"],
        writes=["CV déposés dans Trajectoires"],
        version=2,
        zone="fermee",
        count=_talentlink,
        count_label="candidatures",
    ),
    Connector(
        id="formation",
        name="Plateforme de formation",
        role="Formations suivies, pour compléter le profil.",
        reads=["Formations suivies"],
        writes=["Aucune donnée"],
        version=2,
        zone="encadree",
    ),
]


def get_connector(connector_id: str) -> Connector | None:
    return next((c for c in CONNECTORS if c.id == connector_id), None)
