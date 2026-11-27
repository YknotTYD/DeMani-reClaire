"""Systèmes de la banque reliés à Trajectoires (rapport, section 5.6)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.connectors import CONNECTORS, get_connector
from app.core.database import get_db
from app.core.deps import require_rh
from app.schemas.connector import ConnectorOut
from app.services.connectors import connector_out, sync

router = APIRouter(prefix="/connectors", tags=["connecteurs"], dependencies=[Depends(require_rh)])


@router.get("", response_model=list[ConnectorOut])
def list_connectors(db: Session = Depends(get_db)):
    return [connector_out(db, c) for c in CONNECTORS]


@router.post("/{connector_id}/sync", response_model=ConnectorOut)
def sync_connector(connector_id: str, db: Session = Depends(get_db)):
    connector = get_connector(connector_id)
    if connector is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Connecteur inconnu")
    if connector.count is None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Ce connecteur n'est pas encore branché")
    sync(db, connector)
    return connector_out(db, connector)
