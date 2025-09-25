# Birthday Manager Quick Start for Windows
# Double-click or run this script to quickly start the development server

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🎂 Birthday Manager Quick Start" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if yarn is installed
try {
    $yarnVersion = yarn --version 2>$null
    Write-Host "✅ Yarn found (version $yarnVersion)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Yarn is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installing Yarn via npm..." -ForegroundColor Yellow
    
    try {
        npm install -g yarn
        Write-Host "✅ Yarn installed successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to install Yarn!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install Yarn manually:" -ForegroundColor Yellow
        Write-Host "1. Download from: https://yarnpkg.com/latest.msi" -ForegroundColor Gray
        Write-Host "2. Or run: npm install -g yarn" -ForegroundColor Gray
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "📦 Installing dependencies (first time setup)..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Gray
    Write-Host ""
    
    yarn install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
}

# Start the development server
Write-Host ""
Write-Host "🚀 Starting development server..." -ForegroundColor Green
Write-Host ""
Write-Host "The app will open in your browser at:" -ForegroundColor Cyan
Write-Host "http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Open browser automatically after 3 seconds
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:3001"
} | Out-Null

# Start the dev server
yarn dev
