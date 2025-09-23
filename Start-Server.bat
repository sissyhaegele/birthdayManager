@echo off
echo ========================================
echo  Birthday Manager - WhatsApp Server
echo ========================================
echo.
echo Server wird gestartet...
echo.
echo Bitte lassen Sie dieses Fenster geoeffnet!
echo Der Server muss laufen, damit WhatsApp funktioniert.
echo.
echo Zum Beenden druecken Sie Strg+C
echo.
echo ========================================
echo.

powershell -ExecutionPolicy Bypass -File ".\server.ps1"

echo.
echo Server wurde beendet.
echo.
pause
