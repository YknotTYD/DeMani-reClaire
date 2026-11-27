from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_rh
from app.models.relation import DIRECTED, Relation
from app.routers.members import get_member_or_404
from app.routers.teams import get_team_or_404
from app.schemas.relation import RelationIn, RelationOut

router = APIRouter(prefix="/relations", tags=["relations"], dependencies=[Depends(require_rh)])


@router.get("", response_model=list[RelationOut])
def list_relations(
    team_id: int | None = Query(None, description="Relations entre membres de cette équipe"),
    member_id: int | None = Query(None, description="Toutes les relations de ce membre"),
    db: Session = Depends(get_db),
):
    query = select(Relation)
    if team_id is not None:
        ids = [m.id for m in get_team_or_404(db, team_id).members]
        query = query.where(Relation.member_a_id.in_(ids), Relation.member_b_id.in_(ids))
    if member_id is not None:
        query = query.where(or_(Relation.member_a_id == member_id, Relation.member_b_id == member_id))
    return db.scalars(query).all()


@router.put("", response_model=RelationOut)
def upsert_relation(data: RelationIn, db: Session = Depends(get_db)):
    """Enregistre un lien de travail (tuteur, parrain, binôme, remplaçant). Aucune note sur la relation."""
    if data.member_a_id == data.member_b_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Un membre ne peut pas être lié à lui-même")
    get_member_or_404(db, data.member_a_id)
    get_member_or_404(db, data.member_b_id)

    a, b = data.member_a_id, data.member_b_id
    if data.kind not in DIRECTED:
        a, b = sorted((a, b))  # binôme et remplaçant : le sens n'a pas d'importance
    relation = db.scalar(
        select(Relation).where(Relation.member_a_id == a, Relation.member_b_id == b, Relation.kind == data.kind)
    )
    if relation is None:
        relation = Relation(member_a_id=a, member_b_id=b, kind=data.kind)
        db.add(relation)
        db.commit()
    return relation


@router.delete("/{relation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_relation(relation_id: int, db: Session = Depends(get_db)):
    relation = db.get(Relation, relation_id)
    if relation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Relation introuvable")
    db.delete(relation)
    db.commit()
