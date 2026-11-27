from datetime import datetime

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ConnectorSync(Base):
    """Dernière synchronisation de chaque système de la banque relié à Trajectoires."""

    __tablename__ = "connector_syncs"

    connector_id: Mapped[str] = mapped_column(String(30), primary_key=True)
    last_sync_at: Mapped[datetime]
    items: Mapped[int] = mapped_column(default=0)
