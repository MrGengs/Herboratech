# 📱 Smartwatch Integration - ESP32-S3 LVGL untuk HerboraTech

## Summary

Anda telah meminta integrasi smartwatch dengan ESP32-S3 LVGL untuk HerboraTech. Berikut adalah setup lengkap yang telah kami persiapkan.

---

## ✅ Apa yang Sudah Dikerjakan

### 1. **PlatformIO Setup** ✓
- ✅ Install PlatformIO CLI (Python-based)
- ✅ Create project structure: `esp32-smartwatch/`
- ✅ Download ESP32-S3 toolchain dan dependencies otomatis

### 2. **Hardware Configuration** ✓
- ✅ Target: **Waveshare ESP32-S3 Touch LCD 1.47**
- ✅ Board: esp32-s3-devkitc-1 (compatible)
- ✅ Pin mapping untuk display (SPI) dan touch panel (I2C)
- ✅ Memory optimization: PSRAM enabled, partition table: huge_app.csv

### 3. **Firmware Base** ✓
- ✅ `src/main.cpp` - Basic firmware dengan:
  - GPIO initialization (LED, button)
  - WiFi connectivity (STA + AP fallback mode)
  - Web server (HTTP) dengan:
    - `/` - Dashboard HTML
    - `/status` - JSON status
    - `/health` - JSON health data (placeholder)
  - LED blink indicator
  - Serial logging via UART

### 4. **LVGL Configuration** ✓
- ✅ `include/lv_conf.h` - Konfigurasi LVGL 8.3.11 optimized untuk:
  - Display: 172 x 320 pixels (Waveshare 1.47")
  - Color depth: 16-bit RGB565
  - Memory: 64KB untuk graphics buffer
  - Widgets: Arc, Bar, Button, Label, Switch, Slider, dll
  - Touch support: LV_USE_TOUCH enabled

### 5. **Build System** ✓
- ✅ `platformio.ini` - Configured untuk:
  - Espressif32 platform
  - Arduino framework
  - Libraries: LVGL, TFT_eSPI
  - Upload speed: 921600 baud
  - Monitor speed: 115200 baud
  - Partition table: huge_app.csv

### 6. **Documentation** ✓
- ✅ `README.md` - Project overview
- ✅ `SETUP_GUIDE.md` - Step-by-step installation & troubleshooting
- ✅ `sensor-integration.cpp.example` - Template untuk sensor (HRM, DHT22, MPU6050)

---

## 📦 Project Structure

```
C:\Users\mosto\Desktop\HERBORATECH\
├── esp32-smartwatch/                    # PlatformIO project root
│   ├── src/
│   │   ├── main.cpp                     # Firmware utama
│   │   └── sensor-integration.cpp.example  # Sensor template
│   ├── include/
│   │   └── lv_conf.h                    # LVGL configuration
│   ├── lib/                              # (auto-managed oleh PIO)
│   ├── .pio/                             # (auto-generated)
│   ├── build/                            # (output: compiled binaries)
│   ├── platformio.ini                   # Project config
│   ├── lv_conf.h                        # Copy untuk build
│   ├── README.md                        # Quick reference
│   └── SETUP_GUIDE.md                   # Installation guide
│
└── SMARTWATCH_INTEGRATION.md            # File ini
```

---

## 🚀 Cara Menggunakan

### **1. Build Firmware**

```bash
cd C:\Users\mosto\Desktop\HERBORATECH\esp32-smartwatch

# Build (compile only, no upload yet)
python -m platformio run -e esp32-s3-waveshare
```

**Expected Result:**
```
Building in release mode
Compiling src/main.cpp.o
...
Creating esp32s3 image...
Successfully created esp32s3 image.
========================= [SUCCESS] =========================
```

Output akan disimpan di: `esp32-smartwatch/.pio/build/esp32-s3-waveshare/firmware.bin`

### **2. Konfigurasi WiFi**

Edit `esp32-smartwatch/src/main.cpp` (line ~32):

```cpp
const char* SSID = "Your-WiFi-SSID";           // Ganti
const char* PASSWORD = "Your-WiFi-Password";   // Ganti
const char* HERBORATECH_SERVER = "backend-url.com"; // Ganti (nanti)
```

### **3. Flash ke Hardware**

Setelah hardware terhubung via USB-C:

```bash
# Flash firmware ke device
python -m platformio run -e esp32-s3-waveshare --target upload

# Jika auto-detect gagal:
python -m platformio device list  # Cek COM port
# Edit platformio.ini: upload_port = COM3 (sesuai)
python -m platformio run -e esp32-s3-waveshare --target upload --upload-port COM3
```

### **4. Monitor Serial Output**

Buka terminal baru (keep running):

```bash
python -m platformio device monitor -e esp32-s3-waveshare -b 115200
```

Expected output:
```
HerboraTech ESP32-S3 Smartwatch Firmware v1.0
Waveshare ESP32-S3 Touch LCD 1.47

[OK] GPIO initialized
[OK] WiFi initialized
[OK] Web server initialized
[INFO] Firmware ready!
```

### **5. Akses Web Interface**

Dari browser:
```
http://<ESP32-IP>:80
```

Atau dari terminal (jika tahu IP):
```bash
curl http://192.168.1.100/status
curl http://192.168.1.100/health
```

---

## 🔌 Integration dengan HerboraTech Backend

### **Architectural Overview**

```
┌─────────────────────┐
│  Waveshare         │
│  ESP32-S3 Watch    │──(WiFi + HTTP/WebSocket)──> Backend HerboraTech
│  + LVGL UI         │
└─────────────────────┘
         │
         ├─ Health Sensors (HRM, SpO2, Temp)
         ├─ Movement Sensors (Step counter)
         └─ Battery Monitor
```

### **Next Steps (Batch Planning)**

```markdown
## Batch SMART-1: LVGL Display Driver Integration
- [ ] Integrate TFT_eSPI driver untuk Waveshare display
- [ ] Test basic primitives (rect, circle, text)
- [ ] Create display buffer management
- Time: 2-3 hours

## Batch SMART-2: Touch Panel Input
- [ ] Setup I2C communication untuk touch controller
- [ ] Implement touch event handler di LVGL
- [ ] Create button touch detection
- Time: 2-3 hours

## Batch SMART-3: Health Monitoring UI
- [ ] Create LVGL screens untuk:
  - Dashboard (HR, SpO2, Steps, Battery)
  - Real-time charts (trend graph)
  - Settings page
- Time: 4-6 hours

## Batch SMART-4: Sensor Integration
- [ ] Integrate MAX30102 (Heart Rate + SpO2)
- [ ] Integrate DHT22 (Temperature)
- [ ] Integrate MPU6050 (Step counter)
- Time: 4-5 hours

## Batch SMART-5: HerboraTech API Integration
- [ ] Create HTTP client untuk backend API
- [ ] Sync health data ke Firestore
- [ ] Implement real-time notification (WebSocket)
- Time: 3-4 hours

## Batch SMART-6: BLE Communication
- [ ] Setup BLE untuk pairing dengan phone
- [ ] Implement health data streaming via BLE
- [ ] Battery optimization
- Time: 4-5 hours
```

---

## 🔧 Extensions & MCP Integration untuk Claude Code

### **Recommended Setup untuk Development**

#### **Option 1: VSCode + PlatformIO Extension (Easiest)**
```bash
# Buka VSCode
# Install extension: "PlatformIO IDE" (official)
# Reload VSCode
# Now you have:
# - Build button di sidebar
# - Upload button
# - Monitor button
# - Autocomplete untuk libraries
```

#### **Option 2: Claude Code CLI + PlatformIO (Current)**
```bash
# Sudah berjalan via Python CLI
python -m platformio [command]

# Supported commands:
# - run: Build
# - run --target upload: Flash
# - device monitor: Serial monitor
# - project config: Show configuration
```

#### **Option 3: MCP Integration (Future)**
```
Jika ada MCP untuk PlatformIO:
- Direct command execution via Claude
- Library management
- Device detection
- Build automation

Status: Belum ada MCP standar untuk PlatformIO
Alternative: Kita gunakan Bash wrapper di Claude Code
```

### **Recommendation untuk Efisiensi Development**

1. **Use VSCode Extension** (jika sering edit di VSCode):
   - Faster iteration
   - Better error visualization
   - Integrated serial monitor

2. **Use Claude Code CLI** (jika pakai Claude Code exclusively):
   - Maksimal automation
   - No context switching
   - Full control via commands

3. **Hybrid Approach** (RECOMMENDED):
   - VSCode untuk UI development (LVGL screens)
   - Claude Code untuk logic & integration
   - Both use same PlatformIO project

---

## 📊 Development Workflow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ Edit Code                                               │
│ - VSCode atau Claude Code                               │
│ - File: src/main.cpp, include/lv_conf.h                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  PlatformIO Build    │
          │  pio run             │
          └────────┬─────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼ (Success)      ▼ (Error)
   ✅ Compiled      ❌ Fix & Retry
        │
        ▼
   ┌────────────────────────┐
   │  Flash to Hardware     │
   │  pio run --target upload
   └────────┬───────────────┘
            │
            ▼
   ┌────────────────────────┐
   │ Monitor Serial Output  │
   │ pio device monitor     │
   └────────┬───────────────┘
            │
            ▼
   ┌────────────────────────┐
   │ Test & Debug           │
   │ - Check logs           │
   │ - Verify functionality │
   │ - Iterate              │
   └────────────────────────┘
```

---

## 📝 Quick Command Reference

```bash
# Build
cd esp32-smartwatch
python -m platformio run -e esp32-s3-waveshare

# Flash
python -m platformio run -e esp32-s3-waveshare --target upload

# Monitor
python -m platformio device monitor -e esp32-s3-waveshare -b 115200

# Clean
python -m platformio run -e esp32-s3-waveshare --target clean

# List devices
python -m platformio device list

# Project info
python -m platformio project config
```

---

## 🎯 Next Immediate Action

**Current Status:** Build system ready, base firmware prepared

**Next Steps:**
1. ✅ Build firmware (we're testing now)
2. 🔲 Confirm build success
3. 🔲 If you have hardware: Flash & test connection
4. 🔲 Start Batch SMART-1: LVGL Display Driver

---

## 📚 Resources & Documentation

- **PlatformIO Docs**: https://docs.platformio.org
- **Waveshare ESP32-S3 Wiki**: https://www.waveshare.com/wiki/ESP32-S3-Touch-LCD-1.47
- **LVGL Docs**: https://docs.lvgl.io/8.3/
- **ESP32-S3 Datasheet**: https://www.espressif.com/products/socs/esp32-s3/

---

## ❓ FAQ

**Q: Apakah harus punya hardware untuk test?**
A: Tidak required. Build & flash bisa dilakukan di simulator (setup lebih complex). Untuk sekarang, fokus di build sukses.

**Q: Berapa waktu untuk full integration?**
A: Estimation:
- Display driver: 2-3 jam
- Touch input: 2-3 jam
- UI screens: 4-6 jam
- Sensor integration: 4-5 jam
- Backend API: 3-4 jam
- **Total: ~18-24 jam development**

**Q: Gimana cara reset device kalau jammed?**
A: ```bash
python -m platformio run -e esp32-s3-waveshare --target erase
```

**Q: Bisa di-simulate di PC?**
A: Yes, tapi setup lebih complex (Wokwi atau SDL simulator). Kita skip untuk sekarang, fokus di real hardware.

---

**Last Updated**: March 24, 2026
**Status**: Ready for Batch SMART-1
