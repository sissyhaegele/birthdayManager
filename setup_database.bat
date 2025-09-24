@echo off
title Birthday Manager - Datenbank Setup
color 0A

echo ================================================
echo   Birthday Manager - Datenbank Installation
echo ================================================
echo.

:: Node.js prüfen
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [FEHLER] Node.js ist nicht installiert!
    echo.
    echo Bitte installieren Sie Node.js von:
    echo https://nodejs.org/
    echo.
    echo Nach der Installation starten Sie dieses Script erneut.
    pause
    exit /b 1
)

echo [OK] Node.js ist installiert
node --version
echo.

:: NPM prüfen
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [FEHLER] NPM ist nicht installiert!
    pause
    exit /b 1
)

echo [OK] NPM ist installiert
npm --version
echo.

:: Ins richtige Verzeichnis wechseln
cd /d "C:\Projekte\BirthdayManager"

echo Installation der Pakete...
echo --------------------------

:: Package.json erstellen falls nicht vorhanden
if not exist package.json (
    echo Erstelle package.json...
    echo {"name":"birthday-manager-db","version":"2.0.0","description":"Birthday Manager mit SQLite"} > package.json
)

:: Pakete installieren
echo.
echo Installiere Express...
call npm install express

echo Installiere SQLite3...
call npm install sqlite3

echo Installiere CORS...
call npm install cors

echo Installiere Body-Parser...
call npm install body-parser

echo.
echo ================================================
echo   Installation abgeschlossen!
echo ================================================
echo.
echo Starte Server mit Datenbank...
echo.

:: Server starten
node server_with_db.js

pause
