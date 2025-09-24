@echo off
title Birthday Manager - Komplettstart
color 0A

echo ================================================
echo      Birthday Manager - Starte System
echo ================================================
echo.

cd /d "C:\Projekte\BirthdayManager"

echo [1/4] Starte Datenbank-Server (Port 3000)...
start "DB-Server Port 3000" cmd /c "color 0E && echo DATENBANK-SERVER - Port 3000 && echo ================================ && set PORT=3000 && node server_with_db.js"

echo [2/4] Warte auf Datenbank-Start...
timeout /t 3 /nobreak >nul

echo [3/4] Starte WhatsApp-Server (Port 9999)...
start "WA-Server Port 9999" cmd /c "color 0B && powershell -ExecutionPolicy Bypass -File server.ps1"

echo [4/4] Warte auf Server-Start...
timeout /t 2 /nobreak >nul

echo.
echo ================================================
echo      Alle Server gestartet!
echo ================================================
echo.
echo   Datenbank-Server: http://localhost:3000
echo   WhatsApp-Server:  http://localhost:9999
echo.
echo ================================================
echo.

echo Oeffne Birthday Manager im Browser...
start "" "C:\Projekte\BirthdayManager\BirthdayManager.html"

echo.
echo ================================================
echo      Birthday Manager laueft!
echo ================================================
echo.
echo Server-Fenster NICHT schliessen!
echo.
echo Dieses Fenster kann geschlossen werden.
timeout /t 5 /nobreak >nul
exit
