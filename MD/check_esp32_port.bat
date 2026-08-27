@echo off
REM ============================================================
REM Script untuk check COM port ESP32
REM Run: check_esp32_port.bat
REM ============================================================

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║     ESP32 COM Port Detection Script                ║
echo ║     Waveshare ESP32-S3 Touch LCD 1.47"             ║
echo ╚════════════════════════════════════════════════════╝
echo.

REM Method 1: List COM ports using wmic
echo [Method 1] Listing all COM ports...
echo.

for /f "tokens=1" %%A in ('wmic logicalport get name ^| findstr COM') do (
    set PORT=%%A
    for /f "tokens=2 delims==" %%B in ('wmic logicalport where name="!PORT!" get description ^| findstr "description"') do (
        echo Port: !PORT!  -  Description: %%B
    )
)

echo.
echo ─────────────────────────────────────────────────────
echo.

REM Method 2: Use PowerShell if available
echo [Method 2] Using PowerShell for detailed info...
echo.

powershell -NoProfile -Command "Get-CimInstance Win32_PnPEntity | Where-Object {$_.PNPClass -eq 'Ports'} | Select-Object Name" 2>nul

if errorlevel 1 (
    echo (PowerShell method not available)
)

echo.
echo ─────────────────────────────────────────────────────
echo.

REM Method 3: List from Device Manager via registry
echo [Method 3] COM ports from System Registry...
echo.

reg query "HKLM\HARDWARE\DEVICEMAP\SERIALCOMM" /v * 2>nul

if errorlevel 1 (
    echo (Registry method not available)
)

echo.
echo ─────────────────────────────────────────────────────
echo.
echo NEXT STEPS:
echo 1. Lihat nomor COM port di atas (misal: COM11, COM7, dst)
echo 2. Update di: platformio.ini
echo    Ganti: upload_port = COMxx (dengan nomor yang terdeteksi)
echo 3. Jalankan: python -m platformio run -e esp32-s3-waveshare --target upload
echo.
echo TIPS:
echo - Jika ESP32 tidak terdeteksi: Colok USB dan tekan BOOT button
echo - Port berubah? Tutup serial monitor/ArduinoIDE terlebih dahulu
echo.
pause
