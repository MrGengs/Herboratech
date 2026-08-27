# 🏥 DAFTAR PENYAKIT METABOLIC UNTUK SCREENING QUESTIONNAIRE

**Status:** 📋 PLANNING — 25 Penyakit Candidate
**Target:** Minimal 20 untuk HerboraTech Screening Pages
**Priority:** High prevalence di Indonesia + Screenable via Q

---

## 📊 KATEGORI & DAFTAR PENYAKIT

### **TIER 1: CRITICAL (Prevalence Tinggi, High Impact)**
*Harus ada screening questionnaire*

| # | Penyakit | ICD-10 | Indonesia Prevalence | Screening Tool | Priority |
|---|----------|--------|----------------------|-----------------|----------|
| 1 | Type 2 Diabetes Mellitus | E11 | 10.2% (25M orang) | FINDRISC 9-point | 🔴 CRITICAL |
| 2 | Hypertension | I10-I15 | 34.1% (82M orang) | BP history + symptoms | 🔴 CRITICAL |
| 3 | Metabolic Syndrome | E88.8 | 23.7% (57M orang) | IDF 5-criteria | 🔴 CRITICAL |
| 4 | Obesity | E66 | 21.8% adult (52M) | BMI + waist + diet Q | 🔴 CRITICAL |
| 5 | Dyslipidemia (High Cholesterol) | E78 | 35% (84M orang) | Lipid Q + diet history | 🔴 CRITICAL |
| 6 | Prediabetes | R73.0 | ~7% (17M orang) | FINDRISC 12-14 score | 🔴 CRITICAL |
| 7 | Non-Alcoholic Fatty Liver Disease (NAFLD) | K76.0 | 25-40% Asia | Ultrasound indication Q | 🔴 CRITICAL |
| 8 | Chronic Kidney Disease (CKD) | N18 | 3.2% (8M orang) | ACR + eGFR (sudah ada) | 🔴 CRITICAL |

---

### **TIER 2: HIGH (Moderate Prevalence, Important for DM/HTN complication)**
*Strongly recommended*

| # | Penyakit | ICD-10 | Indonesia Prevalence | Screening Tool | Notes |
|---|----------|--------|----------------------|-----------------|-------|
| 9 | Diabetic Retinopathy Risk | H36.0 | ~33% T2DM | HbA1c + duration + BP Q | Vision check schedule |
| 10 | Diabetic Nephropathy Risk | N08.3 | ~25% T2DM | ACR + eGFR (linked) | Already integrated |
| 11 | Diabetic Neuropathy Risk | E11.4 | ~25% T2DM | Foot symptoms Q | Monofilament screening |
| 12 | Metabolic Syndrome Complications | M79.7 | ~30% MetS | Component Q + cardio risk | Links to HTN/DM |
| 13 | Insulin Resistance | E88.8 | ~40% adult | HOMA-IR proxy Q | Waist + lipid + glucose |
| 14 | Polycystic Ovary Syndrome (PCOS) | E28.2 | 6-15% women | Menstrual + infertility Q | Female-specific |
| 15 | Metabolic Acidosis Risk | E87.2 | ~5% DM | Breathing + fatigue Q | DM complication |
| 16 | Hyperlipidemia (Triglycerides) | E78.1 | 15-20% | Diet + alcohol + weight Q | Separate from cholesterol |

---

### **TIER 3: MODERATE (Medium Prevalence, Screenable)**
*Recommended for comprehensive coverage*

| # | Penyakit | ICD-10 | Indonesia Prevalence | Screening Tool | Clinical Notes |
|---|----------|--------|----------------------|-----------------|-----------------|
| 17 | Gout (Hyperuricemia) | M10, E79.0 | 3.5% male, 1% female | Diet + family hx + uric acid | Purine intake Q |
| 18 | Thyroid Dysfunction (Hypothyroidism) | E03 | ~5-10% | Fatigue + weight + cold sensitivity Q | Often overlooked |
| 19 | Metabolic Bone Disease (Osteoporosis Risk) | M80-M81 | ~30% postmenopausal | Age + calcium + weight Q | Fracture risk |
| 20 | Sleep Apnea Syndrome (OSA) | G47.3 | 4-20% (depends on BMI) | Snoring + apnea + daytime Q | Linked to HTN/MetS |
| 21 | Metabolic Depression (Mood Disorder) | F32-F33 | ~6% | PHQ-9 depression scale | Often missed in MetS |
| 22 | Fatty Acid Oxidation Disorder | E71 | Rare but critical | Family history + symptoms Q | Genetic screening |

---

### **TIER 4: EMERGING (Lower Prevalence, But Interesting)**
*Optional for future expansion*

| # | Penyakit | ICD-10 | Notes |
|---|----------|--------|-------|
| 23 | Hypogonadism (Low Testosterone) | E29.1 | Male metabolic issue, linked to MetS |
| 24 | Lipoprotein(a) Elevation | E78.8 | Genetic CVD risk, emerging importance |
| 25 | Familial Hypercholesterolemia | E78.0 | Genetic, high MI risk, rare (~1:500) |

---

## 🎯 **RECOMMENDED PRIORITY FOR HERBORATECH**

### **Phase 1: CORE SCREENING (8 penyakit)**
```
1. Type 2 Diabetes (FINDRISC)
2. Hypertension (BP + symptom history)
3. Metabolic Syndrome (IDF 5-criteria)
4. Obesity (BMI + waist + behavior)
5. Dyslipidemia (lipid profile Q)
6. Prediabetes (FINDRISC 12-14)
7. NAFLD Risk (ALT/AST indication)
8. CKD Risk (ACR + eGFR — already done)
```
**Timeline:** Batch 17-21 (already planned) ✅

---

### **Phase 2: COMPLICATION SCREENING (4 penyakit)**
```
9. Diabetic Retinopathy Risk
10. Diabetic Nephropathy Risk (linked to CKD)
11. Diabetic Neuropathy Risk
12. Insulin Resistance
```
**Timeline:** Batch 19 (Diabetes Treatment) expansion

---

### **Phase 3: ASSOCIATED CONDITIONS (6+ penyakit)**
```
13. PCOS (women-specific)
14. Gout/Hyperuricemia
15. Thyroid Dysfunction
16. Osteoporosis Risk
17. Sleep Apnea Syndrome
18. Metabolic Depression (PHQ-9)
```
**Timeline:** Batch 22-24 (Treatment + Mental Health)

---

### **Phase 4: ADVANCED (5+ penyakit)**
```
19-25: Lipoprotein(a), Hypogonadism, Familial HC, etc.
```
**Timeline:** Batch 25+ (Research Integration + ML)

---

## 📋 **QUESTIONNAIRE DESIGN TEMPLATE**

Setiap screening akan follow struktur ini:

### **Format Standar untuk Setiap Penyakit:**

```
SCREENING: [Penyakit Nama]

Header:
├─ Disease icon + name
├─ Prevalence di Indonesia (%)
├─ Why important untuk Anda
└─ Research backing (# papers, citations)

Section A: Risk Factors
├─ Question 1-3: Symptoms
├─ Question 4-6: Family history
├─ Question 7-9: Lifestyle factors
└─ Question 10-12: Lab indicators

Section B: Duration & Severity
├─ "How long have you...?"
├─ "Frequency: daily/weekly/monthly?"
└─ "Impact on daily life?"

Section C: Medical History
├─ "Do you have related conditions?"
├─ "Medications you take?"
└─ "Doctor ever mentioned?"

Scoring:
├─ Points calculation
├─ Risk category (Low/Medium/High)
├─ Interpretation
└─ Recommended next step (doctor, lab test, lifestyle change)

Research:
└─ "Based on X papers, Y citations"
```

---

## 🔬 **RESEARCH BACKING AVAILABLE**

### Papers Already Found:
- ✅ CKD (6 papers — BATCH 16 done)
- ✅ MetS (3 papers — IDF criteria validated)
- ✅ HTN (3 papers — home BP monitoring)
- ✅ DM (3 papers — FINDRISC + DPP)
- ✅ Medication adherence (6 papers)
- ✅ Family history genetics (3 papers)

### Papers Still Needed for Full Coverage:
- ❓ PCOS screening questionnaires
- ❓ Diabetic complication screening (retinopathy, neuropathy)
- ❓ NAFLD non-invasive scoring
- ❓ Thyroid dysfunction screening
- ❓ OSA screening tools
- ❓ PHQ-9 depression screening
- ❓ Osteoporosis risk assessment
- ❓ Gout risk prediction

---

## 💡 **HERBORATECH SCREENING ARCHITECTURE**

### Page Flow:
```
[Disease Risk Dashboard]
        ↓
[Select Disease to Screen]
        ↓
[Detailed Questionnaire Page] — NEW
        ├─ Symptoms section
        ├─ Risk factors section
        ├─ Lab/measurement section
        └─ Scoring & result
        ↓
[Result Card]
        ├─ Risk category (Low/Med/High)
        ├─ Interpretation
        ├─ Research backing
        └─ CTA: "See Doctor" / "Track" / "Learn More"
        ↓
[Link to Treatment Pathway] — if HIGH risk
        (CKD → kidney-info + management)
        (DM → diabetes-screening + DPP)
        (HTN → home BP monitoring setup)
```

---

## 🚀 **IMPLEMENTATION ROADMAP**

### **Batch 16 (Done):** CKD Screening ✅
- ACR + eGFR questionnaire (implicit)
- KDIGO staging
- Kidney-info education

### **Batch 17:** Risk Factor Enhancement
- Family history multipliers
- Enhanced risk factors
- (Add Insulin Resistance Q as bonus)

### **Batch 18:** CKD Management
- (Already focused on CKD)

### **Batch 19:** Diabetes Screening & Management
- ✨ ADD: Full FINDRISC questionnaire (9 questions)
- ✨ ADD: Diabetic complications screening (retinopathy, neuropathy, nephropathy)
- Add DPP lifestyle pathway

### **Batch 20:** Hypertension Management
- ✨ ADD: Hypertension symptoms & history questionnaire
- Home BP monitoring + classification

### **Batch 21:** Metabolic Syndrome
- ✨ ADD: Full IDF 5-criteria questionnaire
- ✨ ADD: NAFLD risk assessment Q
- Weight loss pathways

### **Batch 22-24:** Treatment Plans + Mental Health
- ✨ ADD: PHQ-9 depression screening
- ✨ ADD: PCOS screening (women-specific)
- ✨ ADD: Gout/uric acid Q
- ✨ ADD: Sleep apnea screening (STOP-BANG)

### **Batch 25+:** Advanced Screening
- ✨ ADD: Thyroid dysfunction Q
- ✨ ADD: Osteoporosis risk Q
- ✨ ADD: Lipoprotein(a) genetic risk Q
- ✨ ADD: Hypogonadism Q

---

## ✅ **USER DECISION NEEDED**

**Pilih salah satu:**

```
OPTION A: Implement all 20+ screening questionnaires
  ├─ Pro: Comprehensive coverage, research-backed
  ├─ Con: Large scope, 10+ batches, 80+ hours
  └─ Timeline: 8-10 weeks

OPTION B: Start with CORE 8 (Tier 1)
  ├─ Pro: High impact diseases, MVP quality
  ├─ Con: Missing complication screening
  └─ Timeline: 5-6 weeks

OPTION C: Core 8 + Complications (12 total)
  ├─ Pro: Balanced scope, covers DM/HTN/MetS + complications
  ├─ Con: Still significant work
  └─ Timeline: 6-8 weeks

OPTION D: Core 8 + Complications + Associated (18 total)
  ├─ Pro: Very comprehensive, long-term roadmap
  ├─ Con: Larger effort
  └─ Timeline: 9-10 weeks
```

---

**Mana yang Anda prefer? Dan dari 20+ ini, ada prioritas khusus atau yang ingin diskip?**

