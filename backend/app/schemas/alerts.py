from datetime import datetime

from pydantic import BaseModel, Field

from app.models.evolution import EvolutionStatus


class CriticalAlertOut(BaseModel):
    id: int
    member_id: int
    member_name: str
    period: str
    details: list[str]
    created_at: datetime
    seen: bool


class CriticalAlertUpdate(BaseModel):
    seen: bool


class EvolutionOut(BaseModel):
    id: int
    member_id: int
    member_name: str
    period: str
    created_at: datetime
    status: EvolutionStatus
    note: str


class EvolutionUpdate(BaseModel):
    status: EvolutionStatus
    note: str = Field(default="", max_length=5000)


class AlertSummary(BaseModel):
    reminders: int        # rappels « n'oublier personne »
    requests: int         # demandes des collaborateurs non traitées
    evolution_to_discuss: int
