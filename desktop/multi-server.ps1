Clear-Host
Write-Host @"
╔════════════════════════════════════════════════════════════╗
║           BIRTHDAY MANAGER - SERVICE MANAGER               ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

function Start-MainServer {
    Write-Host "`n🌐 Starte Haupt-Server (Port 3001)..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; node birthday-server.js"
}

function Start-CommServer {
    Write-Host "`n📱 Starte Communication Server (Port 3003)..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; node communication-server.js"
}

function Show-Status {
    Write-Host "`n📊 Server Status:" -ForegroundColor Yellow
    
    $main = Test-NetConnection -ComputerName localhost -Port 3001 -WarningAction SilentlyContinue
    $comm = Test-NetConnection -ComputerName localhost -Port 3003 -WarningAction SilentlyContinue
    
    if ($main.TcpTestSucceeded) {
        Write-Host "  ✅ Haupt-Server läuft (Port 3001)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Haupt-Server offline (Port 3001)" -ForegroundColor Red
    }
    
    if ($comm.TcpTestSucceeded) {
        Write-Host "  ✅ Communication Server läuft (Port 3003)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Communication Server offline (Port 3003)" -ForegroundColor Red
    }
}

# Menu
Write-Host "`nOptionen:" -ForegroundColor Yellow
Write-Host "[1] Beide Server starten"
Write-Host "[2] Nur Haupt-Server"
Write-Host "[3] Nur Communication Server"
Write-Host "[4] Status prüfen"
Write-Host "[5] Browser öffnen"

$choice = Read-Host "`nAuswahl"

switch ($choice) {
    "1" {
        Start-MainServer
        Start-Sleep -Seconds 2
        Start-CommServer
        Start-Sleep -Seconds 2
        Start-Process "http://localhost:3001"
    }
    "2" {
        Start-MainServer
        Start-Sleep -Seconds 2
        Start-Process "http://localhost:3001"
    }
    "3" {
        Start-CommServer
    }
    "4" {
        Show-Status
    }
    "5" {
        Start-Process "http://localhost:3001"
    }
}

Write-Host "`n✅ Fertig!" -ForegroundColor Green
