from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import UserOut


class TeamIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class TeamOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    members: list[UserOut]


class TeamMemberIn(BaseModel):
    user_id: int
