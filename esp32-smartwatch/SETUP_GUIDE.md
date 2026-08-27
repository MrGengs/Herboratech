# 🔧 ESP32-S3 Smartwatch Setup Guide

Panduan lengkap untuk setup development environment dan flash firmware ke Waveshare ESP32-S3 Touch LCD 1.47.

## Prerequisites

- **Python 3.8+** installed
- **USB Cable** (USB-C untuk ESP32-S3)
- **Windows/macOS/Linux** dengan Administrator access
- **Waveshare ESP32-S3 Touch LCD 1.47** device

## Step 1: Install PlatformIO

### Option A: Via Command Line (Recommended)
```bash
pip install platformio
```

### Option B: Via VSCode Extension
1. Buka VSCode
2. Go to Extensions → Search "PlatformIO IDE"
3. Click "Install"
4. Reload VSCode

### Verify Installation
```bash
python -m platformio --version
```

Expected output: `PlatformIO Core, version 6.x.x`

---

## Step 2: Setup Hardware Connection

### USB Connection
1. Siapkan USB-C cable
2. Colokkan ke port USB-C di Waveshare ESP32-S3
3. Hubungkan ke computer

### Verify Connection
```bash
python -m platformio device list
```

Contoh output:
```
/dev/ttyUSB0 - CP2102N USB to UART Bridge Controller
```

Jika tidak muncul:
- Instalasi driver CP2102N:
  - Windows: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers
  - macOS: Biasanya auto-installed
  - Linux: `sudo apt-get install libusb-1.0-0`

---

## Step 3: Configure platformio.ini

Edit `esp32-smartwatch/platformio.ini`:

```ini
[env:esp32-s3-waveshare]
; ... existing config ...

; Update COM port jika diperlukan
upload_port = COM3  ; Windows (change as needed)
; upload_port = /dev/ttyUSB0  ; Linux/macOS

; Upload speed (tinggi untuk kecepatan)
upload_speed = 921600

; Monitor/Serial output
monitor_speed = 115200
monitor_filters = esp32_exception_decoder
```

---

## Step 4: Configure WiFi

Edit `esp32-smartwatch/src/main.cpp`:

```cpp
// Line ~32
const char* SSID = "Your-WiFi-Name";
const char* PASSWORD = "Your-WiFi-Password";
const char* HERBORATECH_SERVER = "your-backend-url.com";
const int HERBORATECH_PORT = 8080;
```

---

## Step 5: Build Firmware

```bash
cd esp32-smartwatch

# Build without upload
python -m platformio run -e esp32-s3-waveshare

# Expected: ✓ 4 files compiled, firmware.bin created
```

### Troubleshooting Build Errors

**Error: "lv_conf.h not found"**
```
Solution: Pastikan include/lv_conf.h exists
```

**Error: "Cannot resolve library"**
```
Solution:
python -m platformio lib install
python -m platformio run -e esp32-s3-waveshare --target clean
```

**Error: Memory too large**
```
Solution: Disable unused LVGL widgets di include/lv_conf.h
#define LV_USE_KEYBOARD 0
#define LV_USE_TEXTAREA 0
```

---

## Step 6: Upload Firmware

### Prerequisites:
- Firmware sudah berhasil dibuild (Step 5)
- Device sudah terhubung via USB

### Upload Process

```bash
cd esp32-smartwatch

# Method 1: Upload langsung (recommended)
python -m platformio run -e esp32-s3-waveshare --target upload

# Method 2: Jika port otomatis tidak terdeteksi
python -m platformio run -e esp32-s3-waveshare --target upload --upload-port COM3
```

### During Upload:
1. Anda akan lihat `Connecting....`
2. Jika hang, tekan **BOOT button** di ESP32 (pin 0)
3. Wait ~5 seconds untuk flash selesai
4. Device akan reboot otomatis

### Upload Success Signs:
```
Writing at 0x... (progress bar)
Wrote XX bytes in Y.Z seconds
Leaving...
Hard resetting via RTS pin...
```

---

## Step 7: Monitor Serial Output

```bash
# Terminal 1: Keep monitoring
python -m platformio device monitor -e esp32-s3-waveshare -b 115200

# Expected output:
# [OK] GPIO initialized
# [OK] WiFi initialized
# [OK] Web server initialized
# [INFO] Firmware ready!
```

### Common Serial Messages:
```
[WiFi] Connecting to SSID: ...
[WiFi] Connected! IP: 192.168.1.100
[WebServer] Started on port 80
[OK] Firmware ready!
```

---

## Step 8: Test Connectivity

### Via Web Browser
```
http://192.168.1.100/
```

Should show HerboraTech Watch interface.

### Via API
```bash
# Get device status
curl http://192.168.1.100/status

# Get health data
curl http://192.168.1.100/health
```

---

## Development Workflow

### Daily Workflow
```bash
# 1. Edit code
# vim src/main.cpp

# 2. Build
cd esp32-smartwatch
python -m platformio run -e esp32-s3-waveshare

# 3. Upload (if connected)
python -m platformio run -e esp32-s3-waveshare --target upload

# 4. Monitor
python -m platformio device monitor -e esp32-s3-waveshare
```

### VSCode Workflow (if installed via extension)
1. Open `esp32-smartwatch/src/main.cpp`
2. Edit code
3. Click **PlatformIO: Build** (left sidebar)
4. Click **PlatformIO: Upload** (auto-connects)
5. Click **PlatformIO: Monitor** untuk lihat output

---

## Common Issues & Solutions

### Issue: "Port COM3 not found"
**Solution:**
- Check device di Device Manager (Windows)
- Try different COM port
- Reinstall CP2102N driver

### Issue: "Board not responding / Connecting..."
**Solution:**
- Press BOOT button (GPIO 0) saat proses upload
- Try lower upload speed: `upload_speed = 115200`
- Check USB cable kualitasnya

### Issue: "Firmware too large for partition"
**Solution:**
```ini
# Edit platformio.ini
board_build.partitions = huge_app.csv
```

### Issue: "WiFi tidak connect"
**Solution:**
- Pastikan SSID/Password correct di main.cpp
- Device akan jatuh ke AP mode: 192.168.4.1 (HerboraTech-Watch)
- Check 2.4GHz WiFi (bukan 5GHz)

### Issue: "LVGL compile error"
**Solution:**
- Verify `include/lv_conf.h` present
- Run `platformio lib install`
- Clean build: `pio run -e esp32-s3-waveshare --target clean`

---

## Advanced: CLI Commands Reference

```bash
# Project info
python -m platformio project config

# List environments
python -m platformio project config --json-output

# Build verbose (debug errors)
python -m platformio run -e esp32-s3-waveshare -v

# Clean all
python -m platformio run -e esp32-s3-waveshare --target cleanall

# Erase device flash
python -m platformio run -e esp32-s3-waveshare --target erase

# Generate UF2 (for bootloader, advanced)
python -m platformio run -e esp32-s3-waveshare --target uf2

# Check disk usage
pio system prune --dry-run
```

---

## Next: Integrate LVGL Display

After firmware flashed, next steps:

1. ✅ Setup complete
2. 🔲 Integrate LVGL display driver (TFT_eSPI)
3. 🔲 Create UI screens
4. 🔲 Add touch panel support
5. 🔲 Implement sensor reading
6. 🔲 Add HerboraTech API calls

See `DEVELOPMENT.md` untuk lanjutan.

---

## Support & Resources

- **PlatformIO Docs**: https://docs.platformio.org
- **ESP32-S3 Datasheet**: https://www.espressif.com/products/socs/esp32-s3/
- **Waveshare Wiki**: https://www.waveshare.com/wiki/ESP32-S3-Touch-LCD-1.47
- **LVGL Docs**: https://docs.lvgl.io/8.3/

---

**Last Updated**: March 24, 2026
