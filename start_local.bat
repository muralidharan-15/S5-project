@echo off
title Flood Alert - Local Web Launcher
color 0a

echo ====================================================================
echo      Tamil Nadu Flood Alert System - Local Web Server
echo ====================================================================
echo.

REM Determine Project Root Directory
set "PROJECT_DIR=C:\Users\mural\Downloads\Flood_Alert_System"
if exist "%~dp0backend" (
    set "PROJECT_DIR=%~dp0"
)

REM 1. Clean up previous processes on ports 8000 and 5173
echo Cleaning up any old instances...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a 2>nul
)
timeout /t 1 /nobreak >nul

REM 2. Start Backend API (FastAPI + ML Model) on port 8000
echo [1/2] Starting Backend API on http://localhost:8000...
start "Flood Alert - Local Backend" cmd /k "cd /d "%PROJECT_DIR%\backend" && python run.py"

REM Wait 2 seconds for backend to start
timeout /t 2 /nobreak >nul

REM 3. Start Frontend Web Server (Vite + React) on port 5173
echo [2/2] Starting Frontend Web App on http://localhost:5173...
start "Flood Alert - Local Web Frontend" cmd /k "cd /d "%PROJECT_DIR%\frontend" && npm run dev"

REM Wait 2 seconds and open browser
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo ====================================================================
echo  [SUCCESS] Local services are now running!
echo   - Web App URL:    http://localhost:5173
echo   - Backend API:    http://localhost:8000/docs
echo ====================================================================
echo Keep the opened terminal windows open while using the app.
echo.
pause
