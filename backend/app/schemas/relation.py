from pydantic import BaseModel, ConfigDict

from app.models.relation import RelationKind


class RelationIn(BaseModel):
    """Pour « tuteur » et « parrain », member_a accompagne member_b."""

    member_a_id: int
    member_b_id: int
    kind: RelationKind


class RelationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    member_a_id: int
    member_b_id: int
    kind: RelationKind
