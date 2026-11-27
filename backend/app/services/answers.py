"""Validation et conversion des réponses selon le type de chaque colonne."""

from fastapi import HTTPException, status

from app.models.criterion import AnswerType, Axis, Criterion
from app.models.questionnaire import Answer
from app.schemas.questionnaire import AnswerIn, AnswerOut

MAX_TEXT = 2000


def _bad(message: str):
    raise HTTPException(status.HTTP_400_BAD_REQUEST, message)


def _is_empty(value) -> bool:
    return value is None or (isinstance(value, str) and not value.strip())


def _convert(column: Criterion, value) -> tuple[float | None, str | None]:
    """Renvoie (number, text) à enregistrer, ou lève une erreur si la valeur ne convient pas au type."""
    label = column.label
    match column.answer_type:
        case AnswerType.STARS:
            if isinstance(value, bool) or not isinstance(value, (int, float)) or value not in (1, 2, 3, 4, 5):
                _bad(f"« {label} » : une note de 1 à 5 étoiles est attendue")
            return float(value), None
        case AnswerType.NUMBER:
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                _bad(f"« {label} » : un nombre est attendu")
            if column.min_value is not None and value < column.min_value:
                _bad(f"« {label} » : {value} est inférieur au minimum ({column.min_value:g})")
            if column.max_value is not None and value > column.max_value:
                _bad(f"« {label} » : {value} est supérieur au maximum ({column.max_value:g})")
            return float(value), None
        case AnswerType.YES_NO:
            if not isinstance(value, bool):
                _bad(f"« {label} » : oui ou non est attendu")
            return (1.0 if value else 0.0), None
        case AnswerType.CHOICE:
            if value not in column.option_list:
                _bad(f"« {label} » : choix inconnu")
            return None, value
        case AnswerType.TEXT:
            if not isinstance(value, str) or len(value) > MAX_TEXT:
                _bad(f"« {label} » : texte de {MAX_TEXT} caractères au plus")
            return None, value.strip()
    raise AssertionError(column.answer_type)


def build_answers(criteria: list[Criterion], data: list[AnswerIn], questionnaire_id: int, member_id: int) -> list[Answer]:
    """Vérifie les réponses envoyées (cases existantes, types, colonnes obligatoires) et crée les lignes à enregistrer."""
    rows = {c.id: c for c in criteria if c.axis == Axis.ROW}
    columns = {c.id: c for c in criteria if c.axis == Axis.COLUMN}
    if not rows or not columns:
        _bad("Ce questionnaire n'a pas encore de tableau")

    received = {}
    for a in data:
        if a.row_id not in rows or a.column_id not in columns:
            _bad("Réponse à une case qui n'existe pas dans ce questionnaire")
        if (a.row_id, a.column_id) in received:
            _bad("Une case a reçu deux réponses")
        received[(a.row_id, a.column_id)] = a.value

    answers = []
    for row_id in rows:
        for column_id, column in columns.items():
            value = received.get((row_id, column_id))
            if _is_empty(value):
                if column.required:
                    _bad(f"« {rows[row_id].label} / {column.label} » est obligatoire")
                continue
            number, text = _convert(column, value)
            answers.append(
                Answer(
                    questionnaire_id=questionnaire_id,
                    member_id=member_id,
                    row_id=row_id,
                    column_id=column_id,
                    number=number,
                    text=text,
                )
            )
    return answers


def answer_out(answer: Answer, column: Criterion) -> AnswerOut:
    """Remet la réponse dans la forme attendue par le front (nombre, booléen ou texte)."""
    match column.answer_type:
        case AnswerType.STARS:
            value = int(answer.number)
        case AnswerType.YES_NO:
            value = answer.number == 1
        case AnswerType.NUMBER:
            value = int(answer.number) if answer.number.is_integer() else answer.number
        case _:
            value = answer.text
    return AnswerOut(row_id=answer.row_id, column_id=answer.column_id, value=value)
