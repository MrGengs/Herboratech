@echo off
title HerboraTech Local Server
color 0A

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║         HERBORATECH LOCAL SERVER            ║
echo  ║     Platform Telemedisin AIoT Indonesia  ║
echo  ╚══════════════════════════════════════════╝
echo.

:: Check if we're in the right directory
if not exist "www\index.html" (
    echo [ERROR] Folder www\index.html tidak ditemukan!
    echo Pastikan file start.bat berada di folder HERBORATECH.
    pause
    exit /b 1
)

echo Pilih metode untuk menjalankan server:
echo.
echo   [1] Python (python -m http.server)
echo   [2] Node.js (npx serve)
echo   [3] Firebase CLI (firebase serve)
echo   [4] PHP Built-in Server
echo.

set /p choice="Masukkan pilihan (1-4): "

if "%choice%"=="1" goto python
if "%choice%"=="2" goto nodejs
if "%choice%"=="3" goto firebase
if "%choice%"=="4" goto php

echo Pilihan tidak valid. Menggunakan Python sebagai default...
goto python

:python
echo.
echo [INFO] Menjalankan Python HTTP Server...
echo [INFO] Buka browser: http://localhost:8000
echo [INFO] Tekan Ctrl+C untuk menghentikan server
echo.
cd www
python -m http.server 8000
if errorlevel 1 (
    echo.
    echo [ERROR] Python tidak ditemukan atau gagal dijalankan.
    echo Silakan install Python dari https://python.org
    pause
)
goto end

:nodejs
echo.
echo [INFO] Menjalankan npx serve...
echo [INFO] Tekan Ctrl+C untuk menghentikan server
echo.
cd www
npx serve -l 3000
if errorlevel 1 (
    echo.
    echo [ERROR] Node.js/npx tidak ditemukan.
    echo Silakan install Node.js dari https://nodejs.org
    pause
)
goto end

:firebase
echo.
echo [INFO] Menjalankan Firebase Local Server...
echo [INFO] Buka browser: http://localhost:5000
echo [INFO] Tekan Ctrl+C untuk menghentikan server
echo.
firebase serve
if errorlevel 1 (
    echo.
    echo [ERROR] Firebase CLI tidak ditemukan.
    echo Install dengan: npm install -g firebase-tools
    pause
)
goto end

:php
echo.
echo [INFO] Menjalankan PHP Built-in Server...
echo [INFO] Buka browser: http://localhost:8080
echo [INFO] Tekan Ctrl+C untuk menghentikan server
echo.
cd www
php -S localhost:8080
if errorlevel 1 (
    echo.
    echo [ERROR] PHP tidak ditemukan.
    echo Silakan install PHP dari https://php.net
    pause
)
goto end

:end
pause
