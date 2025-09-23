@echo off
cd C:\Projekte\BirthdayManager
start powershell -ExecutionPolicy Bypass -File server.ps1
timeout /t 2
start BirthdayManager.html
