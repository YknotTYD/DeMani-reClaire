from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app import models  # noqa: F401  (enregistre les tables)
from app.core.config import FRONTEND_ORIGIN, RH_EMAIL, RH_NAME, RH_PASSWORD
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.services.connectors import sync_all
from app.services.retention import purge_expired
from app.models.user import Role, User
from app.routers import (
    absences,
    appointments,
    auth,
    candidates,
    connectors,
    criteria,
    critical_alerts,
    documents,
    evolutions,
    follow_up,
    me,
    member_agenda,
    members,
    positions,
    questionnaire_models,
    questionnaires,
    relations,
    teams,
)


def create_rh_account():
    with SessionLocal() as db:
        if db.scalar(select(User).where(User.role == Role.RH)) is None:
            db.add(User(name=RH_NAME, email=RH_EMAIL, password_hash=hash_password(RH_PASSWORD), role=Role.RH))
            db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)
    create_rh_account()
    with SessionLocal() as db:
        purge_expired(db)  # conservation des candidats : appliquée à chaque démarrage
        sync_all(db)  # relit les systèmes reliés (SIRH, CRM RH, Talentlink, Teams)
    yield


app = FastAPI(title="Trajectoires", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (
    auth.router,
    members.router,
    teams.router,
    relations.router,
    criteria.router,
    questionnaire_models.router,
    questionnaires.router,
    critical_alerts.router,
    evolutions.router,
    positions.router,
    candidates.router,
    documents.router,
    appointments.router,
    member_agenda.router,
    me.router,
    follow_up.router,
    connectors.router,
    absences.router,
):
    app.include_router(router)
