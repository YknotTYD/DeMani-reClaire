import enum

from sqlalchemy import Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class RelationKind(str, enum.Enum):
    """Lien de travail factuel, sans note ni jugement sur la relation."""

    TUTEUR = "tuteur"          # A est tuteur de B
    PARRAIN = "parrain"        # A est parrain / marraine de B
    BINOME = "binome"          # A et B travaillent en binôme
    REMPLACANT = "remplacant"  # A et B se remplacent pendant les absences


DIRECTED = {RelationKind.TUTEUR, RelationKind.PARRAIN}


class Relation(Base):
    """Lien de travail entre deux membres. Pour tuteur et parrain, member_a accompagne member_b."""

    __tablename__ = "relations"
    __table_args__ = (UniqueConstraint("member_a_id", "member_b_id", "kind"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    member_a_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    member_b_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    kind: Mapped[RelationKind] = mapped_column(Enum(RelationKind))
