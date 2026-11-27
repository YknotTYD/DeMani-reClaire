#!/bin/bash
# Lance la démo Trajectoires sur Mac (double-clic). Fonctionne aussi sous Linux : bash "Lancer Trajectoires.command"
# Le script est dans commands/ : on se place à la racine du projet
cd "$(dirname "$0")/.." || exit 1
export PYTHONUTF8=1 PIP_DISABLE_PIP_VERSION_CHECK=1

echo
echo "   Trajectoires"
echo "   ------------"
echo

pause() { echo; read -r -p "   Appuie sur Entrée pour fermer cette fenêtre." _; }

# ---- 1. Python 3.10 ou plus récent ----
PY=""
for candidate in python3.13 python3.12 python3.11 python3.10 python3; do
  if command -v "$candidate" >/dev/null 2>&1 && "$candidate" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)' 2>/dev/null; then
    PY="$candidate"; break
  fi
done
if [ -z "$PY" ]; then
  echo "   Python 3.10 ou plus récent est nécessaire."
  echo "   La page de téléchargement va s'ouvrir : installe la dernière version, puis relance ce fichier."
  (open "https://www.python.org/downloads/" || xdg-open "https://www.python.org/downloads/") >/dev/null 2>&1
  pause; exit 1
fi

# ---- 2. Installation, une seule fois ----
if [ ! -x ".venv/bin/python" ]; then
  echo "   Première ouverture : installation, une à deux minutes..."
  "$PY" -m venv .venv && .venv/bin/python -m pip install -q -r backend/requirements.txt || {
    echo "   L'installation a échoué. Fais une capture de cette fenêtre et envoie-la."; pause; exit 1; }
fi

# ---- 3. Données de démonstration, une seule fois ----
if [ ! -f "backend/suivi_rh.db" ]; then
  echo "   Création des données de démonstration..."
  (cd backend && ../.venv/bin/python -m app.demo.seed --force >/dev/null) || {
    echo "   La création des données a échoué."; pause; exit 1; }
fi

# ---- 4. Lancement ----
echo
echo "   La démo s'ouvre dans ton navigateur : http://localhost:8000"
echo "   Laisse cette fenêtre ouverte. Pour arrêter : ferme-la (ou Ctrl+C)."
echo
(sleep 3; open "http://localhost:8000" 2>/dev/null || xdg-open "http://localhost:8000" 2>/dev/null) >/dev/null 2>&1 &
cd backend && exec ../.venv/bin/python -m uvicorn app.serve:site --host 127.0.0.1 --port 8000 --log-level warning
