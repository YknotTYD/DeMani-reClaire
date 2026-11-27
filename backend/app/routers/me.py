"""Espace du membre connecté : son profil, ses signaux, ses demandes, ses rendez-vous, ses indisponibilités, ses documents."""

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_membre
from app.models.appointment import Appointment, AppointmentStatus
from app.models.busy_slot import BusySlot
from app.models.access_log import AccessLog
from app.models.contact_request import ContactRequest
from app.models.critical_alert import CriticalAlert
from app.models.evolution import EvolutionRequest
from app.models.member_document import MemberDocument
from app.models.questionnaire import Questionnaire
from app.models.relation import Relation, RelationKind
from app.models.team import Team, team_members
from app.models.user import User
from app.routers.questionnaire_models import get_model_or_404
from app.schemas.agenda import AppointmentOut, BusySlotIn, BusySlotOut, MemberDocumentOut, RespondIn
from app.schemas.follow_up import (
    ContactRequestIn,
    ContactRequestOut,
    ProfileEvolution,
    ProfileLink,
    ProfileOut,
    SeenIn,
    SignalOut,
)
from app.schemas.questionnaire import ModelEvolution
from app.services.questionnaire_stats import model_evolution
from app.services.quarters import questionnaire_title
from app.services import file_storage
from app.services.agenda import appointment_end, appointment_out
from app.services.member_files import document_path, get_member_document_or_404, save_member_pdf

router = APIRouter(prefix="/me", tags=["espace membre"])


def own_appointment_or_404(db: Session, appointment_id: int, user: User) -> Appointment:
    appointment = db.get(Appointment, appointment_id)
    if appointment is None or appointment.member_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Rendez-vous introuvable")
    return appointment


# ---------- Rendez-vous ----------


@router.get("/appointments", response_model=list[AppointmentOut])
def my_appointments(db: Session = Depends(get_db), user: User = Depends(require_membre)):
    """Rendez-vous à venir (et ceux en cours)."""
    now = datetime.now() - timedelta(hours=8)
    appointments = db.scalars(
        select(Appointment)
        .where(Appointment.member_id == user.id, Appointment.starts_at >= now)
        .order_by(Appointment.starts_at)
    )
    return [appointment_out(db, a) for a in appointments if appointment_end(a) >= datetime.now()]


@router.post("/appointments/{appointment_id}/respond", response_model=AppointmentOut)
def respond(appointment_id: int, data: RespondIn, db: Session = Depends(get_db), user: User = Depends(require_membre)):
    appointment = own_appointment_or_404(db, appointment_id, user)
    appointment.status = AppointmentStatus.ACCEPTE if data.accept else AppointmentStatus.REFUSE
    db.commit()
    return appointment_out(db, appointment)


# ---------- Indisponibilités ----------


@router.get("/busy-slots", response_model=list[BusySlotOut])
def my_busy_slots(db: Session = Depends(get_db), user: User = Depends(require_membre)):
    return db.scalars(
        select(BusySlot)
        .where(BusySlot.member_id == user.id, BusySlot.ends_at >= datetime.now())
        .order_by(BusySlot.starts_at)
    ).all()


@router.post("/busy-slots", response_model=BusySlotOut, status_code=status.HTTP_201_CREATED)
def add_busy_slot(data: BusySlotIn, db: Session = Depends(get_db), user: User = Depends(require_membre)):
    slot = BusySlot(member_id=user.id, **data.model_dump())
    db.add(slot)
    db.commit()
    return slot


@router.delete("/busy-slots/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_busy_slot(slot_id: int, db: Session = Depends(get_db), user: User = Depends(require_membre)):
    slot = db.get(BusySlot, slot_id)
    if slot is None or slot.member_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Indisponibilité introuvable")
    db.delete(slot)
    db.commit()


# ---------- Documents ----------


@router.get("/documents", response_model=list[MemberDocumentOut])
def my_documents(db: Session = Depends(get_db), user: User = Depends(require_membre)):
    return db.scalars(
        select(MemberDocument).where(MemberDocument.member_id == user.id).order_by(MemberDocument.uploaded_at.desc())
    ).all()


@router.post("/documents", response_model=MemberDocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    appointment_id: int | None = Form(None),
    db: Session = Depends(get_db),
    user: User = Depends(require_membre),
):
    """Dépose un PDF, éventuellement rattaché à l'un de ses rendez-vous."""
    if appointment_id is not None:
        own_appointment_or_404(db, appointment_id, user)
    return await save_member_pdf(db, user.id, file, appointment_id)


@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: int, db: Session = Depends(get_db), user: User = Depends(require_membre)):
    document = get_member_document_or_404(db, document_id)
    if document.member_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document introuvable")
    file_storage.delete_path(document_path(document))
    db.delete(document)
    db.commit()


# ---------- Profil (rapport, annexe C : le collaborateur voit tout son profil) ----------

LINK_LABELS = {
    RelationKind.TUTEUR: ("Tuteur de {other}", "Accompagné(e) par {other} (tuteur)"),
    RelationKind.PARRAIN: ("Parrain / marraine de {other}", "Parrainé(e) par {other}"),
    RelationKind.BINOME: ("En binôme avec {other}", "En binôme avec {other}"),
    RelationKind.REMPLACANT: ("Remplaçant(e) mutuel(le) de {other}", "Remplaçant(e) mutuel(le) de {other}"),
}


def _request_out(r: ContactRequest, user: User) -> ContactRequestOut:
    return ContactRequestOut(
        id=r.id, member_id=r.member_id, member_name=user.name, kind=r.kind, message=r.message, created_at=r.created_at, status=r.status
    )


@router.get("/profile", response_model=ProfileOut)
def my_profile(db: Session = Depends(get_db), user: User = Depends(require_membre)):
    teams = db.scalars(
        select(Team.name).join(team_members, team_members.c.team_id == Team.id).where(team_members.c.user_id == user.id)
    ).all()

    links = []
    relations = db.scalars(select(Relation).where((Relation.member_a_id == user.id) | (Relation.member_b_id == user.id)))
    for r in relations:
        is_a = r.member_a_id == user.id
        other = db.get(User, r.member_b_id if is_a else r.member_a_id).name
        label = LINK_LABELS[r.kind][0 if is_a else 1].format(other=other)
        links.append(ProfileLink(kind=r.kind, label=label))

    evolutions = [
        ProfileEvolution(period=questionnaire_title(db, db.get(Questionnaire, e.questionnaire_id)), status=e.status, created_at=e.created_at)
        for e in db.scalars(select(EvolutionRequest).where(EvolutionRequest.member_id == user.id).order_by(EvolutionRequest.created_at.desc()))
    ]
    requests = [
        _request_out(r, user)
        for r in db.scalars(select(ContactRequest).where(ContactRequest.member_id == user.id).order_by(ContactRequest.created_at.desc()))
    ]
    log = db.scalars(select(AccessLog).where(AccessLog.member_id == user.id).order_by(AccessLog.at.desc()).limit(100)).all()

    return ProfileOut(
        id=user.id,
        name=user.name,
        email=user.email,
        hired_on=user.hired_on,
        teams=list(teams),
        links=links,
        evolutions=evolutions,
        requests=requests,
        access_log=log,
    )


# ---------- Signaux : baisse de ses propres réponses, vue par lui seul ----------


@router.get("/signals", response_model=list[SignalOut])
def my_signals(db: Session = Depends(get_db), user: User = Depends(require_membre)):
    alerts = db.scalars(
        select(CriticalAlert).where(CriticalAlert.member_id == user.id).order_by(CriticalAlert.seen, CriticalAlert.created_at.desc())
    )
    return [
        SignalOut(
            id=a.id,
            period=questionnaire_title(db, db.get(Questionnaire, a.questionnaire_id)),
            details=a.details.split("\n"),
            created_at=a.created_at,
            seen=a.seen,
        )
        for a in alerts
    ]


@router.patch("/signals/{signal_id}", response_model=list[SignalOut])
def mark_signal(signal_id: int, data: SeenIn, db: Session = Depends(get_db), user: User = Depends(require_membre)):
    alert = db.get(CriticalAlert, signal_id)
    if alert is None or alert.member_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Signal introuvable")
    alert.seen = data.seen
    db.commit()
    return my_signals(db, user)


# ---------- Demandes : échange ou correction du profil ----------


@router.post("/contact-requests", response_model=ContactRequestOut, status_code=status.HTTP_201_CREATED)
def create_request(data: ContactRequestIn, db: Session = Depends(get_db), user: User = Depends(require_membre)):
    request = ContactRequest(member_id=user.id, kind=data.kind, message=data.message.strip())
    db.add(request)
    db.commit()
    return _request_out(request, user)


# ---------- Ma propre évolution (toutes mes réponses, partagées ou non) ----------


@router.get("/evolution/{model_id}", response_model=ModelEvolution)
def my_evolution(model_id: int, db: Session = Depends(get_db), user: User = Depends(require_membre)):
    return model_evolution(db, get_model_or_404(db, model_id), user.id)
