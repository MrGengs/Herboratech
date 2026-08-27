# 🎯 TOHA IMPLEMENTATION PLAN — Lengkap

**Status:** 2026-03-23 | Claude Code | Comprehensive Task Analysis & Execution Plan

---

## 📊 COMPLETION STATUS

### ✅ COMPLETED (Progress.md)
| Module | Task | Status |
|--------|------|--------|
| Health Intelligence | Batch 1-5 Setup | ✅ |
| Risk Engine | 6 Models + Scoring | ✅ |
| Dashboard | Health Profile + Risk Cards | ✅ |
| ML Integration | Hybrid 60/40 Mode | ✅ |
| Admin Import | Bug Fix + Error Handling | ✅ |

### 🔄 IN PROGRESS (Phase 1)
| Task | Status | ETA |
|------|--------|-----|
| Run merge_herbals.js | ✅ DONE | - |
| Create seed_herbals.js | ✅ DONE | - |
| Seed to Firestore | ⏳ PENDING | Now |

### ❌ NOT STARTED (TOHA_TASK.md Batch 1-12)
| Batch | Task | Priority | Est. Time |
|-------|------|----------|-----------|
| 1 | Onboarding Wizard | HIGH | 1.5h |
| 2 | Admin Suspend/Delete | HIGH | 1h |
| 3 | Admin Herbal CRUD | HIGH | 2h |
| 4 | Admin Formula CRUD | MED | 2h |
| 5 | Admin Consultations | MED | 2h |
| 6 | Admin Reports/Export | MED | 2h |
| 7 | Admin Settings | LOW | 1.5h |
| 8 | Chat/Video Hardening + ML Hybrid | MED | 2h |
| 9 | ML Models UI Activation | MED | 1.5h |
| 10 | Gemini Chat Integration | LOW | 2.5h |
| 11 | Stress Detection UI | LOW | 1.5h |
| 12 | Health Analytics Chart | LOW | 2h |

**Total Remaining:** ~21 hours of implementation

---

## 🚀 EXECUTION SEQUENCE

### PHASE 1 (NOW) — Data Pipeline ⚡
```
1. Seed herbals_merged.json to Firestore
   → Verify patient.herbal page shows data
   → Deploy hosting
```

### PHASE 2 (2-3 hours) — Critical UI/Admin ⭐
```
1. BATCH 1: Onboarding Wizard → patient/onboarding.html
   - Modify patient/home.html (add guard check)
   - Create onboarding flow (4 steps)

2. BATCH 2: Admin Suspend/Delete Fix → admin/user-detail.html
   - Add suspendUser() function
   - Add deleteUserSoft() function
   - Add confirmation modals

3. BATCH 3: Admin Herbal Catalog → admin/herbals.html (NEW)
   - List/search/edit/delete herbals
   - Wired to Firestore
```

### PHASE 3 (4-6 hours) — Admin CRUD Features
```
4. BATCH 4: Admin Formula Jamu → admin/formulas.html (NEW)
5. BATCH 5: Admin Consultations → admin/consultations.html (NEW)
6. BATCH 6: Admin Reports/Export → admin/reports.html (NEW)
7. BATCH 7: Admin Settings → admin/settings.html (NEW)
```

### PHASE 4 (6-8 hours) — Advanced Features
```
8. BATCH 8-12: Chat hardening, Gemini integration, stress detection, analytics
```

---

## 📋 BATCH 13-15 — PERSONALIZATION LAYER (RESEARCH-BACKED)

**Status:** 2026-03-24 | New advanced features with peer-reviewed foundation

### ✨ BATCH 13: Genetic Risk Intensity
**Goal:** Enhance family history tracking to predict hereditary disease risk (2-6x multiplier)

**Rationale:**
- Family history is stronger predictor than genetic risk scores (EPIC-InterAct study)
- Single question outperforms 10+ genetic variants in clinical setting
- Parental origin matters: Both parents diabetic = 3.4x risk, one parent = 1.8-2.0x

**Implementation:**
- File: [www/patient/health-profile.html](www/patient/health-profile.html) — enhance Step 3 (Riwayat Keluarga)
- Add: Relative type (parent/sibling/grandparent), disease (diabetes/heart/stroke), age of onset
- Store: Firestore `users/{uid}/healthProfile/familyHistory` with calculated multipliers
- Update: [www/shared/risk-engine.js](www/shared/risk-engine.js) add `getFamilyHistoryMultiplier()` function
- Result: Apply 1.8-3.4x multiplier to metabolic/heart/stroke scores

**Literature:**
- [EPIC-InterAct: Family History vs Genetic Risk](https://pmc.ncbi.nlm.nih.gov/articles/PMC4038917/)
- [Parental Origin & Disease Risk](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5275752/)

**Effort:** 1.5-2 days

---

### 📈 BATCH 14: Risk Score Trend Prediction
**Goal:** Show disease progression trajectory (rising/stable/falling) with 3-month forecasting

**Rationale:**
- Time series analysis reveals disease trajectory better than static scores
- LSTM/transformer models validate 3-6 month progression patterns
- Enables early intervention when risk rising (actionable insight)

**Implementation:**
- File: [www/patient/health-dashboard.html](www/patient/health-dashboard.html)
- Add: Historical score tracking (already collecting daily/weekly via risk-engine.js)
- Calculate: 3-month moving average + linear trend (rising/stable/falling)
- Display: Chart showing score trend for each disease (6 models)
- Logic: If slope > 2% per week = "Rising Risk", recommend intervention
- Store: `users/{uid}/riskScores/history` with timestamps and scores

**Literature:**
- [Hypertension & Diabetes Trajectory Co-Prediction](https://pmc.ncbi.nlm.nih.gov/articles/PMC5877818/)
- [LSTM for Longitudinal Disease Prediction](https://pmc.ncbi.nlm.nih.gov/articles/PMC10687240/)

**Effort:** 2-3 days

---

### ⌚ BATCH 15: Wearable Device Integration
**Goal:** Connect Apple Watch/Fitbit/Google Fit for continuous biosignal monitoring (heart rate, sleep, activity)

**Rationale:**
- Apple Watch heart rate accuracy: ±10% error (clinically acceptable)
- Resting heart rate trend predicts hypertension/stress risk
- Sleep duration correlates with metabolic syndrome risk
- Validated across 430k+ participants, 82 studies

**Implementation:**
- File: NEW [www/patient/wearable.html](www/patient/wearable.html)
- Support:
  * Apple Health (iOS HealthKit integration)
  * Google Fit (Android integration)
  * Fitbit API (cloud sync)
- Extract & Store:
  * Resting heart rate (7-day avg) → `devices/{uid}/heartRate`
  * Sleep duration (7-day avg) → `devices/{uid}/sleep`
  * Activity level/steps (7-day avg) → `devices/{uid}/activity`
- Apply: Heart rate trend to hypertension/stress scores (+/-5%)
- UI: Device connection wizard, data sync status, 7-day trend charts

**Literature:**
- [Apple Watch 6 Heart Rate Validation](https://www.nature.com/articles/s41746-025-02238-1)
- [Wearable Accuracy: Systematic Review 430k Participants](https://mhealth.jmir.org/2020/9/e18694)

**Effort:** 3-5 days (API setup complexity)

---

## 📝 BATCH EXECUTION ORDER

**Recommended Sequence** (building complexity):
1. ✅ **BATCH 13 (Genetic Risk)** → 1.5-2 days → Highest impact, simple data model
2. ✅ **BATCH 14 (Trend Prediction)** → 2-3 days → Works with existing score data
3. ✅ **BATCH 15 (Wearable)** → 3-5 days → Most complex, requires API integration

**Parallel Work Possible:**
- Batch 13 & 14 can be worked simultaneously (different files)
- Batch 15 requires Batch 13/14 complete for consistent score application

**Total Estimated Time:** 6.5-10 days

---

## 📝 NEXT STEPS

**USER DECISION NEEDED:**
1. Proceed with Batch 13-15 implementation? (Y/N)
2. Implementation order: Sequential or parallel teams?
3. Wearable APIs: Which platforms to support first? (Apple/Google/Fitbit)

