@echo off
REM Birthday Manager Windows Deployment Script
REM Usage: deploy.bat [command]

setlocal EnableDelayedExpansion

echo.
echo  Birthday Manager Deployment
echo ==============================
echo.

REM Check if yarn is installed
where yarn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Yarn is not installed!
    echo.
    echo Please install Yarn first:
    echo   npm install -g yarn
    echo.
    echo Or download from: https://yarnpkg.com/latest.msi
    echo.
    pause
    exit /b 1
)

REM Parse command argument
set COMMAND=%1

if "%COMMAND%"=="" (
    goto :ShowHelp
)

REM Execute commands
if /i "%COMMAND%"=="dev" goto :RunDev
if /i "%COMMAND%"=="build" goto :RunBuild
if /i "%COMMAND%"=="preview" goto :RunPreview
if /i "%COMMAND%"=="install" goto :RunInstall
if /i "%COMMAND%"=="clean" goto :RunClean
if /i "%COMMAND%"=="bundle" goto :RunBundle
if /i "%COMMAND%"=="docker" goto :RunDocker
if /i "%COMMAND%"=="vercel" goto :RunVercel
if /i "%COMMAND%"=="netlify" goto :RunNetlify
if /i "%COMMAND%"=="help" goto :ShowHelp

echo Unknown command: %COMMAND%
goto :ShowHelp

:RunDev
echo Starting development server...
echo.
call yarn dev
goto :End

:RunBuild
echo Building production version...
echo.
call yarn install --frozen-lockfile
call yarn build
echo.
echo Build completed successfully!
goto :End

:RunPreview
echo Building and previewing production version...
echo.
call yarn install --frozen-lockfile
call yarn build
call yarn preview
goto :End

:RunInstall
echo Installing dependencies...
echo.
call yarn install
echo.
echo Dependencies installed successfully!
goto :End

:RunClean
echo Cleaning build artifacts...
echo.
if exist dist rmdir /s /q dist
if exist node_modules rmdir /s /q node_modules
echo.
echo Cleanup completed!
goto :End

:RunBundle
echo Creating production bundle...
echo.
call yarn install --frozen-lockfile
call yarn build

REM Create timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set datetime=%%a
set timestamp=%datetime:~0,8%_%datetime:~8,6%

REM Create zip file using PowerShell
powershell -Command "Compress-Archive -Path 'dist\*' -DestinationPath 'birthday-manager-%timestamp%.zip' -Force"

echo.
echo Bundle created: birthday-manager-%timestamp%.zip
goto :End

:RunDocker
echo Building Docker image...
echo.
docker --version >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not installed!
    echo Please install Docker Desktop for Windows
    echo Download from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

docker build -t birthday-manager .
echo.
echo Starting Docker container...
docker stop birthday-manager >nul 2>nul
docker rm birthday-manager >nul 2>nul
docker run -d -p 3001:80 --name birthday-manager birthday-manager

echo.
echo Docker container is running!
echo Access the app at: http://localhost:3001
goto :End

:RunVercel
echo Deploying to Vercel...
echo.
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing Vercel CLI...
    call yarn global add vercel
)

call yarn install --frozen-lockfile
call yarn build
call vercel --prod
echo.
echo Deployed to Vercel successfully!
goto :End

:RunNetlify
echo Deploying to Netlify...
echo.
where netlify >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing Netlify CLI...
    call yarn global add netlify-cli
)

call yarn install --frozen-lockfile
call yarn build
call netlify deploy --prod --dir=dist
echo.
echo Deployed to Netlify successfully!
goto :End

:ShowHelp
echo Birthday Manager - Windows Deployment
echo.
echo Usage: deploy.bat [command]
echo.
echo Available commands:
echo   dev        - Start development server
echo   build      - Build production version
echo   preview    - Preview production build
echo   install    - Install dependencies
echo   clean      - Clean build artifacts
echo   bundle     - Create deployment bundle (.zip)
echo   docker     - Deploy with Docker
echo   vercel     - Deploy to Vercel
echo   netlify    - Deploy to Netlify
echo   help       - Show this help message
echo.
echo Examples:
echo   deploy.bat dev
echo   deploy.bat build
echo   deploy.bat bundle
echo.

:End
endlocal
