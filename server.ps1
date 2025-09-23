Write-Host "WhatsApp Server startet..." -ForegroundColor Cyan
Write-Host ""

$http = [System.Net.HttpListener]::new()
$http.Prefixes.Add("http://localhost:8888/")
$http.Start()

Write-Host "Server läuft auf http://localhost:8888" -ForegroundColor Green
Write-Host "Strg+C zum Beenden" -ForegroundColor Yellow
Write-Host ""

while ($http.IsListening) {
    $context = $http.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    # CORS
    $response.AddHeader("Access-Control-Allow-Origin", "*")
    $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    
    Write-Host "Request: $($request.Url.LocalPath)" -ForegroundColor Gray
    
    if ($request.HttpMethod -eq "OPTIONS") {
        $response.StatusCode = 200
        $response.Close()
        continue
    }
    
    switch ($request.Url.LocalPath) {
        "/status" {
            $message = '{"status":"online"}'
            $buffer = [Text.Encoding]::UTF8.GetBytes($message)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.OutputStream.Close()
            Write-Host "  Status: OK" -ForegroundColor Green
        }
        
        "/send" {
            $reader = [System.IO.StreamReader]::new($request.InputStream)
            $body = $reader.ReadToEnd()
            $reader.Close()
            
            try {
                $json = $body | ConvertFrom-Json
                Set-Clipboard $json.message
                Write-Host "  Nachricht kopiert!" -ForegroundColor Green
                
                $message = '{"status":"success"}'
                $buffer = [Text.Encoding]::UTF8.GetBytes($message)
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                $response.OutputStream.Close()
            }
            catch {
                Write-Host "  Fehler: $_" -ForegroundColor Red
            }
        }
        
        default {
            $message = '{"error":"not found"}'
            $buffer = [Text.Encoding]::UTF8.GetBytes($message)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.OutputStream.Close()
        }
    }
    
    $response.Close()
}
