#!/bin/bash
# Remplace toutes les données par la démonstration d'origine (Mac : double-clic).
# Le script est dans commands/ : on se place à la racine du projet
cd "$(dirname "$0")/.." || exit 1
export PYTHONUTF8=1
if [ ! -x ".venv/bin/python" ]; then
  echo "   Lance d'abord « Lancer Trajectoires » une fois."
else
  echo "   Ferme d'abord la fenêtre « Lancer Trajectoires » si elle est ouverte."
  read -r -p "   Entrée pour continuer, Ctrl+C pour annuler. " _
  (cd backend && ../.venv/bin/python -m app.demo.seed --force >/dev/null) && echo "   C'est fait. Relance « Lancer Trajectoires »."
fi
read -r -p "   Entrée pour fermer. " _
