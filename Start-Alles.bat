@echo off
title BirthdayManager - Komplett
cd /d "C:\Projekte\BirthdayManager"
start "WhatsApp Server" powershell -ExecutionPolicy Bypass -File server.ps1
timeout /t 2 >nul
start "" "BirthdayManager.html"
echo BirthdayManager und WhatsApp-Server gestartet!
pause

