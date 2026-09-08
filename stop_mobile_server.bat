@echo off
title Flood Alert - Stop Servers
color 0c

echo ====================================================================
echo      Stopping Tamil Nadu Flood Alert Live Servers...
echo ====================================================================
echo.

echo Stopping Ngrok tunnel...
taskkill /f /im ngrok.exe 2>nul

echo Stopping processes listening on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a 2>nul
)

echo.
echo ====================================================================
echo  [STOPPED] Backend and Ngrok have been closed!
echo ====================================================================
echo.
pause
