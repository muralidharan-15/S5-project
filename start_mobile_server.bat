@echo off
title Flood Alert - Mobile Live Server Launcher
color 0b

echo ====================================================================
echo      Tamil Nadu Flood Alert System - Live Mobile Server
echo ====================================================================
echo.

REM Determine Project Root Directory
set "PROJECT_DIR=C:\Users\mural\Downloads\Flood_Alert_System"
if exist "%~dp0backend" (
    set "PROJECT_DIR=%~dp0"
)

REM 1. Clean up any previous lingering processes to prevent conflict
echo Stopping any previous ngrok or backend instances...
taskkill /f /im ngrok.exe 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a 2>nul
)
timeout /t 1 /nobreak >nul

echo Starting Backend (FastAPI + ML Model) on port 8000...
start "Flood Alert - Backend API" cmd /k "cd /d "%PROJECT_DIR%\backend" && python run.py"

echo Waiting 3 seconds for backend initialization...
timeout /t 3 /nobreak >nul

echo Starting Live Ngrok Tunnel (cargo-humbly-bubbling.ngrok-free.dev)...
start "Flood Alert - Ngrok Tunnel" cmd /k "ngrok http --domain=cargo-humbly-bubbling.ngrok-free.dev 8000"

echo.
echo ====================================================================
echo  [SUCCESS] All live services launched in separate windows!
echo  Mobile App Live Domain: https://cargo-humbly-bubbling.ngrok-free.dev
echo ====================================================================
echo Keep the opened windows running while using the mobile app.
echo You can close this window now.
echo.
pause
