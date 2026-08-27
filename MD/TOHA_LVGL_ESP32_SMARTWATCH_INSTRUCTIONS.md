# 📱 TOHA — LVGL ESP32-S3 Smartwatch UI Implementation

**Project:** HerboraTech Smartwatch — 1.47" AMOLED Touch Display
**Device:** ESP32-S3 Development Board (240MHz, 320KB SRAM, 8MB Flash)
**Framework:** LVGL 8.3+ (Light and Versatile Graphics Library)
**UI Design:** 3-screen carousel (Dashboard, Details, Alerts)
**Target:** Real-time vital signs monitoring with touch interaction
**Execution Time:** 4–6 weeks (phased development)
**Language:** C/C++ (Arduino IDE or PlatformIO)

---

## 📋 PREREQUISITES & DEPENDENCIES

### Hardware Requirements
- **MCU:** ESP32-S3 with PSRAM (2MB minimum)
- **Display:** 1.47" AMOLED 170×320px capacitive touchscreen
- **Connectivity:** WiFi + Bluetooth LE (onboard ESP32-S3)
- **Sensors:** Optional (HR, SpO2, Temp simulated for initial dev)
- **Power:** Li-ion battery 300–400 mAh with charging circuit

### Software Stack
```
PlatformIO / Arduino IDE
├── ESP32-S3 Dev Board
├── LVGL 8.3.0
├── TFT_eSPI (display driver)
├── TouchPad library (GT911 capacitive touch)
├── Firebase Realtime Database (WiFi sync)
└── FreeRTOS (task scheduling)
```

### Compiler & Tools
- **Arduino IDE:** v2.0+ OR **PlatformIO:** v6.0+
- **Python 3.8+** (for build scripts)
- **Git** (for version control)
- **Visual Studio Code** (recommended IDE)

---

## 🔧 PHASE 1: ENVIRONMENT SETUP (1–2 days)

### Step 1.1: Install PlatformIO
```bash
# Via pip (recommended for reproducibility)
pip install platformio

# Or download from: https://platformio.org/install/ide

# Verify installation
pio --version
```

### Step 1.2: Create ESP32-S3 Project
```bash
# Create new project
pio project init -d herboratech_smartwatch -b esp32-s3-devkitc-1

cd herboratech_smartwatch

# Project structure will be:
# herboratech_smartwatch/
# ├── platformio.ini          ← Configuration
# ├── src/
# │   ├── main.cpp            ← Entry point
# │   ├── ui/                 ← LVGL screens
# │   ├── sensors/            ← Sensor drivers
# │   ├── network/            ← WiFi/BLE
# │   └── config.h            ← Settings
# ├── lib/                     ← Dependencies
# ├── include/                 ← Headers
# └── data/                    ← Assets (fonts, images)
```

### Step 1.3: Configure platformio.ini
```ini
[env:esp32-s3-devkitc-1]
platform = espressif32
board = esp32-s3-devkitc-1
framework = arduino
monitor_speed = 115200
upload_speed = 460800

# LVGL Configuration
build_flags =
    -DLVGL_CONF_INCLUDE_SIMPLE
    -DLV_CONF_SKIP=0
    -DARDUINO_USB_CDC_ON_BOOT=0

# Libraries
lib_deps =
    lvgl/lvgl@^8.3.0
    bodmer/TFT_eSPI@^2.5.0
    bblanchon/ArduinoJson@^6.21.0
    firebase/Firebase Arduino Client Library for ESP32@^4.4.0
    madhephaestus/ESP32Servo@^0.13.0

# Memory optimization
board_build.partitions = default.csv
board_build.f_cpu = 240000000L
board_build.f_flash = 80000000L
board_upload.flash_size = 8MB

# Serial logging
monitor_filters = esp32_exception_decoder
```

### Step 1.4: Install LVGL & Dependencies
```bash
# PlatformIO will auto-install from platformio.ini
# Or manually:
pio lib install "lvgl/lvgl@^8.3.0"
pio lib install "bodmer/TFT_eSPI@^2.5.0"

# Verify
pio lib list
```

### Step 1.5: Configure TFT_eSPI for 1.47" Display
Create `lib/TFT_eSPI/User_Setup.h`:
```c
// TFT_eSPI Setup for 1.47" AMOLED (170x320px)

#define ST7789_DRIVER       // AMOLED controller
#define TFT_WIDTH  170
#define TFT_HEIGHT 320
#define TFT_ROTATION 1      // Portrait mode

// ESP32-S3 Pin Configuration
#define TFT_CS   10         // Chip select
#define TFT_DC   9          // Data/Command
#define TFT_RST  8          // Reset
#define TFT_MOSI 11         // SPI MOSI
#define TFT_SCLK 12         // SPI Clock
#define TFT_MISO 13         // SPI MISO (optional)

#define SPI_FREQUENCY       40000000  // 40MHz SPI clock
#define SPI_READ_FREQUENCY  20000000  // 20MHz read

// Touch Panel Configuration (GT911 capacitive)
#define TOUCH_CS    6       // Touch chip select
#define TOUCH_IRQ   7       // Touch interrupt
#define I2C_SDA     14      // I2C data
#define I2C_SCL     15      // I2C clock

// LVGL Config
#define LV_HOR_RES_MAX      170
#define LV_VER_RES_MAX      320
#define LV_COLOR_DEPTH      16    // 16-bit RGB565
#define LV_USE_FILESYSTEM   1     // Enable file system
```

### Step 1.6: Build & Test
```bash
# Build project
pio run -e esp32-s3-devkitc-1

# Upload to device
pio run -e esp32-s3-devkitc-1 -t upload

# Monitor serial output
pio device monitor -e esp32-s3-devkitc-1
```

**Expected Output:**
```
[I] LVGL version: 8.3.0
[I] Display initialized: 170x320
[I] Touch calibrated: 4-point
[I] Ready for UI rendering
```

---

## 🎨 PHASE 2: LVGL SETUP & WIDGET CREATION (3–5 days)

### Step 2.1: LVGL Initialization
File: `src/lvgl_init.cpp`

```cpp
#include "lvgl.h"
#include "TFT_eSPI.h"

// Display buffer (LVGL requires 2 buffers minimum)
#define DISP_BUF_SIZE (170 * 320)
static lv_color_t buf1[DISP_BUF_SIZE];
static lv_color_t buf2[DISP_BUF_SIZE];

static TFT_eSPI tft = TFT_eSPI();

// LVGL callback: Display flush (push pixels to screen)
void disp_flush(lv_disp_drv_t *disp, const lv_area_t *area, lv_color_t *color_p) {
    uint32_t w = (area->x2 - area->x1 + 1);
    uint32_t h = (area->y2 - area->y1 + 1);

    tft.startWrite();
    tft.setAddrWindow(area->x1, area->y1, w, h);
    tft.pushColors((uint16_t *)&color_p->full, w * h, true);
    tft.endWrite();

    lv_disp_flush_ready(disp);
}

// LVGL callback: Touch input
void touch_read(lv_indev_drv_t *indev_drv, lv_indev_data_t *data) {
    uint16_t x = 0, y = 0;
    bool touched = tft.getTouch(&x, &y);

    data->state = touched ? LV_INDEV_STATE_PR : LV_INDEV_STATE_REL;
    data->point.x = x;
    data->point.y = y;
}

void lvgl_init() {
    lv_init();

    // Register display driver
    static lv_disp_drv_t disp_drv;
    lv_disp_drv_init(&disp_drv);

    disp_drv.hor_res = 170;
    disp_drv.ver_res = 320;
    disp_drv.flush_cb = disp_flush;
    disp_drv.buf = (lv_disp_buf_t *)malloc(sizeof(lv_disp_buf_t));
    lv_disp_buf_init(disp_drv.buf, buf1, buf2, DISP_BUF_SIZE);

    lv_disp_drv_register(&disp_drv);

    // Register touch input driver
    static lv_indev_drv_t indev_drv;
    lv_indev_drv_init(&indev_drv);

    indev_drv.type = LV_INDEV_TYPE_POINTER;
    indev_drv.read_cb = touch_read;

    lv_indev_drv_register(&indev_drv);

    Serial.println("[LVGL] Initialized successfully");
}
```

### Step 2.2: Create Color Theme
File: `src/ui/theme.h`

```cpp
#ifndef THEME_H
#define THEME_H

#include "lvgl.h"

// Color Palette (RGB565 format)
#define COLOR_BG        lv_color_hex(0x141923)   // Dark background
#define COLOR_CARD      lv_color_hex(0x232D3C)   // Card background
#define COLOR_PRIMARY   lv_color_hex(0x27AE60)   // Green accent
#define COLOR_PRIMARY_DARK lv_color_hex(0x1E8449)
#define COLOR_TEXT      lv_color_hex(0xF5F8FC)   // White text
#define COLOR_TEXT_SEC  lv_color_hex(0xB4BED2)   // Gray text
#define COLOR_ALERT     lv_color_hex(0xEB5757)   // Red alert
#define COLOR_WARNING   lv_color_hex(0xF29934)   // Orange warning

// Font sizes (adapted for small screen)
#define FONT_XL         lv_font_montserrat_22    // 22px (titles)
#define FONT_LG         lv_font_montserrat_16    // 16px (values)
#define FONT_MD         lv_font_montserrat_12    // 12px (labels)
#define FONT_SM         lv_font_montserrat_10    // 10px (small text)

// Create custom theme
lv_theme_t *theme_create() {
    lv_theme_t *th = lv_theme_alloc();

    // Set colors
    lv_theme_set_color_primary(th, COLOR_PRIMARY);
    lv_theme_set_color_secondary(th, COLOR_PRIMARY_DARK);

    // Apply background
    lv_obj_set_style_bg_color(lv_scr_act(), COLOR_BG, 0);

    return th;
}

#endif
```

### Step 2.3: Create Gauge Widget
File: `src/ui/widgets/gauge.cpp`

```cpp
#include "lvgl.h"

// Draw circular gauge (60x60px)
lv_obj_t *create_gauge(lv_obj_t *parent, const char *label, const char *unit,
                       uint16_t min_val, uint16_t max_val, uint16_t current_val) {

    // Main container
    lv_obj_t *gauge_cont = lv_obj_create(parent);
    lv_obj_set_size(gauge_cont, 60, 75);
    lv_obj_set_style_bg_color(gauge_cont, COLOR_CARD, 0);
    lv_obj_set_style_border_width(gauge_cont, 0, 0);
    lv_obj_set_style_pad_all(gauge_cont, 4, 0);

    // Gauge arc (circular progress)
    lv_obj_t *arc = lv_arc_create(gauge_cont);
    lv_obj_set_size(arc, 50, 50);
    lv_arc_set_range(arc, min_val, max_val);
    lv_arc_set_value(arc, current_val);
    lv_arc_set_bg_angles(arc, 0, 360);
    lv_obj_set_style_arc_color(arc, COLOR_PRIMARY, LV_PART_INDICATOR);
    lv_obj_set_style_arc_color(arc, COLOR_CARD, LV_PART_MAIN);
    lv_obj_set_style_arc_width(arc, 3, 0);

    // Center value text
    lv_obj_t *value_label = lv_label_create(gauge_cont);
    lv_label_set_text_fmt(value_label, "%d", current_val);
    lv_obj_set_style_text_font(value_label, FONT_LG, 0);
    lv_obj_set_style_text_color(value_label, COLOR_TEXT, 0);
    lv_obj_align(value_label, arc, LV_ALIGN_CENTER, 0, -8);

    // Unit label
    lv_obj_t *unit_label = lv_label_create(gauge_cont);
    lv_label_set_text(unit_label, unit);
    lv_obj_set_style_text_font(unit_label, FONT_SM, 0);
    lv_obj_set_style_text_color(unit_label, COLOR_TEXT_SEC, 0);
    lv_obj_align(unit_label, value_label, LV_ALIGN_OUT_BOTTOM_MID, 0, 2);

    // Legend label
    lv_obj_t *label_text = lv_label_create(gauge_cont);
    lv_label_set_text(label_text, label);
    lv_obj_set_style_text_font(label_text, FONT_SM, 0);
    lv_obj_set_style_text_color(label_text, COLOR_TEXT_SEC, 0);
    lv_obj_align(label_text, gauge_cont, LV_ALIGN_OUT_BOTTOM_MID, 0, 2);

    // Store references for updates
    lv_obj_set_user_data(gauge_cont, arc);

    return gauge_cont;
}

// Update gauge value
void update_gauge(lv_obj_t *gauge, uint16_t new_value) {
    lv_arc_t *arc = (lv_arc_t *)lv_obj_get_user_data(gauge);
    lv_arc_set_value(arc, new_value);
}
```

### Step 2.4: Create Screen Manager
File: `src/ui/screen_manager.cpp`

```cpp
#include "lvgl.h"

typedef enum {
    SCREEN_DASHBOARD = 0,
    SCREEN_DETAILS = 1,
    SCREEN_ALERTS = 2,
    SCREEN_COUNT = 3
} screen_id_t;

static lv_obj_t *screens[SCREEN_COUNT];
static screen_id_t current_screen = SCREEN_DASHBOARD;

// Screen container
lv_obj_t *create_screen(const char *title) {
    lv_obj_t *scr = lv_obj_create(NULL);
    lv_obj_set_size(scr, 170, 320);
    lv_obj_set_style_bg_color(scr, COLOR_BG, 0);

    // Status bar
    lv_obj_t *status_bar = lv_obj_create(scr);
    lv_obj_set_size(status_bar, 170, 35);
    lv_obj_set_style_bg_color(status_bar, lv_color_hex(0x0a1115), 0);
    lv_obj_align(status_bar, scr, LV_ALIGN_TOP_MID, 0, 0);

    // Title
    lv_obj_t *title_label = lv_label_create(scr);
    lv_label_set_text(title_label, title);
    lv_obj_set_style_text_font(title_label, FONT_MD, 0);
    lv_obj_set_style_text_color(title_label, COLOR_PRIMARY, 0);
    lv_obj_align(title_label, status_bar, LV_ALIGN_CENTER, 0, 0);

    // Content area (scrollable)
    lv_obj_t *content = lv_obj_create(scr);
    lv_obj_set_size(content, 170, 280);
    lv_obj_set_pos(content, 0, 35);
    lv_obj_set_style_bg_color(content, COLOR_BG, 0);
    lv_obj_set_style_border_width(content, 0, 0);
    lv_obj_set_scroll_dir(content, LV_DIR_VER);

    return scr;
}

// Transition between screens (slide animation)
void screen_transition(screen_id_t new_screen) {
    if (new_screen == current_screen) return;

    lv_obj_t *old_scr = screens[current_screen];
    lv_obj_t *new_scr = screens[new_screen];

    // Slide out old screen
    lv_anim_t a_out;
    lv_anim_init(&a_out);
    lv_anim_set_var(&a_out, old_scr);
    lv_anim_set_values(&a_out, 0, -170);
    lv_anim_set_exec_cb(&a_out, (lv_anim_exec_xcb_t)lv_obj_set_x);
    lv_anim_set_time(&a_out, 300);
    lv_anim_set_path(&a_out, lv_anim_path_ease_out);
    lv_anim_start(&a_out);

    // Slide in new screen
    lv_anim_t a_in;
    lv_anim_init(&a_in);
    lv_anim_set_var(&a_in, new_scr);
    lv_anim_set_values(&a_in, 170, 0);
    lv_anim_set_exec_cb(&a_in, (lv_anim_exec_xcb_t)lv_obj_set_x);
    lv_anim_set_time(&a_in, 300);
    lv_anim_set_path(&a_in, lv_anim_path_ease_out);
    lv_anim_start(&a_in);

    current_screen = new_screen;
}

// Navigate with swipe gesture
void handle_swipe(int16_t dx) {
    if (dx > 30) {  // Swipe left → next screen
        screen_transition((screen_id_t)((current_screen + 1) % SCREEN_COUNT));
    } else if (dx < -30) {  // Swipe right → prev screen
        screen_transition((screen_id_t)((current_screen - 1 + SCREEN_COUNT) % SCREEN_COUNT));
    }
}
```

---

## 📊 PHASE 3: BUILD 3 SCREENS (2–3 weeks)

### Screen 1: Dashboard (Vital Signs)
File: `src/ui/screens/screen_dashboard.cpp`

```cpp
#include "lvgl.h"
#include "../widgets/gauge.cpp"

lv_obj_t *create_dashboard() {
    lv_obj_t *scr = create_screen("Vital Signs");

    // Get content area
    lv_obj_t *content = lv_obj_get_child(scr, 1);

    // Create 2x2 gauge grid
    lv_obj_t *gauge_hr = create_gauge(content, "HR", "bpm", 40, 200, 72);
    lv_obj_align(gauge_hr, content, LV_ALIGN_TOP_LEFT, 2, 10);

    lv_obj_t *gauge_spo2 = create_gauge(content, "SpO2", "%", 70, 100, 98);
    lv_obj_align(gauge_spo2, gauge_hr, LV_ALIGN_OUT_RIGHT_MID, 10, 0);

    lv_obj_t *gauge_temp = create_gauge(content, "Temp", "°C", 35, 40, 36.8);
    lv_obj_align(gauge_temp, gauge_hr, LV_ALIGN_OUT_BOTTOM_LEFT, 0, 15);

    lv_obj_t *gauge_steps = create_gauge(content, "Steps", "k", 0, 50, 8.45);
    lv_obj_align(gauge_steps, gauge_spo2, LV_ALIGN_OUT_BOTTOM_LEFT, 0, 15);

    // Status indicator
    lv_obj_t *status_container = lv_obj_create(content);
    lv_obj_set_size(status_container, 160, 30);
    lv_obj_set_style_bg_color(status_container, COLOR_CARD, 0);
    lv_obj_align(status_container, content, LV_ALIGN_BOTTOM_MID, 0, -20);

    lv_obj_t *status_label = lv_label_create(status_container);
    lv_label_set_text(status_label, "All Systems Normal ✓");
    lv_obj_set_style_text_font(status_label, FONT_SM, 0);
    lv_obj_set_style_text_color(status_label, COLOR_PRIMARY, 0);
    lv_obj_align(status_label, status_container, LV_ALIGN_CENTER, 0, 0);

    return scr;
}
```

### Screen 2: Detailed Metrics
File: `src/ui/screens/screen_details.cpp`

```cpp
#include "lvgl.h"

lv_obj_t *create_details() {
    lv_obj_t *scr = create_screen("Vital Details");
    lv_obj_t *content = lv_obj_get_child(scr, 1);

    // Metric 1: Heart Rate
    lv_obj_t *card1 = lv_obj_create(content);
    lv_obj_set_size(card1, 160, 50);
    lv_obj_set_style_bg_color(card1, COLOR_CARD, 0);
    lv_obj_set_style_border_color(card1, COLOR_PRIMARY, 0);
    lv_obj_set_border_width(card1, 1, 0);
    lv_obj_align(card1, content, LV_ALIGN_TOP_MID, 0, 5);

    lv_obj_t *title1 = lv_label_create(card1);
    lv_label_set_text(title1, "❤️ Heart Rate");
    lv_obj_set_style_text_font(title1, FONT_MD, 0);
    lv_obj_set_style_text_color(title1, COLOR_TEXT, 0);
    lv_obj_align(title1, card1, LV_ALIGN_TOP_LEFT, 4, 2);

    lv_obj_t *value1 = lv_label_create(card1);
    lv_label_set_text(value1, "72 bpm");
    lv_obj_set_style_text_font(value1, FONT_LG, 0);
    lv_obj_set_style_text_color(value1, COLOR_PRIMARY, 0);
    lv_obj_align(value1, card1, LV_ALIGN_BOTTOM_LEFT, 4, -2);

    lv_obj_t *trend1 = lv_label_create(card1);
    lv_label_set_text(trend1, "↓ -2");
    lv_obj_set_style_text_font(trend1, FONT_SM, 0);
    lv_obj_set_style_text_color(trend1, COLOR_TEXT_SEC, 0);
    lv_obj_align(trend1, card1, LV_ALIGN_TOP_RIGHT, -4, 2);

    // Metric 2: Blood Oxygen
    lv_obj_t *card2 = lv_obj_create(content);
    lv_obj_set_size(card2, 160, 50);
    lv_obj_set_style_bg_color(card2, COLOR_CARD, 0);
    lv_obj_align(card2, card1, LV_ALIGN_OUT_BOTTOM_MID, 0, 5);

    lv_obj_t *title2 = lv_label_create(card2);
    lv_label_set_text(title2, "🫁 Blood Oxygen");
    lv_obj_set_style_text_font(title2, FONT_MD, 0);
    lv_obj_set_style_text_color(title2, COLOR_TEXT, 0);
    lv_obj_align(title2, card2, LV_ALIGN_TOP_LEFT, 4, 2);

    lv_obj_t *value2 = lv_label_create(card2);
    lv_label_set_text(value2, "98%");
    lv_obj_set_style_text_font(value2, FONT_LG, 0);
    lv_obj_set_style_text_color(value2, COLOR_PRIMARY, 0);
    lv_obj_align(value2, card2, LV_ALIGN_BOTTOM_LEFT, 4, -2);

    // Metric 3: Temperature
    lv_obj_t *card3 = lv_obj_create(content);
    lv_obj_set_size(card3, 160, 50);
    lv_obj_set_style_bg_color(card3, COLOR_CARD, 0);
    lv_obj_align(card3, card2, LV_ALIGN_OUT_BOTTOM_MID, 0, 5);

    lv_obj_t *title3 = lv_label_create(card3);
    lv_label_set_text(title3, "🌡️ Temperature");
    lv_obj_set_style_text_font(title3, FONT_MD, 0);
    lv_obj_set_style_text_color(title3, COLOR_TEXT, 0);
    lv_obj_align(title3, card3, LV_ALIGN_TOP_LEFT, 4, 2);

    lv_obj_t *value3 = lv_label_create(card3);
    lv_label_set_text(value3, "36.8°C");
    lv_obj_set_style_text_font(value3, FONT_LG, 0);
    lv_obj_set_style_text_color(value3, COLOR_PRIMARY, 0);
    lv_obj_align(value3, card3, LV_ALIGN_BOTTOM_LEFT, 4, -2);

    // Scroll hint
    lv_obj_t *scroll_hint = lv_label_create(content);
    lv_label_set_text(scroll_hint, "↑ Scroll for more");
    lv_obj_set_style_text_font(scroll_hint, FONT_SM, 0);
    lv_obj_set_style_text_color(scroll_hint, COLOR_TEXT_SEC, 0);
    lv_obj_align(scroll_hint, content, LV_ALIGN_BOTTOM_MID, 0, -5);

    return scr;
}
```

### Screen 3: Alerts & Actions
File: `src/ui/screens/screen_alerts.cpp`

```cpp
#include "lvgl.h"

lv_obj_t *create_alerts() {
    lv_obj_t *scr = create_screen("Alerts & Actions");
    lv_obj_t *content = lv_obj_get_child(scr, 1);

    // Alert banner (if active)
    lv_obj_t *alert_banner = lv_obj_create(content);
    lv_obj_set_size(alert_banner, 160, 35);
    lv_obj_set_style_bg_color(alert_banner, lv_color_hex(0x2d1b1b), 0);
    lv_obj_set_style_border_color(alert_banner, COLOR_ALERT, 0);
    lv_obj_set_border_width(alert_banner, 2, 0);
    lv_obj_align(alert_banner, content, LV_ALIGN_TOP_MID, 0, 5);

    lv_obj_t *alert_text = lv_label_create(alert_banner);
    lv_label_set_text(alert_text, "✓ No Active Alerts");
    lv_obj_set_style_text_font(alert_text, FONT_SM, 0);
    lv_obj_set_style_text_color(alert_text, COLOR_PRIMARY, 0);
    lv_obj_align(alert_text, alert_banner, LV_ALIGN_CENTER, 0, 0);

    // Quick action buttons (2x2 grid)
    // Button 1: Emergency Call
    lv_obj_t *btn1 = lv_btn_create(content);
    lv_obj_set_size(btn1, 70, 55);
    lv_obj_align(btn1, content, LV_ALIGN_CENTER, -40, 50);
    lv_obj_set_style_bg_color(btn1, COLOR_PRIMARY, 0);
    lv_obj_set_style_radius(btn1, 8, 0);

    lv_obj_t *btn1_label = lv_label_create(btn1);
    lv_label_set_text(btn1_label, "📞\nEmergency");
    lv_obj_set_style_text_font(btn1_label, FONT_SM, 0);
    lv_obj_set_style_text_color(btn1_label, COLOR_TEXT, 0);
    lv_obj_align(btn1_label, btn1, LV_ALIGN_CENTER, 0, 0);

    // Button 2: Medications
    lv_obj_t *btn2 = lv_btn_create(content);
    lv_obj_set_size(btn2, 70, 55);
    lv_obj_align(btn2, btn1, LV_ALIGN_OUT_RIGHT_MID, 10, 0);
    lv_obj_set_style_bg_color(btn2, COLOR_PRIMARY, 0);

    lv_obj_t *btn2_label = lv_label_create(btn2);
    lv_label_set_text(btn2_label, "💊\nMeds");
    lv_obj_set_style_text_font(btn2_label, FONT_SM, 0);
    lv_obj_set_style_text_color(btn2_label, COLOR_TEXT, 0);
    lv_obj_align(btn2_label, btn2, LV_ALIGN_CENTER, 0, 0);

    // Button 3: Doctor
    lv_obj_t *btn3 = lv_btn_create(content);
    lv_obj_set_size(btn3, 70, 55);
    lv_obj_align(btn3, btn1, LV_ALIGN_OUT_BOTTOM_LEFT, 0, 15);
    lv_obj_set_style_bg_color(btn3, COLOR_PRIMARY, 0);

    lv_obj_t *btn3_label = lv_label_create(btn3);
    lv_label_set_text(btn3_label, "📱\nDoctor");
    lv_obj_set_style_text_font(btn3_label, FONT_SM, 0);
    lv_obj_set_style_text_color(btn3_label, COLOR_TEXT, 0);
    lv_obj_align(btn3_label, btn3, LV_ALIGN_CENTER, 0, 0);

    // Button 4: Clinic
    lv_obj_t *btn4 = lv_btn_create(content);
    lv_obj_set_size(btn4, 70, 55);
    lv_obj_align(btn4, btn3, LV_ALIGN_OUT_RIGHT_MID, 10, 0);
    lv_obj_set_style_bg_color(btn4, COLOR_PRIMARY, 0);

    lv_obj_t *btn4_label = lv_label_create(btn4);
    lv_label_set_text(btn4_label, "🏥\nClinic");
    lv_obj_set_style_text_font(btn4_label, FONT_SM, 0);
    lv_obj_set_style_text_color(btn4_label, COLOR_TEXT, 0);
    lv_obj_align(btn4_label, btn4, LV_ALIGN_CENTER, 0, 0);

    return scr;
}
```

---

## ⚡ PHASE 4: SENSOR INTEGRATION & DATA FLOW (1–2 weeks)

### Sensor Data Structure
File: `src/sensors/vitals.h`

```cpp
#ifndef VITALS_H
#define VITALS_H

#include <stdint.h>

typedef struct {
    uint16_t heart_rate;      // 40-200 bpm
    uint8_t spo2;             // 70-100%
    float temperature;        // 35-40°C
    uint32_t step_count;      // 0-50000/day
    int16_t hr_trend;         // Change in past hour
    uint8_t battery;          // 0-100%
    uint32_t timestamp;       // Unix timestamp
} VitalSigns_t;

// Global vitals (updated by sensors)
extern VitalSigns_t g_vitals;

// Sensor initialization
void sensors_init();

// Read sensor values (non-blocking)
void sensors_update();

// For development: Simulate sensor data
void sensors_simulate();

#endif
```

### Simulate Sensor Data
File: `src/sensors/vitals.cpp`

```cpp
#include "vitals.h"
#include "time.h"

VitalSigns_t g_vitals = {
    .heart_rate = 72,
    .spo2 = 98,
    .temperature = 36.8f,
    .step_count = 8450,
    .hr_trend = -2,
    .battery = 92,
    .timestamp = 0
};

void sensors_init() {
    // Initialize I2C, ADC, etc.
    Serial.println("[SENSORS] Initialized");
}

void sensors_simulate() {
    // Simulate realistic vital sign changes
    static uint32_t last_update = 0;
    uint32_t now = millis();

    if (now - last_update < 1000) return;  // Update every 1 second

    // HR: +/- 2-3 bpm randomly
    g_vitals.heart_rate = 70 + random(10);

    // SpO2: Usually stable at 95-100%
    g_vitals.spo2 = 95 + random(6);

    // Temp: Slowly drift
    static float temp_drift = 36.8f;
    temp_drift += (random(100) - 50) * 0.001f;
    g_vitals.temperature = constrain(temp_drift, 36.0f, 38.0f);

    // Steps: Increase during day
    g_vitals.step_count = 8450 + (millis() / 10000);

    // Battery: Slowly decrease
    g_vitals.battery = max(0, 92 - (millis() / 3600000));

    g_vitals.timestamp = now / 1000;
    last_update = now;
}

void sensors_update() {
    // Call actual sensor read here
    // For now, simulate
    sensors_simulate();
}
```

### Update UI with Live Data
File: `src/main.cpp`

```cpp
#include "Arduino.h"
#include "lvgl.h"
#include "TFT_eSPI.h"
#include "sensors/vitals.h"
#include "ui/screens/screen_dashboard.cpp"

static lv_obj_t *gauge_hr_ref;
static lv_obj_t *gauge_spo2_ref;

void setup() {
    Serial.begin(115200);
    delay(100);

    // Initialize LVGL + display
    lvgl_init();

    // Initialize sensors (simulated)
    sensors_init();

    // Create dashboard
    lv_obj_t *dashboard = create_dashboard();
    lv_scr_load(dashboard);

    Serial.println("[APP] Setup complete");
}

void loop() {
    // Update sensors
    sensors_update();

    // Update UI gauges with live data
    if (gauge_hr_ref) update_gauge(gauge_hr_ref, g_vitals.heart_rate);
    if (gauge_spo2_ref) update_gauge(gauge_spo2_ref, g_vitals.spo2);

    // LVGL task handler
    lv_task_handler();
    delay(5);
}
```

---

## 🔌 PHASE 5: WiFi & FIREBASE SYNC (1 week)

### Firebase Connection
File: `src/network/firebase_sync.cpp`

```cpp
#include "Arduino.h"
#include "WiFi.h"
#include "Firebase_ESP_Client.h"

#define WIFI_SSID "YOUR_SSID"
#define WIFI_PASSWORD "YOUR_PASSWORD"
#define FIREBASE_API_KEY "YOUR_KEY"
#define FIREBASE_PROJECT_ID "vitalora"

FirebaseData fbdo;
FirebaseConfig config;

void firebase_init() {
    // Connect WiFi
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    int retry = 0;
    while (WiFi.status() != WL_CONNECTED && retry < 20) {
        delay(500);
        Serial.print(".");
        retry++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n[FIREBASE] WiFi connected");
    }

    // Configure Firebase
    config.api_key = FIREBASE_API_KEY;
    config.database_url = "https://herboratech-default-rtdb.firebaseio.com";

    Firebase.begin(&config, &fbdo);
}

void firebase_sync_vitals() {
    // Upload current vitals every 5 minutes
    static uint32_t last_sync = 0;
    if (millis() - last_sync < 300000) return;

    String path = "/devices/esp32s3_001/vitals";

    FirebaseJson json;
    json.set("heart_rate", (int)g_vitals.heart_rate);
    json.set("spo2", (int)g_vitals.spo2);
    json.set("temperature", g_vitals.temperature);
    json.set("timestamp", (long)g_vitals.timestamp);

    if (Firebase.patch(fbdo, path.c_str(), &json)) {
        Serial.println("[FIREBASE] Sync successful");
    } else {
        Serial.println("[FIREBASE] Sync failed: " + fbdo.errorReason());
    }

    last_sync = millis();
}
```

---

## 📋 BUILD & DEPLOYMENT CHECKLIST

### Pre-Build Verification
```bash
# [ ] All header files in place
# [ ] platformio.ini configured for ESP32-S3
# [ ] TFT_eSPI User_Setup.h configured
# [ ] No compilation warnings
# [ ] Lint check passed

pio check --fail-on-warnings
```

### Build & Upload
```bash
# Build
pio run -e esp32-s3-devkitc-1

# Upload
pio run -e esp32-s3-devkitc-1 -t upload

# Monitor
pio device monitor -e esp32-s3-devkitc-1
```

### On-Device Testing
```
[ ] Display shows all 3 screens
[ ] Touch responds correctly (tap gauges)
[ ] Swipe gestures work (left/right)
[ ] Animations smooth (30+ fps)
[ ] Gauges update with live data
[ ] Colors correct on device
[ ] No memory leaks (SRAM stable)
[ ] WiFi connects successfully
[ ] Firebase sync works
[ ] Battery drain acceptable (<5%/day idle)
```

---

## ⏱️ TOTAL TIMELINE

| Phase | Task | Time |
|-------|------|------|
| 1 | Environment + PlatformIO setup | 1–2 days |
| 2 | LVGL init + widget creation | 3–5 days |
| 3 | Build 3 screens (Dashboard, Details, Alerts) | 2–3 weeks |
| 4 | Sensor integration + live data flow | 1–2 weeks |
| 5 | WiFi + Firebase sync | 1 week |
| 6 | Polish + optimization | 3–5 days |
| **TOTAL** | **Complete smartwatch** | **4–6 weeks** |

---

## 📁 FINAL PROJECT STRUCTURE

```
herboratech_smartwatch/
├── platformio.ini
├── src/
│   ├── main.cpp
│   ├── lvgl_init.cpp
│   ├── ui/
│   │   ├── theme.h
│   │   ├── screen_manager.cpp
│   │   ├── widgets/
│   │   │   ├── gauge.cpp
│   │   │   └── button.cpp
│   │   └── screens/
│   │       ├── screen_dashboard.cpp
│   │       ├── screen_details.cpp
│   │       └── screen_alerts.cpp
│   ├── sensors/
│   │   ├── vitals.h
│   │   └── vitals.cpp
│   ├── network/
│   │   └── firebase_sync.cpp
│   └── config.h
├── lib/
│   └── TFT_eSPI/
│       └── User_Setup.h
├── data/
│   ├── fonts/
│   └── images/
└── build/
    └── [compiled firmware]
```

---

**Status:** ✅ **READY FOR IMPLEMENTATION**
**Framework:** LVGL 8.3+
**Device:** ESP32-S3 (240MHz, 2MB PSRAM)
**Timeline:** 4–6 weeks phased development
**Expected Result:** Fully functional smartwatch with real-time vitals + WiFi sync

🚀 **Ready to start TOHA LVGL development!**
