# 🎨 LVGL 8.3 CONFIGURATION GUIDE — ESP32-S3 Smartwatch

**LVGL Version:** 8.3.10
**Device:** ESP32-S3 with 1.47" AMOLED display (170×320px)
**Memory:** 320KB SRAM + 2MB PSRAM
**Purpose:** Complete LVGL setup for HerboraTech smartwatch UI

---

## 📋 OVERVIEW

LVGL (Light and Versatile Graphics Library) is an embedded UI library optimized for low-power microcontrollers.

**Why LVGL for HerboraTech Smartwatch:**
- ✅ Minimal memory footprint (can run on 50KB SRAM)
- ✅ Hardware acceleration support (display driver integration)
- ✅ Touch input handling (GT911 capacitive controller)
- ✅ Pre-built widgets (gauges, buttons, spinners, etc.)
- ✅ Smooth animations & transitions
- ✅ Customizable themes & fonts

---

## 🔧 INSTALLATION

### Step 1: Install LVGL Library

```bash
# Via Arduino IDE Library Manager:
# Sketch → Include Library → Manage Libraries
# Search: "LVGL"
# Install: LVGL by Kirill Karamov (version 8.3.10)

# Via Arduino CLI:
arduino-cli lib install LVGL:8.3.10

# Via PlatformIO:
# Add to platformio.ini:
lib_deps =
    LVGL>=8.3.10
```

### Step 2: Create LVGL Configuration File

Create `lv_conf.h` in your project's root (or in libraries folder):

```cpp
/**
 * @file lv_conf.h
 * LVGL Configuration for HerboraTech ESP32-S3 Smartwatch
 * Generated: 2026-03-25
 */

#ifndef LV_CONF_H
#define LV_CONF_H

/* ============================================
   COLOR SETTINGS
   ============================================ */

// Color depth: 16 (RGB565) for AMOLED displays
#define LV_COLOR_DEPTH 16

// Whether to use chroma-keying (transparency color)
#define LV_COLOR_SCREEN_TRANSP 0

/* ============================================
   MEMORY SETTINGS
   ============================================ */

// Memory size (KB) for LVGL internal use
// ESP32-S3 has 320KB SRAM, allocate 80KB for LVGL
#define LV_MEM_SIZE (80 * 1024U)

// Use custom malloc/free (optional)
#define LV_MEM_CUSTOM 0

/* ============================================
   DISPLAY SETTINGS
   ============================================ */

// Display width & height (MUST match physical display)
#define LV_HOR_RES_MAX 170
#define LV_VER_RES_MAX 320

// Display buffer size (in pixels)
// Rule: buffer_size = (HOR_RES * VER_RES) / 10
// For 170×320: 170 * 320 / 10 = 5,440 pixels
#define LV_DISP_BUF_SIZE (170 * 320 / 10)

// Scaling factor for sizes (pixel-per-unit)
#define LV_DPI_DEF 286  // 286 PPI for 1.47" display

/* ============================================
   DISPLAY ORIENTATION
   ============================================ */

// Swap axes for portrait orientation
#define LV_DISPLAY_ORIENTATION LV_DISPLAY_ORIENTATION_PORTRAIT

/* ============================================
   INPUT DEVICE SETTINGS
   ============================================ */

// Enable touch pad
#define LV_USE_TOUCH 1

// Touch input data read period (ms)
#define LV_INDEV_DEF_READ_PERIOD 30

// Touch input debounce (ms)
#define LV_INDEV_DEF_LONG_PRESS_TIME 400
#define LV_INDEV_DEF_LONG_PRESS_REP_TIME 100

/* ============================================
   FEATURE TOGGLES
   ============================================ */

// Enable specific features only (reduce memory)
#define LV_USE_OBJ_DRAW_PART 1          // For custom drawing
#define LV_USE_BTNMATRIX 1              // Button matrix widget
#define LV_USE_CANVAS 0                 // Skip canvas (memory intensive)
#define LV_USE_CHART 1                  // Charts (for sparklines)
#define LV_USE_GAUGE 1                  // Gauge widget (vital signs)
#define LV_USE_METER 1                  // Meter widget
#define LV_USE_MSGBOX 1                 // Message boxes
#define LV_USE_SPINNER 1                // Loading spinner
#define LV_USE_TABLE 0                  // Skip table (memory intensive)
#define LV_USE_ANIMIMG 1                // Animated images

/* ============================================
   FONT SETTINGS
   ============================================ */

// Built-in fonts (reduce memory by disabling unused sizes)
#define LV_FONT_ROBOTO_12 1
#define LV_FONT_ROBOTO_16 1
#define LV_FONT_ROBOTO_22 1             // Title font
#define LV_FONT_ROBOTO_28 0             // Skip extra large
#define LV_FONT_DEFAULT (&lv_font_roboto_16)

// Custom fonts (optional)
#define LV_FONT_CUSTOM_DECLARE \
  extern const lv_font_t lv_font_montserrat_22;

/* ============================================
   ANIMATION SETTINGS
   ============================================ */

// Enable/disable animations
#define LV_USE_ANIMATION 1

// Animation time for screen transitions (ms)
#define LV_ANIM_DEF_TIME 300

// Frame rate (fps)
#define LV_DISP_DEF_REFR_PERIOD 30      // ~33ms per frame (30 FPS)

/* ============================================
   GESTURE & EVENT SETTINGS
   ============================================ */

// Enable gesture recognition
#define LV_USE_GESTURE 1

// Gesture minimum distance (pixels)
#define LV_GESTURE_MIN_VELOCITY 200     // Swipe threshold

// Enable object event callbacks
#define LV_USE_EVENTS 1

/* ============================================
   THEME SETTINGS
   ============================================ */

// Use built-in theme or custom
#define LV_USE_THEME_DEFAULT 0          // Disable default (we'll use custom)

// Theme hue (color tone)
#define LV_THEME_DEFAULT_DARK 1         // Dark theme (for AMOLED)

/* ============================================
   DEBUG & LOG SETTINGS
   ============================================ */

// Enable debug output (disable in production)
#define LV_USE_LOG 0                    // Set to 1 for debugging
#define LV_LOG_LEVEL LV_LOG_LEVEL_WARN

/* ============================================
   TICK SETTINGS
   ============================================ */

// LVGL needs system tick (1ms intervals)
// Will be called from FreeRTOS timer or Arduino millis()
#define LV_TICK_CUSTOM 1
#define LV_TICK_CUSTOM_INCLUDE <Arduino.h>
#define LV_TICK_CUSTOM_SYS_TIME_EXPR (millis())

/* ============================================
   ASSERT & SAFETY
   ============================================ */

// Enable parameter assertions
#define LV_USE_ASSERT_NULL 1
#define LV_USE_ASSERT_MALLOC 1
#define LV_USE_ASSERT_MEM_INTEGRITY 0   // Heavy, disable for production

#endif /* LV_CONF_H */
```

---

## 🎨 DISPLAY & DRIVER SETUP

### Step 1: Install TFT_eSPI Driver

```bash
# TFT_eSPI is the display driver for ESP32 + SPI displays
arduino-cli lib install TFT_eSPI:2.5.0
```

### Step 2: Configure TFT_eSPI for ESP32-S3

Create `User_Setup.h` in TFT_eSPI library folder or project root:

```cpp
/**
 * @file User_Setup.h
 * TFT_eSPI Configuration for HerboraTech ESP32-S3 Smartwatch
 * Display: 1.47" AMOLED 170×320px (Waveshare RP2040-LCD-1.47)
 */

// ===== DISPLAY DRIVER =====
#define ILI9341_DRIVER      // Or ST7735S, GC9A01A depending on your display

// ===== INTERFACE =====
#define TFT_SPI_HOST    HSPI        // HSPI (SPI2) on ESP32-S3
#define TOUCH_SPI_HOST  HSPI        // Same SPI for touch controller

// ===== DISPLAY PINS (Customize for your PCB) =====
#define TFT_MOSI 11                 // Data line (GPIO11 on S3 HSPI)
#define TFT_SCLK 12                 // Clock line (GPIO12 on S3 HSPI)
#define TFT_CS   10                 // Chip Select (GPIO10)
#define TFT_DC    8                 // Data/Command (GPIO8)
#define TFT_RST   -1                // Reset (optional, use -1 if not wired)
#define TFT_BL    9                 // Backlight PWM (GPIO9)

// Touch controller pins (GT911 capacitive)
#define TOUCH_CS    14              // Touch CS (GPIO14)
#define TOUCH_SDA   17              // I2C SDA (GPIO17)
#define TOUCH_SCL   18              // I2C SCL (GPIO18)
#define TOUCH_INT   13              // Interrupt (GPIO13)

// ===== SPI SPEED =====
#define SPI_FREQUENCY  80000000     // 80 MHz for fast refresh

// ===== DISPLAY RESOLUTION =====
#define TFT_WIDTH  170
#define TFT_HEIGHT 320

// ===== COLOR DEPTH =====
#define TFT_BG_COLOR    TFT_BLACK
#define TFT_TEXT_COLOR  TFT_WHITE

// ===== ROTATION (1 = Portrait) =====
#define TFT_ROTATION 1              // Portrait orientation

// ===== LVGL INTEGRATION =====
#define LVGL_USE_TFT_ESPI
#define LV_USE_TOUCH 1

#endif
```

### Step 3: Initialize Display in Arduino Sketch

```cpp
#include <lvgl.h>
#include <TFT_eSPI.h>

// Display configuration
static const uint16_t screenWidth = 170;
static const uint16_t screenHeight = 320;
static const uint16_t buf_size = screenWidth * screenHeight / 10;

static lv_disp_draw_buf_t draw_buf;
static lv_color_t buf[buf_size];
static lv_disp_drv_t disp_drv;

TFT_eSPI tft = TFT_eSPI();

// Callback: flush display buffer to screen
void my_disp_flush(lv_disp_drv_t *disp, const lv_area_t *area, lv_color_t *color_p) {
  uint32_t w = (area->x2 - area->x1 + 1);
  uint32_t h = (area->y2 - area->y1 + 1);

  tft.startWrite();
  tft.setAddrWindow(area->x1, area->y1, w, h);
  tft.pushColors((uint16_t *)&color_p->full, w * h, true);
  tft.endWrite();

  lv_disp_flush_ready(disp);
}

// Callback: read touch input
void my_touchpad_read(lv_indev_drv_t *indev_drv, lv_indev_data_t *data) {
  // Implement GT911 touch reading here
  // (See section below for full implementation)
  uint16_t touchX, touchY;
  bool touched = readGT911Touch(touchX, touchY);

  if (touched) {
    data->point.x = touchX;
    data->point.y = touchY;
    data->state = LV_INDEV_STATE_PRESSED;
  } else {
    data->state = LV_INDEV_STATE_RELEASED;
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);

  // Initialize TFT display
  tft.begin();
  tft.setRotation(1);  // Portrait
  tft.fillScreen(TFT_BLACK);

  // Initialize LVGL
  lv_init();

  // Create display buffer
  lv_disp_draw_buf_init(&draw_buf, buf, NULL, buf_size);

  // Initialize display driver
  lv_disp_drv_init(&disp_drv);
  disp_drv.hor_res = screenWidth;
  disp_drv.ver_res = screenHeight;
  disp_drv.flush_cb = my_disp_flush;
  disp_drv.draw_buf = &draw_buf;
  disp_drv.user_data = (void *)&tft;
  lv_disp_drv_register(&disp_drv);

  // Initialize touch input
  static lv_indev_drv_t indev_drv;
  lv_indev_drv_init(&indev_drv);
  indev_drv.type = LV_INDEV_TYPE_POINTER;
  indev_drv.read_cb = my_touchpad_read;
  lv_indev_drv_register(&indev_drv);

  // Set LVGL tick period
  lv_tick_set_cb(millis);

  Serial.println("✅ LVGL initialized successfully!");
}

void loop() {
  lv_timer_handler();  // Handle LVGL tasks
  delay(5);
}
```

---

## 🎯 TOUCH INPUT — GT911 CAPACITIVE CONTROLLER

### Configuration

```cpp
#include <Wire.h>

#define GT911_ADDR 0x5D    // I2C address
#define GT911_TOUCH_NUM 1  // Single touch point

// Touch data structure
struct TouchData {
  uint16_t x;
  uint16_t y;
  uint8_t pressure;
};

bool readGT911Touch(uint16_t &x, uint16_t &y) {
  Wire.beginTransmission(GT911_ADDR);
  Wire.write(0x81);           // Read status register
  Wire.write(0x4E);           // High byte
  Wire.endTransmission();

  Wire.requestFrom(GT911_ADDR, 1);
  uint8_t status = Wire.read();

  if ((status & 0x80) == 0) {
    return false;  // No touch detected
  }

  uint8_t touches = status & 0x0F;
  if (touches > 1) touches = 1;  // Limit to 1 touch point

  // Read touch coordinates
  Wire.beginTransmission(GT911_ADDR);
  Wire.write(0x81);  // X high byte address
  Wire.write(0x4F);
  Wire.endTransmission();

  Wire.requestFrom(GT911_ADDR, 4);  // X(2 bytes) + Y(2 bytes)
  uint16_t xRaw = Wire.read() | (Wire.read() << 8);
  uint16_t yRaw = Wire.read() | (Wire.read() << 8);

  // Map raw touch coordinates to display coordinates
  x = xRaw;
  y = yRaw;

  return true;
}

// Initialize GT911
void initGT911() {
  Wire.begin(17, 18);  // SDA=17, SCL=18 on ESP32-S3
  delay(100);

  // Power on GT911
  digitalWrite(13, HIGH);  // Interrupt pin high
  delay(50);
  Wire.beginTransmission(GT911_ADDR);
  Wire.write(0x80);
  Wire.write(0x47);  // Config check
  Wire.endTransmission();

  Serial.println("✅ GT911 touch controller initialized");
}
```

---

## 🎨 THEME CONFIGURATION

### Define HerboraTech Color Theme

```cpp
// herboratech_theme.h
#ifndef HERBORATECH_THEME_H
#define HERBORATECH_THEME_H

#include <lvgl.h>

// Color Palette (RGB565)
#define HERBORATECH_PRIMARY     lv_color_hex(0x00B464)  // Green
#define HERBORATECH_PRIMARY_DARK lv_color_hex(0x1E8449) // Dark green
#define HERBORATECH_BG          lv_color_hex(0x141923)  // Dark background
#define HERBORATECH_SURFACE     lv_color_hex(0x232D3C)  // Card background
#define HERBORATECH_TEXT        lv_color_hex(0xF5F8FC)  // White text
#define HERBORATECH_SECONDARY   lv_color_hex(0xB4BED2)  // Gray text
#define HERBORATECH_DANGER      lv_color_hex(0xEB5757)  // Red (alerts)
#define HERBORATECH_WARNING     lv_color_hex(0xF29934)  // Orange (caution)

// Theme initialization function
void init_herboratech_theme(void) {
  // Set default theme colors
  lv_style_init(&style_main);
  lv_style_set_bg_color(&style_main, HERBORATECH_BG);
  lv_style_set_text_color(&style_main, HERBORATECH_TEXT);
  lv_style_set_border_color(&style_main, HERBORATECH_PRIMARY);

  // Apply to screen
  lv_obj_add_style(lv_scr_act(), &style_main, 0);
}

// Button style
lv_style_t style_btn_primary;

void init_button_styles(void) {
  lv_style_init(&style_btn_primary);
  lv_style_set_bg_color(&style_btn_primary, HERBORATECH_PRIMARY);
  lv_style_set_text_color(&style_btn_primary, HERBORATECH_BG);
  lv_style_set_border_width(&style_btn_primary, 0);
  lv_style_set_radius(&style_btn_primary, 10);
  lv_style_set_pad_all(&style_btn_primary, 12);
}

#endif // HERBORATECH_THEME_H
```

---

## 📊 CUSTOM WIDGETS

### Circular Gauge for Vital Signs

```cpp
// vital_gauge.h
#ifndef VITAL_GAUGE_H
#define VITAL_GAUGE_H

#include <lvgl.h>

typedef struct {
  lv_obj_t *gauge;
  lv_obj_t *value_label;
  lv_obj_t *unit_label;
  int32_t min_val;
  int32_t max_val;
  const char *title;
} vital_gauge_t;

vital_gauge_t create_vital_gauge(lv_obj_t *parent, const char *title,
                                  int32_t min_val, int32_t max_val,
                                  int32_t initial_val) {
  vital_gauge_t gauge;
  gauge.min_val = min_val;
  gauge.max_val = max_val;
  gauge.title = title;

  // Create gauge container
  lv_obj_t *cont = lv_obj_create(parent);
  lv_obj_set_width(cont, 80);
  lv_obj_set_height(cont, 80);
  lv_obj_set_style_bg_color(cont, lv_color_hex(0x232D3C), 0);
  lv_obj_set_style_border_color(cont, lv_color_hex(0x00B464), 0);
  lv_obj_set_style_border_width(cont, 2, 0);
  lv_obj_set_style_radius(cont, 40, 0);  // Circle

  // Create gauge widget
  gauge.gauge = lv_gauge_create(cont);
  lv_gauge_set_range(gauge.gauge, min_val, max_val);
  lv_gauge_set_value(gauge.gauge, 0, initial_val);
  lv_obj_set_size(gauge.gauge, 75, 75);
  lv_obj_center(gauge.gauge);

  // Value label (center)
  gauge.value_label = lv_label_create(gauge.gauge);
  lv_label_set_text_fmt(gauge.value_label, "%d", initial_val);
  lv_obj_center(gauge.value_label);
  lv_obj_set_style_text_color(gauge.value_label, lv_color_hex(0x00B464), 0);
  lv_obj_set_style_text_font(gauge.value_label, &lv_font_roboto_22, 0);

  // Unit label
  gauge.unit_label = lv_label_create(cont);
  lv_label_set_text(gauge.unit_label, title);
  lv_obj_set_style_text_color(gauge.unit_label, lv_color_hex(0xB4BED2), 0);
  lv_obj_set_style_text_font(gauge.unit_label, &lv_font_roboto_12, 0);

  return gauge;
}

void update_vital_gauge(vital_gauge_t *gauge, int32_t value) {
  lv_gauge_set_value(gauge->gauge, 0, value);
  lv_label_set_text_fmt(gauge->value_label, "%d", value);
}

#endif // VITAL_GAUGE_H
```

### Screen Manager (3-Screen Carousel)

```cpp
// screen_manager.h
#ifndef SCREEN_MANAGER_H
#define SCREEN_MANAGER_H

#include <lvgl.h>

typedef enum {
  SCREEN_DASHBOARD = 0,
  SCREEN_DETAILS = 1,
  SCREEN_ALERTS = 2,
  SCREEN_COUNT = 3
} screen_t;

class ScreenManager {
private:
  lv_obj_t *screens[SCREEN_COUNT];
  screen_t current_screen;

public:
  ScreenManager() : current_screen(SCREEN_DASHBOARD) {}

  void init() {
    for (int i = 0; i < SCREEN_COUNT; i++) {
      screens[i] = lv_obj_create(NULL);
      lv_obj_set_size(screens[i], 170, 320);
      lv_obj_set_style_bg_color(screens[i], lv_color_hex(0x141923), 0);
    }

    // Load first screen
    load_screen(SCREEN_DASHBOARD);
  }

  void load_screen(screen_t screen_id) {
    // Hide all screens
    for (int i = 0; i < SCREEN_COUNT; i++) {
      lv_obj_add_flag(screens[i], LV_OBJ_FLAG_HIDDEN);
    }

    // Show selected screen
    lv_obj_clear_flag(screens[screen_id], LV_OBJ_FLAG_HIDDEN);
    lv_scr_load_anim(screens[screen_id], LV_SCR_LOAD_ANIM_MOVE_LEFT, 300, 0, false);
    current_screen = screen_id;
  }

  void next_screen() {
    screen_t next = (screen_t)((current_screen + 1) % SCREEN_COUNT);
    load_screen(next);
  }

  void prev_screen() {
    screen_t prev = (screen_t)((current_screen - 1 + SCREEN_COUNT) % SCREEN_COUNT);
    load_screen(prev);
  }

  lv_obj_t *get_screen(screen_t id) {
    return screens[id];
  }

  screen_t get_current() {
    return current_screen;
  }
};

#endif // SCREEN_MANAGER_H
```

---

## ⚙️ OPTIMIZATION TIPS

### Memory Optimization

```cpp
// Reduce LVGL memory footprint:

1. Disable unused features in lv_conf.h
   #define LV_USE_CANVAS 0
   #define LV_USE_TABLE 0

2. Use smaller fonts
   #define LV_FONT_ROBOTO_28 0  // Disable large fonts

3. Reduce animation time
   #define LV_ANIM_DEF_TIME 150  // 150ms instead of 300ms

4. Minimize display buffer
   #define LV_DISP_BUF_SIZE (170 * 320 / 20)  // Smaller buffer
```

### Performance Optimization

```cpp
// Improve refresh speed:

1. Increase SPI frequency
   #define SPI_FREQUENCY 80000000  // 80MHz

2. Increase frame rate
   #define LV_DISP_DEF_REFR_PERIOD 20  // 50 FPS

3. Use hardware acceleration
   TFT_eSPI pushColors() for block transfers

4. Avoid lv_obj_invalidate() excessive calls
   Only invalidate areas that changed
```

---

## 📝 COMPLETE MINIMAL SKETCH

```cpp
#include <lvgl.h>
#include <TFT_eSPI.h>

static const uint16_t screenWidth = 170;
static const uint16_t screenHeight = 320;
static const uint16_t buf_size = screenWidth * screenHeight / 10;

static lv_disp_draw_buf_t draw_buf;
static lv_color_t buf[buf_size];
static lv_disp_drv_t disp_drv;

TFT_eSPI tft = TFT_eSPI();

void my_disp_flush(lv_disp_drv_t *disp, const lv_area_t *area, lv_color_t *color_p) {
  uint32_t w = (area->x2 - area->x1 + 1);
  uint32_t h = (area->y2 - area->y1 + 1);
  tft.startWrite();
  tft.setAddrWindow(area->x1, area->y1, w, h);
  tft.pushColors((uint16_t *)&color_p->full, w * h, true);
  tft.endWrite();
  lv_disp_flush_ready(disp);
}

void my_touchpad_read(lv_indev_drv_t *indev_drv, lv_indev_data_t *data) {
  data->point.x = 85;
  data->point.y = 160;
  data->state = LV_INDEV_STATE_RELEASED;
}

void setup() {
  Serial.begin(115200);
  tft.begin();
  tft.setRotation(1);
  tft.fillScreen(TFT_BLACK);

  lv_init();
  lv_disp_draw_buf_init(&draw_buf, buf, NULL, buf_size);

  lv_disp_drv_init(&disp_drv);
  disp_drv.hor_res = screenWidth;
  disp_drv.ver_res = screenHeight;
  disp_drv.flush_cb = my_disp_flush;
  disp_drv.draw_buf = &draw_buf;
  lv_disp_drv_register(&disp_drv);

  // Create UI
  lv_obj_t *label = lv_label_create(lv_scr_act());
  lv_label_set_text(label, "HerboraTech");
  lv_obj_center(label);
  lv_obj_set_style_text_color(label, lv_color_hex(0x00B464), 0);

  Serial.println("✅ LVGL initialized!");
}

void loop() {
  lv_timer_handler();
  delay(5);
}
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] `lv_conf.h` created in correct location
- [ ] `TFT_eSPI` installed and configured
- [ ] `User_Setup.h` created with correct pins
- [ ] LVGL renders to display without flickering
- [ ] Touch input detected (X,Y coordinates)
- [ ] Frame rate ≥ 30 FPS
- [ ] Memory usage < 80KB
- [ ] No graphics artifacts or corruption
- [ ] Animations run smoothly
- [ ] No heap fragmentation after 24h runtime

