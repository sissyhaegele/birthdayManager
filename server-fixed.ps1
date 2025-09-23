$Port = 8888
Write-Host "WhatsApp Server auf Port $Port" -ForegroundColor Green
Write-Host "http://localhost:$Port" -ForegroundColor Yellow

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
$listener.Prefixes.Add("http://+:$Port/")
$listener.Start()

Write-Host "[OK] Server gestartet" -ForegroundColor Green

while ($true) {
    $context = $listener.GetContext()
    $response = $context.Response
    
    # Wichtige CORS Headers
    $response.Headers.Add("Access-Control-Allow-Origin", "*")
    $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")
    
    $url = $context.Request.Url.LocalPath
    $method = $context.Request.HttpMethod
    
    Write-Host "[$method] $url" -ForegroundColor Cyan
    
    # OPTIONS für CORS Preflight
    if ($method -eq "OPTIONS") {
        $response.StatusCode = 200
        $response.Close()
        continue
    }
    
    if ($url -eq "/status") {
        $json = '{"status":"online","server":"WhatsApp Server aktiv"}'
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($json)
        $response.ContentType = "application/json"
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
        Write-Host "  [OK] Status gesendet" -ForegroundColor Green
    }
    elseif ($url -eq "/send") {
        try {
            $reader = New-Object System.IO.StreamReader($context.Request.InputStream)
            $body = $reader.ReadToEnd()
            $data = $body | ConvertFrom-Json
            
            # In Zwischenablage
            Set-Clipboard -Value $data.message
            Write-Host "  [OK] Nachricht kopiert" -ForegroundColor Green
            
            # WhatsApp öffnen
            Start-Process "whatsapp://"
            
            $json = '{"status":"success","message":"Copied to clipboard"}'
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($json)
            $response.ContentType = "application/json"
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        catch {
            Write-Host "  [ERROR] $_" -ForegroundColor Red
            $response.StatusCode = 500
        }
    }
    else {
        $response.StatusCode = 404
    }
    
    $response.Close()
}
