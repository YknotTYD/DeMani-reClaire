from dataclasses import dataclass, field
from typing import Callable

from sqlalchemy.orm import Session


@dataclass(frozen=True)
class Connector:
    id: str
    name: str
    role: str                  # ce que le système apporte à Trajectoires
    reads: list[str]           # données lues dans le système
    writes: list[str]          # ce que Trajectoires lui renvoie
    version: int               # version du déploiement (figure 16) : 1 exploiter, 2 connecter, 3 étendre
    zone: str                  # zone de données (figure 17)
    count: Callable[[Session], int] | None = None  # None : connecteur prévu, pas encore branché
    count_label: str = ""
    extra: dict = field(default_factory=dict)
