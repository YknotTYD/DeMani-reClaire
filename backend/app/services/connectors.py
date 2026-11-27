from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.connectors import CONNECTORS
from app.connectors.base import Connector
from app.core.config import CONNECTORS_MODE
from app.models.connector_sync import ConnectorSync
from app.schemas.connector import ConnectorOut


def sync(db: Session, connector: Connector) -> ConnectorSync | None:
    """Synchronise un connecteur branché. En démonstration : relit la base locale et date la synchronisation."""
    if connector.count is None:
        return None
    row = db.get(ConnectorSync, connector.id) or ConnectorSync(connector_id=connector.id, last_sync_at=datetime.now(timezone.utc))
    row.items = connector.count(db)
    row.last_sync_at = datetime.now(timezone.utc)
    db.add(row)
    db.commit()
    return row


def sync_all(db: Session) -> None:
    for connector in CONNECTORS:
        sync(db, connector)


def connector_out(db: Session, connector: Connector) -> ConnectorOut:
    row = db.get(ConnectorSync, connector.id)
    return ConnectorOut(
        id=connector.id,
        name=connector.name,
        role=connector.role,
        reads=connector.reads,
        writes=connector.writes,
        version=connector.version,
        zone=connector.zone,
        status="prevu" if connector.count is None else "connecte",
        mode=CONNECTORS_MODE,
        last_sync_at=row.last_sync_at if row else None,
        items=row.items if row else None,
        count_label=connector.count_label,
    )
