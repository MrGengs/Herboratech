# Vitalora Smartwatch Mockup
## Interactive HTML/CSS/JS Prototype → LVGL C Implementation

---

## 📱 **Overview**

This is an **interactive web mockup** of the Vitalora smartwatch UI (172×320px) designed to:

1. ✅ **Test interactions** before firmware (swipe navigation, touch controls)
2. ✅ **Display all sensor data** (HR, SpO2, Temp, RR, Stress, Steps, HRV, Battery)
3. ✅ **Match Vitalora design system** (green accent, neumorphic style, typography)
4. ✅ **Document design tokens** for LVGL C implementation
5. ✅ **Provide a living reference** as you build firmware

---

## 🚀 **Quick Start**

### **View the Mockup**
```bash
# Option 1: Open in browser
open index.html

# Option 2: Use a local server
python -m http.server 8000
# Then visit: http://localhost:8000/index.html
```

### **Test on Mobile Device**
- Open on smartphone/tablet
- Viewport: 172×320px (simulates smartwatch screen)
- Try swiping left/right to navigate between screens
- Toggle buttons and sliders

---

## 📁 **Files**

| File | Purpose |
|------|---------|
| `index.html` | Interactive mockup with 4 screens, sensor simulation, touch handling |
| `DESIGN_TOKENS.md` | Design system documentation (colors, typography, spacing, components) |
| `README.md` | This file |

---

## 🎯 **Features**

### **4 Screens (Swipeable)**

1. **BLE Connectivity** — Connection status, scan devices
2. **Vital Signs** — Heart rate, SpO2, temperature, RR, stress, daily steps
3. **Settings** — Brightness slider, Bluetooth/WiFi toggle, battery info
4. **Device Info** — Device name, firmware, battery, BLE MAC, HRV metrics

### **Sensor Simulation**
- Real-time updates every 2 seconds
- HR, SpO2, Temp, RR, Stress values change realistically
- Steps counter increments
- Battery level decreases gradually

### **Interactive Controls**
- 🎚️ **Brightness slider** (0-100%)
- 🔘 **Bluetooth/WiFi toggles** (click to toggle)
- 👆 **Swipe navigation** (left/right on touchscreen)
- 📲 **Mouse support** (desktop testing)

### **Design System**
- Vitalora green color (#27AE60)
- Dark green header gradient (#1A5C38 → #27AE60)
- Neumorphic cards (subtle shadows)
- Poppins typography
- Responsive 172×320px layout

---

## 🎨 **Design Tokens**

All visual properties are documented in `DESIGN_TOKENS.md` for LVGL implementation:

```cpp
// Example: Using design tokens in LVGL
#define COLOR_PRIMARY       0x27AE60
#define FONT_SIZE_TITLE     16
#define HEADER_HEIGHT       50
#define SPACING_MD          12
#define RADIUS_MEDIUM       10
```

Every color, size, font, spacing value is listed for direct copy-paste to C code.

---

## 🔄 **Workflow: HTML → LVGL**

### **Phase 1: Interactive Mockup** (You are here ✅)
```
✅ Design finalized
✅ Interactions tested
✅ Sensor data flows verified
✅ Design tokens documented
```

### **Phase 2: LVGL C Implementation**
```
1. Create LVGL screen structures
2. Use DESIGN_TOKENS.md values (copy-paste colors, sizes, fonts)
3. Implement 4 screens in C (screen-1.c, screen-2.c, etc.)
4. Add touch swipe detection
5. Connect sensor readings to display
6. Test on ESP32-S3 hardware
```

### **Phase 3: Firmware Integration**
```
1. Integrate BLE GATT server (sensor readings)
2. Connect real sensors (Max30102, MLX90614, MPU6050)
3. Implement FreeRTOS tasks for sensor polling
4. Deploy to ESP32-S3 board
```

---

## 📊 **Sensor Data Reference**

All 12 sensor values are displayed across screens:

| Sensor | Screen | Value | Unit | Range |
|--------|--------|-------|------|-------|
| Heart Rate | 2 | 72 | bpm | 60-100 |
| SpO2 | 2 | 98 | % | 95-100 |
| Temperature | 2 | 36.8 | °C | 36.0-37.5 |
| Resp Rate | 2 | 16 | /min | 12-20 |
| Stress | 2 | 35 | % | 10-90 |
| Steps | 2 | 6,842 | count | 0-50,000 |
| Battery | 3, 4 | 87 | % | 0-100 |
| SDNN | 4 | 42 | ms | 0-150 |
| RMSSD | 4 | 38 | ms | 0-150 |
| pNN50 | 4 | 18 | % | 0-100 |
| Brightness | 3 | 80 | % | 0-100 |
| Signal | 1 | -45 | dBm | -120 to 0 |

---

## 🎛️ **Interactive Testing**

### **Desktop (Mouse)**
- Click and drag left/right to swipe
- Click buttons and toggles
- Adjust sliders

### **Mobile/Tablet**
- Swipe left/right to navigate
- Tap buttons and toggles
- Slide brightness slider

### **Sensor Data**
- Watch values update automatically every 2 seconds
- Sensor data changes are realistic (±small variations)
- Steps increment naturally
- Battery decreases slowly

---

## 🔧 **Customization**

### **Change Sensor Values**
Edit `sensorData` object in JavaScript:
```javascript
const sensorData = {
  hr: 72,              // Adjust default values
  spo2: 98,
  temperature: 36.8,
  // ... etc
};
```

### **Change Colors**
Edit CSS variables in `<style>`:
```css
:root {
  --primary: #27AE60;        // Change primary color
  --primary-dark: #1A5C38;
  --bg-card: #F8F8F8;
  /* ... */
}
```

### **Adjust Screen Size**
For testing different resolutions:
```css
.smartwatch-container {
  width: 172px;    /* Change this */
  height: 320px;   /* And this */
}
```

---

## 📈 **Design Metrics**

```
Display Resolution:     172×320 pixels (1.47")
Pixel Density:          ~270 DPI
Aspect Ratio:           0.5375 (portrait)
Color Depth:            16-bit RGB565 (LVGL default)
Header Height:          50px
Touch Target Min:       40px (accessibility)
Card Padding:           12px
Border Radius:          10px (cards)
Font Primary:           Poppins, 16px (titles)
Font Secondary:         Poppins, 12px (body)
```

---

## 💾 **Code Structure**

### **index.html**
```html
├─ Design tokens (CSS variables)
├─ Smartwatch frame (display container)
├─ Screens wrapper (swipe container)
├─ Screen 1: BLE Connectivity
├─ Screen 2: Vital Signs
├─ Screen 3: Settings
├─ Screen 4: Device Info
├─ JavaScript initialization
├─ Touch/swipe handler
└─ Sensor simulation loop
```

### **Key JavaScript Functions**
```javascript
init()                          // Initialize app
setupTouchHandlers()            // Register swipe listeners
swipeToScreen(screenNum)        // Navigate to screen
startSensorSimulation()         // Begin sensor data updates
updateSensorDisplay()           // Refresh all values
toggleBluetooth/WiFi()          // Toggle controls
updateBrightness()              // Slider control
```

---

## ✅ **Validation Checklist**

Before moving to LVGL, verify:

- [ ] All 4 screens display correctly
- [ ] Swipe navigation works (left/right)
- [ ] Sensor values update in real-time
- [ ] Buttons respond to clicks
- [ ] Toggles switch states
- [ ] Slider adjusts value
- [ ] Layout fits 172×320px
- [ ] Colors match Vitalora design
- [ ] Typography is readable
- [ ] Touch targets are ≥40px
- [ ] Mobile responsive (smartphone testing)
- [ ] No JavaScript errors (check console)

---

## 🔗 **Next Steps: LVGL Implementation**

Once mockup is validated, use `DESIGN_TOKENS.md` to:

1. **Create LVGL header file** (`smartwatch.h`)
   ```cpp
   #define COLOR_PRIMARY 0x27AE60
   #define FONT_SIZE_TITLE 16
   // ... copy all tokens
   ```

2. **Implement screen 1** (`screen_ble.c`)
   ```cpp
   void create_ble_screen() {
     lv_obj_t *scr = lv_obj_create(NULL);
     // Use design tokens for all styling
   }
   ```

3. **Repeat for screens 2-4**

4. **Add touch handler** for swipe navigation

5. **Integrate sensor data** from BLE/sensors

---

## 📞 **Troubleshooting**

### **Swipe not working?**
- Check browser supports Touch API
- On desktop, try click-and-drag
- Ensure delta > 30px for swipe

### **Sensor data not updating?**
- Check browser console for errors
- Verify setInterval not blocked
- Try refreshing page

### **Layout broken?**
- Ensure viewport is 172×320px
- Check CSS loaded correctly
- Try different browser

### **Colors look wrong?**
- Verify CSS variables applied
- Check display color profile
- Test on different device

---

## 📚 **Reference Documents**

- **DESIGN_TOKENS.md** — Complete design system for LVGL
- **index.html** — Interactive mockup source code
- **Vitalora Web** — Reference design from web app

---

## 🎯 **Success Criteria**

✅ Mockup complete and interactive
✅ All sensor data displays
✅ Swipe navigation works smoothly
✅ Design tokens documented
✅ Ready for LVGL C implementation

---

**Status**: 🟢 Ready for LVGL Implementation
**Last Updated**: 2026-03-28
**Next Phase**: LVGL C Firmware Development
