from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.models.contact_request import RequestKind, RequestStatus
from app.models.evolution import EvolutionStatus
from app.models.relation import RelationKind

# ---------- Signaux (baisse de ses propres réponses, vue par le collaborateur seul) ----------


class SignalOut(BaseModel):
    id: int
    period: str
    details: list[str]
    created_at: datetime
    seen: bool


class SeenIn(BaseModel):
    seen: bool


# ---------- Demandes du collaborateur ----------


class ContactRequestIn(BaseModel):
    kind: RequestKind
    message: str = Field(default="", max_length=2000)


class ContactRequestOut(BaseModel):
    id: int
    member_id: int
    member_name: str
    kind: RequestKind
    message: str
    created_at: datetime
    status: RequestStatus


class ContactRequestUpdate(BaseModel):
    status: RequestStatus


# ---------- Profil du collaborateur ----------


class ProfileLink(BaseModel):
    kind: RelationKind
    label: str  # ex. « Tuteur de Manon Schmitt », « Binôme avec Julien Becker »


class ProfileEvolution(BaseModel):
    period: str
    status: EvolutionStatus
    created_at: datetime


class AccessLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    viewer_name: str
    action: str
    at: datetime


class ProfileOut(BaseModel):
    id: int
    name: str
    email: str
    hired_on: date | None
    teams: list[str]
    links: list[ProfileLink]
    evolutions: list[ProfileEvolution]
    requests: list[ContactRequestOut]
    access_log: list[AccessLogOut]


# ---------- « N'oublier personne » ----------


class Reminder(BaseModel):
    member_id: int
    member_name: str
    kind: Literal["sans_contact", "parcours", "integration"]
    label: str
    due_date: date | None
    overdue: bool


class ContactIndicator(BaseModel):
    """Part des collaborateurs ayant eu un échange dans les 12 derniers mois (tableau 23 du rapport)."""

    contacted: int
    total: int
    percent: int


class RemindersOut(BaseModel):
    reminders: list[Reminder]
    indicator: ContactIndicator
