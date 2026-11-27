from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.criterion import AnswerType, Axis


class CriterionIn(BaseModel):
    axis: Axis
    label: str = Field(min_length=1, max_length=120)
    # Pour les colonnes seulement :
    answer_type: AnswerType = AnswerType.STARS
    options: list[str] = Field(default_factory=list, description="Choix possibles (type « choix »)")
    min_value: float | None = None
    max_value: float | None = None
    required: bool = True

    @model_validator(mode="after")
    def check_type(self):
        self.options = [o.strip() for o in self.options if o.strip()]
        if self.axis == Axis.COLUMN and self.answer_type == AnswerType.CHOICE and len(self.options) < 2:
            raise ValueError("Un choix dans une liste demande au moins deux options")
        if self.min_value is not None and self.max_value is not None and self.min_value >= self.max_value:
            raise ValueError("Le minimum doit être inférieur au maximum")
        return self


class CriterionUpdate(BaseModel):
    """Le type de réponse ne change pas après coup (les réponses déjà données deviendraient incohérentes)."""

    label: str = Field(min_length=1, max_length=120)
    required: bool | None = None


class CriterionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    model_id: int
    axis: Axis
    label: str
    position: int
    answer_type: AnswerType
    options: list[str] = Field(validation_alias="option_list")
    min_value: float | None
    max_value: float | None
    required: bool
