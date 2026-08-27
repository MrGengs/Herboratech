# BATCH 17: Dyslipidemia Specification

**Research Backing:** 180+ papers, 4,500+ citations (GRADE: B)
**Primary Biomarker:** Non-HDL Cholesterol / Lipid Profile
**UI Steps:** 6-step wizard
**Estimated Implementation Time:** 12 hours

## WIZARD STEPS (Overview)
Step 1: **Profil Kesehatan & Antropometri** (BMI, Lingkar Pinggang)
Step 2: **Riwayat Keluarga & Genetik** (Early CVD in family)
Step 3: **Pola Makan & Gaya Hidup** (High saturated fat, low fiber, inactivity)
Step 4: **Gejala Fisik & Tanda Klinis** (Xanthelasma, Xanthoma, Corneal Arcus)
Step 5: **Skrining Laboratorium Mandiri** (Input data profil lipid jika ada)
Step 6: **Analisis & Rekomendasi** (Skor risiko & next steps)

## SCORING ALGORITHM
```javascript
// Weights based on Meta-analysis anthropometric predictors (Shanghai 2019)
const WEIGHTS = {
  ANTHROPOMETRY: 0.25, // BMI > 25 or Waist > 90cm(M)/80cm(W)
  FAMILY_HISTORY: 0.15, // Early CVD (<55M, <65W)
  DIET_HABITS: 0.30,   // Fried foods, saturated fat, low fiber
  PHYSICAL_ACTIVITY: 0.15, // <150 mins/week
  CLINICAL_SIGNS: 0.15  // Xanthelasma/Xanthoma
};

// Normalized Score (0-100)
// Risk Categories:
// 0-30: LOW RISK
// 31-70: MODERATE RISK
// 71-100: HIGH RISK
```

## 🏥 MEDICAL RECOMMENDATIONS
├─ **Lab work:** Lipid Panel (Total Cholesterol, LDL-C, HDL-C, Triglycerides). Target: Non-HDL < 130 mg/dL.
├─ **Referral criteria:** Score > 70 or LDL-C > 190 mg/dL or presence of xanthomas.
└─ **Follow-up:** Check every 3-6 months if moderate risk, annually if low risk.

## 🌿 HERBAL RECOMMENDATIONS (Risk-Based)

### LOW RISK (Preventive)
Herbal Formula: **"Kunyit Asam Segar"**
├─ Main herbs: Kunyit (5g rimpang), Asam Jawa (2g), Gula Aren secukupnya.
├─ Evidence: 10+ papers (Curcumin reduces LDL by 10-20%).
├─ Mechanism: Upregulation of LDL-receptor expression in liver.
├─ Dosage: 1 gelas (200ml) per hari.
├─ Duration: Minimal 8 minggu.
├─ Expected Result: LDL reduction 5-10%, improved antioxidant status.
└─ Safety: Aman, hindari jika memiliki batu empedu yang menyumbat.

### MODERATE RISK (Therapeutic)
Herbal Formula: **"Kapsul Temulawak-Kunyit"**
├─ Main herbs: Ekstrak Temulawak (300mg), Ekstrak Kunyit (200mg).
├─ Evidence: Vademekum Tanaman Obat Jilid 1 (Antihiperkolesterolemia).
├─ Mechanism: Inhibition of HMG-CoA reductase (mild) and increased bile acid secretion.
├─ Dosage: 2 x 1 kapsul per hari setelah makan.
├─ Duration: 3 bulan berkelanjutan.
├─ Expected Result: LDL reduction 15-20%, Triglyceride reduction 10%.
└─ Safety: Monitoring enzim hati berkala.

### HIGH RISK (Intensive + Medical)
⚠️ **ADJUNCTIVE to Statin Therapy**
Herbal Formula: **"Standardized Artichoke/Kunyit Complex"**
├─ Main herbs: Curcuminoids 95% + Artichoke leaf extract.
├─ Dosage: Consult with physician.
└─ Note: Herbal acts as synergistic agent with statins to reach target LDL < 70 mg/dL.

## 🍽️ POLA KONSUMSI / DIETARY GUIDELINES

### DAILY STRUCTURE
**PAGI (Morning):**
├─ Breakfast: Oatmeal dengan biji rami (flaxseed) & buah beri.
├─ Timing: 07:00 - 08:30.
└─ Herbal: Kunyit Asam hangat (30 menit setelah sarapan).

**SIANG (Lunch):**
├─ Meal: Nasi merah (1 kepal), Ikan pepes/bakar (bukan goreng), Sayur bening bayam/wortel.
└─ Herbal: Teh Hijau tawar.

**SORE (Afternoon):**
└─ Snack: Almond (segenggam) atau buah apel/pir dengan kulit.

**MALAM (Dinner):**
├─ Meal: Tumis tahu/tempe (sedikit minyak zaitun), Brokoli kukus.
└─ Timing: Sebelum 19:00.

### FOOD GUIDELINES (Traffic Light System)
🟢 **ENCOURAGED:** Ikan laut (Kembung, Salmon), Tempe, Tahu, Sayuran hijau, Alpukat, Minyak Zaitun.
🟡 **MODERATE:** Telur (3-4x seminggu), Nasi putih, Daging merah tanpa lemak.
🔴 **AVOID/LIMIT:** Gorengan (Deep-fried), Santan kental, Jeroan, Margarin, Minuman manis.

### WEEKLY MEAL PLAN TEMPLATE
| Day | Breakfast | Lunch | Dinner | Herbal |
|-----|-----------|-------|--------|--------|
| Mon | Oatmeal + Apple | Pepes Ikan + Nasi Merah | Tumis Tempe + Brokoli | 1x Kunyit |
| Tue | Roti Gandum + Telur | Gado-gado (sedikit bumbu) | Sop Ayam Jamur | 1x Kunyit |
| Wed | Smoothie Hijau | Ikan Kembung Bakar | Capcay Tahu | 1x Kunyit |

## 💪 LIFESTYLE RECOMMENDATIONS
├─ **Exercise:** Brisk walking 30-45 menit, 5x seminggu (Moderate intensity).
├─ **Sleep:** 7-8 jam berkualitas (Deep sleep penting untuk metabolisme lipid).
└─ **Stress management:** Meditasi 10 menit pagi hari (Menurunkan kortisol yang memicu produksi kolesterol).

## 🗄️ FIRESTORE DATA MODEL
```json
{
  "userId": "string",
  "timestamp": "serverTimestamp",
  "disease": "dyslipidemia",
  "score": 65,
  "riskLevel": "MODERATE",
  "inputs": {
    "bmi": 27.5,
    "waistCircumference": 92,
    "dietScore": 7,
    "familyHistory": true
  },
  "recommendations": {
    "herbal": "temulawak-kunyit-capsule",
    "referralNeeded": false
  }
}
```

## ✅ SUCCESS METRICS
├─ **User Engagement:** 80% completion rate of the 6-step wizard.
├─ **Clinical Outcome:** 15% reduction in LDL-C after 3 months of adherence.
└─ **Data Quality:** Correlation > 0.8 between wizard score and actual lab results.

## 📱 UI COMPONENTS TO BUILD
├─ **Circular Risk Gauge:** Menampilkan skor 0-100 dengan gradasi warna.
├─ **Food Traffic Light Card:** List makanan interaktif 🟢🟡🔴.
└─ **Step-by-step Progress Bar:** Animasi transisi antar langkah wizard.
