# HerboraTech ESP32-S3 Smartwatch Integration

Platform PlatformIO untuk mengintegrasikan Waveshare ESP32-S3 Touch LCD 1.47 dengan backend HerboraTech.

## 📋 Quick Start

### 1. Instalasi Dependencies

```bash
# Jika PlatformIO belum terinstall
pip install platformio

# Verifikasi installasi
python -m platformio --version
```

### 2. Build Firmware

```bash
cd esp32-smartwatch

# Build firmware
python -m platformio run -e esp32-s3-waveshare

# Output akan disimpan di: build/esp32-s3-devkitc-1/firmware.bin
```

### 3. Flash ke ESP32

```bash
# Sebelumnya, update COM port di platformio.ini jika diperlukan
# (auto-detect biasanya berfungsi)

# Flash firmware
python -m platformio run -e esp32-s3-waveshare --target upload

# Monitor serial output (optional, di terminal terpisah)
python -m platformio device monitor -e esp32-s3-waveshare -b 115200
```

### 4. Konfigurasi WiFi

Edit `src/main.cpp`:

```cpp
const char* SSID = "YOUR_SSID";
const char* PASSWORD = "YOUR_PASSWORD";
const char* HERBORATECH_SERVER = "your-herboratech-backend.com";
```

## 🏗️ Project Structure

```
esp32-smartwatch/
├── src/
│   └── main.cpp              # Firmware utama
├── include/
│   └── lv_conf.h             # Konfigurasi LVGL
├── lib/                       # Library dependencies (auto-managed by PIO)
├── platformio.ini            # Konfigurasi project
└── README.md                 # File ini
```

## 🔧 Hardware Setup

**Waveshare ESP32-S3 Touch LCD 1.47**
- Resolusi: 172 x 320 pixels
- Touch Panel: I2C
- SPI Display Interface

### Pin Mapping (untuk custom projects):
- TFT MOSI: GPIO11
- TFT MISO: GPIO13
- TFT SCLK: GPIO12
- TFT CS: GPIO10
- TFT DC: GPIO8
- TFT RST: GPIO9
- Touch SDA: GPIO6
- Touch SCL: GPIO7
- LED: GPIO38

## 📦 Libraries Included

### Main Dependencies:
- **lvgl/lvgl@8.3.11** - Graphics library untuk display
- **bodmer/TFT_eSPI@2.5.43** - SPI display driver
- **h2zero/esp-nimble-cpp@1.3.1** - BLE support untuk sensor integration

### Auto-installed oleh PlatformIO:
- **framework-arduinoespressif32** - Arduino core untuk ESP32
- **toolchain-xtensa-esp32s3** - ESP32-S3 compiler
- **tool-esptool** - Upload tool

## 🌐 Web Interface

Setelah firmware terflash, akses via browser:

```
http://<ESP32-IP>:80
```

### Available Endpoints:

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/` | GET | Web interface dashboard |
| `/status` | GET | Device status JSON |
| `/health` | GET | Health data JSON |

## 🔌 Koneksi ke HerboraTech Backend

### WiFi Mode:
```
Modes:
- STA: Connect ke router → full connectivity
- AP: Access Point jika WiFi unavailable → 192.168.4.1
```

### Komunikasi Protocol (TBD):
- REST API via HTTP (current)
- WebSocket untuk real-time data (planned)
- BLE untuk sensor integration (planned)

## 🔋 Health Monitoring Features (Planned)

- [ ] Heart Rate Monitor (HRM)
- [ ] SpO2 Measurement
- [ ] Temperature Sensor
- [ ] Step Counter
- [ ] Sleep Quality Analysis
- [ ] Battery Level Monitoring

## 🛠️ Development Workflow

### 1. Edit Code
```cpp
// src/main.cpp
// Modify dan save
```

### 2. Build
```bash
python -m platformio run -e esp32-s3-waveshare
```

### 3. Check Errors
```bash
# Lihat output build, fix errors
```

### 4. Upload (jika hardware connected)
```bash
python -m platformio run -e esp32-s3-waveshare --target upload
```

### 5. Monitor
```bash
python -m platformio device monitor -e esp32-s3-waveshare -b 115200
```

## 📊 Build Optimization

### Memory Management:
- **PSRAM**: Enabled for extra heap space
- **Partition Table**: huge_app.csv untuk app lebih besar
- **LVGL Memory**: 64KB untuk graphics buffer

### Performance Tuning:
- **Upload Speed**: 921600 baud (max recommended)
- **Monitor Speed**: 115200 baud (standard)

## 🐛 Troubleshooting

### Build Error: "lv_conf.h not found"
→ Pastikan file `include/lv_conf.h` ada di directory

### Connection Error: "PlatformIO can't find COM port"
→ Update `upload_port` di platformio.ini
```ini
upload_port = COM3
```

### Memory Error: "Firmware too large"
→ Disable unused LVGL widgets di `include/lv_conf.h`:
```cpp
#define LV_USE_KEYBOARD 0
#define LV_USE_TEXTAREA 0
```

### WiFi Won't Connect
→ Check SSID/Password di `src/main.cpp`
→ Fallback ke AP mode: 192.168.4.1

## 📚 Useful Commands

```bash
# List available COM ports
python -m platformio device list

# Clean build
python -m platformio run -e esp32-s3-waveshare --target clean

# Full rebuild
python -m platformio run -e esp32-s3-waveshare --target cleanall

# Just compile (no upload)
python -m platformio run -e esp32-s3-waveshare

# List all environments
python -m platformio project config --json-output
```

## 🔗 Resources

- [PlatformIO Docs](https://docs.platformio.org)
- [ESP32-S3 Datasheet](https://www.espressif.com/products/socs/esp32-s3/)
- [LVGL Documentation](https://docs.lvgl.io)
- [Waveshare ESP32-S3 Wiki](https://www.waveshare.com/wiki/ESP32-S3-Touch-LCD-1.47)

## 📝 Next Steps

1. ✅ Setup PlatformIO integration
2. ✅ Create base firmware
3. 🔲 Integrate LVGL display driver
4. 🔲 Implement touch panel input
5. 🔲 Add sensor integration (HRM, SpO2, etc)
6. 🔲 Create health monitoring UI
7. 🔲 Implement HerboraTech API integration
8. 🔲 Add BLE communication support

---

**Last Updated**: March 24, 2026
**Target Device**: Waveshare ESP32-S3 Touch LCD 1.47
