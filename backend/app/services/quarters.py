QUARTER_LABELS = {1: "Jan – Mar", 2: "Avr – Juin", 3: "Juil – Sep", 4: "Oct – Déc"}


def quarter_label(year: int, quarter: int) -> str:
    """(2026, 4) -> « Oct – Déc 2026 »"""
    return f"{QUARTER_LABELS[quarter]} {year}"


def questionnaire_title(db, questionnaire) -> str:
    """« Ambiance · Oct – Déc 2026 »"""
    from app.models.questionnaire_model import QuestionnaireModel

    model = db.get(QuestionnaireModel, questionnaire.model_id)
    return f"{model.name} · {quarter_label(questionnaire.year, questionnaire.quarter)}"
