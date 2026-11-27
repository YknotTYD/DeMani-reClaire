from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class ConnectorOut(BaseModel):
    id: str
    name: str
    role: str
    reads: list[str]
    writes: list[str]
    version: int
    zone: Literal["libre", "encadree", "fermee"]
    status: Literal["connecte", "prevu"]
    mode: str
    last_sync_at: datetime | None
    items: int | None
    count_label: str
