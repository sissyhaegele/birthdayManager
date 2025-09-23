# WhatsApp Server für Birthday Manager
# Korrigierte Version - Behebt Try-Catch Fehler
# Starten: .\server_fixed.ps1
# Server läuft auf http://localhost:9999

param(
    [Parameter(Mandatory=$false)]
    [int]$Port = 9999
)

# Konsole konfigurieren
$Host.UI.RawUI.WindowTitle = "Birthday Manager WhatsApp Server - Port $Port"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Banner anzeigen
Clear-Host
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "           Birthday Manager WhatsApp Server v1.0               " -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Erforderliche Module prüfen
try {
    Add-Type -AssemblyName System.Web
    Write-Host "[OK] System.Web Assembly geladen" -ForegroundColor Green
}
catch {
    Write-Host "[FEHLER] Konnte System.Web nicht laden: $_" -ForegroundColor Red
    Write-Host "Beende..." -ForegroundColor Yellow
    exit 1
}

# HTTP Listener erstellen
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")

Write-Host "WhatsApp Server startet auf Port $Port..." -ForegroundColor Green
Write-Host "Verwende Strg+C zum Beenden" -ForegroundColor Yellow
Write-Host ""

# Request-Zähler initialisieren
$requestCount = 0

try {
    $listener.Start()
    Write-Host "[OK] Server erfolgreich gestartet: http://localhost:$Port" -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    
    while ($listener.IsListening) {
        try {
            # Auf Anfragen warten
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            $requestCount++
            
            # CORS Headers hinzufügen
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")
            
            $url = $request.Url.AbsolutePath
            $method = $request.HttpMethod
            
            Write-Host "$(Get-Date -Format 'HH:mm:ss') - Request #$requestCount - $method $url" -ForegroundColor Cyan
            
            # OPTIONS Request (CORS Preflight)
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
                    } | ConvertTo-Json
                    
                    $bytes = [Text.Encoding]::UTF8.GetBytes($statusResponse)
                    $response.ContentType = "application/json; charset=utf-8"
                    $response.ContentLength64 = $bytes.Length
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                    Write-Host "  -> Status check erfolgreich" -ForegroundColor Green
                }
                
                "^/send$" {
                    # Legacy Endpoint für alte HTML Version
                    if ($method -eq "POST") {
                        $streamReader = New-Object System.IO.StreamReader($request.InputStream)
                        $postData = $streamReader.ReadToEnd()
                        $streamReader.Close()
                        
                        try {
                            $data = $postData | ConvertFrom-Json
                            $message = $data.message
                            
                            # Nachricht in Zwischenablage
                            $message | Set-Clipboard
                            
                            # WhatsApp Web öffnen
                            Start-Process "https://web.whatsapp.com/"
                            
                            Write-Host "  -> WhatsApp Web geöffnet, Nachricht in Zwischenablage" -ForegroundColor Green
                            
                            $successResponse = @{
                                success = $true
                                message = "WhatsApp wurde geöffnet"
                            } | ConvertTo-Json
                            
                            $bytes = [Text.Encoding]::UTF8.GetBytes($successResponse)
                            $response.ContentType = "application/json; charset=utf-8"
                            $response.ContentLength64 = $bytes.Length
                            $response.OutputStream.Write($bytes, 0, $bytes.Length)
                        }
                        catch {
                            Write-Host "  -> Fehler: $_" -ForegroundColor Red
                            $response.StatusCode = 400
                            $errorResponse = @{
                                success = $false
                                error = $_.Exception.Message
                            } | ConvertTo-Json
                            
                            $bytes = [Text.Encoding]::UTF8.GetBytes($errorResponse)
                            $response.ContentType = "application/json; charset=utf-8"
                            $response.ContentLength64 = $bytes.Length
                            $response.OutputStream.Write($bytes, 0, $bytes.Length)
                        }
                    }
                }
                
                "^/send-whatsapp$" {
                    # WhatsApp Nachricht senden (Direkt)
                    if ($method -eq "POST") {
                        $streamReader = New-Object System.IO.StreamReader($request.InputStream)
                        $postData = $streamReader.ReadToEnd()
                        $streamReader.Close()
                        
                        try {
                            $data = $postData | ConvertFrom-Json
                            $phoneNumber = $data.phone
                            $message = $data.message
                            $name = $data.name
                            
                            # WhatsApp URL erstellen
                            $encodedMessage = [System.Web.HttpUtility]::UrlEncode($message)
                            $whatsappUrl = "https://wa.me/$phoneNumber`?text=$encodedMessage"
                            
                            # WhatsApp im Standard-Browser öffnen
                            Start-Process $whatsappUrl
                            
                            Write-Host "  -> WhatsApp geöffnet für $name ($phoneNumber)" -ForegroundColor Green
                            
                            $successResponse = @{
                                success = $true
                                message = "WhatsApp wurde geöffnet"
                                phone = $phoneNumber
                                name = $name
                            } | ConvertTo-Json
                            
                            $bytes = [Text.Encoding]::UTF8.GetBytes($successResponse)
                            $response.ContentType = "application/json; charset=utf-8"
                            $response.ContentLength64 = $bytes.Length
                            $response.OutputStream.Write($bytes, 0, $bytes.Length)
                        }
                        catch {
                            Write-Host "  -> Fehler beim Senden: $_" -ForegroundColor Red
                            
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
                            $groupId = $data.groupId
                            $message = $data.message
                            $bereich = $data.bereich
                            
                            # Nachricht in Zwischenablage
                            $message | Set-Clipboard
                            
                            # WhatsApp Web öffnen
                            Start-Process "https://web.whatsapp.com/"
                            
                            Write-Host "  -> WhatsApp Gruppe geöffnet für Bereich: $bereich" -ForegroundColor Green
                            Write-Host "  -> Nachricht in Zwischenablage kopiert" -ForegroundColor Yellow
                            
                            $successResponse = @{
                                success = $true
                                message = "WhatsApp Gruppe wurde geöffnet"
                                bereich = $bereich
                                clipboard = $true
                            } | ConvertTo-Json
                            
                            $bytes = [Text.Encoding]::UTF8.GetBytes($successResponse)
                            $response.ContentType = "application/json; charset=utf-8"
                            $response.ContentLength64 = $bytes.Length
                            $response.OutputStream.Write($bytes, 0, $bytes.Length)
                        }
                        catch {
                            Write-Host "  -> Fehler beim Senden: $_" -ForegroundColor Red
                            
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
                
                "^/$" {
                    # Root - Willkommensnachricht
                    $welcome = @"
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Birthday Manager Server</title>
    <style>
        body { 
            font-family: 'Segoe UI', Arial; 
            background: linear-gradient(135deg, #667eea, #764ba2); 
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }
        .container { 
            background: white; 
            color: #333; 
            padding: 40px; 
            border-radius: 15px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 600px;
        }
        h1 { color: #667eea; margin-top: 0; }
        .status { 
            background: #d4edda; 
            color: #155724; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0; 
            font-weight: bold;
        }
        code { 
            background: #f0f0f0; 
            padding: 3px 8px; 
            border-radius: 4px; 
            font-family: 'Courier New', monospace;
        }
        ul { line-height: 2; }
        .endpoint { 
            background: #f8f9fa; 
            padding: 8px; 
            border-left: 4px solid #667eea; 
            margin: 10px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎂 Birthday Manager WhatsApp Server</h1>
        <div class="status">✓ Server läuft auf Port $Port</div>
        <p><strong>Verfügbare Endpoints:</strong></p>
        <div class="endpoint">GET <code>/status</code> - Server-Status prüfen</div>
        <div class="endpoint">POST <code>/send-whatsapp</code> - Direktnachricht senden</div>
        <div class="endpoint">POST <code>/send-group</code> - Gruppennachricht senden</div>
        <div class="endpoint">POST <code>/send</code> - Legacy Endpoint (Kompatibilität)</div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
        <p style="color: #666; font-size: 14px;">
            Requests verarbeitet: <strong>$requestCount</strong><br>
            Server gestartet: <strong>$(Get-Date -Format 'HH:mm:ss')</strong>
        </p>
    </div>
</body>
</html>
"@
                    $bytes = [Text.Encoding]::UTF8.GetBytes($welcome)
                    $response.ContentType = "text/html; charset=utf-8"
                    $response.ContentLength64 = $bytes.Length
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                    Write-Host "  -> Willkommensseite angezeigt" -ForegroundColor Green
                }
                
                default {
                    # 404 für unbekannte Pfade
                    Write-Host "  -> 404 Not Found: $url" -ForegroundColor Red
                    $response.StatusCode = 404
                    $bytes = [Text.Encoding]::UTF8.GetBytes("Not Found")
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            }
            
            $response.Close()
        }
        catch [System.Management.Automation.RuntimeException] {
            # Ignoriere Abbruch durch Strg+C
            if ($_.Exception.Message -like "*Abbruch*") {
                break
            }
            Write-Host "Request-Fehler: $_" -ForegroundColor Yellow
        }
        catch {
            Write-Host "Request-Fehler: $_" -ForegroundColor Yellow
        }
    }
}
catch [System.Net.HttpListenerException] {
    Write-Host ""
    Write-Host "[FEHLER] Port $Port ist bereits belegt!" -ForegroundColor Red
    Write-Host "Mögliche Lösungen:" -ForegroundColor Yellow
    Write-Host "  1. Beenden Sie andere Programme auf diesem Port" -ForegroundColor White
    Write-Host "  2. Verwenden Sie einen anderen Port:" -ForegroundColor White
    Write-Host "     .\server.ps1 -Port 8080" -ForegroundColor Cyan
    Write-Host ""
}
catch {
    Write-Host "[FEHLER] Server-Fehler: $_" -ForegroundColor Red
}
finally {
    if ($null -ne $listener) {
        if ($listener.IsListening) {
            $listener.Stop()
            $listener.Close()
        }
    }
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "Server wurde beendet. ($requestCount Anfragen verarbeitet)" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Kurz warten bevor das Fenster schließt
    Start-Sleep -Seconds 2
}
