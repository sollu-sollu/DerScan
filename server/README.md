# DerScan AI Backend — Setup & Usage Guide

This folder contains the FastAPI backend and AI inference engine for the DerScan mobile application. It uses a quantized **MedGemma 4B** model accelerated by **llama.cpp** (GPU/CUDA).

## 📋 Prerequisites

- **Python 3.11** (recommended for best wheel compatibility)
- **NVIDIA GPU** (8GB+ VRAM recommended)
- **CUDA Toolkit 12.4** installed on the system

## 🚀 One-Click Quick Start (Windows)

1. **Install Python backend**: Run `setup_backend.bat` in this folder. This creates the virtual environment and installs all dependencies.
2. **Download AI Binaries**: Run `utils\install_llama_server.py`. This will download `llama-server.exe` and the necessary CUDA DLLs into the `bin/` folder.
3. **Launch System**: Run `run_backend.bat`. This will:
   - Launch the MedGemma GPU Server in a separate window.
   - Start the FastAPI API in the current window.

---

## 📁 Directory Structure

- `bin/`: Contains the compiled `llama-server.exe` and specialized CUDA `ggml-*.dll` files.
- `models/`: Place your `.gguf` model files and vision projectors here.
- `utils/`: 
  - `check_gpu.py`: Verify if your system detects the GPU for AI.
  - `install_llama_server.py`: Automatically fetches the latest compatible llama binaries.
  - `fix_python_gpu.bat`: Troubleshooting script for Python-based CUDA installations.
- `main.py`: The FastAPI application that bridges the mobile app and AI model.

## 🛠️ Manual Installation (Optional)

If you prefer to set things up manually:

1. **Create Venv**: `python -m venv venv`
2. **Activate**: `venv\Scripts\activate`
3. **Install Deps**: `pip install -r requirements.txt`
4. **Download Model**:
   Download `medgemma-4b-it_Q4_K_M.gguf` from HuggingFace and place in `models/`.

## 🌐 API Endpoints

- **GET /health**: Check if the backend and AI model are ready.
- **POST /analyze**: Send an image (multipart/form-data) to get a structured AI diagnosis.

---

*For mobile app setup, refer to the root README.md.*
