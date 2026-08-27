# 🔧 ARDUINO CLI — ESP32-S3 Smartwatch Firmware Workflow

**Purpose:** Command-line programming workflow for HerboraTech smartwatch
**Tool:** Arduino CLI 1.0+ (replaces Arduino IDE)
**Target:** ESP32-S3 with LVGL + TFT_eSPI
**Benefits:** CI/CD automation, reproducible builds, version control

---

## 🚀 INSTALLATION & SETUP

### Step 1: Install Arduino CLI

**Windows (PowerShell):**
```powershell
# Download latest release
$version = "1.1.1"
$url = "https://github.com/arduino/arduino-cli/releases/download/${version}/arduino-cli_${version}_Windows_64bit.zip"
Invoke-WebRequest -Uri $url -OutFile arduino-cli.zip

# Extract
Expand-Archive -Path arduino-cli.zip -DestinationPath C:\arduino-cli
Add-Content $PROFILE 'Set-Alias -Name arduino-cli -Value C:\arduino-cli\arduino-cli.exe'
. $PROFILE

# Verify
arduino-cli version
```

**Linux/macOS (Bash):**
```bash
# Download latest release
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

# Add to PATH
export PATH="$HOME/local/bin:$PATH"
echo 'export PATH="$HOME/local/bin:$PATH"' >> ~/.bashrc

# Verify
arduino-cli version
```

### Step 2: Initialize Arduino CLI Config

```bash
# Create configuration directory
arduino-cli config init --overwrite

# Verify config
arduino-cli config dump
```

**Config file location:**
- Windows: `C:\Users\<username>\AppData\Local\Arduino15\arduino-cli.yaml`
- Linux/macOS: `~/.arduino15/arduino-cli.yaml`

### Step 3: Add ESP32 Board Support

```bash
# Add ESP32 board package
arduino-cli core install esp32:esp32@3.0.0

# List installed cores
arduino-cli core list

# Output:
# ID              Installed  Latest  Name
# esp32:esp32     3.0.0      3.0.0   esp32
```

### Step 4: Install Required Libraries

```bash
# LVGL Graphics Library
arduino-cli lib install LVGL:8.3.10

# TFT_eSPI Display Driver
arduino-cli lib install TFT_eSPI:2.5.0

# Touch Controller Library (GT911 capacitive)
arduino-cli lib install GT911:1.0.0

# Firebase Realtime Database
arduino-cli lib install Firebase Arduino Client Library for ESP32:4.4.2

# WiFi & BLE (included with ESP32 core, but verify)
arduino-cli core search wifi esp32

# List installed libraries
arduino-cli lib list
```

---

## 📁 PROJECT STRUCTURE

```
herboratech-smartwatch/
├── arduino-cli.yaml             ← Configuration file
├── .github/workflows/
│   └── build-and-deploy.yml     ← CI/CD pipeline
├── src/
│   ├── main.cpp                 ← Entry point
│   ├── display/
│   │   ├── lvgl_setup.h         ← LVGL initialization
│   │   ├── screens.h            ← 3 screen definitions
│   │   └── themes.h             ← Color themes
│   ├── sensors/
│   │   ├── vital_reading.h      ← HR, SpO2, Temp
│   │   └── calibration.h        ← Sensor calibration
│   ├── connectivity/
│   │   ├── wifi_manager.h       ← WiFi setup
│   │   └── firebase_sync.h      ← Firebase Realtime DB
│   ├── ui/
│   │   ├── gauge.h              ← Circular progress bars
│   │   ├── animations.h         ← Screen transitions
│   │   └── touch_handler.h      ← Touch input logic
│   └── config.h                 ← Global settings
├── libraries/
│   └── custom/                  ← Custom libraries (optional)
├── sketches/                    ← Test sketches
│   ├── test_lvgl.ino
│   ├── test_touch.ino
│   └── test_sensors.ino
├── build/                       ← Build artifacts
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── TROUBLESHOOTING.md
├── platformio.ini               ← PlatformIO config (alternative)
└── README.md
```

---

## 🔨 COMPILATION WORKFLOW

### Basic Compilation

```bash
# Verify sketch (compile without uploading)
arduino-cli compile --fqbn esp32:esp32:esp32s3:PSRAMSize=2M \
  --verify \
  herboratech-smartwatch/src/main.cpp

# Output should end with:
# ✓ Sketch uses 256,000 bytes (5%) of program storage space...
# ✓ Global variables use 32,000 bytes (45%) of dynamic memory...
```

### Full Build with All Flags

```bash
# High optimization, minimal debug output
arduino-cli compile \
  --fqbn esp32:esp32:esp32s3:PSRAMSize=2M,PartitionScheme=huge_app,DebugLevel=none \
  --build-properties build.partitions=huge_app \
  --build-properties compiler.cpp.extra_flags="-O3 -march=xtensa-lx7 -DCORE_DEBUG_LEVEL=0" \
  --verbose \
  herboratech-smartwatch/src/main.cpp

# Output binary to specific location
arduino-cli compile --output-dir ./build/ herboratech-smartwatch/src/main.cpp
```

### Build with Libraries Pre-check

```bash
# Verify all libraries compile
arduino-cli lib check-syntax LVGL
arduino-cli lib check-syntax TFT_eSPI
arduino-cli lib check-syntax GT911

# Full compilation with library verification
arduino-cli compile \
  --fqbn esp32:esp32:esp32s3:PSRAMSize=2M \
  --warnings=all \
  herboratech-smartwatch/src/main.cpp
```

---

## 📤 UPLOAD WORKFLOW

### Step 1: Identify Serial Port

```bash
# List available serial ports
arduino-cli board list

# Output:
# Port         Protocol Type              Board Name              FQBN                                 Core
# /dev/ttyUSB0 serial   Serial Port (USB) ESP32-S3 DevKit         esp32:esp32:esp32s3              esp32:esp32
# COM3         serial   Serial Port (USB) ESP32-S3 with 2MB PSRAM  esp32:esp32:esp32s3:PSRAMSize=2M esp32:esp32
```

**Windows Common Ports:** `COM3`, `COM4`, `COM5`
**Linux Common Ports:** `/dev/ttyUSB0`, `/dev/ttyUSB1`, `/dev/ttyACM0`
**macOS Common Ports:** `/dev/cu.usbserial-XXXXX`, `/dev/cu.SLAB_USBtoUART`

### Step 2: Upload Firmware

```bash
# Standard upload
arduino-cli upload --port COM3 \
  --fqbn esp32:esp32:esp32s3:PSRAMSize=2M \
  herboratech-smartwatch/src/main.cpp

# With bootloader reset (for stubborn boards)
arduino-cli upload --port COM3 \
  --fqbn esp32:esp32:esp32s3:PSRAMSize=2M \
  --use-1200bps-touch \
  herboratech-smartwatch/src/main.cpp

# Monitor after upload
arduino-cli monitor --port COM3 --config baudrate=115200
```

### Step 3: Monitor Serial Output

```bash
# Monitor with baudrate
arduino-cli monitor --port COM3 --config baudrate=115200

# Monitor with filter (only log lines containing "ERROR")
arduino-cli monitor --port COM3 --config baudrate=115200 | grep ERROR

# Redirect output to file
arduino-cli monitor --port COM3 --config baudrate=115200 > serial_log.txt 2>&1
```

---

## 🎬 AUTOMATED WORKFLOWS

### Makefile Shortcut (Windows/Linux/macOS)

Create `Makefile` in project root:

```makefile
BOARD = esp32:esp32:esp32s3:PSRAMSize=2M
PORT = /dev/ttyUSB0
SKETCH = herboratech-smartwatch/src/main.cpp

# Windows: export PORT=COM3

.PHONY: all build upload monitor clean

all: build upload monitor

build:
	@echo "🔨 Building firmware..."
	arduino-cli compile --fqbn $(BOARD) --build-properties compiler.cpp.extra_flags="-O3" --verbose $(SKETCH)

upload:
	@echo "📤 Uploading firmware..."
	arduino-cli upload --port $(PORT) --fqbn $(BOARD) $(SKETCH)

monitor:
	@echo "📺 Monitoring serial output..."
	arduino-cli monitor --port $(PORT) --config baudrate=115200

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf build/

quick: build upload
	@echo "✅ Build and upload complete!"

# Example usage:
# make build       → Compile only
# make upload      → Upload only
# make monitor     → Monitor serial
# make all         → Full cycle (build→upload→monitor)
# make quick       → Build + upload (no monitor)
```

**Usage:**
```bash
make build       # Compile
make quick       # Compile + upload
make all         # Compile + upload + monitor
make clean       # Clean build artifacts
```

### Bash Script Workflow (Linux/macOS)

Create `deploy.sh`:

```bash
#!/bin/bash
set -e  # Exit on error

BOARD="esp32:esp32:esp32s3:PSRAMSize=2M"
PORT="${1:-/dev/ttyUSB0}"  # Default to /dev/ttyUSB0, or use arg 1
SKETCH="herboratech-smartwatch/src/main.cpp"
BUILD_DIR="./build"

echo "🔨 Starting ESP32-S3 firmware build & deploy..."
echo "Board: $BOARD"
echo "Port: $PORT"

# Step 1: Compile
echo ""
echo "📦 Compiling firmware..."
if ! arduino-cli compile \
  --fqbn $BOARD \
  --output-dir $BUILD_DIR \
  --build-properties compiler.cpp.extra_flags="-O3 -DCORE_DEBUG_LEVEL=0" \
  $SKETCH; then
  echo "❌ Compilation failed!"
  exit 1
fi
echo "✅ Compilation successful"

# Step 2: Upload
echo ""
echo "📤 Uploading firmware to $PORT..."
if ! arduino-cli upload --port $PORT --fqbn $BOARD $SKETCH; then
  echo "❌ Upload failed! Check port and connections."
  exit 1
fi
echo "✅ Upload successful"

# Step 3: Monitor
echo ""
echo "📺 Monitoring serial output (Ctrl+C to stop)..."
arduino-cli monitor --port $PORT --config baudrate=115200

echo ""
echo "✅ Deployment complete!"
```

**Usage:**
```bash
chmod +x deploy.sh
./deploy.sh                    # Default port /dev/ttyUSB0
./deploy.sh /dev/ttyUSB1       # Custom port
./deploy.sh COM3               # Windows COM port
```

### PowerShell Script (Windows)

Create `deploy.ps1`:

```powershell
# ESP32-S3 Firmware Build & Deploy Script for Windows

param(
    [string]$Port = "COM3"
)

$board = "esp32:esp32:esp32s3:PSRAMSize=2M"
$sketch = "herboratech-smartwatch/src/main.cpp"
$buildDir = "./build"

Write-Host "🔨 Starting ESP32-S3 firmware build & deploy..." -ForegroundColor Cyan
Write-Host "Board: $board"
Write-Host "Port: $Port"

# Step 1: Compile
Write-Host ""
Write-Host "📦 Compiling firmware..." -ForegroundColor Yellow
$compileResult = & arduino-cli compile `
  --fqbn $board `
  --output-dir $buildDir `
  --build-properties "compiler.cpp.extra_flags=-O3 -DCORE_DEBUG_LEVEL=0" `
  $sketch

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Compilation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Compilation successful" -ForegroundColor Green

# Step 2: Upload
Write-Host ""
Write-Host "📤 Uploading firmware to $Port..." -ForegroundColor Yellow
$uploadResult = & arduino-cli upload --port $Port --fqbn $board $sketch

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed! Check port and connections." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Upload successful" -ForegroundColor Green

# Step 3: Monitor
Write-Host ""
Write-Host "📺 Monitoring serial output (Ctrl+C to stop)..." -ForegroundColor Yellow
& arduino-cli monitor --port $Port --config baudrate=115200

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
```

**Usage:**
```powershell
.\deploy.ps1                   # Default port COM3
.\deploy.ps1 -Port COM4        # Custom port
```

---

## 🔄 CI/CD PIPELINE (GitHub Actions)

Create `.github/workflows/build.yml`:

```yaml
name: Build ESP32-S3 Firmware

on:
  push:
    branches: [main, develop]
    paths:
      - 'src/**'
      - 'platformio.ini'
      - '.github/workflows/build.yml'
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Arduino CLI
        uses: arduino/setup-arduino-cli@v1

      - name: Add ESP32 board core
        run: arduino-cli core install esp32:esp32@3.0.0

      - name: Install required libraries
        run: |
          arduino-cli lib install LVGL:8.3.10
          arduino-cli lib install TFT_eSPI:2.5.0
          arduino-cli lib install GT911:1.0.0
          arduino-cli lib install Firebase\ Arduino\ Client\ Library\ for\ ESP32:4.4.2

      - name: Compile firmware
        run: |
          arduino-cli compile \
            --fqbn esp32:esp32:esp32s3:PSRAMSize=2M \
            --build-properties compiler.cpp.extra_flags="-O3 -DCORE_DEBUG_LEVEL=0" \
            --output-dir ./build \
            src/main.cpp

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: esp32-firmware
          path: build/

      - name: Check code size
        run: |
          ls -lh build/src/main.cpp.bin
          echo "Firmware size check passed ✓"
```

**Triggered automatically on:**
- Push to `main` or `develop`
- Pull request to `main`
- Changes to `src/`, `platformio.ini`, or workflow file

---

## 🐛 TROUBLESHOOTING

### Problem: Port not found

```bash
# Windows: List COM ports
mode

# Linux: List serial devices
ls -la /dev/ttyUSB* /dev/ttyACM*
sudo usermod -a -G dialout $USER  # Grant permissions

# macOS: List serial ports
ls -la /dev/cu.*

# General: Use verbose mode to diagnose
arduino-cli board list --verbose
```

### Problem: Upload fails with "Timed out"

```bash
# Manually reset ESP32 to bootloader mode:
# 1. Hold BOOT button (GPIO0)
# 2. Press EN (reset) button briefly
# 3. Release BOOT button
# 4. Retry upload

# Or use 1200bps touch (auto-reset):
arduino-cli upload --port COM3 --fqbn esp32:esp32:esp32s3:PSRAMSize=2M --use-1200bps-touch src/main.cpp
```

### Problem: Memory issues ("Not enough space")

```bash
# Check memory usage
arduino-cli compile --fqbn esp32:esp32:esp32s3:PSRAMSize=2M src/main.cpp --verbose 2>&1 | grep "bytes"

# Optimize with high-level settings
arduino-cli compile \
  --fqbn esp32:esp32:esp32s3:PSRAMSize=2M,Optimization=O3 \
  --build-properties compiler.cpp.extra_flags="-DCORE_DEBUG_LEVEL=0" \
  src/main.cpp
```

### Problem: Library conflicts

```bash
# List library dependencies
arduino-cli lib list

# Check specific library version
arduino-cli lib list | grep LVGL

# Uninstall conflicting version
arduino-cli lib uninstall LVGL

# Install specific version
arduino-cli lib install "LVGL:8.3.10"
```

---

## 📊 BUILD OPTIMIZATION FLAGS

```bash
# Speed optimization (faster execution)
--build-properties compiler.cpp.extra_flags="-O3 -march=xtensa-lx7"

# Size optimization (smaller binary)
--build-properties compiler.cpp.extra_flags="-Os -DCORE_DEBUG_LEVEL=0"

# Disable debug output (smaller, faster)
--build-properties compiler.cpp.extra_flags="-DCORE_DEBUG_LEVEL=0"

# All optimizations
arduino-cli compile \
  --fqbn esp32:esp32:esp32s3:PSRAMSize=2M \
  --build-properties compiler.cpp.extra_flags="-O3 -march=xtensa-lx7 -DCORE_DEBUG_LEVEL=0" \
  src/main.cpp
```

---

## ✅ VERIFICATION CHECKLIST

After deployment:

- [ ] Serial monitor shows startup messages
- [ ] LVGL screens render correctly
- [ ] Touch input responds (swipe left/right)
- [ ] Vital signs update (HR, SpO2, Temp)
- [ ] WiFi connects successfully
- [ ] Firebase data syncs
- [ ] Battery drain < 5% per day
- [ ] No memory leaks after 24h runtime

---

## 📚 USEFUL COMMANDS CHEATSHEET

| Task | Command |
|------|---------|
| **Verify sketch** | `arduino-cli compile --verify --fqbn esp32:esp32:esp32s3:PSRAMSize=2M src/main.cpp` |
| **List ports** | `arduino-cli board list` |
| **Compile only** | `arduino-cli compile --fqbn esp32:esp32:esp32s3:PSRAMSize=2M src/main.cpp` |
| **Upload** | `arduino-cli upload --port COM3 --fqbn esp32:esp32:esp32s3:PSRAMSize=2M src/main.cpp` |
| **Monitor** | `arduino-cli monitor --port COM3 --config baudrate=115200` |
| **List libs** | `arduino-cli lib list` |
| **Install lib** | `arduino-cli lib install "LVGL:8.3.10"` |
| **List cores** | `arduino-cli core list` |
| **Update core** | `arduino-cli core upgrade esp32:esp32` |

