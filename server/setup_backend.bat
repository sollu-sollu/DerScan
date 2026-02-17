@echo off
echo ==========================================
echo      DerScan AI Backend Setup (CUDA 13.0)
echo ==========================================

echo [1/5] Creating virtual environment...
if not exist "venv" python -m venv venv

echo [2/5] Activating venv...
call venv\Scripts\activate

echo [3/5] Upgrading pip...
python -m pip install --upgrade pip

echo [4/6] Installing CUDA 12.4 llama-cpp-python...
pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cu124

echo [5/6] Downloading CUDA Runtime DLLs...
python install_cuda_libs.py

echo [6/6] Installing other dependencies...
pip install -r requirements.txt

echo ==========================================
echo           Setup Complete!
echo ==========================================
echo.
echo To start the server, run:
echo   call venv\Scripts\activate
echo   python main.py
echo ==========================================
pause
