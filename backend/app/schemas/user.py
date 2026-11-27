from datetime import date

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import Role


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    role: Role
    hired_on: date | None = None


class MemberCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6)
    hired_on: date | None = None


class MemberUpdate(BaseModel):
    hired_on: date | None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    token: str
    user: UserOut
