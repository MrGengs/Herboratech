# 🎯 ESP32-S3 1.47" Smartwatch UI Design Specification

**Device:** ESP32-S3 1.47" AMOLED Touch Display (170×320px)
**Framework:** LVGL or TFT_eSPI
**Color Mode:** 16-bit RGB565 (65K colors)
**Touch:** Capacitive multi-touch
**Design Pattern:** 3-Screen Carousel (swipe left/right to navigate)

---

## 📐 Device Specifications
- **Resolution:** 170×320 pixels
- **Diagonal:** 1.47 inches
- **Pixel Density:** ~286 PPI (high density)
- **Aspect Ratio:** 1:1.88 (tall rectangle)
- **Touch Latency:** <30ms (capacitive)
- **Safe Area:** 165×310px (leave 2-3px margin on sides)

---

## 🎨 Color Palette (RGB565)

| Color | RGB | Hex | Use Case |
|-------|-----|-----|----------|
| **Primary Green** | 0, 180, 100 | #00B464 | Main accent, active state |
| **Primary Dark** | 30, 132, 73 | #1E8449 | Secondary accent |
| **Background** | 20, 25, 35 | #141923 | Base dark background |
| **Card Background** | 35, 45, 60 | #232D3C | Card/container fill |
| **Text Primary** | 245, 248, 252 | #F5F8FC | Main text |
| **Text Secondary** | 180, 190, 210 | #B4BED2 | Secondary text |
| **Accent Red** | 235, 87, 87 | #EB5757 | Alert/warning |
| **Accent Orange** | 242, 153, 74 | #F29934 | Info/caution |

---

## 🖥️ Screen 1: Vital Signs Dashboard (Default Home)

**Purpose:** At-a-glance health monitoring
**Layout:** Vertical stack with circular gauges

### Header (0-35px)
```
┌─────────────────────────────────────┐
│ 09:45  |  ●●●●  |  92%    (top right: battery)
│ FRI 24 MAR 2026
│ Ahmad Fauzi
└─────────────────────────────────────┘
```
- Status bar height: 35px
- Time + date + name in gray text
- Battery icon (top right)
- Font: 10px (time), 8px (date), 9px (name)

### Main Content (35-300px)

**4 Circular Gauges (vertical stack, 2 columns)**
```
┌──────────────────────────────────────┐
│  ┌─────────┐    ┌─────────┐          │
│  │   HR    │    │  SpO2   │          │
│  │  72 bpm │    │  98 %   │          │
│  │   ○●    │    │  ○●●    │          │
│  └─────────┘    └─────────┘          │
│  ┌─────────┐    ┌─────────┐          │
│  │  Temp   │    │  Steps  │          │
│  │ 36.8°C  │    │ 8,450   │          │
│  │   ○●    │    │  ○●●●   │          │
│  └─────────┘    └─────────┘          │
└──────────────────────────────────────┘
```

**Gauge Details:**
- Each gauge: 60×60px circle
- Center value: 12px bold font
- Unit: 8px light gray
- Outer ring: 2px stroke (green when normal)
- Inner fill: Gradient from background to green
- Spacing: 8px horizontal, 12px vertical

**Vital Thresholds:**
- HR: 60-100 bpm (green), <60 or >100 (orange)
- SpO2: 95-100% (green), <95% (red)
- Temp: 36.5-37.5°C (green), else orange
- Steps: color intensity increases with count

### Footer (300-320px)
```
┌──────────────────────────────────────┐
│  ◀  Screen 1 of 3  ▶                 │
│  ← Swipe right for details →         │
└──────────────────────────────────────┘
```
- Indicator dots (3 white circles, center one filled green)
- Font: 7px gray hint text
- Touch zone: 8px tall for swipe gestures

---

## 📊 Screen 2: Detailed Metrics & Risk Assessment

**Purpose:** Deep dive into individual vitals + risk scores
**Layout:** Scrollable list with expandable metrics

### Header (0-35px)
```
┌──────────────────────────────────────┐
│ 09:45  |  ●●●●  |  92%              │
│ Vital Details
└──────────────────────────────────────┘
```

### Scrollable Content Area (35-300px)

**Metric Card Structure (repeating):**
```
┌──────────────────────────────────────┐
│  ❤️ Heart Rate Monitor               │
│  ──────────────────────────────────  │
│  Current: 72 bpm  | Trend: ↓ -2 bpm  │
│  ▁▂▃▅▆█▇▅▃▂▁ [sparkline 7h]         │
│  Status: NORMAL ✓                    │
│  Avg (7d): 68 bpm | Max: 92 bpm      │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  🫁 Blood Oxygen (SpO2)              │
│  ──────────────────────────────────  │
│  Current: 98 %  | Status: EXCELLENT  │
│  ▁▂▃▅▆██▇▅▃▂▁ [sparkline 7h]        │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  🌡️ Body Temperature                 │
│  ──────────────────────────────────  │
│  Current: 36.8°C | Trend: ↑ +0.3°C  │
│  Status: NORMAL ✓                    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  📍 Risk Assessment                  │
│  ──────────────────────────────────  │
│  Overall Health Score: 87/100        │
│  ████████░░ [progress bar]           │
│  Status: LOW RISK  ✓                 │
│  Alert: None                         │
└──────────────────────────────────────┘
```

**Card Sizing:**
- Width: 160px (centered with 5px margin)
- Height: ~50-65px per card
- Border-radius: 10px
- Background: Card background color with 1px gray border
- Icon: 14px emoji/icon at left (8px margin)
- Title: 10px bold white
- Values: 9px light green (current), 8px gray (trend)
- Sparkline: 6px height, 60px width
- Status badge: 8px, green/orange/red based on health
- Font family: Monospace for numbers (better readability on small screens)

### Footer (300-320px)
```
┌──────────────────────────────────────┐
│  ◀  Screen 2 of 3  ▶                 │
│  ↑ Scroll for more details ↑         │
└──────────────────────────────────────┘
```

---

## 🚨 Screen 3: Alerts, History & Quick Actions

**Purpose:** Emergency alerts, recent events, app shortcuts
**Layout:** Vertical list with action buttons

### Header (0-35px)
```
┌──────────────────────────────────────┐
│ 09:45  |  ●●●●  |  92%              │
│ Alerts & Actions
└──────────────────────────────────────┘
```

### Content Area (35-300px)

**Section 1: Active Alerts (if any)**
```
┌──────────────────────────────────────┐
│  ⚠️  ALERT: High HR Detected         │
│  HR spiked to 112 bpm at 09:30       │
│  Status: MONITORING  [blue badge]    │
└──────────────────────────────────────┘
```
- Show only if alert present, else show "No Active Alerts ✓"
- Alert card: Red border left, red background tinted
- Icon: 14px ⚠️
- Title: 10px bold red
- Details: 8px gray
- Auto-dismiss option (swipe left)

**Section 2: Recent Events (Last 24h)**
```
┌──────────────────────────────────────┐
│  📋 Recent Activity
│  ─────────────────────────────────── │
│  09:30  HR Alert         HIGH        │
│  08:15  Workout Detected 45 min      │
│  07:00  Sleep Quality    GOOD  8h    │
│  Yesterday at 21:45 Medication ✓    │
└──────────────────────────────────────┘
```
- Compact list: time (8px) + event (9px) + status (7px green)
- Scrollable if >4 events
- Tap event to see details (expand inline)
- Max height: 90px

**Section 3: Quick Action Buttons**
```
┌──────────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐          │
│  │  📞 Call │  │  💊 Meds │          │
│  │ Emergency│  │ Schedule │          │
│  └──────────┘  └──────────┘          │
│                                       │
│  ┌──────────┐  ┌──────────┐          │
│  │  📱 Phone│  │  🏥 Clinic          │
│  │  Doctor  │  │ Location │          │
│  └──────────┘  └──────────┘          │
└──────────────────────────────────────┘
```
- Grid: 2 columns, 4 buttons (2×2)
- Button size: 70×65px each, 8px spacing
- Button style: Rounded (8px), semi-transparent green when idle, solid green on press
- Icon: 20px emoji/icon
- Label: 7px white text below icon
- Tap action: Navigate to app or trigger action

### Footer (300-320px)
```
┌──────────────────────────────────────┐
│  ◀  Screen 3 of 3  ▶                 │
│  Press to cycle screens              │
└──────────────────────────────────────┘
```

---

## ⚙️ Navigation & Interaction

### Swipe Gestures
- **Left Swipe:** Next screen (Screen 1 → 2 → 3 → 1)
- **Right Swipe:** Previous screen
- **Swipe Sensitivity:** 30px minimum distance
- **Transition Animation:** Slide in 300ms (ease-out)
- **Visual Feedback:** Indicator dots animate on transition

### Touch Interactions
- **Tap Card:** Expand/collapse details (inline animation)
- **Tap Button:** Haptic feedback (vibrate 100ms)
- **Long Press:** Context menu (3-point menu)
- **Double Tap:** Quick action (HR graph → detailed view)

### Status Bar (Always Visible)
- Time (HH:MM, 24-hour format)
- Battery indicator (●●●●ㅤㅤ = 75-100%, ●●●●ㅤ = 50-75%, etc.)
- Signal strength (WiFi or Bluetooth)
- Update: Every 1 minute

---

## 🎭 Animations & Transitions

### Gauge Animation (Screen 1)
```
- Load: Ring fills 0→100% in 1000ms (easing: ease-in-out)
- Live Update: Number text animates 0→current in 500ms
- Status Change: Color transition in 300ms
```

### Sparkline Animation (Screen 2)
```
- Draw: Path animation left-to-right in 800ms
- Data Update: Smooth easing every 5 minutes
- Color: Green (normal), orange (caution), red (alert)
```

### Screen Transition (All Screens)
```
- Outgoing screen: Slide left/right + fade out (200ms)
- Incoming screen: Slide in + fade in (200ms)
- Indicator dots: Bounce to next dot (300ms, ease-out-bounce)
- Stagger: 50ms delay between elements
```

### Card Tap Animation (Screen 2-3)
```
- Press: Scale 0.98 + shadow increase (100ms)
- Release: Scale 1.0 + shadow decrease (100ms)
- Expand: Card height expands + content fades in (300ms)
```

---

## 💾 Memory & Performance Optimization

### Screen Buffer Strategy
- **Active Screen:** Rendered continuously
- **Inactive Screens:** Rendered on-demand (when swiped to)
- **Gauge Circles:** Pre-render static background, animate ring only
- **Sparklines:** Use line drawing algorithm (not bitmap)

### Update Frequency
- **Heart Rate:** Every 1 second (real-time sensor)
- **SpO2:** Every 2 seconds
- **Temperature:** Every 5 seconds
- **Steps:** Every 10 seconds
- **Risk Score:** Every 60 seconds

### Data Storage (SPIFFS/Flash)
```
/vitals/
  ├── hr_history.json      (48h × 1min = 2880 points)
  ├── spo2_history.json    (24h × 5min = 288 points)
  ├── temp_history.json    (7d × 30min = 336 points)
  └── alerts.json          (last 20 alerts)
```

---

## 🎯 Wireframe ASCII Art (Full Smartwatch Layout)

```
SCREEN 1: VITAL SIGNS DASHBOARD
┌──────────────────────────┐
│ 09:45 | ●●●●● | 92%     │  Status Bar (35px)
│ FRI 24 MAR 2026          │
│ Ahmad Fauzi              │
├──────────────────────────┤
│  ┌──────────┐┌──────────┐│
│  │    ❤️    ││    🫁    ││
│  │   72 bpm ││   98 %   ││
│  │   ██░░   ││   ██░░   ││
│  └──────────┘└──────────┘│  Main Gauges
│  ┌──────────┐┌──────────┐│
│  │   🌡️    ││   👟    ││
│  │  36.8°C  ││ 8,450    ││
│  │   ██░░   ││  ██░░   ││
│  └──────────┘└──────────┘│
│                          │
│  ◀ Screen 1 of 3 ▶      │  Navigation
└──────────────────────────┘

SCREEN 2: DETAILED METRICS
┌──────────────────────────┐
│ 09:45 | ●●●●● | 92%     │
│ Vital Details            │
├──────────────────────────┤
│ ❤️ Heart Rate Monitor   │
│ 72 bpm | Trend: ↓ -2bpm │
│ ▁▂▃▅▆█▇▅▃▂▁ [7h graph] │
│ Status: NORMAL ✓        │
│ ─────────────────────────│
│ 🫁 Blood Oxygen (SpO2)  │
│ 98% | Status: EXCELLENT │
│ ────────────────────────│
│  [scroll for more]       │
│ ◀ Screen 2 of 3 ▶      │
└──────────────────────────┘

SCREEN 3: ALERTS & ACTIONS
┌──────────────────────────┐
│ 09:45 | ●●●●● | 92%     │
│ Alerts & Actions         │
├──────────────────────────┤
│ ✓ No Active Alerts      │
│ ─────────────────────────│
│ 📋 Recent Activity       │
│ 09:30 HR Alert   HIGH   │
│ 08:15 Workout    45 min │
│ ─────────────────────────│
│ ┌────────┐┌────────┐   │
│ │ 📞 Call││ 💊 Meds │   │
│ │ Emerg. ││ Schedule│   │
│ └────────┘└────────┘   │
│ ┌────────┐┌────────┐   │
│ │ 📱 Phone││ 🏥 Clinic   │
│ │ Doctor ││ Locatin │   │
│ └────────┘└────────┘   │
│ ◀ Screen 3 of 3 ▶      │
└──────────────────────────┘
```

---

## 📝 Implementation Checklist

### Phase 1: Core UI Framework (Week 1)
- [ ] LVGL initialization (170×320 screen buffer)
- [ ] Color palette & theme setup
- [ ] Font selection (Roboto 8-12px range)
- [ ] Gauge widget setup (circular progress)
- [ ] Sparkline drawing algorithm

### Phase 2: Screen 1 - Dashboard (Week 1)
- [ ] Status bar with time + battery
- [ ] 4 circular gauges (HR, SpO2, Temp, Steps)
- [ ] Real-time sensor data integration
- [ ] Color coding by health status
- [ ] Swipe gesture detection

### Phase 3: Screen 2 - Details (Week 2)
- [ ] Scrollable metric cards
- [ ] Sparkline rendering (7h + 7d views)
- [ ] Trend indicators (up/down arrows)
- [ ] Risk assessment widget
- [ ] Tap to expand animations

### Phase 4: Screen 3 - Alerts (Week 2)
- [ ] Alert banner display
- [ ] Recent events timeline
- [ ] Quick action button grid
- [ ] Touch event handling
- [ ] Navigation to external apps (mock)

### Phase 5: Polish & Optimization (Week 3)
- [ ] Animation fine-tuning
- [ ] Memory profiling (FPS target: 30+ fps)
- [ ] Battery impact analysis
- [ ] Touch response tuning
- [ ] User testing on physical device

---

## 🔗 Integration Points

### Sensor Data Input
```cpp
// Mock sensor values for development
struct VitalSigns {
  uint16_t heart_rate;      // 40-200 bpm
  uint8_t spo2;             // 70-100%
  float temperature;        // 35-40°C
  uint32_t step_count;      // 0-50000/day
  int16_t hr_trend;         // Change in past 1h
  uint8_t risk_score;       // 0-100 (health)
};
```

### Cloud Sync (Firebase/MQTT)
```
Every 5 minutes:
  → Upload vital signs to cloud
  → Fetch alerts from backend
  → Update risk assessment

Every 24 hours:
  → Sync full history
  → Download firmware updates
```

---

## 📱 Testing on Physical Device

### Hardware Setup
1. Flash LVGL demo to ESP32-S3
2. Calibrate touchscreen (4-point calibration)
3. Adjust brightness (auto or manual setting)
4. Test gesture recognition sensitivity

### Performance Metrics
- **FPS Target:** 30-60 fps (smooth animations)
- **Touch Latency:** <100ms (responsiveness)
- **Memory Usage:** <2.5 MB (SRAM)
- **Battery Drain:** <5% per day (idle)

---

## 🚀 Future Enhancements (Phase 2)

1. **ECG Display:** 6-lead ECG waveform (Screen 2 expansion)
2. **Sleep Tracking:** Sleep cycle visualization
3. **Medication Reminders:** Time-based alerts
4. **Weather Widget:** Mini weather on Screen 1
5. **Music Control:** Play/pause/volume (Screen 3)
6. **Phone Notifications:** Incoming call/SMS preview
7. **Exercise Modes:** Activity-specific dashboards
8. **Custom Watch Faces:** Theme selector

---

**Design Status:** ✅ READY FOR IMPLEMENTATION
**Device Resolution:** 170×320px (1.47" AMOLED)
**Color Depth:** 16-bit RGB565 (65K colors)
**Expected Development Time:** 3-4 weeks
**Framework Recommendation:** LVGL 8.3+ or TFT_eSPI + custom widgets
