"""Rangement des fichiers sur le disque :
<FILES_DIR>/Candidats/<Poste>/<Candidat>/<fichier>
<FILES_DIR>/Membres/<id du membre>/<fichier>
"""

import re
import shutil
from pathlib import Path

from app.core.config import FILES_DIR

ROOT = Path(FILES_DIR)
CANDIDATES_ROOT = ROOT / "Candidats"
MEMBERS_ROOT = ROOT / "Membres"
_FORBIDDEN = re.compile(r'[<>:"/\\|?*\x00-\x1f]')


def safe_name(name: str) -> str:
    """Nom utilisable comme dossier ou fichier sur Windows, macOS et Linux."""
    cleaned = _FORBIDDEN.sub("", name).strip().strip(".")
    return cleaned[:100] or "Sans nom"


def unique_name(wanted: str, taken: set[str]) -> str:
    """« CV.pdf » -> « CV (2).pdf » si « CV.pdf » est déjà pris (comparaison sans casse)."""
    taken_lower = {t.lower() for t in taken}
    if wanted.lower() not in taken_lower:
        return wanted
    stem, dot, ext = wanted.rpartition(".")
    if not dot:
        stem, ext = wanted, ""
    i = 2
    while True:
        candidate = f"{stem} ({i}).{ext}" if dot else f"{stem} ({i})"
        if candidate.lower() not in taken_lower:
            return candidate
        i += 1


def candidate_dir(position_folder: str, candidate_folder: str) -> Path:
    return CANDIDATES_ROOT / position_folder / candidate_folder


def save_file(directory: Path, filename: str, content: bytes) -> Path:
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / filename
    path.write_bytes(content)
    return path


def rename_dir(old: Path, new: Path) -> None:
    if old.exists() and old != new:
        new.parent.mkdir(parents=True, exist_ok=True)
        old.rename(new)


def delete_path(path: Path) -> None:
    if path.is_dir():
        shutil.rmtree(path)
    elif path.exists():
        path.unlink()


def member_dir(member_id: int) -> Path:
    return MEMBERS_ROOT / str(member_id)
