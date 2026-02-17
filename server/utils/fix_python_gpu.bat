@echo off
setlocal

:: This script reinstall llama-cpp-python with CUDA support using the abetlen index.
:: Use this if the library-based approach is required instead of the standalone server.

echo [1/3] Navigating to server directory...
cd /d "%~dp0\.."

if not exist venv (
    echo [ERROR] Virtual environment 'venv' not found.
    pause
    exit /b
)

echo [2/3] Uninstalling current llama-cpp-python...
venv\Scripts\python -m pip uninstall llama-cpp-python -y

echo [3/3] Reinstalling llama-cpp-python v0.3.4 with CUDA Support...
venv\Scripts\python -m pip install llama-cpp-python==0.3.4 --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cu124

echo.
echo ========================================================
echo GPU reinstallation attempt complete.
echo Please run 'utils\check_gpu.py' to verify.
echo ========================================================
pause
