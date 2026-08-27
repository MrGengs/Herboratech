@echo off
REM ============================================================
REM HERBORATECH Smartwatch - LVGL Development Workflow
REM Quick Reference for Parallel Development (2 Terminals)
REM ============================================================

cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  HERBORATECH LVGL Development - Quick Reference              ║
echo ║  Parallel 2-Terminal Workflow                             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Display current status
echo [CURRENT STATUS]
echo.
echo ✅ COMPLETED:
echo   - Hardware setup (ESP32-S3, LCD, Touch)
echo   - LVGL infrastructure files created
echo   - Display driver (Arduino_GFX backend)
echo   - Touch driver (FT6206 backend)
echo   - COM port detection script
echo.
echo 🔧 IN PROGRESS:
echo   - Fix LVGL build compilation issue
echo   - Upload test firmware to device
echo.
echo ⏳ PENDING:
echo   - SquareLine UI design (Terminal 2)
echo   - Hardware validation
echo   - Backend integration
echo.

echo ─────────────────────────────────────────────────────────────
echo.

REM Display workflow
echo [PARALLEL WORKFLOW: 2 TERMINALS]
echo.
echo TERMINAL 1: LVGL + ESP32 (Firmware Development)
echo ────────────────────────────────────────────────────────────
echo Location: cd c:\Users\mosto\Desktop\HERBORATECH\esp32-smartwatch\
echo.
echo WEEK 1:
echo   1. Fix LVGL compilation (lv_conf.h precedence)
echo   2. Build: platformio run -e esp32-s3-waveshare
echo   3. Flash: platformio run -e esp32-s3-waveshare --target upload
echo   4. Test: Verify display + touch on hardware
echo.
echo WEEK 2:
echo   1. Wait for ui.h + ui.c from Terminal 2
echo   2. Integrate UI files into src/ui/
echo   3. Update main.cpp: call ui_init()
echo   4. Rebuild + Flash
echo   5. Test all 3 screens: HOME / STATS / SETTINGS
echo.
echo WEEK 3:
echo   1. Performance optimization
echo   2. Debug & clean up code
echo   3. Final hardware validation
echo.

echo ─────────────────────────────────────────────────────────────
echo.

echo TERMINAL 2: Application Development (Backend)
echo ────────────────────────────────────────────────────────────
echo Location: c:\Users\mosto\Desktop\HERBORATECH\
echo.
echo WEEK 1:
echo   1. Download SquareLine Studio (squareline.io)
echo   2. Create new project: 172x320, ESP32, 16-bit
echo   3. Design 3 screens:
echo      - HOME: Time, Temp Arc, ON/OFF, Brightness Slider
echo      - STATS: Heart Rate, Steps, Sleep
echo      - SETTINGS: WiFi, Battery, Device Info
echo   4. Configure tab navigation
echo.
echo WEEK 2:
echo   1. SquareLine: Export C Code
echo      → ui.h, ui.c (send to Terminal 1)
echo   2. Prepare data structures
echo      → health_data_t, ui_state_t
echo   3. Plan API endpoints
echo      → GET /health, POST /settings
echo.
echo WEEK 3:
echo   1. Write health data provider
echo   2. Write settings handler
echo   3. Prepare Firestore schema
echo   4. Create test data
echo.

echo ─────────────────────────────────────────────────────────────
echo.

REM Display quick commands
echo [QUICK COMMANDS]
echo.
echo TERMINAL 1 (LVGL):
echo   check_esp32_port.bat
echo     └─ Detect ESP32 COM port
echo.
echo   platformio run -e esp32-s3-waveshare
echo     └─ Build firmware
echo.
echo   platformio run -e esp32-s3-waveshare --target upload
echo     └─ Flash to device
echo.
echo   platformio device monitor -p COM11 -b 115200
echo     └─ View serial output (replace COM11 with your port)
echo.

echo TERMINAL 2 (APP):
echo   git add .
echo   git commit -m "feat: LVGL + SquareLine UI design"
echo     └─ Track progress
echo.

echo ─────────────────────────────────────────────────────────────
echo.

REM Display file structure
echo [FILE STRUCTURE]
echo.
echo HERBORATECH/esp32-smartwatch/
echo ├── platformio.ini
echo ├── src/
echo │   ├── main.cpp
echo │   ├── lv_conf.h
echo │   ├── lv_port_disp.h/cpp
echo │   ├── lv_port_indev.h/cpp
echo │   └── ui/  (Terminal 2 exports here)
echo │       ├── ui.h
echo │       └── ui.c
echo └── check_esp32_port.bat
echo.

echo ─────────────────────────────────────────────────────────────
echo.

REM Display blockers
echo [KNOWN BLOCKERS]
echo.
echo 1. LVGL Build Error (spinbox/textarea)
echo    Status: FIXING
echo    Solution: Update platformio.ini include path
echo.
echo 2. ESP32 COM Port Not Detected
echo    Status: MONITORING
echo    Solution: Run check_esp32_port.bat + press BOOT
echo.
echo 3. Touch Coordinate Mapping
echo    Status: TO DO
echo    Solution: Calibrate in lv_port_indev.cpp if needed
echo.

echo ─────────────────────────────────────────────────────────────
echo.

REM Display success criteria
echo [SUCCESS CRITERIA]
echo.
echo Terminal 1 (LVGL):
echo   ✓ Firmware compiles without errors
echo   ✓ Display renders at 30+ FPS
echo   ✓ Touch input accurate
echo   ✓ No crashes or memory leaks
echo.
echo Terminal 2 (APP):
echo   ✓ 3 screens designed in SquareLine
echo   ✓ C code generated
echo   ✓ Data structures defined
echo   ✓ API endpoints stubbed
echo.
echo Integration:
echo   ✓ All 3 screens display on hardware
echo   ✓ Navigation smooth
echo   ✓ Touch responsive
echo.

echo ═════════════════════════════════════════════════════════════
echo.
echo For detailed workflow: open WORKFLOW_LVGL_PARALLEL.md
echo.
pause
