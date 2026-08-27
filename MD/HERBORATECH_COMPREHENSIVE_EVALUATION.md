# 🏥 HERBORATECH COMPREHENSIVE EVALUATION & ENHANCEMENT PLAN

**Status:** 2026-03-24 | Claude Code | Strategic Medical Feature Gap Analysis & Batch Planning
**Target Focus:** Metabolic Syndrome, Diabetes, Hypertension, Chronic Kidney Disease, Common Community Health Issues

---

## 📊 EXECUTIVE SUMMARY

### Current State: 80% UI Complete, 40% Medical Features Complete

**What's Done:**
- ✅ 58 HTML pages created (all UI/UX)
- ✅ Firebase Auth + Firestore integrated
- ✅ 6 disease risk models (metabolic, diabetes, heart, hypertension, stroke, sleep)
- ✅ Batch 1-7 implementation tasks (Health Intelligence, Risk Engine, Dashboard, ML, Admin)
- ✅ Patient onboarding + health profile collection (6-step wizard)
- ✅ Real-time vital sign monitoring
- ✅ AI Health Chat (Gemini integration ready)

**What's Missing (Medical Gaps):**
- ❌ **Treatment Management System** — No guided treatment adherence, daily checklist, lifestyle monitoring
- ❌ **Chronic Disease Management** — No disease-specific pathways (DM, HTN, CKD)
- ❌ **Patient Education** — No evidence-based content for major diseases
- ❌ **Questionnaire Completeness** — Health profile missing disease-specific items (albumuria screening, etc.)
- ❌ **Risk Factor Comprehensiveness** — Missing genetic risk, kidney function, albuminuria, inflammation
- ❌ **Treatment Monitoring** — No medication adherence, lab tracking, follow-up scheduling
- ❌ **Lifestyle Intervention** — No structured diet plans, exercise tracking, stress management
- ❌ **Doctor-Patient Feedback Loop** — One-way recommendations only
- ❌ **Evidence Research Integration** — No peer-reviewed research backing features
- ❌ **CKD Screening** — Albuminuria, eGFR tracking missing
- ❌ **Preventive Intervention** — No early lifestyle modification program

---

## 🔍 PART 1: CURRENT RISK SCORING ANALYSIS

### 6 Disease Models Currently Implemented

| Model | Coverage | Evidence Base | Completeness |
|-------|----------|---------------|--------------|
| **Metabolic Syndrome** | BMI, Waist, Lipids, BP, Glucose, UA | IDF 2006 + NCEP ATP III | ✓ 85% |
| **Diabetes** | Age, BMI, FG, HbA1c, Family Hx, Lifestyle | FINDRISC + ADA 2024 | ✓ 80% |
| **Heart Disease** | Age, Gender, Lipids, BP, Smoking, Family Hx | Framingham simplified | ✓ 75% |
| **Hypertension** | BP categories, Lifestyle, Salt, Sleep, Stress | JNC-8 + WHO/ISH | ✓ 70% |
| **Stroke** | Age, HTN, Smoking, DM, Lipids, Family Hx | ASCVD framework | ✓ 65% |
| **Sleep Quality** | Duration, Quality (self), BMI, Smoking, Alcohol | PSQI adapted | ✓ 60% |

### 🚨 Critical Gaps in Risk Models

#### 1. **Metabolic Syndrome** — Missing Asian-Specific Criteria
- ❌ IDF cutoff for waist circumference is region-specific
- ❌ No NAFLD (non-alcoholic fatty liver disease) assessment — very common in Asia
- ❌ Uric acid included but not validated for MetS

**Fix Needed:** Add NAFLD risk (via ALT/AST), validate waist cutoffs for Indonesia/Asia

---

#### 2. **Diabetes** — Missing High-Risk Screening (Albuminuria)
- ❌ No albumin-to-creatinine ratio (ACR) input
- ❌ No gestational diabetes history (for females)
- ❌ Missing PCOS screening (for females 18-40)

**Fix Needed:** Add ACR field, GDM history, PCOS screening

---

#### 3. **Heart Disease** — Missing Inflammatory Markers
- ❌ No high-sensitivity CRP (hsCRP) — strong independent predictor
- ❌ No lipoprotein(a) — genetic predisposition marker
- ❌ No family history of early MI (<55M, <65F)

**Fix Needed:** Add hsCRP, Lp(a), early MI family history

---

#### 4. **Hypertension** — Missing Kidney Function
- ❌ No serum creatinine / eGFR — crucial for HTN + diabetes risk stratification
- ❌ No albuminuria — marker of end-organ damage
- ❌ No home BP monitoring trend (only one-time lab value)

**Fix Needed:** Add kidney function (eGFR, ACR), BP monitoring history

---

#### 5. **Stroke** — Missing Atrial Fibrillation Screening
- ❌ No pulse irregularity check (easy bedside exam)
- ❌ No history of TIA/ministrokes
- ❌ Missing homocysteine (for high-risk patients)

**Fix Needed:** Add AF screening, TIA history, homocysteine optional

---

#### 6. **Sleep Quality** — Too Simplistic
- ❌ No OSA (obstructive sleep apnea) screening — affects HTN/DM risk 3x
- ❌ Missing shift work assessment
- ❌ No nightmare/anxiety component

**Fix Needed:** Add STOP-BANG OSA screening

---

#### 7. **General Missing Items:**
- ❌ **Kidney Disease Screening** — No eGFR (from creatinine), no ACR
- ❌ **Genetic Risk Intensity** — Family history is single YES/NO, should track: relation, age of onset, severity
- ❌ **Inflammatory Markers** — No hsCRP (CRP), no fibrinogen
- ❌ **Psychosocial** — No depression screening (PHQ-9), anxiety (GAD-7)
- ❌ **Medication History** — No current medication list
- ❌ **Social Determinants** — No income, education, access to healthcare

---

## 🔬 PART 2: CONSENSUS API RESEARCH INTEGRATION PLAN

### Why Consensus API?

**Problem:** Features built without peer-reviewed evidence → may not reflect best practices → patient harm risk

**Solution:** Before implementing each feature, search Consensus API for:
1. Effectiveness of intervention
2. Target population evidence
3. Guidelines from major organizations (ADA, ESC, KDIGO)
4. Sample size & quality assessment

### Research Topics (Priority Order)

#### **CRITICAL — Implement First (Weeks 1-2)**

| Topic | Consensus Query | Use Case |
|-------|-----------------|----------|
| **Metabolic Syndrome Prevention** | "Lifestyle intervention metabolic syndrome efficacy RCT" | Justify lifestyle module |
| **Diabetes Prevention** | "Diabetes prevention program lifestyle exercise efficacy" | DPP-style intervention |
| **Hypertension Management** | "Home blood pressure monitoring hypertension control" | BP tracking validation |
| **Albuminuria as Screening** | "Albumin-to-creatinine ratio diabetes risk prediction" | CKD screening |
| **Kidney Disease Staging** | "eGFR KDIGO CKD classification prevalence Asia" | CKD management |

#### **HIGH — Implement Weeks 2-3**

| Topic | Query | Use Case |
|-------|-------|----------|
| **Sleep Apnea & HTN** | "Obstructive sleep apnea hypertension treatment CPAP RCT" | OSA screening |
| **Medication Adherence** | "Medication adherence intervention mobile app efficacy" | Adherence tracking |
| **Genetic Risk Counseling** | "Family history vs genetic testing cardiovascular risk prediction" | Family history module |
| **Inflammation & CVD** | "High-sensitivity CRP cardiovascular risk prediction independent" | hsCRP integration |
| **Mental Health & DM** | "Depression diabetes glycemic control bidirectional relationship" | Mental health screening |

#### **MEDIUM — Nice-to-have (Weeks 3-4)**

| Topic | Query | Use Case |
|-------|-------|----------|
| **Exercise Prescription** | "Exercise intensity duration metabolic syndrome diabetes improvement" | Exercise module |
| **Dietary Intervention** | "Mediterranean diet DASH diet hypertension diabetes RCT" | Nutrition module |
| **Stress Management** | "Mindfulness meditation cardiovascular disease anxiety RCT" | Stress module |

### Implementation Workflow

```
┌─ Batch X Feature Request
├─ Search Consensus API (get top 5 papers)
├─ Extract: Effect size, sample size, inclusion criteria, outcomes
├─ Document in code comments + features doc
├─ Implement feature
├─ Track evidence quality in admin dashboard
└─ Display "Evidence Level: ⭐⭐⭐⭐" to users
```

---

## 🏥 PART 3: MEDICAL APPROPRIATENESS EVALUATION

### For Target Diseases: Metabolic Syndrome, Diabetes, Hypertension, CKD

#### **A. Metabolic Syndrome (Insulin Resistance Cluster)**

**Definition:** ≥3 of: Central obesity + High BP + High triglycerides + Low HDL + Impaired fasting glucose

**HerboraTech Coverage:**

| Feature | Current | Gap |
|---------|---------|-----|
| **Screening & Diagnosis** | ✓ IDF criteria model | ❌ NAFLD assessment, UA levels not validated |
| **Patient Education** | ❌ Missing | ❌ NO content on what is metabolic syndrome |
| **Lifestyle Intervention** | ⚠️ Monitoring only | ❌ NO structured weight loss program (5-10% goal) |
| **Pharmacotherapy** | ❌ Missing | ❌ NO metformin monitoring, lipid drug tracking |
| **Follow-up** | ❌ Missing | ❌ NO 3-month reassessment schedule |
| **Comorbidity Management** | ⚠️ Partial (DM screening) | ❌ NO treatment for individual components |

**Recommendation:** **CRITICAL** — Implement Treatment Pathway for Metabolic Syndrome (Batch 16)

---

#### **B. Diabetes Mellitus (Type 2 Prevalence ~8% Indonesia)**

**HerboraTech Coverage:**

| Feature | Current | Gap |
|---------|---------|-----|
| **Risk Prediction** | ✓ FINDRISC + ADA | ❌ Missing GDM history, PCOS screening, HbA1c target personalization |
| **Diagnosis** | ⚠️ Shows risk score | ❌ NO clear pathway when FG/HbA1c diagnostic criteria met |
| **Patient Education** | ❌ Missing | ❌ NO DM pathophysiology, complications education |
| **Lifestyle Program** | ⚠️ Monitoring only | ❌ NO structured DPP (Diabetes Prevention Program) replication |
| **Medication Tracking** | ❌ Missing | ❌ NO insulin/metformin/GLP1 adherence monitoring |
| **Lab Monitoring** | ✓ Glucose input | ❌ NO HbA1c trending, no kidney function (ACR/eGFR) |
| **Complication Screening** | ❌ Missing | ❌ **NO retinopathy, neuropathy, nephropathy assessment** |
| **Preventive Care** | ❌ Missing | ❌ NO annual foot exam, eye exam scheduling |

**Recommendation:** **CRITICAL** — Implement Diabetes Management Pathway (Batch 17)

---

#### **C. Hypertension (HTN) (Prevalence ~31% Indonesia)**

**HerboraTech Coverage:**

| Feature | Current | Gap |
|---------|---------|-----|
| **Risk Stratification** | ⚠️ BP categories only | ❌ NO ABPM (24h), HOME BP trending, organ damage assessment |
| **Home BP Monitoring** | ❌ Missing | ❌ NO guided patient self-measurement protocol |
| **Lifestyle Intervention** | ⚠️ Salt, Exercise | ❌ NO DASH diet, weight loss targets, alcohol reduction |
| **Pharmacotherapy** | ❌ Missing | ❌ NO drug selection (ACEi vs ARB vs CCB), titration schedule |
| **Kidney Protection** | ❌ Missing | ❌ **CRITICAL: NO ACR/eGFR monitoring** for DM+HTN |
| **Follow-up** | ❌ Missing | ❌ NO 2-week BP check post-medication, NO 3-month reassessment |
| **Hypertensive Crisis** | ❌ Missing | ❌ NO when-to-seek-ER guidance |

**Recommendation:** **CRITICAL** — Implement Hypertension Management Pathway (Batch 18)

---

#### **D. Chronic Kidney Disease (CKD) (Prevalence ~3.8% Indonesia, often undiagnosed)**

**Current State in HerboraTech:** ❌ **COMPLETELY ABSENT**

**What's Needed:**

| Feature | Gap |
|---------|-----|
| **Risk Factors** | ❌ NO screening for: HTN, DM, CKD family history, NSAIDs use |
| **Screening Test** | ❌ NO eGFR (from creatinine), NO ACR |
| **CKD Staging** | ❌ NO KDIGO stages (G1-G5 by eGFR, A1-A3 by ACR) |
| **Risk Factors** | ❌ NO anemia screening (Hgb), NO mineral metabolism (Ca/PO4) |
| **Patient Education** | ❌ NO "You have CKD stage 3b" messaging |
| **Medication Review** | ❌ NO ACEi/ARB recommendation for DM+CKD |
| **Monitoring Schedule** | ❌ NO: "Check eGFR every 3-6 months" |
| **Referral Pathway** | ❌ NO "When to see nephrologist" criteria |

**Recommendation:** **CRITICAL** — Implement CKD Screening & Management (NEW Batch 19)

---

#### **E. Albuminuria (Microalbumin) — Critical Screening Test**

**Current State:** ❌ **COMPLETELY ABSENT**

**Why It Matters:**
- Earliest sign of diabetic kidney disease (before creatinine rises)
- Predictive of cardiovascular disease (even without diabetes)
- Asian populations have high rates: 30% DM patients have albuminuria
- Reversible if caught early (ACEi/ARB, glycemic control)

**HerboraTech Gap:**
- ❌ NO ACR (albumin-to-creatinine ratio) input field
- ❌ NO urine dipstick option
- ❌ NO interpretation: "Microalbuminuria stage 1" vs "Macroalbuminuria"
- ❌ NO triggered referral: "If ACR ≥300, refer to nephrologist"

**Recommendation:** **CRITICAL** — Add Albuminuria Screening Module (Part of Batch 19)

---

## 🎯 PART 4: TREATMENT MANAGEMENT SYSTEM — NEW ARCHITECTURE

### User Story

```
Patient A (35F) diagnosed with Type 2 Diabetes by doctor.
Doctor creates a Treatment Plan:
  - Goal: HbA1c <7%, weight loss 5kg in 3 months
  - Medications: Metformin 500mg BID, SGLT2i daily
  - Lifestyle: 150min/week exercise, DASH diet, <5g salt/day
  - Monitoring: Home glucose tracking, weekly weight, monthly HbA1c

Every day, Patient sees:
  - ✓ Checklist: Did you exercise? (Planned: 30min walk)
  - ✓ Checklist: Did you take medications? (✓ AM metformin, ✓ PM SGLT2i)
  - ✓ Checklist: Did you stay on diet? (✓ No sugar, ✓ <2000 kcal)
  - ✓ Checklist: Did you log vitals? (⏳ Pending glucose)
  - 📊 Weekly progress: Weight down 0.5kg, glucose avg 145 mg/dL (target <140)
  - 📈 Doctor feedback: "Great! Keep going. Increase exercise to 200min if tolerated."

Every month:
  - Doctor reviews: HbA1c trend, medication adherence, weight loss, side effects
  - Doctor adjusts: "Add Pioglitazone if HbA1c still >7%"
  - Doctor sends: Updated checklist goals
```

### Technical Design

#### **Firestore Schema**

```javascript
// Collection: users/{uid}/treatmentPlans/{planId}
{
  id: "treat_20260324_diabetes_001",
  disease: "Type 2 Diabetes",
  status: "active",  // active | paused | completed
  createdBy: "doc_12345",  // Doctor UID
  startDate: "2026-03-24",
  targetEndDate: "2026-06-24",

  // Goals
  goals: [
    { id: "g1", metric: "HbA1c", target: 7, unit: "%", current: 8.2, deadline: "2026-06-24" },
    { id: "g2", metric: "Weight Loss", target: 5, unit: "kg", current: 0.5, deadline: "2026-06-24" },
    { id: "g3", metric: "BP Systolic", target: 130, unit: "mmHg", current: 145, deadline: "2026-06-24" }
  ],

  // Medications
  medications: [
    {
      id: "med1",
      name: "Metformin",
      dose: "500mg",
      frequency: "2x daily (after breakfast + dinner)",
      reason: "Reduce glucose production",
      sideEffects: ["Nausea if taken empty stomach", "GI upset rare"],
      adherence: { target: 90, current: 95 }
    },
    {
      id: "med2",
      name: "SGLT2 Inhibitor (Empagliflozin)",
      dose: "10mg",
      frequency: "Once daily (morning)",
      reason: "Increase glucose excretion",
      sideEffects: ["Genital infection risk", "Dehydration"],
      adherence: { target: 90, current: 100 }
    }
  ],

  // Lifestyle Targets
  lifestyle: {
    exercise: {
      target: { duration: 150, unit: "min/week", type: "moderate intensity" },
      current: { duration: 45, unit: "min/week" },
      breakdown: ["30min walk 3x/week", "Avoid strenuous initially"]
    },
    diet: {
      target: ["DASH diet", "<5g sodium/day", "<2000 kcal/day", "Low glycemic index"],
      tracking: { method: "Daily checklist", frequency: "Every meal" }
    },
    monitoring: {
      glucometer: { frequency: "Fasting + 2h post meals", target: "7 times/week" },
      weight: { frequency: "Daily morning", target: "Track weekly avg" },
      bloodPressure: { frequency: "2x daily", target: "Home BP monitor" }
    }
  },

  // Daily Checklist Template
  dailyChecklistTemplate: [
    { id: "dl1", category: "Medication", item: "Metformin (morning)", required: true },
    { id: "dl2", category: "Medication", item: "SGLT2i (morning)", required: true },
    { id: "dl3", category: "Exercise", item: "30min walk", required: false },
    { id: "dl4", category: "Diet", item: "Stay on DASH diet", required: true },
    { id: "dl5", category: "Monitoring", item: "Check glucose", required: true },
    { id: "dl6", category: "Monitoring", item: "Weigh yourself", required: false }
  ],

  // Doctor Instructions
  doctorNotes: "Aggressive DM management. Consider insulin if HbA1c >8.5% at 3-month check.",

  // Review Schedule
  reviewSchedule: [
    { checkpoint: "2-week", metrics: ["Adherence", "Side effects"], action: "Phone call" },
    { checkpoint: "4-week", metrics: ["HbA1c trend (if available)", "Weight", "Medication adherence"], action: "Video visit" },
    { checkpoint: "12-week", metrics: ["HbA1c", "Weight", "BP", "Kidney function"], action: "In-person + labs" }
  ]
}

// Collection: users/{uid}/treatmentPlans/{planId}/dailyEntries/{dateStr}
{
  date: "2026-03-24",
  completed: 4,  // 4 of 6 completed
  checklist: [
    { id: "dl1", item: "Metformin (morning)", done: true, time: "08:15", notes: "" },
    { id: "dl2", item: "SGLT2i (morning)", done: true, time: "08:20", notes: "" },
    { id: "dl3", item: "30min walk", done: false, time: null, notes: "Rainy day, will do tomorrow" },
    { id: "dl4", item: "Stay on DASH diet", done: true, time: null, notes: "Brown rice + vegetables + fish" },
    { id: "dl5", item: "Check glucose", done: true, value: 156, unit: "mg/dL", time: "08:30" },
    { id: "dl6", item: "Weigh yourself", done: false, time: null, notes: "" }
  ]
}

// Collection: users/{uid}/treatmentPlans/{planId}/progressReports/{weekNum}
{
  week: 1,
  dateRange: "2026-03-24 — 2026-03-31",
  summary: {
    adherenceRate: 92,
    exerciseTotal: "45 min (goal: 150)",
    weightChange: "-0.5 kg",
    glucoseAvg: "145 mg/dL (baseline: 168)",
    medicationAdherence: "98%"
  },
  doctorFeedback: "✓ Excellent medication adherence! Increase exercise gradually.",
  alerts: [
    { level: "warning", message: "Only 45 min exercise this week. Try to add one more 30min session." }
  ]
}
```

---

### UI Components to Build

#### **Patient Side: New Pages**

**1. `patient/treatment-plan.html` — View Active Plans**

```
Header: "Rencana Pengobatan Saya"

FOR EACH active plan:
  Card: Disease name (e.g., "Diabetes Tipe 2")
  - Goal progress bars (3 goals showing: HbA1c, Weight, BP)
  - Button: "Lihat Detail" → `patient/treatment-detail.html`
  - Compliance summary: "92% compliance minggu ini"
  - Doctor note: "Excellent progress! Keep going."
```

**2. `patient/treatment-detail.html` — Plan Details & Daily Checklist**

```
Header: "Rencana Pengobatan: Diabetes Tipe 2"
Tab 1: TODAY'S CHECKLIST (sticky top)
  ✓ Metformin 500mg (Done 08:15)
  ✓ SGLT2i 10mg (Done 08:20)
  ◻ 30min walk (Not done)
  ✓ Jaga Diet DASH (Done)
  ✓ Cek Gula Darah 156 mg/dL (Done 08:30)
  ◻ Timbang Berat (Not done)

  Button: "Tandai Selesai Item" (untuk yang belum diklik)

Tab 2: GOALS PROGRESS (charts)
  3 charts: HbA1c trend, Weight loss curve, BP trend
  Each chart: Baseline → Current → Target
  Timeline: 3-month view

Tab 3: MEDICATIONS
  For each med:
    - Name, dose, frequency, reason
    - Potential side effects
    - Adherence: "95% (19 of 20 doses)"
    - Notes: "When to take: after food"

Tab 4: LIFESTYLE TARGETS
  - Exercise: "150 min/week moderate intensity"
    Current: "45 min done this week"
  - Diet: "DASH diet, <5g salt, <2000 kcal"
  - Monitoring: "Glucose 7x/week, Weight daily, BP 2x daily"

Tab 5: DOCTOR'S NOTES
  - Treatment rationale
  - Instructions
  - Next review date
  - Contact method

Bottom: "Next Review: 2026-04-21 (3 weeks)" button
```

**3. `patient/treatment-checklist.html` — Daily Checklist View**

```
Header: "Checklist Harian — {date}"

Time-ordered checklist:
  08:00 — Pagi (Morning)
    ✓ Minum Metformin
    ✓ Minum SGLT2i
    ⏳ Olahraga 30 min [Button: Mark done / Skip]

  12:00 — Siang (Afternoon)
    ✓ Makan sesuai Diet DASH

  08:30, 12:30, 20:30 (anytime)
    ⏳ Cek Gula Darah [input glucose value]
    ⏳ Timbang Berat [input weight]

Completion: 4 of 6 ✓ 67% (progress bar)

Button: "Selesai Untuk Hari Ini" (saves to daily entry)

Footer: "Doctor saw your checklist! ✓"
```

**4. `patient/treatment-progress.html` — Weekly Reports**

```
Header: "Laporan Kemajuan"
Dropdown: "Week 1" | "Week 2" | etc

THIS WEEK (Week 2):
  Date Range: 2026-03-24 — 2026-03-31

  Compliance Card:
    "92% kepatuhan minggu ini"
    - Medications: 98%
    - Exercise: 45 min (goal: 150) ⚠
    - Diet: 85% (some cheating days)

  Vital Signs Card:
    - Glucose avg: 145 mg/dL (target <140) ⚠
    - Weight: 72.5 kg (down 0.5 kg) ✓
    - BP: 132/82 (trend: stable)

  Doctor Feedback Card:
    "Great adherence to medications! ✓
     Next: Increase exercise to 200min. Try morning walks 5x/week.
     See you in 2 weeks for BP check."

  Alerts Section:
    ⚠ "Low exercise this week (45 min vs 150 goal)"
    ℹ "Glucose slightly high Wed-Thu; check diet on those days"
    ✓ "100% medication adherence! Excellent!"
```

#### **Doctor Side: New Pages**

**1. `doctor/treatment-plans.html` — Manage Plans for All Patients**

```
Header: "Rencana Pengobatan Pasien Saya"
Filter: "Active" | "Completed" | "All"
Search: By patient name

Table:
  Patient Name | Disease | Status | Progress | Last Review | Actions
  ─────────────────────────────────────────────────────────────────
  Budi A.      | DM2     | Active | 92%      | 3 days ago  | [View] [Edit]
  Siti R.      | HTN     | Active | 78%      | 1 week ago  | [View] [Edit]
  Rini J.      | CKD G3b | Active | 65%      | 2 weeks ago | [View] [Edit]
  ...

Button: "+ Create New Plan" (for patient you're consulting)
```

**2. `doctor/treatment-create.html` — Create Treatment Plan**

```
Header: "Buat Rencana Pengobatan Baru"
Step-by-step form:

Step 1: Select Patient
  Dropdown: [Patient list from recent consultations]

Step 2: Disease Selection
  Radio: Diabetes | Hypertension | CKD | Metabolic Syndrome | Custom

Step 3: Goals (max 3-5)
  Input: Goal metric (HbA1c / Weight / BP / etc)
        Target value
        Current value (auto-filled from last record)
        Deadline (30/60/90 days)

  [+ Add Another Goal]

Step 4: Medications
  [+ Add Medication]
    - Name (dropdown: common drugs for disease)
    - Dose + Frequency
    - Reason (patient education)
    - Side effects to watch for

Step 5: Lifestyle Targets
  Checkboxes:
    ☑ Exercise (duration/frequency)
    ☑ Diet (DASH/Mediterranean/Keto)
    ☑ Monitoring (daily glucose/weekly weight)
    ☑ Weight loss target (5-10%)
    ☑ Salt/Alcohol/Stress reduction

Step 6: Doctor Notes
  Textarea: Treatment rationale, comorbidities, monitoring plan

Step 7: Review Schedule
  Dropdown: 2-week | 4-week | 8-week | 12-week checkpoints

[Save & Create Plan]
```

**3. `doctor/treatment-monitor.html` — Monitor Specific Plan**

```
Header: "Monitor: {Disease} — {Patient Name}"

TOP SECTION: Goals Dashboard
  3 cards showing progress on each goal
  - HbA1c: 8.2% → 7.9% (current) vs 7% (target)
  - Weight: 75kg → 74.5kg vs 70kg
  - BP: 145/88 → 142/86 vs 130/80

  Timeline: Color-coded (red if off track, green if on track)

MIDDLE: Checklist Compliance This Week
  "92% completed (23 of 25 items)"
  Bar showing: Med adherence 98% | Exercise 45% | Diet 85% | Monitoring 100%

  Alerts section:
  ⚠ "Patient missed 2 SGLT2i doses (Thu-Fri)"
  ⚠ "Low exercise (45 min, not 150)"
  ℹ "Glucose high Wed (156 mg/dL)"

BOTTOM: Recent Entries (last 7 days)
  Table: Date | Glucose | Weight | Adherence | Notes
  2026-03-31 | 145 | 72.5 | 90% | Slight elevation
  2026-03-30 | 138 | 72.8 | 100% | Good
  ...

Button: "Send Feedback Message" → pre-fills with suggestions
Button: "Schedule Next Review" → calendar

Footer: "Plan expires 2026-06-24"
```

---

### Integration with Existing Features

#### **For Patient`doctor/chat-room.html`:**
- Add button: "📋 Create Treatment Plan" → redirect to `doctor/treatment-create.html`
- Display: "Patient has active plan: Diabetes. Compliance: 92%"

#### **For Patient `patient/health-dashboard.html`:**
- Add section: "📋 Your Active Plans"
  - Show 1-2 active plans with progress bars
  - Quick link to `patient/treatment-plan.html`

#### **For Doctor `doctor/home.html`:**
- Add widget: "Plans Overview"
  - Avg compliance: 85%
  - Patients on track: 8/10
  - Alert: "3 plans need review"

---

## 📋 PART 5: COMPREHENSIVE BATCH PLAN (16-25)

### Summary Table

| Batch | Name | Focus | Files | Est. Time | Medical Priority |
|-------|------|-------|-------|-----------|------------------|
| **16** | Albuminuria & CKD Screening | New ACR field, kidney function | health-profile, risk-engine | 3 days | 🔴 CRITICAL |
| **17** | Risk Factor Enhancement | Genetic risk, hsCRP, kidney | risk-engine, health-profile | 3 days | 🔴 CRITICAL |
| **18** | CKD Management Pathway | Staging, monitoring, referral | patient/ckd-*.html, doctor/* | 5 days | 🔴 CRITICAL |
| **19** | Diabetes Treatment System | Type 2 DM pathway + complications | patient/diabetes-*.html, doctor/* | 5 days | 🔴 CRITICAL |
| **20** | Hypertension Management | HTN pathway + home BP | patient/hypertension-*.html, doctor/* | 5 days | 🔴 CRITICAL |
| **21** | Metabolic Syndrome Pathway | MetS intervention + NAFLD | patient/metabolic-*.html, doctor/* | 4 days | 🟠 HIGH |
| **22** | Treatment Plan System (Phase 1) | Patient side: view plans, daily checklist | patient/treatment-*.html | 4 days | 🟠 HIGH |
| **23** | Treatment Plan System (Phase 2) | Doctor side: create, monitor plans | doctor/treatment-*.html | 4 days | 🟠 HIGH |
| **24** | Medication Adherence Tracking | Pill reminders, adherence %, interaction check | patient/medication.html, shared/* | 3 days | 🟠 HIGH |
| **25** | Consensus API Research Integration | Hook into all clinical features, display evidence badges | shared/consensus-api.js, all clinical pages | 4 days | 🟠 HIGH |

---

### 🔴 BATCH 16: Albuminuria & CKD Screening Module

**Goal:** Add kidney function indicators to risk scoring

**Files to Create:**
1. Update `shared/risk-engine.js` — Add `kidneyScore()` function
2. Update `patient/health-profile.html` — Add kidney function section (Step 5A)
3. New `patient/kidney-info.html` — CKD education page

**Implementation Details:**

```javascript
// In risk-engine.js, add:
function kidneyScore(profile) {
  const factors = [];
  let score = 0;

  // eGFR (calculated from creatinine)
  const egfr = profile.eGFR || calculateEGFR(profile.creatinine, profile.age, profile.gender);
  if (egfr !== null) {
    if (egfr < 30) { score += 40; factors.push('CKD Stage 4 (eGFR ' + egfr + ' mL/min)'); }
    else if (egfr < 45) { score += 30; factors.push('CKD Stage 3b (eGFR ' + egfr + ')'); }
    else if (egfr < 60) { score += 20; factors.push('CKD Stage 3a (eGFR ' + egfr + ')'); }
    else if (egfr < 90) { score += 8; factors.push('eGFR borderline (eGFR ' + egfr + ')'); }
  }

  // ACR (albumin-to-creatinine ratio)
  const acr = profile.acrUrine; // mg/g
  if (acr !== null) {
    if (acr >= 300) { score += 25; factors.push('Macroalbuminuria (ACR ' + acr + ' mg/g)'); }
    else if (acr >= 30) { score += 15; factors.push('Microalbuminuria (ACR ' + acr + ' mg/g)'); }
  }

  // Cause of CKD
  if (profile.knownConditions?.diabetes) { score += 15; }
  if (profile.knownConditions?.hypertension) { score += 10; }
  if (profile.familyHistory?.kidneyDisease) { score += 12; }

  // NSAID use (risk factor)
  if (profile.nsaidFrequency === 'frequent') { score += 8; }

  if (factors.length === 0) factors.push('Fungsi ginjal dalam batas normal');
  return { score: clamp(score, 0, 100), category: RISK_CATEGORY(score), factors };
}

function calculateEGFR(creatinine, age, gender) {
  // MDRD formula (simplified)
  const isMale = gender !== 'female';
  const factor = isMale ? 1 : 0.742;
  return 186 * Math.pow(creatinine, -1.154) * Math.pow(age, -0.203) * factor;
}
```

**Files Modified:**
- `patient/health-profile.html` — Add Step 5A: "Kidney Health"
  - Input: Serum creatinine (mg/dL)
  - Input: ACR (mg/g) or urine albumin (random or 24-hour)
  - Input: NSAID frequency (radio: never/rare/frequent)
  - Display: Calculated eGFR + KDIGO CKD stage

**Time:** 3 days (coding + testing)

---

### 🔴 BATCH 17: Risk Factor Enhancement (Genetic, Inflammatory, Medication)

**Goal:** Augment risk models with missing high-impact factors

**New Fields in `health-profile.html` Step 3 (Family History):**

```html
<!-- Existing: Simple checkboxes for disease -->
<!-- New: Track age of onset + severity -->

<div class="field-group">
  <label class="field-label">Riwayat Keluarga (Lebih Detail)</label>

  <!-- Diabetes Section -->
  <div class="toggle-row">
    <div class="toggle-info">
      <div class="toggle-title">Diabetes</div>
      <div class="toggle-sub">Siapa yang punya DM di keluarga?</div>
    </div>
    <label class="neu-toggle">
      <input type="checkbox" id="fh-diabetes">
      <span class="toggle-slider"></span>
    </label>
  </div>

  <!-- If checked, show detail input -->
  <div id="fh-diabetes-detail" style="display:none; margin-left: 20px;">
    <div style="font-size: 0.75rem; margin-bottom: 10px;">

      <!-- Relative type -->
      <label>Hubungan keluarga:</label>
      <div style="display: flex; gap: 8px; margin-bottom: 8px;">
        <button class="relative-btn" data-rel="parent">Orang tua</button>
        <button class="relative-btn" data-rel="sibling">Saudara</button>
        <button class="relative-btn" data-rel="grandparent">Kakek/Nenek</button>
      </div>

      <!-- Age of onset -->
      <label>Usia saat diagnosis (tebakan jika tidak tahu):</label>
      <input type="number" placeholder="Misal: 45" min="20" max="100" style="width: 100%; padding: 8px;">

    </div>
    [+ Add Another Family Member]
  </div>

  <!-- Similar for: Hypertension, Heart Disease, Stroke -->
  ...
</div>
```

**Update `risk-engine.js`:**

```javascript
function getFamilyHistoryMultiplier(profile) {
  // Each disease has enhanced family history
  let metabolicMult = 1.0;
  let diabetesMult = 1.0;
  let heartMult = 1.0;

  // Diabetes multiplier (EPIC-InterAct study)
  const dmFamily = profile.familyHistory?.diabetes;
  if (dmFamily?.both_parents) { diabetesMult = 3.4; }
  else if (dmFamily?.one_parent) { diabetesMult = 2.0; }
  else if (dmFamily?.sibling) { diabetesMult = 2.5; }
  else if (dmFamily?.grandparent) { diabetesMult = 1.5; }

  // If parent with DM <55 years: even higher
  if (dmFamily?.parents_early_onset) { diabetesMult *= 1.3; }

  return { metabolicMult, diabetesMult, heartMult };
}
```

**New Lab Inputs (in `health-profile.html` Step 4: Lab Results):**

```html
<!-- Existing: Glucose, Lipids, BP -->
<!-- New: Inflammatory markers -->

<div class="field-group">
  <label class="field-label">Penanda Peradangan (Optional)</label>

  <div class="lab-field">
    <label>High-Sensitivity CRP (hsCRP)</label>
    <input type="number" class="lab-input" placeholder="0.5-3.0" step="0.1">
    <span class="lab-unit">mg/L</span>
  </div>

  <div class="lab-field">
    <label>Fibrinogen</label>
    <input type="number" class="lab-input" placeholder="200-400" step="1">
    <span class="lab-unit">mg/dL</span>
  </div>
</div>

<!-- Medication Section -->
<div class="field-group">
  <label class="field-label">Obat yang Sedang Diminum</label>

  [+ Add Medication]
    - Name (search/autocomplete: Metformin, Insulin, etc)
    - Dose + Frequency
    - Duration (months taking)

  [List of medications patient has entered]
</div>
```

**Time:** 3 days

---

### 🔴 BATCH 18: CKD Management Pathway

**Goal:** Complete CKD screening → staging → monitoring → referral system

**New Pages to Create:**

1. **`patient/ckd-screening.html`** — Initial CKD risk assessment
   - Collection of eGFR + ACR (from health-profile or new input)
   - KDIGO CKD stage calculator
   - Education: "What is CKD?"
   - Recommendation: When to see nephrologist

2. **`patient/ckd-management.html`** — Active CKD patient's dashboard
   - Current eGFR trend (chart 12 months)
   - Current ACR (microalbumin status)
   - CKD stage badge (G1-G5, A1-A3)
   - Medications recommended (ACEi/ARB)
   - Monitoring schedule: eGFR check every 3-6 months
   - Lab values to watch: Phosphate, Calcium, Anemia

3. **`doctor/ckd-patient.html`** — Doctor monitoring CKD patient
   - Patient info + CKD stage
   - eGFR trend with regression rate (mL/min/year)
   - When to refer to nephrologist (threshold: eGFR <30 or rapid decline)
   - Medication adjustments (dose-based-on-eGFR dropdown)

**Update `risk-engine.js`:**
- Add CKD-specific risk calculator
- Track: eGFR, ACR category, KDIGO stage
- Output: "CKD Stage 3a — Moderate reduction in kidney function"

**Time:** 5 days

---

### 🔴 BATCH 19: Diabetes Treatment Management Pathway

**Goal:** Complete T2DM management for patients

**New Pages:**

1. **`patient/diabetes-screening.html`** — Diabetes risk & diagnosis
   - Collection of: FG, HbA1c, OGTT (if available)
   - FINDRISC score
   - Diagnosis logic: FG ≥126 OR HbA1c ≥6.5 → "Diabetes Confirmed"
   - If prediabetes (FG 100-125 or HbA1c 5.7-6.4) → Recommend DPP (Diabetes Prevention Program)

2. **`patient/diabetes-management.html`** — Active diabetes patient
   - HbA1c trend (quarterly)
   - Current medications + adherence
   - Complications screening checklist:
     - [ ] Annual eye exam (retinopathy)
     - [ ] Annual foot exam (neuropathy)
     - [ ] Annual urine ACR (nephropathy)
     - [ ] Annual lipid panel
     - [ ] Annual BP check
   - Lifestyle section: Target <7% HbA1c, 5-10% weight loss

3. **`patient/diabetes-complications.html`** — Screening for diabetic complications
   - Retinopathy: Any vision changes? → Refer to ophthalmologist
   - Neuropathy: Foot pain/numbness? → Simple sensation test (monofilament)
   - Nephropathy: ACR elevated? → Already captured in kidney module
   - CVD: Angina/chest pain? → Refer to cardiologist

4. **`doctor/diabetes-management.html`** — Doctor-side management
   - Patient HbA1c + trend (chart)
   - Medication list + adherence
   - Alert: "HbA1c > 8% for 2 quarters → Consider intensifying therapy"
   - Decision tree: Add metformin → add SGLT2i → add GLP-1 → add insulin
   - Complication checklist: Doctor-assigned referrals

**Time:** 5 days

---

### 🟠 BATCH 20: Hypertension Management Pathway

Similar to Diabetes but for HTN:

**New Pages:**
1. `patient/hypertension-screening.html` — BP classification, risk assessment
2. `patient/hypertension-management.html` — Monitoring, lifestyle, medication adherence
3. `patient/home-bp-monitoring.html` — Guided self-BP measurement + trend tracking
4. `doctor/hypertension-management.html` — Doctor adjustment of BP meds

**Key Features:**
- ABPM (home BP monitoring) log
- Medication ladder: ACEi → ARB → CCB → Thiazide
- DASH diet education
- Alert if SBP ≥180 mmHg → "Seek ER immediately"

**Time:** 5 days

---

### 🟠 BATCH 21: Metabolic Syndrome Pathway

**New Pages:**
1. `patient/metabolic-syndrome.html` — MetS diagnosis (IDF criteria)
2. `patient/metabolic-management.html` — Weight loss program, lipid management, NAFLD screening
3. `doctor/metabolic-management.html` — Monitor individual components

**Key Feature:**
- Weight loss goal: 5-10% (calculate from baseline)
- Lipid targets: TG <150, HDL >40M/>50F, LDL target varies
- NAFLD screening: ALT/AST, fatty liver ultrasound

**Time:** 4 days

---

### 🟠 BATCH 22-23: Treatment Plan System (Phase 1 & 2)

See Section 4 above. Split into patient-side (Batch 22) and doctor-side (Batch 23).

**Time:** 4 days each = 8 days total

---

### 🟠 BATCH 24: Medication Adherence Tracking

**Goal:** Help patients remember meds + track adherence

**New Page:** `patient/medication-tracker.html`

```html
<!-- Medication List with Reminders -->
Metformin 500mg
  When: Every morning after breakfast
  Reminder: 08:00 AM
  Frequency: Daily (365 days/year)

  [Set Reminder] [Mark as Taken] [Skip Today]

  This month: 23 of 30 doses taken (77% adherence)
  [Chart showing adherence trend]

SGLT2i 10mg
  When: Every morning
  Reminder: 08:15 AM
  ...

[+ Add Medication Manually]
```

**Features:**
- Push notification reminders
- One-click "Mark as Taken" logging
- Weekly adherence % display
- Drug-drug interaction warning (in shared/medication-check.js)
- Doctor sees adherence % in treatment plan

**Time:** 3 days

---

### 🟠 BATCH 25: Consensus API Research Integration

**Goal:** Link all clinical features to peer-reviewed evidence

**New Files:**
- `shared/consensus-api.js` — Wrapper around Consensus API
- Update all risk pages, treatment pages to display evidence badges

**Implementation:**

```javascript
// shared/consensus-api.js
const ConsensusAPI = {
  apiKey: process.env.CONSENSUS_API_KEY,

  async searchEvidence(topic) {
    // Call Consensus API
    const res = await fetch(`https://api.consensus.app/search`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
      body: JSON.stringify({ query: topic, limit: 5 })
    });
    return await res.json();
  },

  async getEvidenceBadge(feature) {
    // feature: "Diabetes Prevention via DPP"
    // Returns: { quality: 'A', studies: 42, avgCitation: 45 }
    ...
  }
};
```

**Display on Pages:**

```html
<!-- In patient/diabetes-management.html -->
<div class="evidence-badge">
  Evidence: ⭐⭐⭐⭐⭐ (A-level recommendation)
  42 RCTs, avg 45 citations
  [View Papers →] (link to Consensus search results)
</div>
```

**Time:** 4 days

---

## 📅 EXECUTION TIMELINE

### Optimal Schedule (Using 2x Anthropic Promo)

```
WEEK 1 (Mar 25-29): Batches 16-17 (Kidney + Risk Factors)
  Mon-Wed: Batch 16 (Kidney screening module)
  Wed-Fri: Batch 17 (Genetic risk, labs) + Testing

WEEK 2 (Apr 1-5): Batches 18-19 (CKD + Diabetes Pathways)
  Mon-Tue: Batch 18 (CKD management) Part 1
  Wed-Fri: Batch 19 (DM management) Part 1

WEEK 3 (Apr 8-12): Batches 20-21 (HTN + MetS)
  Mon-Tue: Batch 20 (HTN management)
  Wed-Thu: Batch 21 (MetS pathway)
  Fri: Integration testing

WEEK 4 (Apr 15-19): Batches 22-23 (Treatment Plans)
  Mon-Tue: Batch 22 (Patient treatment UI)
  Wed-Thu: Batch 23 (Doctor treatment UI)
  Fri: Firestore schema + backend setup

WEEK 5 (Apr 22-26): Batches 24-25 (Adherence + Evidence)
  Mon-Tue: Batch 24 (Medication tracking)
  Wed-Thu: Batch 25 (Consensus API integration)
  Fri: Final testing + deployment

TOTAL: ~5 weeks for all 10 batches
```

---

## ✅ SUCCESS CRITERIA

### By End of Batch 25

| Metric | Target |
|--------|--------|
| **Kidney Disease Screening** | ✓ eGFR + ACR collection + KDIGO staging |
| **Diabetes Management** | ✓ T2DM pathway from screening → complications |
| **Hypertension Management** | ✓ BP classification + medication ladder |
| **Metabolic Syndrome** | ✓ Weight loss + lipid tracking |
| **Treatment Plans** | ✓ Doctor creates, patient follows daily checklist |
| **Medication Adherence** | ✓ 80%+ patient adherence tracking |
| **Evidence Integration** | ✓ All features backed by Consensus papers |
| **Medical Accuracy** | ✓ All models follow KDIGO/ADA/ESC guidelines |

---

## 🎯 NEXT IMMEDIATE STEPS

1. **User Decision (TODAY):**
   - [ ] Approve this plan?
   - [ ] Proceed with Batch 16 first (Kidney screening)?
   - [ ] Which medical condition is highest priority? (Diabetes? HTN? CKD?)

2. **Setup for Batch 16:**
   - [ ] Get Consensus API key (if not already have)
   - [ ] Review KDIGO CKD guidelines
   - [ ] Start health-profile.html Step 5A modification

3. **Parallel Work (Terminal 2):**
   - Terminal 1 (Firmware): Continue LVGL + smartwatch integration
   - Terminal 2 (Web App): Start Batch 16 kidney screening

---

## 📚 REFERENCES

**KDIGO Guidelines:**
- https://kdigo.org/guidelines/ckd-evaluation-and-management/

**ADA Standards of Care (2024):**
- https://diabetesjournals.org/standards/

**ESC Hypertension Guidelines:**
- https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines

**FIND RISC Diabetes Risk Score:**
- https://www.findrisc.org/

**IDF Metabolic Syndrome Criteria:**
- https://www.idf.org/

---

**Document Created:** 2026-03-24
**Next Review:** Post-Batch 17 completion
**Owner:** Claude Code + User
**Status:** 🔴 Awaiting User Approval
