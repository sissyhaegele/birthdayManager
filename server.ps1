# WhatsApp Server fuer BirthdayManager
param([int]$Port = 8888)

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   WhatsApp Server - Port $Port" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server laeuft auf: http://localhost:$Port" -ForegroundColor Green
Write-Host "Druecken Sie Strg+C zum Beenden" -ForegroundColor Yellow
Write-Host ""

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host "[OK] Server gestartet" -ForegroundColor Green
Write-Host ""

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # CORS Header
        $response.Headers.Add("Access-Control-Allow-Origin", "*")
        
        $url = $request.Url.LocalPath
        Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] Request: $url" -ForegroundColor Cyan
        
        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }
        
        $responseData = ""
        
        if ($url -eq "/send") {
            $reader = New-Object System.IO.StreamReader($request.InputStream)
            $body = $reader.ReadToEnd()
            $reader.Close()
            
            $data = $body | ConvertFrom-Json
            $message = $data.message
            
            # Nachricht kopieren
            $message | Set-Clipboard
            Write-Host "    [OK] Nachricht kopiert" -ForegroundColor Green
            
            # WhatsApp oeffnen
            Start-Process "whatsapp://" -ErrorAction SilentlyContinue
            
            $responseData = '{"status":"success"}'
        }
        elseif ($url -eq "/status") {
            $responseData = '{"status":"online"}'
        }
        else {
            $responseData = '{"status":"error"}'
        }
        
        # Response senden
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($responseData)
        $response.ContentType = "application/json"
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
        $response.Close()
        
    } catch {
        Write-Host "[ERROR] $_" -ForegroundColor Red
    }
}