from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_rh
from app.models.team import Team
from app.routers.members import get_member_or_404
from app.schemas.team import TeamIn, TeamMemberIn, TeamOut

router = APIRouter(prefix="/teams", tags=["équipes"], dependencies=[Depends(require_rh)])


def get_team_or_404(db: Session, team_id: int) -> Team:
    team = db.get(Team, team_id)
    if team is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Équipe introuvable")
    return team


def commit_or_409(db: Session, message: str):
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, message)


@router.get("", response_model=list[TeamOut])
def list_teams(db: Session = Depends(get_db)):
    return db.scalars(select(Team).order_by(Team.name)).all()


@router.get("/{team_id}", response_model=TeamOut)
def get_team(team_id: int, db: Session = Depends(get_db)):
    return get_team_or_404(db, team_id)


@router.post("", response_model=TeamOut, status_code=status.HTTP_201_CREATED)
def create_team(data: TeamIn, db: Session = Depends(get_db)):
    team = Team(name=data.name)
    db.add(team)
    commit_or_409(db, "Une équipe porte déjà ce nom")
    return team


@router.patch("/{team_id}", response_model=TeamOut)
def rename_team(team_id: int, data: TeamIn, db: Session = Depends(get_db)):
    team = get_team_or_404(db, team_id)
    team.name = data.name
    commit_or_409(db, "Une équipe porte déjà ce nom")
    return team


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(team_id: int, db: Session = Depends(get_db)):
    db.delete(get_team_or_404(db, team_id))
    db.commit()


@router.post("/{team_id}/members", response_model=TeamOut)
def add_member(team_id: int, data: TeamMemberIn, db: Session = Depends(get_db)):
    team = get_team_or_404(db, team_id)
    member = get_member_or_404(db, data.user_id)
    if member not in team.members:
        team.members.append(member)
        db.commit()
    return team


@router.delete("/{team_id}/members/{user_id}", response_model=TeamOut)
def remove_member(team_id: int, user_id: int, db: Session = Depends(get_db)):
    team = get_team_or_404(db, team_id)
    team.members = [m for m in team.members if m.id != user_id]
    db.commit()
    return team
