@echo off
rem Le script est dans commands\ : on se place a la racine du projet
chcp 65001 >nul
title Trajectoires - remise a zero
cd /d "%~dp0.."
set PYTHONUTF8=1
if not exist ".venv\Scripts\python.exe" (
  echo    Lance d'abord "Lancer Trajectoires" une fois.
  pause
  exit /b
)
echo.
echo    Toutes les donnees vont etre remplacees par la demonstration d'origine.
echo    Ferme d'abord la fenetre "Trajectoires" si elle est ouverte.
echo.
pause
cd backend
"..\.venv\Scripts\python.exe" -m app.demo.seed --force
cd ..
echo.
echo    C'est fait. Relance "Lancer Trajectoires".
pause
