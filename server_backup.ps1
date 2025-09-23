# WhatsApp Server für Birthday Manager
# Verbesserte Version mit automatischer Ordner-Erkennung
# Starten: .\server_improved.ps1
# Server läuft standardmäßig auf http://localhost:9999

param(
    [Parameter(Mandatory=$false)]
    [int]$Port = 9999,
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectPath = ""
)

# Konsole konfigurieren
$Host.UI.RawUI.WindowTitle = "Birthday Manager WhatsApp Server - Port $Port"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Farben für bessere Lesbarkeit
function Write-ColorHost($Text, $Color = "White") {
    Write-Host $Text -ForegroundColor $Color
}

# Banner anzeigen
Clear-Host
Write-ColorHost "═══════════════════════════════════════════════════════════" "Cyan"
Write-ColorHost "          Birthday Manager WhatsApp Server v2.0            " "Yellow"
Write-ColorHost "═══════════════════════════════════════════════════════════" "Cyan"
Write-ColorHost ""

# Projekt-Ordner finden oder erstellen
if ([string]::IsNullOrEmpty($ProjectPath)) {
    # Versuche verschiedene Standard-Pfade
    $possiblePaths = @(
        "C:\Projekte\BirthdayManager",
        "$env:USERPROFILE\Documents\BirthdayManager",
        "$env:USERPROFILE\Desktop\BirthdayManager",
        (Get-Location).Path
    )
    
    $foundPath = $null
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $foundPath = $path
            Write-ColorHost "✓ Projekt-Ordner gefunden: $path" "Green"
            break
        }
    }
    
    if ($null -eq $foundPath) {
        Write-ColorHost "⚠ Kein Projekt-Ordner gefunden. Erstelle neuen Ordner..." "Yellow"
        $defaultPath = "C:\Projekte\BirthdayManager"
        
        try {
            if (-not (Test-Path "C:\Projekte")) {
                New-Item -ItemType Directory -Path "C:\Projekte" -Force | Out-Null
            }
            New-Item -ItemType Directory -Path $defaultPath -Force | Out-Null
            $ProjectPath = $defaultPath
            Write-ColorHost "✓ Projekt-Ordner erstellt: $defaultPath" "Green"
        } catch {
            $ProjectPath = "$env:USERPROFILE\Documents\BirthdayManager"
            New-Item -ItemType Directory -Path $ProjectPath -Force | Out-Null
            Write-ColorHost "✓ Projekt-Ordner erstellt: $ProjectPath" "Green"
        }
    } else {
        $ProjectPath = $foundPath
    }
}

# HTML-Datei prüfen
$htmlPath = Join-Path $ProjectPath "BirthdayManager.html"
if (Test-Path $htmlPath) {
    Write-ColorHost "✓ BirthdayManager.html gefunden" "Green"
} else {
    Write-ColorHost "⚠ BirthdayManager.html nicht gefunden in: $ProjectPath" "Yellow"
    Write-ColorHost "  Bitte kopieren Sie die HTML-Datei in diesen Ordner." "Gray"
}

Write-ColorHost ""
Write-ColorHost "═══════════════════════════════════════════════════════════" "Cyan"
Write-ColorHost ""

# Erforderliche Assemblies laden
try {
    Add-Type -AssemblyName System.Web
    Write-ColorHost "✓ System.Web Assembly geladen" "Green"
} catch {
    Write-ColorHost "✗ Fehler beim Laden der Assemblies: $_" "Red"
    Write-ColorHost "  Installiere .NET Framework falls nötig" "Yellow"
    exit 1
}

# HTTP Listener erstellen
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Prefixes.Add("http://127.0.0.1:$Port/")

Write-ColorHost ""
Write-ColorHost "▶ Server startet auf Port $Port..." "Yellow"

try {
    $listener.Start()
    Write-ColorHost "✓ Server erfolgreich gestartet!" "Green"
    Write-ColorHost ""
    Write-ColorHost "═══════════════════════════════════════════════════════════" "Cyan"
    Write-ColorHost "  URLs:" "White"
    Write-ColorHost "  • http://localhost:$Port" "Cyan"
    Write-ColorHost "  • http://127.0.0.1:$Port" "Cyan"
    Write-ColorHost ""
    Write-ColorHost "  HTML öffnen:" "White"
    Write-ColorHost "  • file:///$($htmlPath.Replace('\','/'))" "Cyan"
    Write-ColorHost "═══════════════════════════════════════════════════════════" "Cyan"
    Write-ColorHost ""
    Write-ColorHost "  Drücken Sie Strg+C zum Beenden" "Yellow"
    Write-ColorHost ""
    Write-ColorHost "▼ Server-Log:" "White"
    Write-ColorHost "─────────────────────────────────────────────────────────────" "DarkGray"
    
    # Request-Zähler
    $requestCount = 0
    
    while ($listener.IsListening) {
        # Auf Anfragen warten
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        $requestCount++
        
        # CORS Headers hinzufügen (wichtig für Browser)
        $response.Headers.Add("Access-Control-Allow-Origin", "*")
        $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Accept")
        $response.Headers.Add("Access-Control-Max-Age", "86400")
        
        $url = $request.Url.AbsolutePath
        $method = $request.HttpMethod
        $timestamp = Get-Date -Format "HH:mm:ss"
        
        # Log mit Farben
        $logColor = switch ($method) {
            "GET"     { "Cyan" }
            "POST"    { "Green" }
            "OPTIONS" { "Gray" }
            default   { "White" }
        }
        
        Write-Host "[$timestamp] " -NoNewline -ForegroundColor DarkGray
        Write-Host "#$requestCount " -NoNewline -ForegroundColor DarkYellow
        Write-Host "$method " -NoNewline -ForegroundColor $logColor
        Write-Host "$url" -ForegroundColor White
        
        # OPTIONS Requests (CORS Preflight)
        if ($method -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }
        
        # Verschiedene Endpoints behandeln
        switch -Regex ($url) {
            "^/status$" {
                # Status Check - wichtig für die App
                $statusResponse = @{
                    status = "online"
                    port = $Port
                    timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
                    whatsapp = "ready"
                    projectPath = $ProjectPath
                    requestCount = $requestCount
                    version = "2.0"
                } | ConvertTo-Json
                
                $bytes = [Text.Encoding]::UTF8.GetBytes($statusResponse)
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                
                Write-Host "  → Status: OK" -ForegroundColor Green
            }
            
            "^/send-whatsapp$" {
                # WhatsApp Nachricht an einzelne Person
                if ($method -eq "POST") {
                    $streamReader = New-Object System.IO.StreamReader($request.InputStream)
                    $postData = $streamReader.ReadToEnd()
                    $streamReader.Close()
                    
                    try {
                        $data = $postData | ConvertFrom-Json
                        $phoneNumber = $data.phone
                        $message = $data.message
                        $name = $data.name
                        
                        # Telefonnummer bereinigen (nur Zahlen)
                        $phoneNumber = $phoneNumber -replace '[^\d]', ''
                        
                        # WhatsApp URL erstellen
                        $encodedMessage = [System.Web.HttpUtility]::UrlEncode($message)
                        $whatsappUrl = "https://wa.me/$phoneNumber`?text=$encodedMessage"
                        
                        # WhatsApp im Standard-Browser öffnen
                        Start-Process $whatsappUrl
                        
                        Write-Host "  → WhatsApp geöffnet für: " -NoNewline -ForegroundColor Green
                        Write-Host "$name ($phoneNumber)" -ForegroundColor Yellow
                        
                        $successResponse = @{
                            success = $true
                            message = "WhatsApp wurde geöffnet"
                            phone = $phoneNumber
                            name = $name
                            url = $whatsappUrl
                        } | ConvertTo-Json
                        
                        $bytes = [Text.Encoding]::UTF8.GetBytes($successResponse)
                        $response.ContentType = "application/json; charset=utf-8"
                        $response.ContentLength64 = $bytes.Length
                        $response.OutputStream.Write($bytes, 0, $bytes.Length)
                    }
                    catch {
                        Write-Host "  ✗ Fehler: $_" -ForegroundColor Red
                        
                        $errorResponse = @{
                            success = $false
                            error = $_.Exception.Message
                        } | ConvertTo-Json
                        
                        $response.StatusCode = 400
                        $bytes = [Text.Encoding]::UTF8.GetBytes($errorResponse)
                        $response.ContentType = "application/json; charset=utf-8"
                        $response.ContentLength64 = $bytes.Length
                        $response.OutputStream.Write($bytes, 0, $bytes.Length)
                    }
                }
                else {
                    $response.StatusCode = 405
                    $bytes = [Text.Encoding]::UTF8.GetBytes("Method Not Allowed")
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            }
            
            "^/send-group$" {
                # Gruppen-Nachricht senden
                if ($method -eq "POST") {
                    $streamReader = New-Object System.IO.StreamReader($request.InputStream)
                    $postData = $streamReader.ReadToEnd()
                    $streamReader.Close()
                    
                    try {
                        $data = $postData | ConvertFrom-Json
                        $message = $data.message
                        $bereich = $data.bereich
                        
                        # WhatsApp Web URL für Gruppen
                        $encodedMessage = [System.Web.HttpUtility]::UrlEncode($message)
                        
                        # Zuerst in Zwischenablage kopieren
                        $message | Set-Clipboard
                        
                        # WhatsApp Web öffnen
                        $whatsappUrl = "https://web.whatsapp.com/"
                        Start-Process $whatsappUrl
                        
                        Write-Host "  → WhatsApp Web geöffnet" -ForegroundColor Green
                        Write-Host "  → Nachricht in Zwischenablage" -ForegroundColor Green
                        if ($bereich -ne "all") {
                            Write-Host "  → Bereich: $bereich" -ForegroundColor Yellow
                        }
                        
                        $successResponse = @{
                            success = $true
                            message = "WhatsApp Web wurde geöffnet. Nachricht in Zwischenablage."
                            bereich = $bereich
                            clipboard = $true
                        } | ConvertTo-Json
                        
                        $bytes = [Text.Encoding]::UTF8.GetBytes($successResponse)
                        $response.ContentType = "application/json; charset=utf-8"
                        $response.ContentLength64 = $bytes.Length
                        $response.OutputStream.Write($bytes, 0, $bytes.Length)
                    }
                    catch {
                        Write-Host "  ✗ Fehler: $_" -ForegroundColor Red
                        
                        $errorResponse = @{
                            success = $false
                            error = $_.Exception.Message
                        } | ConvertTo-Json
                        
                        $response.StatusCode = 400
                        $bytes = [Text.Encoding]::UTF8.GetBytes($errorResponse)
                        $response.ContentType = "application/json; charset=utf-8"
                        $response.ContentLength64 = $bytes.Length
                        $response.OutputStream.Write($bytes, 0, $bytes.Length)
                    }
                }
            }
            
            "^/open-html$" {
                # HTML-Datei im Browser öffnen
                if (Test-Path $htmlPath) {
                    Start-Process $htmlPath
                    Write-Host "  → HTML geöffnet" -ForegroundColor Green
                    
                    $response.StatusCode = 200
                    $bytes = [Text.Encoding]::UTF8.GetBytes('{"success": true}')
                    $response.ContentType = "application/json"
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                } else {
                    $response.StatusCode = 404
                    $bytes = [Text.Encoding]::UTF8.GetBytes('{"success": false, "error": "HTML not found"}')
                    $response.ContentType = "application/json"
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            }
            
            "^/$" {
                # Root - Zeige Willkommensnachricht
                $welcome = @"
<!DOCTYPE html>
<html>
<head>
    <title>Birthday Manager Server</title>
    <style>
        body { font-family: Arial; padding: 20px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
        .container { max-width: 600px; margin: auto; background: white; color: #333; padding: 30px; border-radius: 10px; }
        h1 { color: #667eea; }
        .status { background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 20px 0; }
        code { background: #f0f0f0; padding: 2px 5px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎂 Birthday Manager WhatsApp Server</h1>
        <div class="status">✓ Server läuft auf Port $Port</div>
        <p><strong>Projekt-Ordner:</strong> <code>$ProjectPath</code></p>
        <p><strong>Verfügbare Endpoints:</strong></p>
        <ul>
            <li><code>GET /status</code> - Server-Status</li>
            <li><code>POST /send-whatsapp</code> - Direktnachricht senden</li>
            <li><code>POST /send-group</code> - Gruppennachricht senden</li>
            <li><code>GET /open-html</code> - HTML öffnen</li>
        </ul>
    </div>
</body>
</html>
"@
                $bytes = [Text.Encoding]::UTF8.GetBytes($welcome)
                $response.ContentType = "text/html; charset=utf-8"
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
            
            default {
                # 404 für unbekannte Pfade
                Write-Host "  ✗ 404 Not Found" -ForegroundColor Red
                $response.StatusCode = 404
                $errorHtml = @"
<!DOCTYPE html>
<html>
<head><title>404</title></head>
<body style="font-family: Arial; text-align: center; padding: 50px;">
    <h1>404 - Nicht gefunden</h1>
    <p>Endpoint: $url</p>
    <a href="/">Zur Startseite</a>
</body>
</html>
"@
                $bytes = [Text.Encoding]::UTF8.GetBytes($errorHtml)
                $response.ContentType = "text/html; charset=utf-8"
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
        }
        
        $response.Close()
    }
}
catch [System.Net.HttpListenerException] {
    Write-ColorHost "" "White"
    Write-ColorHost "✗ Port $Port ist bereits belegt!" "Red"
    Write-ColorHost "  Mögliche Lösungen:" "Yellow"
    Write-ColorHost "  1. Beenden Sie andere Programme auf diesem Port" "White"
    Write-ColorHost "  2. Verwenden Sie einen anderen Port:" "White"
    Write-ColorHost "     .\server_improved.ps1 -Port 8080" "Cyan"
    Write-ColorHost "" "White"
}
catch {
    Write-ColorHost "" "White"
    Write-ColorHost "✗ Server-Fehler: $_" "Red"
    Write-ColorHost "" "White"
}
finally {
    if ($listener.IsListening) {
        $listener.Stop()
        $listener.Close()
    }
    Write-ColorHost "" "White"
    Write-ColorHost "─────────────────────────────────────────────────────────────" "DarkGray"
    Write-ColorHost "Server wurde beendet. ($requestCount Anfragen bearbeitet)" "Yellow"
    Write-ColorHost "" "White"
    
    # Kurz warten bevor Fenster schließt
    Start-Sleep -Seconds 2
}
