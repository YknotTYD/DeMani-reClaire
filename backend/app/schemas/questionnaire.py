from pydantic import BaseModel, ConfigDict, Field

from app.schemas.criterion import CriterionOut

# ---------- Modèles ----------


class ModelIn(BaseModel):
    name: str = Field(min_length=1, max_length=120, examples=["Ambiance"])


class ModelOut(BaseModel):
    id: int
    name: str
    criteria: list[CriterionOut]
    questionnaire_count: int


# ---------- Questionnaires (un modèle, un trimestre, des équipes) ----------


class QuestionnaireIn(BaseModel):
    model_id: int
    year: int = Field(ge=2000, le=2100)
    quarter: int = Field(ge=1, le=4)
    team_ids: list[int] = Field(min_length=1)


class TeamRef(BaseModel):
    id: int
    name: str


class QuestionnaireOut(BaseModel):
    id: int
    model_id: int
    model_name: str
    year: int
    quarter: int
    label: str  # « Oct – Déc 2026 »
    teams: list[TeamRef]
    targeted_count: int
    answered_count: int
    overall_average: float | None
    masked: bool


class MyQuestionnaireOut(BaseModel):
    """Vue membre."""

    id: int
    model_id: int
    model_name: str
    year: int
    quarter: int
    label: str
    answered: bool
    shared: bool


class FormOut(BaseModel):
    """Tableau à remplir pour un questionnaire."""

    questionnaire_id: int
    model_name: str
    label: str
    criteria: list[CriterionOut]


# ---------- Réponses ----------


# Une réponse : nombre (étoiles, nombre), booléen (oui/non) ou texte (choix, texte libre)
AnswerValue = bool | float | str


class AnswerIn(BaseModel):
    row_id: int
    column_id: int
    value: AnswerValue | None = None


class AnswerOut(BaseModel):
    row_id: int
    column_id: int
    value: AnswerValue


class SubmissionIn(BaseModel):
    answers: list[AnswerIn]
    wants_evolution: bool  # « Souhaitez-vous évoluer dans votre poste ou votre carrière ? »


class SubmissionOut(BaseModel):
    answers: list[AnswerOut]
    wants_evolution: bool | None  # None = pas encore envoyé
    shared: bool = False  # le membre a choisi de partager ses réponses avec le RH


class ShareIn(BaseModel):
    shared: bool


class AnsweredQuestionnaire(BaseModel):
    """Questionnaire auquel un membre a répondu (pour son rapport)."""

    questionnaire_id: int
    model_id: int
    model_name: str
    label: str
    year: int
    quarter: int
    shared: bool


# ---------- Statistiques ----------


class CellAverage(BaseModel):
    """Moyenne d'une case en étoiles (sert aux courbes d'évolution)."""

    row_id: int
    column_id: int
    average: float
    count: int


class CellStat(BaseModel):
    """Résultat d'une case, selon le type de réponse de sa colonne."""

    row_id: int
    column_id: int
    count: int
    average: float | None = None            # étoiles, nombre
    yes_percent: float | None = None        # oui / non
    choices: dict[str, int] | None = None   # choix : nombre de réponses par option
    texts: list[str] | None = None          # texte libre, sans le nom de l'auteur


class Respondent(BaseModel):
    member_id: int
    name: str
    answered: bool


class QuestionnaireStats(BaseModel):
    """Moyennes d'un questionnaire : l'état général de l'ambiance."""

    questionnaire: QuestionnaireOut
    criteria: list[CriterionOut]
    cells: list[CellStat]
    overall_average: float | None  # moyenne des colonnes en étoiles
    masked: bool  # moins de MIN_GROUP_SIZE répondants : résultats masqués
    min_group: int
    evolution_yes: int  # nombre de « Oui » à la question d'évolution
    respondents: list[Respondent]


class EvolutionPoint(BaseModel):
    questionnaire_id: int
    label: str
    year: int
    quarter: int
    overall_average: float | None
    cells: list[CellAverage]
    masked: bool = False


class ModelEvolution(BaseModel):
    """Évolution d'un modèle au fil des trimestres (moyenne de tous, ou d'un seul membre)."""

    model_id: int
    model_name: str
    criteria: list[CriterionOut]
    points: list[EvolutionPoint]
