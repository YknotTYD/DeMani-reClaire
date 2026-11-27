"""Connecteurs vers les systèmes existants de la banque.

Trajectoires ne remplace aucun outil : il lit le SIRH, le CRM RH et Talentlink, et s'ouvre dans Teams
(rapport, sections 4.2 et 5.6). Chaque connecteur dit ce qu'il lit, ce qu'il renvoie et dans quelle version
du déploiement il arrive. En mode démonstration, il compte simplement les données de la base locale.
"""

from app.connectors.registry import CONNECTORS, get_connector

__all__ = ["CONNECTORS", "get_connector"]
