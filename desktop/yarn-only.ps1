#!/usr/bin/env pwsh
Clear-Host

Write-Host @"
╔════════════════════════════════════════════════════════════╗
║           BIRTHDAY MANAGER - YARN ONLY                     ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  🧶 Nur Yarn wird verwendet - kein npm!                   ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Prüfe Yarn Installation
try {
    $yarnVersion = yarn --version
    Write-Host "`n✅ Yarn $yarnVersion ist installiert" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Yarn ist nicht installiert!" -ForegroundColor Red
    Write-Host "Installiere Yarn mit:" -ForegroundColor Yellow
    Write-Host "  npm install -g yarn (einmalig)" -ForegroundColor White
    Write-Host "  ODER" -ForegroundColor Gray
    Write-Host "  choco install yarn" -ForegroundColor White
    exit
}

# Zeige Befehle
Write-Host "`n📋 VERFÜGBARE BEFEHLE:" -ForegroundColor Yellow
Write-Host "  [1] yarn install     - Dependencies installieren"
Write-Host "  [2] yarn start       - Server starten"
Write-Host "  [3] yarn add         - Package hinzufügen"
Write-Host "  [4] yarn remove      - Package entfernen"  
Write-Host "  [5] yarn list        - Packages anzeigen"
Write-Host "  [6] yarn upgrade     - Packages updaten"
Write-Host "  [7] yarn clean       - Cache leeren"
Write-Host "  [Q] Beenden"

Write-Host ""
$choice = Read-Host "Auswahl"

switch ($choice) {
    "1" { yarn install }
    "2" { yarn start }
    "3" { 
        $pkg = Read-Host "Package Name"
        yarn add $pkg
    }
    "4" {
        $pkg = Read-Host "Package Name"
        yarn remove $pkg
    }
    "5" { yarn list }
    "6" { yarn upgrade }
    "7" { yarn cache clean }
    "Q" { exit }
    default { yarn start }
}
