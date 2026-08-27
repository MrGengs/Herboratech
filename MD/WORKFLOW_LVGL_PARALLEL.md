# HERBORATECH Smartwatch - LVGL Development Workflow
## Parallel Development: 2 Claude Code Terminals

---

## 📋 SUMMARY: Yang Sudah Dikerjakan

### ✅ PHASE 1: Infrastructure Setup (SELESAI)

#### Hardware & Setup
- ✅ ESP32-S3 Waveshare 1.47" LCD working (pin mapping verified)
- ✅ Display: ST7789 172×320 via SPI (pin: DC:45, CS:21, SCK:38, MOSI:39, RST:47)
- ✅ Touch: FT6206 via I2C (SDA:19, SCL:20)
- ✅ Backlight: GPIO46, LCD_RST: GPIO40

#### Files Created
- ✅ `platformio.ini` — LVGL 8.3.11 added
- ✅ `src/lv_conf.h` — LVGL configuration (172×320, 16-bit, double buffer)
- ✅ `src/lv_port_disp.h/cpp` — Display driver glue (Arduino_GFX backend)
- ✅ `src/lv_port_indev.h/cpp` — Touch input glue (FT6206 backend)
- ✅ `src/main.cpp` — LVGL init + loop (simplified, ready for UI)
- ✅ `check_esp32_port.bat` — COM port detection script

#### Current Status
- 🔧 Build issue: LVGL header parsing (working on fix)
- 📌 **Next: Fix LVGL build → Upload test → UI design starts**

---

## 🎯 PHASE 2: Workflow Plan (RECOMMENDED)

### Architecture: 2 Parallel Terminal Sessions

```
┌─────────────────────────────────────┬─────────────────────────────────┐
│   TERMINAL 1: LVGL + ESP32          │   TERMINAL 2: App Development   │
│   (Firmware Development)             │   (Backend/Integration)         │
└─────────────────────────────────────┴─────────────────────────────────┘

│                                                                        │
├─ Fix LVGL build issue                ├─ Design SVG mockup
├─ Test LVGL display on hardware       ├─ Download SquareLine Studio
├─ Upload test firmware                ├─ Create UI project in SquareLine
├─ Verify touch input working          ├─ Design 3 screens (HOME/STATS/SET)
├─ Integrate exported ui.h/ui.c        ├─ Export C code from SquareLine
├─ Final hardware test                 ├─ Prepare data structures
│                                      ├─ API endpoints for health data
│                                      ├─ Database schema (Firestore)
└──────────────────────────────────────┴─────────────────────────────────┘
```

---

## 📋 TERMINAL 1: LVGL + ESP32 (Firmware)

### Responsible For:
- LVGL library integration
- Display driver (Arduino_GFX → LVGL)
- Touch input driver (FT6206 → LVGL)
- Hardware testing
- Build optimization
- Upload & verification

### Task Checklist

**Week 1: Build & Hardware Setup**
```
□ Fix LVGL 8.3.11 compilation error
  └─ Issue: Header parsing spinbox/textarea
  └─ Solution: Proper lv_conf.h precedence

□ Build successful (no errors)
  └─ Command: platformio run -e esp32-s3-waveshare

□ Flash firmware to ESP32-S3
  └─ Use: check_esp32_port.bat to find COM port
  └─ Command: platformio run -e esp32-s3-waveshare --target upload

□ Verify on hardware:
  └─ Display shows LVGL test screen
  └─ Touch input responds (serial log)
  └─ No flickering/artifacts
```

**Week 2: UI Integration**
```
□ Receive ui.h + ui.c from Terminal 2 (SquareLine export)

□ Integrate into project:
  └─ Copy src/ui/ui.h, src/ui/ui.c
  └─ Update main.cpp: call ui_init()
  └─ Remove test screen code

□ Build with exported UI
  └─ Command: platformio run -e esp32-s3-waveshare

□ Flash & test on hardware:
  └─ HOME screen displays
  └─ STATS screen displays
  └─ SETTINGS screen displays
  └─ Navigation buttons work
  └─ Touch responsiveness OK
```

**Week 3: Optimization & Finalization**
```
□ Performance optimization
  └─ Frame rate: target 30+ FPS
  └─ Memory usage: stay under 300KB RAM

□ Clean up debug code
  └─ Remove test labels
  └─ Remove serial logs (except errors)

□ Final hardware validation:
  └─ All 3 screens working
  └─ Touch input accurate
  └─ No crashes/reboots
```

---

## 📋 TERMINAL 2: Application (Backend)

### Responsible For:
- SVG/UI design
- SquareLine Studio project
- C code generation
- Data structures
- API integration
- App logic

### Task Checklist

**Week 1: Design & SquareLine Setup**
```
□ Download & install SquareLine Studio
  └─ Free tier: ≤5 screens
  └─ Website: squareline.io

□ Create new SquareLine project:
  └─ Platform: ESP32
  └─ Display: 172×320
  └─ Color depth: 16-bit RGB565

□ Design 3 screens from mockup:

  ├─ HOME Screen:
  │  ├─ Label: Time (12:45)
  │  ├─ Arc: Temperature (24°C)
  │  ├─ Button: ON
  │  ├─ Button: OFF
  │  ├─ Slider: Brightness
  │  └─ 3x Tab buttons: HOME/STATS/SET
  │
  ├─ STATS Screen:
  │  ├─ Label: Heart Rate avg
  │  ├─ Label: Steps today
  │  ├─ Label: Sleep hours
  │  └─ 3x Tab buttons
  │
  └─ SETTINGS Screen:
     ├─ Label: WiFi Status
     ├─ Label: Battery %
     ├─ Label: Device Info
     └─ 3x Tab buttons

□ Configure interactions:
  └─ ON button: change state
  └─ OFF button: change state
  └─ Slider: value update event
  └─ Tabs: screen switch
```

**Week 2: Code Generation & Integration Prep**
```
□ SquareLine: Export C Code
  └─ File: ui.h
  └─ File: ui.c
  └─ File: ui_events.c (if using event handlers)
  └─ Output folder: src/ui/

□ Prepare data structures (C/C++):
  └─ Health data struct:
     {heart_rate, steps, temperature, sleep, battery}

  └─ UI state struct:
     {current_screen, brightness, device_enabled, ...}

□ Plan API endpoints:
  └─ GET /health → return health data (JSON)
  └─ POST /settings → update brightness, etc
  └─ GET /status → device status

□ Create data flow diagram:
  └─ Sensor → Health struct → API → LVGL display
```

**Week 3: Backend Integration**
```
□ Write health data provider:
  └─ Read from sensors (simulated for now)
  └─ Format data struct
  └─ Expose via API

□ Write settings handler:
  └─ Save brightness level
  └─ Save device enabled state
  └─ Persist to EEPROM (if needed)

□ Prepare for Firestore integration:
  └─ Schema for health_logs collection
  └─ Schema for user_settings document

□ Create test data:
  └─ Mock health readings
  └─ Test API responses
```

---

## 🔄 Communication Protocol Between Terminals

### Terminal 1 → Terminal 2
```
"I have LVGL running on hardware"
  └─ Terminal 2: "OK, starting SquareLine design"

"Waiting for ui.h and ui.c"
  └─ Terminal 2: "Exporting SquareLine project now..."
  └─ Terminal 1: "Received, integrating..."

"Hardware test complete, all screens working"
  └─ Terminal 2: "Great! Starting backend integration"
```

### Terminal 2 → Terminal 1
```
"Starting SquareLine design"
  └─ Terminal 1: "Focus on LVGL build fix"

"Need to test touch coordinates"
  └─ Terminal 1: "Sending serial log of touch points"

"API ready for health data"
  └─ Terminal 1: "Will call endpoint on data update"
```

---

## 📦 Deliverables by Week

### End of Week 1
- [ ] LVGL compiling successfully ✓
- [ ] Firmware uploaded to ESP32 ✓
- [ ] SquareLine UI design 70% complete ✓

### End of Week 2
- [ ] 3 screens fully rendered on LCD ✓
- [ ] Touch input working for all buttons ✓
- [ ] UI C code exported & integrated ✓

### End of Week 3
- [ ] Backend API serving health data ✓
- [ ] Full hardware validation pass ✓
- [ ] Ready for HerboraTech app integration ✓

---

## 🛠 Tools & Versions

| Component | Version | Purpose |
|-----------|---------|---------|
| PlatformIO | Latest | Build & upload |
| ESP-IDF | 2.0.17 (Arduino) | Framework |
| Arduino_GFX | 1.3.7 | Display driver |
| LVGL | 8.3.11 | UI library |
| Adafruit FT6206 | 1.0.6 | Touch driver |
| SquareLine Studio | Latest | UI design tool |

---

## 📝 File Structure

```
HERBORATECH/esp32-smartwatch/
├── platformio.ini                 [TERMINAL 1]
├── src/
│   ├── main.cpp                   [TERMINAL 1]
│   ├── lv_conf.h                  [TERMINAL 1]
│   ├── lv_port_disp.h/cpp         [TERMINAL 1]
│   ├── lv_port_indev.h/cpp        [TERMINAL 1]
│   └── ui/                        [TERMINAL 2 exports here]
│       ├── ui.h                   [Generated by SquareLine]
│       ├── ui.c                   [Generated by SquareLine]
│       └── ui_events.c            [Optional event handlers]
├── include/
│   └── health_data.h              [TERMINAL 2 - data structures]
└── check_esp32_port.bat           [Utility script]
```

---

## 🚀 Quick Start Commands

### Terminal 1 (LVGL + ESP32)
```bash
# Check COM port
check_esp32_port.bat

# Build firmware
python -m platformio run -e esp32-s3-waveshare

# Upload to device
python -m platformio run -e esp32-s3-waveshare --target upload

# Monitor serial output
python -m platformio device monitor -p COM11 -b 115200
```

### Terminal 2 (App Development)
```bash
# Navigate to project folder
cd c:\Users\mosto\Desktop\HERBORATECH\

# Git commit changes
git add .
git commit -m "feat: LVGL infrastructure + SquareLine design"

# Keep track of progress
# (No build commands - focus on design & planning)
```

---

## ⚠️ Blockers & Solutions

| Issue | Impact | Solution |
|-------|--------|----------|
| LVGL build error (spinbox/textarea) | HIGH | Fix lv_conf.h precedence in platformio.ini |
| ESP32 COM port not detected | HIGH | Run check_esp32_port.bat, press BOOT button |
| SquareLine export format mismatch | MEDIUM | Verify ui.h struct names match expected format |
| Touch coordinate mapping incorrect | MEDIUM | Calibrate coordinates in lv_port_indev.cpp |
| Memory overflow (LVGL buffer) | LOW | Reduce buffer size or disable extra widgets |

---

## 📞 Success Criteria

✅ **LVGL + ESP32 (Terminal 1):**
- Firmware compiles without errors
- Displays render at 30+ FPS
- Touch input accurate within 5 pixels
- No crashes or memory leaks

✅ **Application (Terminal 2):**
- 3 screens fully designed in SquareLine
- C code generates without warnings
- Data structures defined for all sensors
- API endpoints stubbed & ready

✅ **Integration:**
- Hardware shows all 3 screens
- Navigation works smoothly
- Touch responsiveness feels natural
- Ready for real sensor data integration

---

## 🎯 Next Immediate Actions

**FOR TERMINAL 1 (LVGL + ESP32):**
1. Fix LVGL build compilation
2. Get test firmware running on device
3. Verify display & touch work

**FOR TERMINAL 2 (Application):**
1. Download SquareLine Studio
2. Start designing mockup into 3 screens
3. Prepare data structures

**Both collaborate:** Exchange COM port info, design constraints, hardware feedback

---

**Created:** 2026-03-24
**Target Completion:** 2026-04-14 (3 weeks)
**Status:** Ready to execute 🚀
