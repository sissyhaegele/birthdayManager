# Birthday Manager Deployment Script for Windows
# Usage: .\deploy.ps1 [platform]

param(
    [Parameter(Position=0)]
    [string]$Platform = "help"
)

# Set colors for output
$Host.UI.RawUI.ForegroundColor = "White"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-Host ""
Write-Host "🎂 Birthday Manager Deployment Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if yarn is installed
function Test-YarnInstalled {
    try {
        $null = yarn --version 2>$null
        return $true
    }
    catch {
        return $false
    }
}

# Check if command exists
function Test-CommandExists {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

# Function to build the project
function Build-Project {
    Write-Host "📦 Building project..." -ForegroundColor Yellow
    
    # Install dependencies
    Write-Host "Installing dependencies..." -ForegroundColor Gray
    yarn install --frozen-lockfile
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
    
    # Build project
    Write-Host "Creating production build..." -ForegroundColor Gray
    yarn build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
}

# Function to deploy to Vercel
function Deploy-Vercel {
    Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
    
    # Check if Vercel CLI is installed
    if (-not (Test-CommandExists "vercel")) {
        Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
        yarn global add vercel
    }
    
    Build-Project
    
    # Deploy to Vercel
    vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployed to Vercel successfully!" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Vercel deployment failed!" -ForegroundColor Red
        exit 1
    }
}

# Function to deploy to Netlify
function Deploy-Netlify {
    Write-Host "🚀 Deploying to Netlify..." -ForegroundColor Yellow
    
    # Check if Netlify CLI is installed
    if (-not (Test-CommandExists "netlify")) {
        Write-Host "Installing Netlify CLI..." -ForegroundColor Yellow
        yarn global add netlify-cli
    }
    
    Build-Project
    
    # Deploy to Netlify
    netlify deploy --prod --dir=dist
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployed to Netlify successfully!" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Netlify deployment failed!" -ForegroundColor Red
        exit 1
    }
}

# Function to deploy with Docker
function Deploy-Docker {
    Write-Host "🐳 Building Docker image..." -ForegroundColor Yellow
    
    # Check if Docker is installed
    if (-not (Test-CommandExists "docker")) {
        Write-Host "❌ Docker is not installed. Please install Docker Desktop for Windows." -ForegroundColor Red
        Write-Host "Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
        exit 1
    }
    
    # Build Docker image
    docker build -t birthday-manager .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker build failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Starting Docker container..." -ForegroundColor Yellow
    
    # Stop existing container if running
    docker stop birthday-manager 2>$null
    docker rm birthday-manager 2>$null
    
    # Run new container
    docker run -d -p 3001:80 --name birthday-manager birthday-manager
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker container is running!" -ForegroundColor Green
        Write-Host "📍 Access the app at: http://localhost:3001" -ForegroundColor Cyan
    }
    else {
        Write-Host "❌ Failed to start Docker container!" -ForegroundColor Red
        exit 1
    }
}

# Function to deploy to GitHub Pages
function Deploy-GitHubPages {
    Write-Host "🚀 Deploying to GitHub Pages..." -ForegroundColor Yellow
    
    # Check if gh-pages is installed
    $ghPagesInstalled = yarn list gh-pages 2>$null | Select-String "gh-pages"
    
    if (-not $ghPagesInstalled) {
        Write-Host "Installing gh-pages..." -ForegroundColor Yellow
        yarn add --dev gh-pages
    }
    
    Build-Project
    
    # Deploy to GitHub Pages
    npx gh-pages -d dist
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployed to GitHub Pages successfully!" -ForegroundColor Green
    }
    else {
        Write-Host "❌ GitHub Pages deployment failed!" -ForegroundColor Red
        exit 1
    }
}

# Function to create production bundle
function Create-Bundle {
    Write-Host "📦 Creating production bundle..." -ForegroundColor Yellow
    
    Build-Project
    
    # Create timestamp for filename
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $bundleName = "birthday-manager-$timestamp.zip"
    
    # Create zip file
    if (Test-Path "dist") {
        Compress-Archive -Path "dist\*" -DestinationPath $bundleName -Force
        
        Write-Host "✅ Production bundle created: $bundleName" -ForegroundColor Green
        Write-Host "You can upload this to any web server." -ForegroundColor Gray
        
        # Get file size
        $fileSize = (Get-Item $bundleName).Length / 1MB
        Write-Host "Bundle size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Gray
    }
    else {
        Write-Host "❌ Build directory not found!" -ForegroundColor Red
        exit 1
    }
}

# Function to run development server
function Start-DevServer {
    Write-Host "🔧 Starting development server..." -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
    yarn dev
}

# Function to preview production build
function Start-Preview {
    Write-Host "👁️ Previewing production build..." -ForegroundColor Yellow
    Build-Project
    Write-Host "Starting preview server..." -ForegroundColor Gray
    yarn preview
}

# Function to run tests
function Run-Tests {
    Write-Host "🧪 Running tests..." -ForegroundColor Yellow
    yarn test
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ All tests passed!" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Some tests failed!" -ForegroundColor Red
        exit 1
    }
}

# Function to run linter
function Run-Lint {
    Write-Host "🔍 Running linter..." -ForegroundColor Yellow
    yarn lint
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ No linting errors found!" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ Linting warnings/errors found!" -ForegroundColor Yellow
    }
}

# Function to install dependencies
function Install-Dependencies {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    yarn install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
}

# Function to clean build artifacts
function Clean-Build {
    Write-Host "🧹 Cleaning build artifacts..." -ForegroundColor Yellow
    
    if (Test-Path "dist") {
        Remove-Item -Recurse -Force "dist"
        Write-Host "Removed dist folder" -ForegroundColor Gray
    }
    
    if (Test-Path "node_modules") {
        Write-Host "Removing node_modules..." -ForegroundColor Gray
        Remove-Item -Recurse -Force "node_modules"
        Write-Host "Removed node_modules folder" -ForegroundColor Gray
    }
    
    if (Test-Path ".cache") {
        Remove-Item -Recurse -Force ".cache"
        Write-Host "Removed .cache folder" -ForegroundColor Gray
    }
    
    Write-Host "✅ Cleanup completed!" -ForegroundColor Green
}

# Function to show help
function Show-Help {
    Write-Host "Birthday Manager Deployment Options" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\deploy.ps1 [platform]" -ForegroundColor White
    Write-Host ""
    Write-Host "Available platforms:" -ForegroundColor Yellow
    Write-Host "  vercel       - Deploy to Vercel" -ForegroundColor Gray
    Write-Host "  netlify      - Deploy to Netlify" -ForegroundColor Gray
    Write-Host "  docker       - Deploy with Docker" -ForegroundColor Gray
    Write-Host "  gh-pages     - Deploy to GitHub Pages" -ForegroundColor Gray
    Write-Host "  bundle       - Create deployment bundle (.zip)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Development commands:" -ForegroundColor Yellow
    Write-Host "  dev          - Start development server" -ForegroundColor Gray
    Write-Host "  preview      - Preview production build" -ForegroundColor Gray
    Write-Host "  build        - Build project only" -ForegroundColor Gray
    Write-Host "  install      - Install dependencies" -ForegroundColor Gray
    Write-Host "  lint         - Run linter" -ForegroundColor Gray
    Write-Host "  clean        - Clean build artifacts" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\deploy.ps1 vercel" -ForegroundColor Gray
    Write-Host "  .\deploy.ps1 dev" -ForegroundColor Gray
    Write-Host "  .\deploy.ps1 bundle" -ForegroundColor Gray
    Write-Host ""
}

# Check if yarn is installed
if (-not (Test-YarnInstalled)) {
    Write-Host "❌ Yarn is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Yarn using one of these methods:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Using npm (if Node.js is installed):" -ForegroundColor Cyan
    Write-Host "  npm install -g yarn" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 2: Using Chocolatey:" -ForegroundColor Cyan
    Write-Host "  choco install yarn" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 3: Download installer from:" -ForegroundColor Cyan
    Write-Host "  https://yarnpkg.com/latest.msi" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# Main script logic - Execute based on platform parameter
switch ($Platform.ToLower()) {
    "vercel" {
        Deploy-Vercel
    }
    "netlify" {
        Deploy-Netlify
    }
    "docker" {
        Deploy-Docker
    }
    { $_ -in "github-pages", "gh-pages" } {
        Deploy-GitHubPages
    }
    "bundle" {
        Create-Bundle
    }
    "dev" {
        Start-DevServer
    }
    "preview" {
        Start-Preview
    }
    "build" {
        Build-Project
    }
    "test" {
        Run-Tests
    }
    "lint" {
        Run-Lint
    }
    "install" {
        Install-Dependencies
    }
    "clean" {
        Clean-Build
    }
    default {
        Show-Help
    }
}
