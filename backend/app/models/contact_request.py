import enum
from datetime import datetime, timezone

from sqlalchemy import Enum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class RequestKind(str, enum.Enum):
    ECHANGE = "echange"        # le collaborateur demande à échanger avec son gestionnaire
    CORRECTION = "correction"  # le collaborateur demande la correction de son profil


class RequestStatus(str, enum.Enum):
    NOUVELLE = "nouvelle"
    TRAITEE = "traitee"


class ContactRequest(Base):
    """Demande faite par le collaborateur lui-même : c'est lui qui décide de solliciter le RH."""

    __tablename__ = "contact_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    member_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    kind: Mapped[RequestKind] = mapped_column(Enum(RequestKind))
    message: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
    status: Mapped[RequestStatus] = mapped_column(Enum(RequestStatus), default=RequestStatus.NOUVELLE)
