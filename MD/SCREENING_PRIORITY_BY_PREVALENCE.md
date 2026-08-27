# 🔬 SCREENING QUESTIONNAIRE PRIORITY — By Prevalence + Research

**Strategy:** Research-First (find papers) → Design Wizard → Code

**Update Date:** 2026-03-24
**Target:** 12-15 diseases dengan prevalence tertinggi di Indonesia

---

## 📊 **RANKED BY PREVALENCE (Indonesia)**

| Rank | Penyakit | Prevalence | Pengidap | Research Status | Priority |
|------|----------|-----------|----------|-----------------|----------|
| **1** | Dyslipidemia (High Cholesterol) | 35% | 84M | ❓ NEED | 🔴 CRITICAL |
| **2** | Hypertension | 34.1% | 82M | ✅ 3 papers found | 🔴 CRITICAL |
| **3** | NAFLD (Fatty Liver) | 25-40% | 60-96M | ❓ NEED | 🔴 CRITICAL |
| **4** | Metabolic Syndrome | 23.7% | 57M | ✅ 3 papers found | 🔴 CRITICAL |
| **5** | Obesity | 21.8% | 52M | ✅ 3 papers (MetS) | 🔴 CRITICAL |
| **6** | Prediabetes | ~7% | 17M | ✅ FINDRISC | 🔴 CRITICAL |
| **7** | Type 2 Diabetes | 10.2% | 25M | ✅ 3 papers (DPP) | 🔴 CRITICAL |
| **8** | Thyroid Dysfunction | 5-10% | 12-24M | ❓ NEED | 🟠 HIGH |
| **9** | Depression | ~6% | 14M | ✅ PHQ-9 | 🟠 HIGH |
| **10** | PCOS (women) | 6-15% women | 6-15M | ❓ NEED | 🟠 HIGH |
| **11** | Sleep Apnea (OSA) | 4-20% | 10-50M | ❓ NEED | 🟠 HIGH |
| **12** | Gout | 3.5% M, 1% F | 5-8M | ❓ NEED | 🟠 HIGH |
| **13** | CKD | 3.2% | 8M | ✅ 6 papers found | 🟢 DONE |
| **14** | Insulin Resistance | ~40% | 96M | ✅ Proxy Q | 🟡 MEDIUM |
| **15** | Diabetic Complications | Varies | Varies | ❓ NEED | 🟡 MEDIUM |

**Total: 15 penyakit**
- ✅ Papers already found: 5 (HTN, MetS, Obesity, Diabetes, CKD)
- ❓ Papers needed: 10

---

## 📚 **RESEARCH PAPERS YANG HARUS DICARI**

### Priority Order untuk Consensus MCP Search:

```
ROUND 1 (Critical — Highest Prevalence):
  ❌ #1: Dyslipidemia screening questionnaire
         Query: "dyslipidemia screening questionnaire lipid profile prediction"
         Year: ≥2015, Sample size: ≥100

  ❌ #2: NAFLD non-invasive assessment
         Query: "NAFLD screening non-invasive FIB-4 index fatty liver assessment"
         Year: ≥2015, Sample size: ≥100

  ❌ #3: Thyroid dysfunction screening
         Query: "hypothyroidism screening questionnaire TSH symptoms"
         Year: ≥2015, Sample size: ≥100

ROUND 2 (High — Moderate Prevalence):
  ❌ #4: PCOS screening questionnaire
         Query: "PCOS screening Rotterdam criteria polycystic ovary syndrome diagnosis"
         Year: ≥2015, Sample size: ≥100

  ❌ #5: Sleep Apnea screening (STOP-BANG)
         Query: "STOP-BANG OSA screening obstructive sleep apnea questionnaire"
         Year: ≥2015, Sample size: ≥100

  ❌ #6: Gout risk prediction
         Query: "gout risk prediction hyperuricemia screening questionnaire"
         Year: ≥2015, Sample size: ≥100

ROUND 3 (Supportive):
  ❌ #7: Insulin Resistance assessment
         Query: "insulin resistance HOMA-IR metabolic syndrome screening"
         Year: ≥2015, Sample size: ≥100

  ❌ #8: Diabetic Complication Screening
         Query: "diabetic complications screening retinopathy neuropathy checklist"
         Year: ≥2015, Sample size: ≥100

  ❌ #9: Osteoporosis Risk Assessment
         Query: "osteoporosis risk assessment FRAX screening postmenopausal"
         Year: ≥2015, Sample size: ≥100

  ❌ #10: Depression & Metabolic Health
          Query: "depression PHQ-9 metabolic syndrome metabolic health mental"
          Year: ≥2015, Sample size: ≥100
```

---

## 🎯 **WIZARD MULTI-STEP ARCHITECTURE**

Setiap screening akan follow struktur ini:

### **STEP 1: Introduction & Risk Assessment**
```html
[Disease Icon] [Name] [Indonesia Prevalence]

"Did you know? X% dari orang Indonesia memiliki [penyakit]"
"Screening ini membantu deteksi dini dalam 5 menit"

[START SCREENING] button
```

### **STEP 2: Symptoms Check (3-5 questions)**
```
Q1: "Apakah Anda mengalami [gejala utama]?"
Q2: "Durasi gejala berapa lama?"
Q3: "Frekuensi: setiap hari, seminggu, kadang?"
Q4: "Seberapa mengganggu aktivitas sehari-hari?" (slider 1-10)
Q5: "Pernah ke dokter untuk ini?" (yes/no)

Progress: ▓▓▒▒▒▒▒▒▒▒ 20%
```

### **STEP 3: Risk Factors Check (4-6 questions)**
```
Q6: "Riwayat keluarga [penyakit]?" (yes/no)
Q7: "Faktor lifestyle: [sedentary/stress/diet/smoking]" (multi-checkbox)
Q8: "Berat badan berubah dalam 6 bulan?"
Q9: "Minum obat untuk [related condition]?"
Q10: "Diagnosis terkait yang sudah dimiliki?" (checkboxes)

Progress: ▓▓▓▓▒▒▒▒▒▒ 40%
```

### **STEP 4: Lab Indicators / Biometrics (2-4 questions)**
```
Q11: "Ketahui hasil lab terakhir Anda?"
      └─ Checkbox: Berat badan, Tekanan darah, Kolesterol, Gula darah, dll

Q12: "Masukkan nilai terbaru yang diketahui"
      └─ Input fields untuk lab values (optional)

Q13: "Kapan terakhir check up?" (date picker)

Progress: ▓▓▓▓▓▓▒▒▒▒ 60%
```

### **STEP 5: Severity & Duration (2-3 questions)**
```
Q14: "Berapa lama mengalami kondisi ini?"
      └─ Radio: <1 bulan, 1-3 bulan, 3-6 bulan, >6 bulan, >1 tahun

Q15: "Seberapa berat gejala saat ini?" (slider)

Q16: "Pernah diberi diagnosis resmi?" (yes/no/unsure)

Progress: ▓▓▓▓▓▓▓▓▒▒ 80%
```

### **STEP 6: RESULT & INTERPRETATION**
```
[Risk Category CARD]
├─ Level: ✓ LOW RISK / ⚠ MEDIUM RISK / 🔴 HIGH RISK
├─ Score: 42/100
├─ Interpretation text (personalized)
└─ Confidence: Based on X screening questions

[RESEARCH BACKING]
├─ "Based on 5 peer-reviewed papers"
├─ "324 total citations"
└─ [View Papers] expandable

[NEXT STEPS CTA]
├─ Button A: "Schedule Doctor Visit"
├─ Button B: "View Management Plan"
├─ Button C: "Download Report"
└─ Button D: "Track Progress"

Progress: ▓▓▓▓▓▓▓▓▓▓ 100% COMPLETE
```

---

## 🗂️ **QUESTIONNAIRE SCORING SYSTEM (UNIVERSAL)**

Setiap screening akan menggunakan scoring framework ini:

```javascript
scoring = {
  // Symptoms section (Max 30 points)
  symptoms: {
    presence: 0-10,  // "do you have symptom?"
    severity: 0-10,  // "how severe?" (slider)
    duration: 0-10   // "how long?" (weight factor)
  },

  // Risk factors section (Max 30 points)
  riskFactors: {
    familyHistory: 0-10,  // genetic multiplier
    lifestyle: 0-10,      // diet, exercise, smoking
    comorbidities: 0-10   // other diseases present
  },

  // Lab/Biometric section (Max 25 points)
  labIndicators: {
    pathological: 0-15,   // lab values abnormal
    trending: 0-10        // getting worse
  },

  // Duration/Chronicity (Max 15 points)
  chronicity: 0-15
}

totalScore = sum(all sections) / 100

category = {
  0-20:   "LOW RISK — General population average",
  21-50:  "MEDIUM RISK — Some concerning findings, monitor closely",
  51-100: "HIGH RISK — Recommend immediate doctor consultation"
}
```

---

## 📝 **SAMPLE WIZARD: DYSLIPIDEMIA SCREENING**

(Ini template untuk kuesioner pertama)

```
┌─────────────────────────────────────────┐
│     💊 SCREENING: Dyslipidemia         │
│     (High Cholesterol & Triglycerides)  │
│                                         │
│  35% dari orang Indonesia punya ini!    │
│  Screening 5 menit. Hasilnya penting!  │
│                                         │
│        [MULAI SCREENING]                │
└─────────────────────────────────────────┘

STEP 1/6: Gejala Umum
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▓▓▒▒▒▒▒▒▒▒ 16%

Dyslipidemia sering "silent killer" — tidak ada gejala.
Tapi beberapa orang melaporkan:

Q1. Apakah Anda merasakan chest pain / nyeri dada?
    ○ Tidak ada
    ○ Kadang-kadang
    ○ Sering
    ○ Sangat sering

Q2. Apakah ada riwayat serangan jantung di keluarga?
    ○ Ya, orangtua
    ○ Ya, saudara
    ○ Tidak ada
    ○ Tidak tahu

Q3. Apakah Anda pernah diperiksa kolesterol?
    ○ Ya, normal
    ○ Ya, tinggi
    ○ Ya, tapi lupa nilainya
    ○ Belum pernah

[LANJUT KE STEP 2]
```

---

## 🎬 **IMPLEMENTATION SEQUENCE**

### **Phase A: RESEARCH (1-2 minggu)**
```
1. Cari papers untuk 10 penyakit yang belum ada research
2. Dokumentasikan findings
3. Siapkan screening algorithms dari papers
```

### **Phase B: DESIGN (1 minggu)**
```
1. Design wizard template (HTML mockup)
2. Create questionnaire forms untuk top 5 (most prevalent)
3. Plan Firestore schema untuk screening results
```

### **Phase C: CODING (3-4 minggu)**
```
BATCH 17-A: Dyslipidemia + HTN + Obesity Screening
BATCH 17-B: MetS + Prediabetes Screening
BATCH 18: CKD (already done) + Thyroid + PCOS
BATCH 19: Diabetes screening (FINDRISC) + complications
BATCH 20: Sleep Apnea + Gout screening
BATCH 21-22: Depression (PHQ-9) + Insulin Resistance
```

---

## 🔍 **RESEARCH GATHERING CHECKLIST**

```
❌ Dyslipidemia screening questionnaire (35% prevalence)
❌ NAFLD non-invasive assessment (25-40% prevalence)
❌ Thyroid dysfunction screening (5-10% prevalence)
❌ PCOS screening (6-15% women)
❌ Sleep Apnea (STOP-BANG) (4-20% prevalence)
❌ Gout/Hyperuricemia (3.5% male)
❌ Insulin Resistance assessment (~40% prevalence)
❌ Diabetic Complications screening (varies)
❌ Osteoporosis risk (30% postmenopausal)
❌ Depression & Metabolic (6% baseline)

ALREADY HAVE:
✅ HTN (3 papers)
✅ MetS (3 papers)
✅ Obesity (3 papers)
✅ Diabetes (3 papers)
✅ CKD (6 papers)
✅ PHQ-9 (standard tool)
✅ FINDRISC (validated)
```

---

**NEXT STEP: Saya mulai search Consensus MCP untuk 10 papers yang missing?**

**Target:** Lengkapi semua research minggu ini, baru mulai design & code minggu depan.

