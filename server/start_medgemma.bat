@echo off
setlocal

echo.
echo ========================================================
echo   DerScan AI — MedGemma 4B GPU Server
echo ========================================================
echo.

:: Ensure we are in the server directory
cd /d "%~dp0"

echo [ACTION] Launching Model Server...
echo.
"bin\llama-server.exe" -m models/medgemma-4b-it_Q4_K_M.gguf --mmproj models/mmproj-medgemma-4b-it-F16.gguf -ngl 99 --port 8080 -c 4096

pause
