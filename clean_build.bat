@echo off
echo ==========================================
echo      DerScan: Force Clean & Build Script
echo ==========================================
echo.
echo [1/5] Stopping Gradle Daemons...
cd android
call gradlew --stop
cd ..

echo.
echo [2/5] Removing Android Build Folders...
if exist android\.gradle rmdir /s /q android\.gradle
if exist android\app\build rmdir /s /q android\app\build
if exist android\build rmdir /s /q android\build

echo.
echo [3/5] Cleaning Gradle Cache (Best Effort)...
echo NOTE: If this fails, please Restart Computer and run this script immediately.
rmdir /s /q "C:\Users\OG07\.gradle\caches\8.10.2\transforms" 2>nul
if exist "C:\Users\OG07\.gradle\caches\8.10.2\transforms" (
    echo WARNING: Could not fully delete transforms cache.
    echo Please RESTART your computer to release file locks.
) else (
    echo Cache cleaned successfully.
)

echo.
echo [4/5] Syncing Gradle...
cd android
call gradlew app:dependencies > nul
cd ..

echo.
echo [5/5] Building App...
npx react-native run-android

echo.
echo ==========================================
echo                 Done
echo ==========================================
pause
