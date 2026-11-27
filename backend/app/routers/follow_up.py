"""Suivi côté RH : rappels « n'oublier personne » et demandes faites par les collaborateurs."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_rh
from app.models.contact_request import ContactRequest
from app.models.user import User
from app.schemas.follow_up import ContactRequestOut, ContactRequestUpdate, RemindersOut
from app.services.reminders import compute_reminders

router = APIRouter(tags=["suivi"], dependencies=[Depends(require_rh)])


def request_out(db: Session, r: ContactRequest) -> ContactRequestOut:
    return ContactRequestOut(
        id=r.id,
        member_id=r.member_id,
        member_name=db.get(User, r.member_id).name,
        kind=r.kind,
        message=r.message,
        created_at=r.created_at,
        status=r.status,
    )


@router.get("/reminders", response_model=RemindersOut)
def reminders(db: Session = Depends(get_db)):
    return compute_reminders(db)


@router.get("/contact-requests", response_model=list[ContactRequestOut])
def list_requests(db: Session = Depends(get_db)):
    requests = db.scalars(select(ContactRequest).order_by(ContactRequest.status, ContactRequest.created_at.desc()))
    return [request_out(db, r) for r in requests]


@router.patch("/contact-requests/{request_id}", response_model=ContactRequestOut)
def update_request(request_id: int, data: ContactRequestUpdate, db: Session = Depends(get_db)):
    r = db.get(ContactRequest, request_id)
    if r is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Demande introuvable")
    r.status = data.status
    db.commit()
    return request_out(db, r)
