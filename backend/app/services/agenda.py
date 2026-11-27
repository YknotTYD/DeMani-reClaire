"""Agenda : créneaux occupés d'un membre, conflits, mise en forme des rendez-vous."""

from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.absence import Absence, AbsenceStatus
from app.models.appointment import Appointment, AppointmentStatus
from app.models.busy_slot import BusySlot
from app.models.candidate import Candidate
from app.models.member_document import MemberDocument
from app.models.position import Position
from app.models.user import User
from app.schemas.agenda import AppointmentOut, BusyPeriod
from app.services.absences import period as absence_period

MAX_DURATION = timedelta(minutes=480)


def appointment_end(appointment: Appointment) -> datetime:
    return appointment.starts_at + timedelta(minutes=appointment.duration_minutes)


def busy_periods(
    db: Session, member_id: int, start: datetime, end: datetime, exclude_appointment_id: int | None = None
) -> list[BusyPeriod]:
    """Créneaux occupés du membre entre start et end : ses indisponibilités + ses rendez-vous non refusés."""
    periods = [
        BusyPeriod(starts_at=s.starts_at, ends_at=s.ends_at)
        for s in db.scalars(
            select(BusySlot).where(BusySlot.member_id == member_id, BusySlot.starts_at < end, BusySlot.ends_at > start)
        )
    ]
    appointments = db.scalars(
        select(Appointment).where(
            Appointment.member_id == member_id,
            Appointment.status != AppointmentStatus.REFUSE,
            Appointment.starts_at < end,
            Appointment.starts_at > start - MAX_DURATION,
        )
    )
    for a in appointments:
        if a.id != exclude_appointment_id and appointment_end(a) > start:
            periods.append(BusyPeriod(starts_at=a.starts_at, ends_at=appointment_end(a)))
    # Une absence en attente ou validée rend le membre indisponible
    for absence in db.scalars(
        select(Absence).where(
            Absence.member_id == member_id,
            Absence.status != AbsenceStatus.REFUSEE,
            Absence.start_date <= end.date(),
            Absence.end_date >= start.date(),
        )
    ):
        absence_start, absence_end = absence_period(absence)
        if absence_start < end.replace(tzinfo=None) and absence_end > start.replace(tzinfo=None):
            periods.append(BusyPeriod(starts_at=absence_start, ends_at=absence_end))
    return sorted(periods, key=lambda p: p.starts_at.replace(tzinfo=None))


def has_conflict(db: Session, member_id: int, start: datetime, end: datetime, exclude_appointment_id: int | None = None) -> bool:
    return bool(busy_periods(db, member_id, start, end, exclude_appointment_id))


def appointment_out(db: Session, appointment: Appointment) -> AppointmentOut:
    if appointment.candidate_id is not None:
        candidate = db.get(Candidate, appointment.candidate_id)
        kind, person_name = "candidat", candidate.name
        position_name = db.get(Position, candidate.position_id).name
        documents = []
    else:
        kind, person_name = "membre", db.get(User, appointment.member_id).name
        position_name = None
        documents = db.scalars(select(MemberDocument).where(MemberDocument.appointment_id == appointment.id)).all()

    return AppointmentOut(
        id=appointment.id,
        kind=kind,
        candidate_id=appointment.candidate_id,
        member_id=appointment.member_id,
        person_name=person_name,
        position_name=position_name,
        starts_at=appointment.starts_at,
        duration_minutes=appointment.duration_minutes,
        location=appointment.location,
        note=appointment.note,
        status=appointment.status,
        category=appointment.category,
        documents=documents,
    )
