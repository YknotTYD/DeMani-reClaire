"""Mode tout-en-un, utilisé par le lanceur Windows : un seul serveur, sans Node.js.

L'API répond sous /api (comme avec le serveur de développement Vite) et le site déjà construit
(frontend/dist) est servi à la racine.
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException

from app.main import app as api
from app.main import lifespan

DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"


class SinglePageApp(StaticFiles):
    """Les adresses de l'application (/equipes, /mon-profil...) renvoient toutes vers index.html."""

    async def get_response(self, path, scope):
        try:
            return await super().get_response(path, scope)
        except HTTPException as error:
            if error.status_code != 404:
                raise
            return await super().get_response("index.html", scope)


site = FastAPI(title="Trajectoires", lifespan=lifespan)
site.mount("/api", api)
site.mount("/", SinglePageApp(directory=DIST, html=True), name="site")
