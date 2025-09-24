@echo off
echo Starte beide Server...
start "Database" cmd /k setup_database.bat
timeout /t 3
start "WhatsApp" powershell -ExecutionPolicy Bypass -File server.ps1
echo Beide Server laufen!
pause
