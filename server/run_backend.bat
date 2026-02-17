@echo off
setlocal

:: Unified Launcher for DerScan Backend
:: Ensure you are in the server directory

echo.
echo ========================================================
echo   DerScan AI Backend — Unified Launcher
echo ========================================================
echo.

:: Ensure we are in the server directory
cd /d "%~dp0"

:: 1. Launch MedGemma GPU Server in its own window
echo [1/2] Launching MedGemma GPU Server...
start "MedGemma GPU Server" start_medgemma.bat

:: Wait a few seconds for initialization
echo [WAIT] Giving the GPU server 5 seconds to initialize...
timeout /t 5 /nobreak >nul

:: 2. Launch FastAPI Backend in its own window
echo [2/2] Launching FastAPI Backend...
start "DerScan FastAPI Backend" cmd /k "venv\Scripts\python main.py"

echo.
echo ========================================================
echo   Both servers have been launched in separate windows.
echo   Check the new windows for logs and status.
echo ========================================================
echo.

pause
