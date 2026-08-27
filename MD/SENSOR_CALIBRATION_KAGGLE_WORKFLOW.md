# 🔬 SENSOR CALIBRATION FRAMEWORK — Kaggle Data Collection & Precision Workflow

**Project:** HerboraTech Sensor Data Calibration System
**Purpose:** Transform raw sensor readings into clinical-grade vital signs
**Integration:** Kaggle Composio MCP + Arduino CLI + Firebase
**Target:** HR, SpO2, Temperature, Respiratory Rate
**Timeline:** 6–8 weeks

---

## 📋 OVERVIEW

### Current Problem
- ❌ Raw sensor data = noisy, uncalibrated, patient-specific drift
- ❌ Direct display to users = clinically inaccurate, potential harm
- ❌ No reference ground-truth for validation

### Solution Architecture
```
Raw Sensor Data (ESP32)
    ↓
[Local Preprocessing: Filters + Smoothing]
    ↓
[Calibration Engine: Linear/Polynomial/ML Model]
    ↓
[Cloud Validation: Firebase + Kaggle Dataset]
    ↓
Clinical-Grade Output → User Display
```

### Three-Tier Strategy
1. **Tier 1 (Immediate)**: Simple linear calibration (1-2 weeks)
2. **Tier 2 (Short-term)**: Patient-specific adaptive models (2-3 weeks)
3. **Tier 3 (Long-term)**: Population-wide ML models via Kaggle (4+ weeks)

---

## 🎯 TIER 1: IMMEDIATE CALIBRATION (1–2 weeks)

### 1.1 Hardware Calibration Phase

**Collect reference data using clinical-grade devices:**

```
Equipment Needed:
├── Reference Pulse Oximeter (FDA-approved)
├── Digital Thermometer (±0.1°C accuracy)
├── Calibrated ECG monitor (if available)
├── 3-5 test subjects (diverse age, skin tone, activity level)
└── Data logging sheet (Google Forms or local CSV)
```

**Protocol:**
```
For each subject, 10 measurements:
1. Rest position (5 min) → record reference HR, SpO2, Temp
2. Attach HerboraTech sensor to same location
3. Record raw readings for 30 seconds
4. Compare raw vs. reference
5. Calculate error: (HerboraTech - Reference) / Reference × 100%
6. Repeat for stress state (30 jumping jacks) + recovery
```

**Data Collection Template:**

```csv
timestamp,subject_id,reference_hr,herboratech_hr_raw,error_hr_%,reference_spo2,herboratech_spo2_raw,error_spo2_%,reference_temp,herboratech_temp_raw,error_temp_c
2026-03-25T10:15:00Z,S001,72,74,-2.8,98,97.2,-1.2,36.8,36.5,-0.3
2026-03-25T10:16:00Z,S001,73,75,-2.7,98,97.1,-1.1,36.8,36.6,-0.2
...
```

### 1.2 Linear Calibration Model

**Method: Least-Squares Linear Regression**

For each vital:
```
Calibrated_Value = a × Raw_Value + b

Where:
  a = slope (sensitivity correction)
  b = offset (bias correction)

Solve via: min Σ(Calibrated - Reference)²
```

**Implementation (C/Arduino for ESP32):**

```cpp
// Calibration structure
struct CalibrationCoeff {
  float hr_slope = 1.0;      // HR multiplier
  float hr_offset = 0.0;     // HR add-on
  float spo2_slope = 1.0;
  float spo2_offset = 0.0;
  float temp_slope = 1.0;
  float temp_offset = 0.0;
};

// Store in EEPROM (non-volatile)
EEPROM.put(CALIB_ADDR, calib_coeff);

// Apply calibration in real-time
float calibrate_hr(float raw_hr) {
  return raw_hr * calib_coeff.hr_slope + calib_coeff.hr_offset;
}

float calibrate_spo2(float raw_spo2) {
  return constrain(
    raw_spo2 * calib_coeff.spo2_slope + calib_coeff.spo2_offset,
    70.0, 100.0  // SpO2 bounds
  );
}

float calibrate_temp(float raw_temp) {
  return raw_temp * calib_coeff.temp_slope + calib_coeff.temp_offset;
}
```

**Accuracy Target (Tier 1):**
- HR: ±3 bpm within reference
- SpO2: ±1% within reference
- Temp: ±0.2°C within reference

---

## 🎯 TIER 2: ADAPTIVE PATIENT-SPECIFIC MODELS (2–3 weeks)

### 2.1 Patient Onboarding Calibration

**Goal:** Adapt model to individual patient's physiology

**Process:**
```
Day 1 (Setup):
  1. Patient completes 3-minute baseline measurement at rest
  2. System captures HR/SpO2/Temp trends
  3. Pair against clinical reference (optional: user-input or auto-sync with clinic)
  4. Calculate patient-specific calibration offset

Ongoing (Weekly):
  1. Every 100 measurements, recalibrate using exponential moving average
  2. EWMA = 0.7 × new_offset + 0.3 × previous_offset
  3. Detect drift: if |offset_change| > threshold, alert user
```

**Patient Profile Storage (Firebase Realtime Database):**

```json
{
  "users/patient123/calibration": {
    "last_updated": "2026-03-25T10:15:00Z",
    "device_id": "ESP32-S3-XXXX",
    "hr": {
      "slope": 0.98,
      "offset": -1.5,
      "confidence": 0.92,
      "samples": 145
    },
    "spo2": {
      "slope": 1.02,
      "offset": 0.3,
      "confidence": 0.88,
      "samples": 145
    },
    "temp": {
      "slope": 0.99,
      "offset": 0.1,
      "confidence": 0.85,
      "samples": 145
    },
    "metadata": {
      "age_group": "40-50",
      "skin_tone": "medium",
      "wrist_circumference_cm": 18.5
    }
  }
}
```

### 2.2 Multi-Variable Calibration

**Consider environmental factors:**

```cpp
// Extended calibration model
float calibrate_hr_advanced(
  float raw_hr,
  float activity_level,       // 0-100 (rest to exercise)
  float ambient_temp,         // 16-35°C
  float skin_temp            // 32-36°C
) {
  float activity_factor = 1.0 + (activity_level / 1000.0);
  float temp_factor = 1.0 + (ambient_temp - 25.0) * 0.01;

  float calibrated = raw_hr * calib.hr_slope + calib.hr_offset;
  calibrated *= activity_factor * temp_factor;

  return constrain(calibrated, 30.0, 200.0);
}
```

---

## 🎯 TIER 3: POPULATION-WIDE ML MODELS VIA KAGGLE (4+ weeks)

### 3.1 Kaggle Dataset Publishing Strategy

**Create a benchmark dataset on Kaggle:**

**Dataset Structure:**
```
herboratech-sensor-calibration-dataset/
├── metadata.csv
│   Columns: dataset_id, subject_id, device_model, study_date,
│            age_group, gender, skin_tone, bmi, medical_history,
│            measurement_location, activity_level
│
├── raw_measurements.csv
│   Columns: measurement_id, timestamp, raw_hr, raw_spo2, raw_temp,
│            raw_rr, activity_level, ambient_temp, skin_temp
│
├── reference_measurements.csv
│   Columns: measurement_id, reference_hr, reference_spo2,
│            reference_temp, reference_device, clinician_notes
│
├── calibration_ground_truth.csv
│   Columns: measurement_id, true_hr, true_spo2, true_temp, true_rr,
│            error_source (sensor_drift|device_var|patient_physio|env)
│
└── README.md (300+ lines documenting study protocol, sensor specs,
              reference devices, ethical approval, usage rights)
```

**Expected Dataset Size:**
```
Tier 3 Target: 5,000–10,000 measurement pairs
├── 50–100 diverse subjects
├── 50–100 measurements per subject
├── 6–12 months collection timeline
└── Validate with independent clinical dataset
```

### 3.2 Composio Kaggle MCP Integration

**Setup Instructions:**

**Step 1: Install Composio Libraries**
```bash
pip install composio-core python-dotenv
```

**Step 2: Create `.env` file**
```
COMPOSIO_API_KEY=your_composio_api_key_here
CLAUDE_CODE_USER_ID=your_user_id_here
```

**Step 3: Generate MCP URL (Python script)**

Create `setup_kaggle_mcp.py`:
```python
from composio import Composio
import os
from dotenv import load_dotenv

load_dotenv()

composio_client = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))
session = composio_client.create(
    user_id=os.getenv("CLAUDE_CODE_USER_ID"),
    toolkits=["kaggle"]
)

mcp_url = session.mcp.url
print(f"✅ MCP URL: {mcp_url}")
print(f"\nRun this command in Claude Code:")
print(f"claude mcp add --transport http kaggle-composio \"{mcp_url}\" \\")
print(f"  --headers \"X-API-Key:{os.getenv('COMPOSIO_API_KEY')}\"")
```

**Step 4: Register with Claude Code**
```bash
python setup_kaggle_mcp.py

# Output:
# ✅ MCP URL: https://api.composio.dev/mcp/kaggle-abc123xyz
#
# Run this command in Claude Code:
# claude mcp add --transport http kaggle-composio "https://api.composio.dev/mcp/kaggle-abc123xyz" \
#   --headers "X-API-Key:comp_xxx"

# Execute the command
claude mcp add --transport http kaggle-composio "https://api.composio.dev/mcp/kaggle-abc123xyz" \
  --headers "X-API-Key:comp_xxx"

# Restart Claude Code
exit
claude
```

**Step 5: Verify Installation**
```bash
claude mcp list
# Should show: kaggle-composio (HTTP) ✓
```

### 3.3 Available Kaggle Tools via Composio

| Tool Name | Purpose | Example Use |
|-----------|---------|-------------|
| `kaggle_list_datasets` | List all Kaggle datasets | Find similar calibration datasets |
| `kaggle_download_dataset` | Download dataset files | Get reference data for model training |
| `kaggle_create_dataset` | Create new Kaggle dataset | Publish HerboraTech calibration data |
| `kaggle_create_new_dataset_version` | Update dataset version | Publish refined calibration data |
| `kaggle_dataset_list_files` | List files in dataset | Check what files are available |
| `kaggle_competition_download_files` | Download competition data | Participate in health-related competitions |
| `kaggle_competition_submit` | Submit competition predictions | Validate calibration models |
| `kaggle_kernels_initialize` | Create Jupyter notebook | Run collaborative ML analysis |
| `kaggle_kernels_output_download` | Download kernel results | Retrieve model training outputs |

### 3.4 ML Calibration Model Training (Python/Kaggle Kernel)

**Step 1: Create Kaggle Kernel (Jupyter Notebook)**

```python
# Kaggle Kernel: HerboraTech Sensor Calibration Model Training

import pandas as pd
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import PolynomialFeatures
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

# Load dataset
df = pd.read_csv('../input/herboratech-sensor-calibration-dataset/raw_measurements.csv')
ref = pd.read_csv('../input/herboratech-sensor-calibration-dataset/reference_measurements.csv')

# Merge
data = df.merge(ref, on='measurement_id')

# Feature engineering
X = data[['raw_hr', 'raw_spo2', 'raw_temp', 'activity_level', 'ambient_temp', 'skin_temp']]
y_hr = data['reference_hr']
y_spo2 = data['reference_spo2']
y_temp = data['reference_temp']

# Train HR model with polynomial features
poly = PolynomialFeatures(degree=2, include_bias=False)
X_poly = poly.fit_transform(X)
X_train, X_test, y_train, y_test = train_test_split(X_poly, y_hr, test_size=0.2, random_state=42)

model_hr = Ridge(alpha=1.0)
model_hr.fit(X_train, y_train)
y_pred = model_hr.predict(X_test)

print(f"HR Model - MAE: {mean_absolute_error(y_test, y_pred):.2f} bpm")
print(f"HR Model - R²: {r2_score(y_test, y_pred):.4f}")

# Save models
joblib.dump(model_hr, 'model_hr.pkl')
joblib.dump(poly, 'poly_transformer.pkl')

# Similar for SpO2 and Temp...
```

**Step 2: Export Models as Firmware**

```cpp
// Convert sklearn model to embedded C++ coefficients
// Model: Ridge regression with polynomial features

float calibrate_hr_ml(float raw_hr, float activity, float ambient_t) {
  // Polynomial features: [raw_hr, activity, ambient_t, hr², activity², t², hr*activity, ...]

  // Example Ridge coefficients (extracted from trained model)
  const float coeff[] = {
    -5.2,      // bias/intercept
     0.95,     // raw_hr
     0.002,    // activity
     0.15,     // ambient_temp
     0.0001,   // raw_hr²
     0.0003,   // activity²
     0.001     // ambient_t²
  };

  float x0 = raw_hr;
  float x1 = activity;
  float x2 = ambient_t;

  float result = coeff[0] +
                 coeff[1]*x0 + coeff[2]*x1 + coeff[3]*x2 +
                 coeff[4]*(x0*x0) + coeff[5]*(x1*x1) + coeff[6]*(x2*x2);

  return constrain(result, 30.0, 200.0);
}
```

### 3.5 Continuous Improvement Loop

**Monthly Process:**

```
Week 1: Collect new calibration data from users (Firebase)
  └─→ Export to CSV, upload to Kaggle as new dataset version

Week 2: Retrain ML models using updated data (Kaggle Kernel)
  └─→ Compare new vs. old model accuracy
  └─→ If improvement >2%, proceed to Week 3

Week 3: Benchmark against clinical references
  └─→ Test on held-out patient cohort
  └─→ Publish paper/preprint on findings

Week 4: Deploy updated firmware
  └─→ OTA update to all HerboraTech devices
  └─→ A/B test: 50% old vs. 50% new model
  └─→ Monitor error drift over 2 weeks

Monthly: Publish calibration quality report
  └─→ Public dashboard: accuracy by subpopulation
  └─→ Transparency: model version, training data, limitations
```

---

## 📊 SUCCESS METRICS

### Tier 1 (Linear)
- ✅ MAE < 3 bpm for HR
- ✅ MAE < 1% for SpO2
- ✅ MAE < 0.2°C for Temperature
- ✅ Calibration time < 5 minutes per device

### Tier 2 (Adaptive)
- ✅ Patient-specific error reduces by 30% after 1 week
- ✅ No recalibration needed for 30 days
- ✅ Drift detection sensitivity > 90%

### Tier 3 (Population ML)
- ✅ Model accuracy ≥ 95% on test set (5,000+ samples)
- ✅ Equal accuracy across age/gender/skin-tone subgroups
- ✅ FDA validation pathway (future)

---

## 🔐 DATA PRIVACY & ETHICS

**Requirements:**
1. ✅ Obtain informed consent (HIPAA/GDPR compliant)
2. ✅ De-identify all data before Kaggle upload
3. ✅ Data use agreement limiting to research
4. ✅ Public documentation of limitations/biases
5. ✅ Offer participants right to deletion
6. ✅ IRB approval (if applicable in your region)

---

## 📅 TIMELINE

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Tier 1** | 1–2 weeks | Linear calibration model, EEPROM storage |
| **Tier 2** | 2–3 weeks | Patient-specific adaptation, Firebase schema |
| **Tier 3a** | 2–3 weeks | Kaggle dataset + documentation |
| **Tier 3b** | 2–4 weeks | ML model training + deployment pipeline |
| **Validation** | 2–4 weeks | Clinical validation, accuracy testing |
| **Total** | **6–8 weeks** | Production-ready calibration system |

---

## 🚀 NEXT STEPS

1. **Immediate:** Implement Tier 1 linear calibration
2. **Week 3:** Start collecting Tier 2 patient data
3. **Week 6:** Publish Tier 3 Kaggle dataset
4. **Week 10:** Deploy ML models via firmware OTA update
5. **Ongoing:** Monthly recalibration & accuracy monitoring

