@echo off
setlocal

echo.
echo ===========================================
echo   DerScan AI — ngrok Tunnel Starter
echo ===========================================
echo.

:: Ensure we are in the server directory
cd /d "%~dp0\.."

:: Check if venv exists
if not exist "venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found. Please run setup_backend.bat first.
    pause
    exit /b
)

echo [ACTION] Verifying dependencies...
venv\Scripts\python -m pip install pyngrok python-dotenv >nul 2>&1

echo [ACTION] Starting Python-based tunnel...
echo.
venv\Scripts\python utils\ngrok_tunnel.py

pause
