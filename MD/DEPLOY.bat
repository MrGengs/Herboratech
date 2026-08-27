@echo off
title HerboraTech - Deploy ke Firebase Hosting

echo.
echo ==========================================
echo   HERBORATECH - DEPLOY KE FIREBASE HOSTING
echo ==========================================
echo.

cd /d "%~dp0"

where firebase >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Firebase CLI belum terinstall, menginstall...
    call npm install -g firebase-tools
    if %errorlevel% neq 0 (
        echo [ERROR] Gagal install firebase-tools!
        pause
        exit /b 1
    )
)

echo [INFO] Deploy hosting ke herboratech.web.app ...
echo.
call firebase deploy --only hosting:herboratech

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Deploy gagal! Coba jalankan dulu: firebase login
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   DEPLOY SELESAI!
echo   https://herboratech.web.app
echo ==========================================
echo.
pause
