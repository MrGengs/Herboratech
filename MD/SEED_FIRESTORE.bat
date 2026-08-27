@echo off
title HerboraTech - Seed Firestore

echo.
echo ==========================================
echo   HERBORATECH - SEED DATA KE FIRESTORE
echo ==========================================
echo.

cd /d "%~dp0"

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan!
    echo         Download di: https://nodejs.org
    echo.
    pause
    exit /b 1
)

if not exist "serviceAccountKey.json" (
    echo [ERROR] serviceAccountKey.json tidak ditemukan!
    echo         Letakkan file tsb di folder HERBORATECH sejajar dengan firebase.json
    echo.
    pause
    exit /b 1
)

if not exist "data\final\herbals_merged.json" (
    echo [ERROR] data\final\herbals_merged.json tidak ditemukan!
    echo.
    pause
    exit /b 1
)

if not exist "data\final\formulas_merged.json" (
    echo [ERROR] data\final\formulas_merged.json tidak ditemukan!
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\firebase-admin" (
    echo [INFO] Menginstall firebase-admin, harap tunggu...
    echo.
    call npm install firebase-admin
    if %errorlevel% neq 0 (
        echo [ERROR] npm install gagal!
        echo.
        pause
        exit /b 1
    )
)

set GOOGLE_APPLICATION_CREDENTIALS=%~dp0serviceAccountKey.json

echo ------------------------------------------
echo  STEP 1/2 - Seeding HERBALS (60 tanaman)
echo ------------------------------------------
echo.
node scripts/seed_herbals.js
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Seed herbals gagal!
    echo.
    pause
    exit /b 1
)

echo.
echo ------------------------------------------
echo  STEP 2/2 - Seeding FORMULAS (1051 formula)
echo ------------------------------------------
echo.
node scripts/seed_formulas.js
if %errorlevel% neq 0 (
    echo.
    echo [WARN] Ada error kecil setelah seeding, tapi data kemungkinan sudah tersimpan.
    echo        Cek Firestore Console untuk verifikasi.
    echo.
)

echo.
echo ==========================================
echo   SEEDING SELESAI!
echo   Cek: https://console.firebase.google.com
echo ==========================================
echo.
pause
