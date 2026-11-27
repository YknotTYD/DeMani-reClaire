"""
Remplit Trajectoires avec une base de démonstration réaliste (personnes et données fictives).

    cd backend
    python -m app.demo.seed --force

Tout passe par l'API, comme un vrai utilisateur : les alertes, moyennes et statuts se calculent d'eux-mêmes.
ATTENTION : la base et les dossiers de fichiers existants sont supprimés.
"""

import io
import logging
import random
import shutil
import sys
import unicodedata
from datetime import date, datetime, timedelta
from pathlib import Path

from app.core.config import DATABASE_URL, FILES_DIR, RH_EMAIL, RH_PASSWORD
from app.demo.data import (
    BASE_LEVEL,
    COMMENTS,
    EMAIL_DOMAIN,
    MEMBER_PASSWORD,
    NEW_HIRES,
    NEW_HIRES_TEAM,
    POSITIONS,
    TEAMS,
    TEAMS_LINK,
)
from app.demo.pdf import make_pdf

random.seed(42)
logging.getLogger("suivi_rh.email").setLevel(logging.ERROR)

QUARTERS_2026 = [1, 2, 3, 4]
CURRENT_QUARTER = 4


# ---------- Outils ----------


def slug(name: str) -> str:
    plain = unicodedata.normalize("NFD", name).encode("ascii", "ignore").decode().lower()
    return plain.replace(" ", ".").replace("'", "")


def email_of(name: str) -> str:
    return f"{slug(name)}@{EMAIL_DOMAIN}"


def clamp_stars(value: float) -> int:
    return max(1, min(5, round(value)))


def business_day(offset: int) -> date:
    """Le jour ouvré situé `offset` jours ouvrés après (ou avant) aujourd'hui."""
    day = date.today()
    step = 1 if offset >= 0 else -1
    remaining = abs(offset)
    while remaining:
        day += timedelta(days=step)
        if day.weekday() < 5:
            remaining -= 1
    return day


def at(day: date, hour: int, minute: int = 0) -> str:
    return datetime(day.year, day.month, day.day, hour, minute).isoformat()


def make_docx(paragraphs: list[str]) -> bytes:
    from docx import Document

    doc = Document()
    for p in paragraphs:
        doc.add_paragraph(p)
    buffer = io.BytesIO()
    doc.save(buffer)
    return buffer.getvalue()


class Api:
    """Appels à l'API avec vérification du code retour."""

    def __init__(self, client):
        self.client = client

    def login(self, email: str, password: str) -> dict:
        r = self.client.post("/auth/login", json={"email": email, "password": password})
        r.raise_for_status()
        return {"Authorization": f"Bearer {r.json()['token']}"}

    def call(self, method: str, path: str, headers: dict, expected=(200, 201, 204), **kwargs):
        r = self.client.request(method, path, headers=headers, **kwargs)
        if r.status_code not in expected:
            raise RuntimeError(f"{method} {path} -> {r.status_code} {r.text}")
        return r.json() if r.content else None


# ---------- Réponses crédibles ----------


def level_for(profile: str, team: str, quarter: int) -> float:
    level = BASE_LEVEL[profile] + random.uniform(-0.4, 0.4)
    if team == "Agence Strasbourg Kléber" and quarter == 2:
        level -= 0.9  # réorganisation de l'agence au printemps, puis retour à la normale
    if profile == "baisse" and quarter == CURRENT_QUARTER:
        level -= 2.3  # baisse nette ce trimestre : déclenche une alerte
    return level


def comment_for(level: float) -> str:
    key = "haut" if level >= 3.8 else "moyen" if level >= 2.8 else "bas"
    return random.choice(COMMENTS[key])


def barometer_answers(cols: dict, rows: dict, profile: str, team: str, quarter: int, previous: float | None):
    answers, levels = [], []
    for row_label, row_id in rows.items():
        level = level_for(profile, team, quarter) + (0.3 if row_label == "Mon équipe" else 0)
        levels.append(level)
        answers.append({"row_id": row_id, "column_id": cols["Satisfaction"], "value": clamp_stars(level)})
        answers.append(
            {"row_id": row_id, "column_id": cols["Charge supportable"], "value": clamp_stars(level - random.uniform(0, 0.8))}
        )
        if previous is None or abs(level - previous) < 0.4:
            trend = "Stable"
        else:
            trend = "En amélioration" if level > previous else "En dégradation"
        answers.append({"row_id": row_id, "column_id": cols["Tendance"], "value": trend})
        if random.random() < 0.3:
            answers.append({"row_id": row_id, "column_id": cols["Un mot pour le RH"], "value": comment_for(level)})
    return answers, sum(levels) / len(levels)


def integration_answers(cols: dict, rows: dict, quarter: int):
    answers = []
    for row_label, row_id in rows.items():
        first_week = row_label == "Ma première semaine"
        answers.append({"row_id": row_id, "column_id": cols["Note"], "value": clamp_stars(random.uniform(3.2, 4.9))})
        hours = random.choice([6, 8, 10, 12]) if first_week else random.choice([14, 18, 21, 24, 28])
        answers.append({"row_id": row_id, "column_id": cols["Heures de formation suivies"], "value": hours})
        knows = random.random() < (0.55 if quarter == 3 and first_week else 0.9)
        answers.append({"row_id": row_id, "column_id": cols["Je sais à qui m'adresser"], "value": knows})
        if random.random() < 0.4:
            text = random.choice(
                [
                    "Accueil chaleureux de l'équipe.",
                    "Les accès informatiques sont arrivés tard.",
                    "Le tuteur est très disponible.",
                    "Beaucoup d'informations en peu de temps.",
                    "Les classes virtuelles du Campus sont claires.",
                ]
            )
            answers.append({"row_id": row_id, "column_id": cols["Commentaire"], "value": text})
    return answers


# ---------- Étapes ----------


NEW_HIRE_DATE = date(2026, 9, 1)


def hire_date_of(name: str) -> date:
    if name in NEW_HIRES:
        return NEW_HIRE_DATE
    return date(random.randint(2009, 2023), random.randint(1, 12), random.randint(1, 28))


def create_people(api: Api, rh: dict) -> tuple[dict, dict, dict]:
    members, profiles, teams = {}, {}, {}
    for team_name, people in TEAMS.items():
        for name, profile in people:
            members[name] = api.call(
                "POST",
                "/members",
                rh,
                json={"name": name, "email": email_of(name), "password": MEMBER_PASSWORD, "hired_on": hire_date_of(name).isoformat()},
            )
            profiles[name] = profile
        team = api.call("POST", "/teams", rh, json={"name": team_name})
        for name, _ in people:
            api.call("POST", f"/teams/{team['id']}/members", rh, json={"user_id": members[name]["id"]})
        teams[team_name] = team

        # Liens de travail factuels : binômes et remplaçants dans l'équipe
        names = [n for n, _ in people]
        random.shuffle(names)
        for a, b in zip(names[::2], names[1::2]):
            kind = random.choice(["binome", "binome", "remplacant"])
            api.call("PUT", "/relations", rh, json={"member_a_id": members[a]["id"], "member_b_id": members[b]["id"], "kind": kind})

    # Chaque nouvel entrant a un tuteur dans son agence, et certains un parrain au siège
    team_of = {name: team for team, people in TEAMS.items() for name, _ in people}
    for i, newcomer in enumerate(NEW_HIRES):
        colleagues = [n for n, p in TEAMS[team_of[newcomer]] if n not in NEW_HIRES and p == "solide"]
        tutor = colleagues[0] if colleagues else [n for n, _ in TEAMS[team_of[newcomer]] if n not in NEW_HIRES][0]
        api.call("PUT", "/relations", rh, json={"member_a_id": members[tutor]["id"], "member_b_id": members[newcomer]["id"], "kind": "tuteur"})
        if i % 2 == 0:
            sponsor = ["Nathalie Durand", "Sophie Lambert", "Amandine Fabre"][i % 3]
            api.call("PUT", "/relations", rh, json={"member_a_id": members[sponsor]["id"], "member_b_id": members[newcomer]["id"], "kind": "parrain"})

    new_team = api.call("POST", "/teams", rh, json={"name": NEW_HIRES_TEAM})
    for name in NEW_HIRES:
        api.call("POST", f"/teams/{new_team['id']}/members", rh, json={"user_id": members[name]["id"]})
    teams[NEW_HIRES_TEAM] = new_team
    return members, profiles, teams


def create_models(api: Api, rh: dict) -> dict:
    def model(name: str, rows: list[str], columns: list[dict]):
        m = api.call("POST", "/questionnaire-models", rh, json={"name": name})
        row_ids = {
            r: api.call("POST", f"/questionnaire-models/{m['id']}/criteria", rh, json={"axis": "row", "label": r})["id"]
            for r in rows
        }
        col_ids = {
            c["label"]: api.call("POST", f"/questionnaire-models/{m['id']}/criteria", rh, json={"axis": "column", **c})["id"]
            for c in columns
        }
        return {"id": m["id"], "rows": row_ids, "cols": col_ids}

    barometer = model(
        "Baromètre trimestriel",
        ["Mon poste", "Mon équipe", "Mon organisation"],
        [
            {"label": "Satisfaction", "answer_type": "stars"},
            {"label": "Charge supportable", "answer_type": "stars"},
            {"label": "Tendance", "answer_type": "choice", "options": ["En amélioration", "Stable", "En dégradation"]},
            {"label": "Un mot pour le RH", "answer_type": "text", "required": False},
        ],
    )
    integration = model(
        "Intégration des nouveaux entrants",
        ["Ma première semaine", "Mes premiers mois"],
        [
            {"label": "Note", "answer_type": "stars"},
            {"label": "Heures de formation suivies", "answer_type": "number", "min_value": 0, "max_value": 60},
            {"label": "Je sais à qui m'adresser", "answer_type": "yes_no"},
            {"label": "Commentaire", "answer_type": "text", "required": False},
        ],
    )
    return {"barometer": barometer, "integration": integration}


def run_questionnaires(api: Api, rh: dict, members: dict, profiles: dict, teams: dict, models: dict):
    agency_team_ids = [t["id"] for name, t in teams.items() if name != NEW_HIRES_TEAM]
    team_of = {name: team for team, people in TEAMS.items() for name, _ in people}
    tokens = {name: api.login(email_of(name), MEMBER_PASSWORD) for name in members}
    previous_level: dict[str, float] = {}
    # Chaque collaborateur a son habitude de partage : la plupart partagent, certains jamais
    sharer = {name: random.random() < 0.7 for name in members}
    sharer["Thomas Klein"] = False  # n'a pas partagé : le RH ne voit pas sa baisse, il la voit dans son profil
    sharer["Yasmine Cherif"] = True

    def share(questionnaire: dict, name: str):
        if sharer[name]:
            api.call("PUT", f"/questionnaires/{questionnaire['id']}/share", tokens[name], json={"shared": True})

    barometer = models["barometer"]
    for quarter in QUARTERS_2026:
        q = api.call(
            "POST",
            "/questionnaires",
            rh,
            json={"model_id": barometer["id"], "year": 2026, "quarter": quarter, "team_ids": agency_team_ids},
        )
        # Taux de réponse élevé mais jamais complet ; le trimestre en cours n'est pas encore terminé
        missing = 6 if quarter == CURRENT_QUARTER else random.choice([1, 2, 2])
        absent = set(random.sample([n for n in members if profiles[n] != "baisse"], missing))
        for name in members:
            if name in absent:
                continue
            profile = profiles[name]
            answers, level = barometer_answers(
                barometer["cols"], barometer["rows"], profile, team_of[name], quarter, previous_level.get(name)
            )
            previous_level[name] = level
            wants = (profile == "baisse" and quarter == CURRENT_QUARTER) or (
                profile in ("moyen", "fragile") and random.random() < 0.1
            )
            api.call(
                "PUT",
                f"/questionnaires/{q['id']}/my-answers",
                tokens[name],
                json={"answers": answers, "wants_evolution": wants},
            )
            share(q, name)

    integration = models["integration"]
    for quarter in (3, 4):
        q = api.call(
            "POST",
            "/questionnaires",
            rh,
            json={"model_id": integration["id"], "year": 2026, "quarter": quarter, "team_ids": [teams[NEW_HIRES_TEAM]["id"]]},
        )
        for i, name in enumerate(NEW_HIRES):
            if quarter == CURRENT_QUARTER and i == len(NEW_HIRES) - 1:
                continue  # une réponse encore attendue
            api.call(
                "PUT",
                f"/questionnaires/{q['id']}/my-answers",
                tokens[name],
                json={"answers": integration_answers(integration["cols"], integration["rows"], quarter), "wants_evolution": False},
            )
            share(q, name)
    return tokens


def follow_up(api: Api, rh: dict, tokens: dict):
    """Le RH a commencé à traiter les souhaits d'évolution ; des collaborateurs ont fait des demandes."""
    evolutions = api.call("GET", "/evolutions", rh)
    notes = [
        ("propose", "Échange prévu sur un poste de conseiller patrimonial, à confirmer avec la direction d'agence."),
        ("fait", "Inscription au parcours « Chargé d'affaires pro » validée pour le premier trimestre."),
    ]
    for evolution, (status, note) in zip(evolutions[1:], notes):
        api.call("PATCH", f"/evolutions/{evolution['id']}", rh, json={"status": status, "note": note})

    # Inès a vu le signal sur ses réponses et demande elle-même un échange
    api.call(
        "POST",
        "/me/contact-requests",
        tokens["Inès Moreau"],
        json={"kind": "echange", "message": "Suite à mes réponses de ce trimestre, j'aimerais faire un point sur ma charge."},
    )
    api.call(
        "POST",
        "/me/contact-requests",
        tokens["Lucie Perrin"],
        json={"kind": "correction", "message": "Ma date d'embauche est le 1er septembre, pas le 3."},
    )
    done = api.call(
        "POST",
        "/me/contact-requests",
        tokens["Julien Becker"],
        json={"kind": "echange", "message": "Je souhaite parler de mon planning de formation."},
    )
    api.call("PATCH", f"/contact-requests/{done['id']}", rh, json={"status": "traitee"})


def create_candidates(api: Api, rh: dict):
    n = 0
    for position_name, candidates in POSITIONS.items():
        position = api.call("POST", "/positions", rh, json={"name": position_name})
        for name, email, status, city, experience in candidates:
            cv = make_pdf(
                [
                    name,
                    f"Candidature : {position_name}",
                    f"{email} - 06 {random.randint(10, 99)} {random.randint(10, 99)} {random.randint(10, 99)} {random.randint(10, 99)}",
                    f"{city}, Grand Est",
                    "",
                    "Expérience",
                    experience,
                    "",
                    "Compétences",
                    "Relation client, écoute, rigueur, outils bureautiques",
                ]
            )
            filed = api.call(
                "POST",
                "/documents",
                rh,
                files={"file": (f"CV_{slug(name)}.pdf", cv, "application/pdf")},
                data={
                    "position_id": position["id"],
                    "candidate_name": name,
                    "candidate_email": email,
                    "doc_type": "cv",
                    "candidate_status": status,
                    "candidate_informed": "true",
                },
            )
            if status in ("entretien", "retenu"):
                letter = make_docx(
                    [
                        name,
                        email,
                        "Madame, Monsieur,",
                        f"Je souhaite rejoindre la Banque Populaire Alsace Lorraine Champagne en tant que {position_name.lower()}.",
                        f"Fort(e) de mon expérience ({experience.lower()}), je serais heureux(se) d'échanger avec vous.",
                    ]
                )
                api.call(
                    "POST",
                    "/documents",
                    rh,
                    files={"file": (f"Lettre_{slug(name)}.docx", letter, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
                    data={
                        "position_id": position["id"],
                        "candidate_name": name,
                        "candidate_email": email,
                        "doc_type": "lettre",
                        "candidate_status": status,
                        "candidate_informed": "true",
                    },
                )
            # Entretiens : un premier échange passé, puis un second à venir en visio pour ceux en cours de process
            if status in ("entretien", "retenu"):
                n += 1
                api.call(
                    "POST",
                    "/appointments",
                    rh,
                    json={
                        "candidate_id": filed["candidate_id"],
                        "starts_at": at(business_day(-random.randint(4, 12)), random.choice([9, 10, 14, 16])),
                        "duration_minutes": 45,
                        "location": f"Agence de {city}",
                        "note": "Premier entretien avec le gestionnaire de carrière.",
                    },
                )
            if status == "entretien":
                n += 1
                api.call(
                    "POST",
                    "/appointments",
                    rh,
                    json={
                        "candidate_id": filed["candidate_id"],
                        "starts_at": at(business_day(random.randint(1, 8)), random.choice([9, 11, 14, 15])),
                        "duration_minutes": 60,
                        "location": TEAMS_LINK.format(n=n),
                        "note": "Second entretien avec la direction d'agence (visio Teams).",
                    },
                )


def create_agenda(api: Api, rh: dict, members: dict, tokens: dict):
    def propose(name: str, starts_at: str, minutes: int, location: str, note: str, category: str = "suivi"):
        return api.call(
            "POST",
            "/appointments",
            rh,
            json={
                "member_id": members[name]["id"],
                "starts_at": starts_at,
                "duration_minutes": minutes,
                "location": location,
                "note": note,
                "category": category,
            },
        )

    def respond(name: str, appointment: dict, accept: bool):
        api.call("POST", f"/me/appointments/{appointment['id']}/respond", tokens[name], json={"accept": accept})

    # Indisponibilités saisies par les membres (le RH ne voit que « occupé »)
    for name, offset, start, end, label in [
        ("Thomas Klein", 2, 9, 12, "Formation conformité"),
        ("Yasmine Cherif", 3, 14, 17, "Rendez-vous clients"),
        ("Inès Moreau", 1, 8, 10, "Personnel"),
        ("Claire Muller", 2, 13, 15, "Comité d'agence"),
    ]:
        day = business_day(offset)
        api.call(
            "POST",
            "/me/busy-slots",
            tokens[name],
            json={"starts_at": at(day, start), "ends_at": at(day, end), "label": label},
        )

    # Historique du suivi (rendez-vous passés et acceptés) : c'est ce qui alimente les rappels « n'oublier personne »
    today = date.today()
    veterans = [n for n in members if n not in NEW_HIRES]
    no_recent_contact = {"Vincent Garnier", "Olivier Mercier"}       # aucun échange depuis plus de 12 mois
    parcours_late = {"Mehdi Boukhari", "Antoine Lefèvre"}             # entretien de parcours en retard
    parcours_soon = {"Karim Haddad"}                                  # échéance dans quelques semaines
    for name in veterans:
        if name in parcours_late:
            years_ago = 4.3
        elif name in parcours_soon:
            years_ago = 3.95
        else:
            years_ago = random.uniform(1.0, 3.5)
        day = today - timedelta(days=round(years_ago * 365))
        while day.weekday() >= 5:
            day -= timedelta(days=1)
        a = propose(name, at(day, 10), 60, "Bureau RH", "Entretien de parcours professionnel.", "parcours")
        respond(name, a, True)

        months_ago = 14 if name in no_recent_contact else random.randint(2, 10)
        day = today - timedelta(days=months_ago * 30)
        while day.weekday() >= 5:
            day -= timedelta(days=1)
        a = propose(name, at(day, 15), 30, "Bureau RH", "Point de suivi.")
        respond(name, a, True)

    # Nouveaux entrants : bilan à 30 jours fait pour certains
    for name in ["Hugo Marchal", "Lucie Perrin", "Camille Petitjean"]:
        a = propose(name, at(date(2026, 10, 1 + NEW_HIRES.index(name)), 11), 45, "Bureau RH", "Bilan à 30 jours.", "integration")
        respond(name, a, True)

    # Un rendez-vous en cours au moment de la démonstration
    now = datetime.now().replace(second=0, microsecond=0)
    a = propose("Camille Petitjean", (now - timedelta(minutes=15)).isoformat(), 60, TEAMS_LINK.format(n=90), "Bilan de fin de période d'essai.", "integration")
    respond("Camille Petitjean", a, True)

    # À venir
    klein = propose(
        "Thomas Klein",
        at(business_day(2), 14),
        45,
        TEAMS_LINK.format(n=91),
        "Point sur la charge de travail, suite à vos dernières réponses.",
    )  # en attente de réponse
    yasmine = propose("Yasmine Cherif", at(business_day(4), 10), 60, "Agence Strasbourg Kléber, bureau 2", "Échange sur votre souhait d'évolution.")
    respond("Yasmine Cherif", yasmine, True)
    ines = propose("Inès Moreau", at(business_day(1), 10, 30), 30, "Bureau RH", "Point de suivi.")
    respond("Inès Moreau", ines, False)  # refusé (créneau qui ne convenait pas)
    ines2 = propose("Inès Moreau", at(business_day(3), 11), 30, TEAMS_LINK.format(n=92), "Point de suivi (nouveau créneau).")
    respond("Inès Moreau", ines2, True)
    propose("Romain Hoffmann", at(business_day(5), 15), 45, "Agence Strasbourg Kléber", "Bilan de fin de période d'essai.", "integration")
    lucie = propose("Lucie Perrin", at(business_day(6), 9, 30), 45, TEAMS_LINK.format(n=93), "Bilan de fin de période d'essai.", "integration")
    respond("Lucie Perrin", lucie, True)

    # Documents déposés par les membres
    for name, filename, lines, appointment in [
        ("Thomas Klein", "Point_charge_de_travail.pdf", ["Point charge de travail", "Liste des dossiers en cours et délais."], klein),
        ("Yasmine Cherif", "Projet_evolution.pdf", ["Projet d'évolution", "Poste visé : conseillère patrimoniale."], yasmine),
        ("Camille Petitjean", "Attestation_formation_AMF.pdf", ["Attestation de formation", "Certification AMF obtenue."], None),
        ("Hugo Marchal", "Souhaits_mobilite.pdf", ["Souhaits de mobilité", "Ouvert à une mobilité vers Metz."], None),
    ]:
        data = {"appointment_id": str(appointment["id"])} if appointment else {}
        api.call(
            "POST",
            "/me/documents",
            tokens[name],
            files={"file": (filename, make_pdf(lines), "application/pdf")},
            data=data,
        )



def create_absences(api: Api, rh: dict, tokens: dict):
    """Quelques absences déclarées par les collaborateurs : le RH les consulte sans recevoir d'email."""

    def declare(name, kind, start, end, comment="", proof=None, start_afternoon=False, end_morning=False):
        files = [("files", (proof[0], make_pdf(proof[1]), "application/pdf"))] if proof else None
        data = {"kind": kind, "start_date": start.isoformat(), "end_date": end.isoformat(),
                "start_afternoon": str(start_afternoon).lower(), "end_morning": str(end_morning).lower(), "comment": comment}
        return api.call("POST", "/me/absences", tokens[name], data=data, files=files)

    arret = ["Avis d'arrêt de travail", "Volet 3 - à adresser à l'employeur", "", "Salarié : Thomas Klein",
             "Arrêt initial", f"Du {business_day(-8):%d/%m/%Y} au {business_day(-6):%d/%m/%Y} inclus", "",
             "Document de démonstration"]
    thomas = declare("Thomas Klein", "maladie", business_day(-8), business_day(-6), proof=("Arret_de_travail_volet_employeur.pdf", arret))
    api.call("PATCH", f"/absences/{thomas['id']}", rh, json={"status": "validee"})

    declare("Inès Moreau", "conges", business_day(7), business_day(8), "Pont de fin d'année avec ma famille.", start_afternoon=True)
    declare("Julien Becker", "autre", business_day(4), business_day(4), "Déménagement.")
    convocation = ["Convocation", "Juré d'assises - session de décembre", "", "Karim Haddad est convoqué en qualité de juré.",
                   "Document de démonstration"]
    declare("Karim Haddad", "autre", business_day(12), business_day(14), "Convocation comme juré d'assises.",
            proof=("Convocation_jure.pdf", convocation))
    mehdi = declare("Mehdi Boukhari", "conges", business_day(2), business_day(3), "Long week-end.")
    api.call("PATCH", f"/absences/{mehdi['id']}", rh,
             json={"status": "refusee", "rh_comment": "Clôture trimestrielle ces jours-là : peux-tu décaler d'une semaine ?"})


def age_one_candidate():
    """Pour la démo de la conservation : un dossier refusé dont le dernier contact remonte à près de deux ans."""
    from sqlalchemy import select

    from app.core.database import SessionLocal
    from app.models.candidate import Candidate

    with SessionLocal() as db:
        candidate = db.scalar(select(Candidate).where(Candidate.name == "Julie Fontaine"))
        candidate.last_contact_at = datetime.now() - timedelta(days=715)
        db.commit()


# ---------- Lancement ----------


def reset_storage():
    if DATABASE_URL.startswith("sqlite:///"):
        db_path = Path(DATABASE_URL.removeprefix("sqlite:///"))
        if db_path.exists():
            db_path.unlink()
    shutil.rmtree(FILES_DIR, ignore_errors=True)


def main():
    if "--force" not in sys.argv:
        print("Ce script SUPPRIME la base et les fichiers actuels, puis crée la démonstration.")
        print("Relance avec :  python -m app.demo.seed --force")
        sys.exit(1)

    reset_storage()

    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as client:
        api = Api(client)
        rh = api.login(RH_EMAIL, RH_PASSWORD)
        members, profiles, teams = create_people(api, rh)
        models = create_models(api, rh)
        tokens = run_questionnaires(api, rh, members, profiles, teams, models)
        create_candidates(api, rh)
        create_agenda(api, rh, members, tokens)
        follow_up(api, rh, tokens)
        create_absences(api, rh, tokens)
        age_one_candidate()
        for c in api.call("GET", "/connectors", rh):
            if c["status"] == "connecte":
                api.call("POST", f"/connectors/{c['id']}/sync", rh)

        stats = [api.call("GET", f"/questionnaires/{q['id']}/stats", rh) for q in api.call("GET", "/questionnaires", rh)]
        reminders = api.call("GET", "/reminders", rh)
        requests = api.call("GET", "/contact-requests", rh)
        evolutions = api.call("GET", "/evolutions", rh)

    print("Démonstration prête.")
    print(f"  {len(members)} membres, {len(teams)} équipes, {sum(len(c) for c in POSITIONS.values())} candidats")
    for s in stats:
        q = s["questionnaire"]
        masked = "  (masqué : moins de 10 réponses)" if s["masked"] else ""
        print(f"  {q['model_name']:<36} {q['label']:<16} {q['answered_count']:>2}/{len(s['respondents'])} réponses{masked}")
    print(f"  {len(reminders['reminders'])} rappels « n'oublier personne », {reminders['indicator']['percent']} % vus dans les 12 mois")
    print(f"  {len(requests)} demandes de collaborateurs, {len(evolutions)} souhaits d'évolution")
    print("  Absences : 5 déclarées (1 validée, 1 refusée, 3 à traiter), sans email au RH")
    print("  Systèmes reliés (démo) : Teams, CRM RH, SIRH, Talentlink ; plateforme de formation prévue")
    print(f"  Compte RH : {RH_EMAIL} / {RH_PASSWORD}")
    print(f"  Comptes membres : prenom.nom@{EMAIL_DOMAIN} / {MEMBER_PASSWORD}  (ex. thomas.klein@{EMAIL_DOMAIN})")


if __name__ == "__main__":
    main()
