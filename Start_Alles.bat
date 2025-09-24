@echo off
title Birthday Manager - Komplett Start
echo ===============================================
echo   Birthday Manager - Starte alle Komponenten
echo ===============================================
echo.

echo [1/3] Starte Datenbank-Server (Port 3000)...
start "DB-Server" cmd /k setup_database.bat

echo [2/3] Warte 3 Sekunden...
timeout /t 3 /nobreak >nul

echo [3/3] Starte WhatsApp-Server (Port 9999)...
start "WA-Server" cmd /k start-server.bat

echo.
echo ===============================================
echo   Alle Server gestartet!
echo ===============================================
echo.
echo Oeffne BirthdayManager im Browser...
timeout /t 2 /nobreak >nul
start "" "BirthdayManager.html"

echo.
echo Fertig! Alle Komponenten laufen.
pause
