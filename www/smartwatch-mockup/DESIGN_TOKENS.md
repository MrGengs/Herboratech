# Design Tokens — Vitalora Smartwatch
## Reference untuk LVGL C Implementation

---

## 🎨 **Colors**

```cpp
// Primary Colors (Green theme - Vitalora style)
#define COLOR_PRIMARY           0x27AE60  // Main green
#define COLOR_PRIMARY_DARK      0x1A5C38  // Dark green (header)
#define COLOR_PRIMARY_LIGHT     0x6FCF97  // Light green

// Base Colors
#define COLOR_BG                0xFFFFFF  // White background
#define COLOR_CARD              0xF8F8F8  // Light gray card
#define COLOR_BORDER            0xE0E0E0  // Light border

// Text Colors
#define COLOR_TEXT_PRIMARY      0x333333  // Dark gray (body text)
#define COLOR_TEXT_SECONDARY    0x666666  // Medium gray (secondary)
#define COLOR_TEXT_TERTIARY     0x999999  // Light gray (tertiary/labels)

// Status Colors
#define COLOR_DANGER            0xEB5757  // Red (alerts)
#define COLOR_WARNING           0xF2994A  // Orange (warnings)
#define COLOR_INFO              0x2F80ED  // Blue (info)
#define COLOR_SUCCESS           0x27AE60  // Green (success)
```

---

## 📐 **Dimensions & Sizes**

```cpp
// Screen Dimensions
#define SCREEN_WIDTH            172     // pixels
#define SCREEN_HEIGHT           320     // pixels
#define SCREEN_ASPECT_RATIO     0.5375  // 172/320

// Component Heights
#define HEADER_HEIGHT           50      // pixels
#define BUTTON_HEIGHT_MIN       42      // minimum touch target
#define TOGGLE_HEIGHT           24      // pixels
#define TOGGLE_WIDTH            40      // pixels

// Component Border Radius
#define RADIUS_SMALL            8       // pixels
#define RADIUS_MEDIUM           10      // pixels
#define RADIUS_LARGE            14      // pixels
```

---

## 🔤 **Typography**

```cpp
// Font Family
#define FONT_FAMILY             "Poppins"  // Primary font
// Fallback: -apple-system, BlinkMacSystemFont, sans-serif

// Font Sizes (in pixels)
#define FONT_SIZE_TITLE         16      // Screen titles, main headers
#define FONT_SIZE_BODY          12      // Primary content text
#define FONT_SIZE_SMALL         10      // Secondary labels
#define FONT_SIZE_TINY          9       // Helper text, small labels
#define FONT_SIZE_VALUE         24      // Large vital values
#define FONT_SIZE_VALUE_LARGE   32      // Primary vital (e.g., HR)
#define FONT_SIZE_VALUE_MINI    18      // Mini vital cards

// Font Weights
#define FONT_WEIGHT_BOLD        700     // Strong emphasis (titles, values)
#define FONT_WEIGHT_SEMIBOLD    600     // Medium emphasis (labels)
#define FONT_WEIGHT_MEDIUM      500     // Normal emphasis
#define FONT_WEIGHT_REGULAR     400     // Default

// Line Height
#define LINE_HEIGHT_TIGHT       1.0
#define LINE_HEIGHT_NORMAL      1.2
#define LINE_HEIGHT_RELAXED     1.6
```

---

## 📏 **Spacing (Margins & Padding)**

```cpp
// Spacing Scale (8px base)
#define SPACING_XS              4       // pixels (micro spacing)
#define SPACING_SM              8       // pixels (small)
#define SPACING_MD              12      // pixels (medium - default padding)
#define SPACING_LG              16      // pixels (large)

// Common Padding Values
#define PAD_CARD                12      // Card internal padding
#define PAD_BUTTON              8       // Button padding (vertical)
#define PAD_HEADER              12      // Header padding

// Common Margin Values
#define MARGIN_SECTION          12      // Between sections
#define MARGIN_ITEM             8       // Between items
```

---

## 🎪 **Components Layout**

### **Header**
```
Height: 50px
Padding: 12px (left/right)
Background: Linear gradient (#1A5C38 → #27AE60)
Text: Font 16px, Bold 700, White, left-aligned
Icon: Font 18px, right-aligned
Shadow: drop-shadow(0 2px 8px rgba(0,0,0,0.08))
```

### **Card (Primary)**
```
Padding: 12px (all)
Background: #F8F8F8
Border: 1px solid #E0E0E0
Border-radius: 10px
Shadow: drop-shadow(0 2px 8px rgba(0,0,0,0.08))
```

### **Vital Card**
```
Layout: Horizontal flex
Gap: 8px
Padding: 12px
Background: #F8F8F8
Border-left: 4px solid #27AE60 (primary color)
Border-radius: 10px
Icon size: 20px
```

### **Button**
```
Height: 42px (minimum touch target)
Width: 100% (full width)
Padding: 8px 12px
Background: #27AE60
Color: White
Border-radius: 10px
Font: 12px, Bold 600
Shadow: drop-shadow(0 2px 8px rgba(39,174,96,0.2))
Active: scale(0.98) + reduced shadow
```

### **Toggle Switch**
```
Width: 40px
Height: 24px
Background: #E0E0E0 (inactive) or #27AE60 (active)
Border-radius: 12px
Knob: 20px circle, white, shadow
Knob offset: 2px (inactive), 18px (active)
Transition: 0.3s ease
```

### **Slider**
```
Height: 6px
Background: #E0E0E0
Border-radius: 3px
Thumb: 14px circle, #27AE60
Shadow: drop-shadow(0 2px 4px rgba(0,0,0,0.12))
```

---

## 🎯 **Screen Layouts**

### **Screen 1: BLE Connectivity**
```
Header (50px)
├─ Title: "BLE Connection"
├─ Icon: 📡

Content Area (270px)
├─ Status Icon (40px)
├─ Status Text "Connected" (24px, bold, green)
├─ Status Label "BLE Active" (12px, gray)
├─ Device Info Card (50px)
│  ├─ Icon: 📱
│  ├─ Device Name
│  ├─ Signal: -45 dBm
│  └─ Status Badge
├─ Scan Button (42px)
└─ Swipe Indicator (12px)
```

### **Screen 2: Vital Signs**
```
Header (50px)
├─ Title: "Vital Signs"
├─ Icon: ❤️

Content Area (270px)
├─ Heart Rate (Primary - Large)
│  ├─ Icon: 32px
│  ├─ Label: "HEART RATE"
│  ├─ Value: 72 (32px, green, bold)
│  └─ Unit: "bpm"
├─ Secondary Vitals Grid (2×2)
│  ├─ SpO2 (98%)
│  ├─ Temperature (36.8°C)
│  ├─ Resp Rate (16 /min)
│  └─ Stress (35%)
├─ Daily Steps Card
│  ├─ Icon: 🚶
│  ├─ Value: 6,842
│  └─ Label: "STEPS"
└─ Swipe Indicator
```

### **Screen 3: Settings**
```
Header (50px)
├─ Title: "Settings"
├─ Icon: ⚙️

Content Area (270px)
├─ Brightness Control
│  ├─ Icon: ☀️
│  ├─ Label: "Brightness"
│  ├─ Value: "80%"
│  └─ Slider (100%)
├─ Bluetooth Toggle
│  ├─ Icon: 📡
│  ├─ Label: "Bluetooth"
│  └─ Toggle Switch (40×24px)
├─ WiFi Toggle
│  ├─ Icon: 📶
│  ├─ Label: "WiFi"
│  └─ Toggle Switch
├─ Battery Info
│  ├─ Icon: 🔋
│  ├─ Value: "87%"
│  └─ Label: "BATTERY"
└─ Swipe Indicator
```

### **Screen 4: Device Info**
```
Header (50px)
├─ Title: "Device Info"
├─ Icon: ℹ️

Content Area (270px)
├─ Device Name Item
│  ├─ Label: "📱 Device Name"
│  └─ Value: "Vitalora Watch"
├─ Firmware Item
│  ├─ Label: "⚡ Firmware"
│  └─ Value: "v1.2.3"
├─ Battery Item
│  ├─ Label: "🔋 Battery"
│  └─ Value: "87%"
├─ BLE MAC Item
│  ├─ Label: "🔗 BLE MAC"
│  └─ Value: "AA:BB:CC:DD:EE:FF" (monospace)
├─ HRV Metrics Section
│  ├─ SDNN: 42 ms
│  ├─ RMSSD: 38 ms
│  └─ pNN50: 18%
└─ Swipe Indicator
```

---

## 🎪 **Shadows & Effects**

```cpp
// Shadow Definitions
#define SHADOW_SMALL    "0 2px 8px rgba(0,0,0,0.08)"
#define SHADOW_MEDIUM   "0 4px 16px rgba(0,0,0,0.12)"

// Animations
#define ANIMATION_SWIPE "0.4s cubic-bezier(0.4, 0, 0.2, 1)"
#define ANIMATION_TRANSITION "0.3s ease"
#define ANIMATION_PULSE "2s ease-in-out infinite"
```

---

## 📱 **Responsive Behavior**

- **Mobile (320px width)**: Full viewport
- **Tablet/Desktop**: Centered in viewport, max-width 172px
- **Orientation**: Portrait only (320px)
- **Touch targets**: Minimum 40px height for accessibility

---

## 🔌 **Integration Points (for LVGL)**

### **Color Conversion for LVGL**
```cpp
// From hex #27AE60 to LVGL RGB565
lv_color_t primary = lv_color_hex(0x27AE60);

// OR using RGB values
// #27AE60 = RGB(39, 174, 96)
lv_color_t primary = lv_color_make(39, 174, 96);
```

### **Font Definition**
```cpp
// Use system fonts in LVGL or custom font files
// Font sizes match screen DPI for 172×320px @ ~270 DPI
extern const lv_font_t lv_font_montserrat_16;  // Titles
extern const lv_font_t lv_font_montserrat_12;  // Body
extern const lv_font_t lv_font_montserrat_10;  // Small
```

### **Screen Creation Template (LVGL)**
```cpp
void create_screen_template() {
  lv_obj_t *scr = lv_obj_create(NULL);
  lv_obj_set_size(scr, SCREEN_WIDTH, SCREEN_HEIGHT);
  lv_obj_set_style_bg_color(scr, lv_color_hex(COLOR_BG), 0);

  // Create header
  lv_obj_t *header = lv_obj_create(scr);
  lv_obj_set_size(header, SCREEN_WIDTH, HEADER_HEIGHT);
  lv_obj_set_style_bg_color(header, lv_color_hex(COLOR_PRIMARY), 0);
  lv_obj_set_style_border_width(header, 0, 0);

  // Create content area
  lv_obj_t *content = lv_obj_create(scr);
  lv_obj_set_pos(content, 0, HEADER_HEIGHT);
  lv_obj_set_size(content, SCREEN_WIDTH, SCREEN_HEIGHT - HEADER_HEIGHT);
  lv_obj_set_layout(content, LV_FLEX_FLOW_COLUMN);
  lv_obj_set_style_pad_all(content, SPACING_MD, 0);
  lv_obj_set_style_gap(content, SPACING_MD, 0);

  lv_disp_load_scr(scr);
}
```

---

## 📊 **Sensor Data Display Standards**

All sensor values follow this pattern:

```
┌─────────────────────────┐
│ [ICON] Label            │
│        Value [Unit]     │
│        Status/Range     │
└─────────────────────────┘
```

**Color coding by status:**
- 🟢 Green (#27AE60): Normal range
- 🟡 Orange (#F2994A): Warning range
- 🔴 Red (#EB5757): Critical range

---

## 🚀 **Implementation Checklist**

- [ ] Define all color constants in C header
- [ ] Create font definitions or use system fonts
- [ ] Implement header component (gradient + title)
- [ ] Implement card component (bg + border + shadow)
- [ ] Implement button component (responsive 42px min)
- [ ] Implement toggle switch component
- [ ] Implement slider component
- [ ] Create 4 screen layouts
- [ ] Implement touch swipe navigation (horizontal)
- [ ] Connect sensor data to display values
- [ ] Test responsiveness at 172×320px

---

**Version**: 1.0
**Last Updated**: 2026-03-28
**Status**: Ready for LVGL Implementation
