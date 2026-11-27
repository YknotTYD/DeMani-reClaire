"""Lecture simple (sans IA) d'un CV PDF ou Word : email fiable, nom deviné."""

import io
import re

from docx import Document as DocxDocument
from pypdf import PdfReader

EMAIL = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
NAME_WORD = re.compile(r"^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'’-]*$")

# Mots qui indiquent qu'une ligne n'est pas un nom
NOT_A_NAME = {
    "curriculum", "vitae", "cv", "profil", "profile", "contact", "expérience", "experience",
    "expériences", "formation", "formations", "compétences", "competences", "langues", "loisirs",
    "adresse", "téléphone", "telephone", "email", "mail", "objectif", "résumé", "resume",
    "développeur", "developpeur", "ingénieur", "ingenieur", "chef", "projet", "stage", "alternance",
    "lettre", "motivation", "madame", "monsieur", "objet",
}


def extract_text(content: bytes, extension: str) -> str:
    try:
        if extension == ".pdf":
            reader = PdfReader(io.BytesIO(content))
            return "\n".join(page.extract_text() or "" for page in reader.pages[:3])
        if extension == ".docx":
            doc = DocxDocument(io.BytesIO(content))
            return "\n".join(p.text for p in doc.paragraphs)
    except Exception:  # fichier abîmé ou illisible : on laisse le RH saisir à la main
        return ""
    return ""


def _looks_like_name(line: str) -> bool:
    words = line.split()
    if not 2 <= len(words) <= 4:
        return False
    if any(w.lower().strip("'’-") in NOT_A_NAME for w in words):
        return False
    return all(NAME_WORD.match(w) for w in words)


def _format_name(line: str) -> str:
    # « MARTIN alice » -> « Martin Alice »
    return " ".join("-".join(part.capitalize() for part in w.split("-")) for w in line.split())


def _name_from_email(email: str) -> str:
    local = email.split("@")[0]
    parts = [p for p in re.split(r"[._-]+", local) if p.isalpha()]
    return " ".join(p.capitalize() for p in parts) if len(parts) >= 2 else ""


def extract_contact(text: str) -> dict[str, str]:
    email_match = EMAIL.search(text)
    email = email_match.group(0) if email_match else ""

    name = ""
    for line in [l.strip() for l in text.splitlines() if l.strip()][:15]:
        if _looks_like_name(line):
            name = _format_name(line)
            break
    if not name and email:
        name = _name_from_email(email)

    return {"name": name, "email": email}
