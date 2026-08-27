# 📋 MASTER IMPLEMENTATION PLAN — HERBORATECH

**Date:** 2026-03-24
**Status:** PLANNING PHASE - AWAITING APPROVAL
**Last Updated:** 2026-03-24

---

## 🎯 OVERVIEW

Rencana komprehensif untuk mengatasi **3 kategori masalah besar**:
1. **UI/UX Bugs** — Tombol tidak bekerja, fitur tidak berfungsi
2. **Medical Feature Gaps** — Fitur kesehatan belum lengkap
3. **Dynamic Data Integration** — Grafik/data masih statis

---

## 📌 PART 1: UI/UX BUGS - PRIORITY FIXES

### Bug #1: Health Profile - Checkboxes Don't Toggle

**File:** `patient/health-profile.html` (Lines 377-415)

**Problem:**
- User tidak bisa check/uncheck kondisi kesehatan (Diabetes, Hipertensi, dll)
- Tidak ada visual feedback
- Data tidak tersimpan ke Firestore

**Root Cause:**
- Checkbox input tersembunyi (opacity: 0)
- Tidak ada event listener untuk handle check/uncheck
- Auto-save tidak aktif

**Proposed Fix:**
- ✅ Add JavaScript event listeners untuk semua checkboxes
- ✅ Add visual feedback saat click
- ✅ Auto-save ke Firestore saat berubah
- ✅ Show "✓ Tersimpan" toast message

**Estimation:** 30 minutes
**Status:** ✅ READY TO IMPLEMENT

---

### Bug #2: Herbal Page - Search Button Doesn't Work

**File:** `patient/herbal.html` (Line 29)

**Problem:**
- Tombol search (🔍) di header tidak ada fungsi
- User tidak bisa klik untuk search
- Fitur search sudah ada tapi tidak terdiskover

**Root Cause:**
- Header search button tidak punya `onclick` handler
- Search input field ada tapi tidak fokus

**Proposed Fix:**
- ✅ Add `onclick="focusSearchInput()"` ke search button
- ✅ Create function yang fokus ke search input
- ✅ Auto-select text saat fokus

**Estimation:** 15 minutes
**Status:** ✅ READY TO IMPLEMENT

---

### Bug #3: Profile Page - All Menu Buttons Don't Work

**File:** `patient/profile.html` (Lines 47-76)

**Problems:**
| Button | Current | Issue |
|--------|---------|-------|
| Edit Profil | `showToast()` | Hanya toast, tidak navigate |
| Riwayat Medis | `showToast()` | Hanya toast, tidak navigate |
| FAQ / Q&A | No onclick | Tidak ada handler |
| Kebijakan Privasi | No onclick | Tidak ada handler |
| Pengaturan Notifikasi | No onclick | Tidak ada handler |
| Kontak Darurat | No onclick | Tidak ada handler |
| Settings Icon | No onclick | Tidak ada handler |

**Root Cause:**
- Buttons tidak punya `onclick="nav(...)"` handler
- Event listeners tidak terhubung ke page navigasi

**Proposed Fix:**
```
Edit Profil → edit-profile.html
Riwayat Medis → medical-history.html
FAQ → faq.html
Kebijakan Privasi → privacy-policy.html
Pengaturan Notifikasi → notification.html
Kontak Darurat → emergency-contact.html
Settings Icon → edit-profile.html
```

**Estimation:** 20 minutes
**Status:** ✅ READY TO IMPLEMENT

---

### Bug #4: Vital Signs - Static Graphics (High Priority)

**Files Affected:**
- `patient/home.html` (Lines 139-145) — Vital Mini cards
- `patient/monitoring.html` — Real-time vital display
- `patient/health-dashboard.html` — Risk cards

**Problem:**
```
Current: HR=78, SpO2=98, Temp=36.5, Steps=6,842 (hardcoded)
Sparklines: Empty placeholders
Animations: None
```

**Root Cause:**
- Vital data loaded dari VitalsManager tapi tidak ditampilkan
- SVG sparklines tidak dirender
- Tidak ada connection antara Firestore data dan UI display

**Proposed Fix:**
```
1. Load real vital data dari VitalsManager/Firestore
2. Create dynamic SVG sparklines
3. Update values every 5-10 seconds
4. Add smooth CSS animations saat value berubah
5. Show 24-hour trend data
```

**Complexity:** HIGH
**Estimation:** 2-3 hours
**Status:** ⏳ PLANNING PHASE

---

## 📌 PART 2: MEDICAL FEATURE GAPS - BATCHES 16-25

### Strategic Overview

**Status:** 6 disease models ada, tapi banyak gap medical features

| Batch | Feature | Priority | Scope |
|-------|---------|----------|-------|
| **16** | Albuminuria & CKD Screening | 🔴 CRITICAL | Add ACR field, kidney function, eGFR |
| **17** | Risk Factor Enhancement | 🔴 CRITICAL | Genetic risk, hsCRP, kidney markers |
| **18** | CKD Management Pathway | 🔴 CRITICAL | Staging, monitoring, referral system |
| **19** | Diabetes Treatment System | 🔴 CRITICAL | T2DM pathway, complications, meds |
| **20** | Hypertension Management | 🔴 CRITICAL | BP classification, drug ladder |
| **21** | Metabolic Syndrome Pathway | 🟠 HIGH | Weight loss, lipid tracking, NAFLD |
| **22** | Treatment Plan System P1 | 🟠 HIGH | Patient-side UI (view, daily checklist) |
| **23** | Treatment Plan System P2 | 🟠 HIGH | Doctor-side UI (create, monitor) |
| **24** | Medication Adherence | 🟠 HIGH | Pill reminders, adherence tracking |
| **25** | Consensus API Integration | 🟠 HIGH | Link all features to peer-reviewed research |

**Total Effort:** ~50-60 hours across 5 weeks

---

### Batch 16: Albuminuria & CKD Screening

**Files:**
- `shared/risk-engine.js` — Add `kidneyScore()` function
- `patient/health-profile.html` — Add kidney section (Step 5A)
- `patient/kidney-info.html` — NEW, CKD education

**New Data Fields:**
```
- Serum Creatinine (mg/dL)
- Albumin-to-Creatinine Ratio (mg/g)
- NSAID frequency
- eGFR (calculated)
- KDIGO CKD stage
```

**Estimation:** 3 days
**Dependencies:** None
**Next:** Batch 17

---

### Batch 17: Risk Factor Enhancement

**Files:**
- `shared/risk-engine.js` — Add genetic multipliers, hsCRP
- `patient/health-profile.html` — Enhanced family history tracking

**Enhancements:**
```
Family History:
  - Relative type (parent/sibling/grandparent)
  - Age of onset
  - Disease severity
  - Applies 1.8-3.4x multiplier (from EPIC-InterAct study)

New Lab Fields:
  - High-sensitivity CRP (hsCRP)
  - Fibrinogen
  - Lipoprotein(a)
```

**Estimation:** 3 days
**Dependencies:** Batch 16
**Next:** Batch 18

---

### Batch 18: CKD Management Pathway

**Files:**
- `patient/ckd-screening.html` — NEW
- `patient/ckd-management.html` — NEW
- `doctor/ckd-patient.html` — NEW
- `shared/risk-engine.js` — CKD risk calculator

**Features:**
```
Patient Side:
  - CKD risk assessment
  - KDIGO stage calculator
  - 12-month eGFR trend chart
  - When to see nephrologist

Doctor Side:
  - Patient CKD dashboard
  - eGFR regression rate
  - Auto-referral thresholds
  - Medication dose adjustment
```

**Estimation:** 5 days
**Dependencies:** Batch 16, 17
**Next:** Batch 19

---

### Batch 19: Diabetes Treatment Management

**Files:**
- `patient/diabetes-screening.html` — NEW
- `patient/diabetes-management.html` — NEW
- `patient/diabetes-complications.html` — NEW
- `doctor/diabetes-management.html` — NEW

**Features:**
```
Screening:
  - FINDRISC score
  - FG + HbA1c diagnosis logic
  - DPP (Diabetes Prevention Program) recommendation

Management:
  - HbA1c trending
  - Medication adherence
  - Complication checklist:
    * Annual eye exam (retinopathy)
    * Annual foot exam (neuropathy)
    * Annual urine ACR (nephropathy)
    * Annual lipid panel
```

**Estimation:** 5 days
**Dependencies:** Batch 16, 17, 18
**Next:** Batch 20

---

### Batch 20: Hypertension Management

**Files:**
- `patient/hypertension-screening.html` — NEW
- `patient/hypertension-management.html` — NEW
- `patient/home-bp-monitoring.html` — NEW
- `doctor/hypertension-management.html` — NEW

**Features:**
```
BP Classification:
  - Normal / Elevated / Stage 1 / Stage 2 / Crisis

Home BP Monitoring:
  - Guided self-measurement
  - 7-day average trend
  - Alert if SBP ≥180 mmHg

Treatment Ladder:
  - ACEi → ARB → CCB → Thiazide
  - Dosage adjustments based on response
```

**Estimation:** 5 days
**Dependencies:** Batch 18, 19
**Next:** Batch 21

---

### Batch 21: Metabolic Syndrome Pathway

**Files:**
- `patient/metabolic-syndrome.html` — NEW
- `patient/metabolic-management.html` — NEW
- `doctor/metabolic-management.html` — NEW

**Features:**
```
Diagnosis:
  - IDF criteria (5 components)
  - NAFLD risk assessment (ALT/AST)

Management:
  - Weight loss goal (5-10%)
  - Lipid targets
  - Individual component monitoring
```

**Estimation:** 4 days
**Dependencies:** Batch 18, 19, 20
**Next:** Batch 22

---

### Batch 22: Treatment Plan System - Patient Side

**Files:**
- `patient/treatment-plan.html` — NEW
- `patient/treatment-detail.html` — NEW
- `patient/treatment-checklist.html` — NEW
- `patient/treatment-progress.html` — NEW

**Features:**
```
View Plans:
  - Active treatment plans
  - Disease name + goals progress
  - Doctor recommendations

Daily Checklist:
  - Medications: ✓/◻ with time
  - Exercise: target minutes
  - Diet: DASH/Mediterranean adherence
  - Monitoring: Glucose, weight, BP
  - Completion %

Weekly Reports:
  - Compliance rate (%)
  - Medication adherence
  - Vital trends
  - Doctor feedback
```

**UI/UX:** Mobile-first, time-ordered checklist
**Estimation:** 4 days
**Dependencies:** Batch 18-21
**Next:** Batch 23

---

### Batch 23: Treatment Plan System - Doctor Side

**Files:**
- `doctor/treatment-plans.html` — NEW
- `doctor/treatment-create.html` — NEW
- `doctor/treatment-monitor.html` — NEW

**Features:**
```
Create Plan:
  - Select patient
  - Disease selection
  - Goals (max 5)
  - Medications with rationale
  - Lifestyle targets
  - Doctor notes
  - Review schedule

Monitor Plan:
  - Goals dashboard (progress bars)
  - Compliance this week (%)
  - Medication adherence
  - Alerts (low exercise, high glucose, etc)
  - Recent entries
  - Send feedback

Firestore Schema:
  - users/{uid}/treatmentPlans/{planId}
  - users/{uid}/treatmentPlans/{planId}/dailyEntries/{date}
  - users/{uid}/treatmentPlans/{planId}/progressReports/{week}
```

**Estimation:** 4 days
**Dependencies:** Batch 22
**Next:** Batch 24

---

### Batch 24: Medication Adherence Tracking

**Files:**
- `patient/medication-tracker.html` — NEW
- `shared/medication-check.js` — NEW

**Features:**
```
Medication List:
  - Name, dose, frequency
  - Reminder time (push notification)
  - "Mark as Taken" button
  - Drug-drug interaction warning

Adherence Analytics:
  - This month: X of Y doses taken (%)
  - Trend chart (7, 30 days)
  - Display on treatment plan
```

**Estimation:** 3 days
**Dependencies:** Batch 23
**Next:** Batch 25

---

### Batch 25: Consensus API Integration

**Files:**
- `shared/consensus-api.js` — NEW
- Update all clinical pages with evidence badges

**Features:**
```
For Each Feature:
  - Search Consensus API for peer-reviewed papers
  - Display: ⭐⭐⭐⭐⭐ (A-level)
  - Show: # studies, avg citations
  - Link to full paper list

Display on:
  - Risk pages (why this model?)
  - Treatment pages (effectiveness)
  - Medication pages (guidelines)
```

**Topics to Research:**
```
CRITICAL:
  - Metabolic Syndrome Prevention
  - Diabetes Prevention Program
  - Hypertension Management (Home BP)
  - Albuminuria Screening
  - CKD Staging (KDIGO)

HIGH:
  - Sleep Apnea & HTN
  - Medication Adherence Interventions
  - Family History vs Genetic Testing
  - hsCRP & CVD Risk
  - Depression & Diabetes
```

**Estimation:** 4 days
**Dependencies:** All batches (25 is final)

---

## 📊 TIMELINE & SEQUENCING

### Recommended Execution Order

```
WEEK 1 (Mar 25-29): Bug Fixes + Batch 16-17
  Mon-Tue: Bug #1, #2, #3 (UI fixes) — 1 hour total
  Tue-Wed: Bug #4 (Vital graphics) — 2-3 hours
  Wed-Fri: Batch 16 (Kidney screening) — 3 days
  Fri: Batch 17 start (Risk factors) — 1 day

WEEK 2 (Apr 1-5): Batch 17-19
  Mon: Batch 17 finish (Risk factors) — 2 days
  Tue-Wed: Batch 18 (CKD pathway) — 3 days
  Thu-Fri: Batch 19 start (Diabetes) — 2 days

WEEK 3 (Apr 8-12): Batch 19-21
  Mon: Batch 19 finish (Diabetes) — 3 days
  Tue-Wed: Batch 20 (Hypertension) — 3 days
  Thu-Fri: Batch 21 start (MetS) — 2 days

WEEK 4 (Apr 15-19): Batch 21-23
  Mon: Batch 21 finish (MetS) — 2 days
  Tue-Wed: Batch 22 (Treatment plans - patient) — 2 days
  Thu-Fri: Batch 23 start (Treatment plans - doctor) — 2 days

WEEK 5 (Apr 22-26): Batch 23-25
  Mon: Batch 23 finish (Treatment plans - doctor) — 2 days
  Tue-Wed: Batch 24 (Medication tracking) — 2 days
  Thu-Fri: Batch 25 (Consensus API) — 2 days

TOTAL: ~5 weeks, ~60 hours
```

### Parallel Work Possible

- Batch 16 & 17 can overlap (different files)
- Batch 22 & 23 must be sequential (dependencies)
- Batch 24 & 25 can run in parallel

---

## 🎯 SUCCESS CRITERIA

### UI/UX Bugs
- [ ] Checkboxes toggle on/off with visual feedback
- [ ] Search button focuses input field
- [ ] All profile menu items navigate to correct pages
- [ ] Vital signs cards show real data + animated sparklines

### Medical Features
- [ ] CKD staging works (KDIGO G1-G5, A1-A3)
- [ ] Diabetes pathway shows complications screening
- [ ] HTN shows when to seek ER (SBP≥180)
- [ ] Treatment plans save to Firestore
- [ ] Daily checklist tracks compliance
- [ ] Doctor can create/monitor plans
- [ ] All features linked to research papers

---

## ⚠️ RISKS & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Firestore schema changes | HIGH | Plan schema before implementation |
| Backward compatibility | MEDIUM | Provide migration for old data |
| Consensus API rate limits | LOW | Cache results, batch requests |
| Large codebase changes | MEDIUM | Create feature branches, test each batch |

---

## 📝 DECISION REQUIRED

**Before proceeding, please confirm:**

1. ✅ Proceed with **UI/UX Bug Fixes** first (1-2 hours)?
2. ✅ Then proceed with **Batches 16-25** (50-60 hours)?
3. ✅ Priority: Medical accuracy over quick delivery?
4. ✅ Weekly schedule OK (5-week timeline)?

**Or alternative priorities?**

---

**Status:** ⏳ AWAITING USER APPROVAL
**Next Action:** User reviews plan → Approves → Implementation begins
