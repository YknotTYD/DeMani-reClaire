from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.appointment import AppointmentCategory, AppointmentStatus

# ---------- Documents des membres ----------


class MemberDocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    member_id: int
    appointment_id: int | None
    filename: str
    original_name: str
    uploaded_at: datetime


# ---------- Rendez-vous ----------


class AppointmentIn(BaseModel):
    """Rendez-vous avec un candidat OU un membre (un seul des deux)."""

    candidate_id: int | None = None
    member_id: int | None = None
    starts_at: datetime
    duration_minutes: int = Field(default=60, ge=5, le=480)
    location: str = Field(default="", max_length=255)
    note: str = Field(default="", max_length=5000)
    category: AppointmentCategory = AppointmentCategory.SUIVI

    @model_validator(mode="after")
    def one_participant(self):
        if (self.candidate_id is None) == (self.member_id is None):
            raise ValueError("Choisis un candidat ou un membre (un seul)")
        return self


class AppointmentOut(BaseModel):
    id: int
    kind: Literal["candidat", "membre"]
    candidate_id: int | None
    member_id: int | None
    person_name: str
    position_name: str | None  # pour un candidat
    starts_at: datetime
    duration_minutes: int
    location: str
    note: str
    status: AppointmentStatus
    category: AppointmentCategory
    documents: list[MemberDocumentOut]  # PDF joints par le membre


class RespondIn(BaseModel):
    accept: bool


# ---------- Agenda du membre ----------


class BusyPeriod(BaseModel):
    """Ce que le RH voit de l'agenda d'un membre : un créneau occupé, sans détail."""

    starts_at: datetime
    ends_at: datetime


class BusySlotIn(BaseModel):
    starts_at: datetime
    ends_at: datetime
    label: str = Field(default="", max_length=120)

    @model_validator(mode="after")
    def ends_after_start(self):
        if self.ends_at <= self.starts_at:
            raise ValueError("La fin doit être après le début")
        return self


class BusySlotOut(BusySlotIn):
    model_config = ConfigDict(from_attributes=True)

    id: int
