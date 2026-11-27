from datetime import date, datetime

from pydantic import BaseModel

from app.models.absence import AbsenceKind, AbsenceStatus


class AbsenceDocumentOut(BaseModel):
    id: int
    filename: str


class AbsenceOut(BaseModel):
    id: int
    member_id: int
    member_name: str
    kind: AbsenceKind
    start_date: date
    start_afternoon: bool
    end_date: date
    end_morning: bool
    days: float  # jours ouvrés (lundi à vendredi), demi-journées comprises
    comment: str
    status: AbsenceStatus
    rh_comment: str
    created_at: datetime
    decided_at: datetime | None
    documents: list[AbsenceDocumentOut]


class AbsenceDecision(BaseModel):
    status: AbsenceStatus
    rh_comment: str = ""
