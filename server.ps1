# WhatsApp Server für BirthdayManager
param([int]$Port = 8888)

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   WhatsApp Server für BirthdayManager" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server läuft auf: http://localhost:$Port" -ForegroundColor Green
Write-Host "Drücken Sie Strg+C zum Beenden" -ForegroundColor Yellow
Write-Host ""

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
}
"@

Write-Host "[OK] Server gestartet - Warte auf Anfragen..." -ForegroundColor Green
Write-Host ""

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # CORS Header
        $response.Headers.Add("Access-Control-Allow-Origin", "*")
        $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")
        
        $url = $request.Url.LocalPath
        Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] $($request.HttpMethod) $url" -ForegroundColor Cyan
        
        # OPTIONS Request (CORS Preflight)
        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }
        
        $responseData = ""
        
        switch ($url) {
            "/send" {
                if ($request.HttpMethod -eq "POST") {
                    $reader = New-Object System.IO.StreamReader($request.InputStream)
                    $body = $reader.ReadToEnd()
                    $reader.Close()
                    
                    try {
                        $data = $body | ConvertFrom-Json
                        $message = $data.message
                        
                        # Nachricht in Zwischenablage
                        $message | Set-Clipboard
                        Write-Host "    [OK] Nachricht kopiert" -ForegroundColor Green
                        
                        # WhatsApp öffnen
                        Start-Process "shell:AppsFolder\5319275A.WhatsAppDesktop_cv1g1gvanyjgm!App" -ErrorAction SilentlyContinue
                        Start-Sleep -Seconds 2
                        
                        # WhatsApp in Vordergrund
                        $whatsapp = Get-Process "WhatsApp" -ErrorAction SilentlyContinue
                        if ($whatsapp) {
                            [Win32]::SetForegroundWindow($whatsapp.MainWindowHandle) | Out-Null
                            Write-Host "    [OK] WhatsApp geöffnet" -ForegroundColor Green
                        }
                        
                        $responseData = '{"status":"success","message":"WhatsApp geöffnet"}'
                    } catch {
                        Write-Host "    [ERROR] $_" -ForegroundColor Red
                        $responseData = '{"status":"error","message":"Fehler beim Verarbeiten"}'
                    }
                }
            }
            
            "/status" {
                $responseData = '{"status":"online","server":"WhatsApp Server aktiv"}'
                Write-Host "    [OK] Status abgefragt" -ForegroundColor Gray
            }
            
            "/test" {
                "Test-Nachricht" | Set-Clipboard
                $responseData = '{"status":"success","message":"Test erfolgreich"}'
                Write-Host "    [OK] Test durchgeführt" -ForegroundColor Green
            }
            
            default {
                $responseData = '{"status":"error","message":"Unbekannte Route"}'
                Write-Host "    [!] Unbekannte Route: $url" -ForegroundColor Yellow
            }
        }
        
        # Response senden
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($responseData)
        $response.ContentType = "application/json"
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
        $response.Close()
        
    } catch {
        Write-Host "[ERROR] $_" -ForegroundColor Red
        if ($response) {
            $response.StatusCode = 500
            $response.Close()
        }
    }
}