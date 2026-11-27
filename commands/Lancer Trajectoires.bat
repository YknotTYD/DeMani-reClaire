@echo off
rem Le script est dans commands\ : on se place a la racine du projet
chcp 65001 >nul
title Trajectoires
cd /d "%~dp0.."
set PYTHONUTF8=1
set PIP_DISABLE_PIP_VERSION_CHECK=1

echo.
echo    Trajectoires
echo    ------------
echo.

rem ---- 1. Python ----
set "PY="
py -3 --version >nul 2>nul && set "PY=py -3"
if not defined PY python --version >nul 2>nul && set "PY=python"
if defined PY goto :venv

echo    Python n'est pas installe. Installation automatique...
winget --version >nul 2>nul || goto :no_winget
winget install -e --id Python.Python.3.12 --scope user --accept-source-agreements --accept-package-agreements
echo.
echo    Python est installe. Ferme cette fenetre puis relance "Lancer Trajectoires".
pause
exit /b

:no_winget
echo    Installe Python depuis la page qui va s'ouvrir.
echo    IMPORTANT : coche la case "Add python.exe to PATH" pendant l'installation.
echo    Puis relance "Lancer Trajectoires".
start https://www.python.org/downloads/
pause
exit /b

rem ---- 2. Installation, une seule fois ----
:venv
if exist ".venv\Scripts\python.exe" goto :data
echo    Premiere ouverture : installation, une a deux minutes...
%PY% -m venv .venv || goto :error
".venv\Scripts\python.exe" -m pip install -q -r backend\requirements.txt || goto :error

rem ---- 3. Donnees de demonstration, une seule fois ----
:data
if exist "backend\suivi_rh.db" goto :run
echo    Creation des donnees de demonstration...
cd backend
"..\.venv\Scripts\python.exe" -m app.demo.seed --force || (cd .. & goto :error)
cd ..

rem ---- 4. Lancement ----
:run
echo.
echo    La demo s'ouvre dans ton navigateur : http://localhost:8000
echo    Trajectoires seul, sans Teams       : http://localhost:8000/connexion
echo    Compte RH     : rh@entreprise.fr / rh123456
echo    Collaborateur : thomas.klein@demo-trajectoires.fr / demo1234
echo.
echo    Laisse cette fenetre ouverte. Pour arreter Trajectoires, ferme-la.
echo.
start "" /min cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:8000"
cd backend
"..\.venv\Scripts\python.exe" -m uvicorn app.serve:site --host 127.0.0.1 --port 8000 --log-level warning
cd ..
pause
exit /b

:error
echo.
echo    Une erreur est survenue. Fais une capture de cette fenetre et envoie-la.
pause
exit /b 1
