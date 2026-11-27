from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_rh
from app.models.appointment import Appointment, AppointmentCategory, AppointmentStatus
from app.models.candidate import Candidate
from app.services.retention import touch_candidate
from app.routers.candidates import get_candidate_or_404
from app.routers.members import get_member_or_404
from app.schemas.agenda import AppointmentIn, AppointmentOut
from app.services.agenda import appointment_out, has_conflict

router = APIRouter(prefix="/appointments", tags=["rendez-vous"], dependencies=[Depends(require_rh)])


def get_appointment_or_404(db: Session, appointment_id: int) -> Appointment:
    appointment = db.get(Appointment, appointment_id)
    if appointment is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Rendez-vous introuvable")
    return appointment


def check_participant(db: Session, data: AppointmentIn, exclude_appointment_id: int | None = None):
    if data.candidate_id is not None:
        get_candidate_or_404(db, data.candidate_id)
        return
    get_member_or_404(db, data.member_id)
    end = data.starts_at + timedelta(minutes=data.duration_minutes)
    if has_conflict(db, data.member_id, data.starts_at, end, exclude_appointment_id):
        raise HTTPException(status.HTTP_409_CONFLICT, "Le membre est déjà occupé sur ce créneau")


@router.get("", response_model=list[AppointmentOut])
def list_appointments(
    start: datetime | None = Query(None, description="Début de la période affichée"),
    end: datetime | None = Query(None, description="Fin de la période affichée (exclue)"),
    candidate_id: int | None = Query(None),
    member_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    query = select(Appointment).order_by(Appointment.starts_at)
    if start is not None:
        query = query.where(Appointment.starts_at >= start)
    if end is not None:
        query = query.where(Appointment.starts_at < end)
    if candidate_id is not None:
        query = query.where(Appointment.candidate_id == candidate_id)
    if member_id is not None:
        query = query.where(Appointment.member_id == member_id)
    return [appointment_out(db, a) for a in db.scalars(query)]


@router.post("", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def create_appointment(data: AppointmentIn, db: Session = Depends(get_db)):
    """Avec un membre : le rendez-vous est proposé, le membre doit l'accepter."""
    check_participant(db, data)
    appointment = Appointment(
        **data.model_dump(),
        status=AppointmentStatus.PROPOSE if data.member_id else AppointmentStatus.ACCEPTE,
    )
    if data.candidate_id:
        appointment.category = AppointmentCategory.RECRUTEMENT
        touch_candidate(db.get(Candidate, data.candidate_id))
    db.add(appointment)
    db.commit()
    return appointment_out(db, appointment)


@router.put("/{appointment_id}", response_model=AppointmentOut)
def update_appointment(appointment_id: int, data: AppointmentIn, db: Session = Depends(get_db)):
    appointment = get_appointment_or_404(db, appointment_id)
    check_participant(db, data, exclude_appointment_id=appointment.id)
    moved = (data.starts_at, data.duration_minutes, data.member_id) != (
        appointment.starts_at,
        appointment.duration_minutes,
        appointment.member_id,
    )
    for field, value in data.model_dump().items():
        setattr(appointment, field, value)
    if data.member_id and moved:
        appointment.status = AppointmentStatus.PROPOSE  # nouvel horaire : le membre doit de nouveau accepter
    if data.candidate_id:
        appointment.status = AppointmentStatus.ACCEPTE
        appointment.category = AppointmentCategory.RECRUTEMENT
    db.commit()
    return appointment_out(db, appointment)


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    db.delete(get_appointment_or_404(db, appointment_id))
    db.commit()
