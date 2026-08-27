# BATCH 20: Metabolic Syndrome Specification

**Research Backing:** 60+ papers, 2,500+ citations (GRADE: A)
**Primary Biomarker:** IDF Criteria (Obesity + 2 additional factors)
**UI Steps:** 7-step wizard
**Estimated Implementation Time:** 11 hours

## WIZARD STEPS (Overview)
Step 1: **Pengukuran Utama** (Lingkar Pinggang - Wajib menurut IDF)
Step 2: **Tekanan Darah** (Sistolik/Diastolik)
Step 3: **Profil Gula Darah** (Fasting Glucose)
Step 4: **Profil Lipid (TG & HDL)** (Trigliserida dan HDL-Cholesterol)
Step 5: **Gaya Hidup & Pola Makan** (Konsumsi serat & aktivitas fisik)
Step 6: **Riwayat Merokok & Stres** (Faktor risiko tambahan)
Step 7: **Integrasi Diagnosis & Skor Risiko** (MetS Status)

## SCORING ALGORITHM
```javascript
// IDF Definition of Metabolic Syndrome
// Central Obesity (Waist >= 90cm M, >= 80cm W for Asians)
// PLUS any 2 of the following 4:

const IDF_CRITERIA = {
  TRIGLYCERIDES: (tg) => tg >= 150,
  HDL_CHOLESTEROL: (hdl, sex) => (sex === 'M' ? hdl < 40 : hdl < 50),
  BLOOD_PRESSURE: (sys, dia) => sys >= 130 || dia >= 85,
  FASTING_GLUCOSE: (glu) => glu >= 100
};

// Result: YES/NO for MetS + Score 0-100 for severity
```

## 🏥 MEDICAL RECOMMENDATIONS
├─ **Lab work:** Metabolic Panel (Complete Lipid, HbA1c, Fasting Insulin).
├─ **Referral criteria:** Positif Sindrom Metabolik (3 kriteria terpenuhi) atau Waist > 100cm.
└─ **Target:** Weight loss minimal 5-10% dalam 6 bulan untuk menghentikan progresivitas ke T2DM.

## 🌿 HERBAL RECOMMENDATIONS (Risk-Based)

### LOW RISK (Preventive)
Herbal Formula: **"Infusa Kayu Manis-Kunyit"**
├─ Main herbs: Bubuk Kayu Manis (1 sdt), Rimpang Kunyit (iris tipis).
├─ Evidence: 15+ papers (Cinnamon improves insulin sensitivity).
├─ Mechanism: Polyphenols in Cinnamon mimic insulin & Curcumin reduces systemic inflammation.
├─ Dosage: 1 gelas pagi hari sebelum sarapan.
├─ Duration: Harian.
└─ Safety: Aman, hindari Kayu Manis dosis sangat tinggi pada gangguan hati (Coumarin content).

### MODERATE RISK (Therapeutic)
Herbal Formula: **"Standardized Fenugreek-Curcumin"**
├─ Main herbs: Trigonella foenum-graecum extract (500mg) + Curcumin (200mg).
├─ Evidence: Landmark study PREDIMED-Plus backed components.
├─ Mechanism: Soluble fiber (Fenugreek) slows glucose absorption & improves lipid profile.
├─ Dosage: 1 kapsul 2x sehari (15 menit sebelum makan).
├─ Duration: 3-6 bulan berkelanjutan.
└─ Expected Result: Penurunan Triglyserida 15-20%, Perbaikan Gula Darah Puasa.

### HIGH RISK (Intensive + Medical)
⚠️ **ADJUNCTIVE to Lifestyle + Medical Treatment**
Herbal Formula: **"Berberine + Silymarin Complex"**
├─ Dosage: Berberine 500mg 3x sehari.
├─ Note: Berberine memiliki efikasi mendekati Metformin dalam kontrol glukosa & lipid. Perlu pengawasan dokter jika dikombinasikan dengan obat diabetes.

## 🍽️ POLA KONSUMSI / DIETARY GUIDELINES (Indo-Mediterranean)

### DAILY STRUCTURE
**PAGI (Morning):**
├─ Breakfast: Bubur Ayam Tanpa Kerupuk (Banyak Daun Bawang & Seledri) atau Telur Rebus & Ubi Cilembu.
├─ Timing: 07:00 - 08:00.
└─ Herbal: Infusa Kayu Manis Kunyit.

**SIANG (Lunch):**
├─ Meal: Nasi Merah (1/2 porsi), Ikan Bakar bumbu Kunyit, Lalapan Mentah (Timun, Kemangi), Tempe Bakar.
└─ Herbal: Jus Sayur (Sawi, Nanas, Lemon).

**SORE (Afternoon):**
└─ Snack: Kacang Tanah Sangrai atau Kuaci (Tanpa garam).

**MALAM (Dinner):**
├─ Meal: Sop Ikan atau Pepes Ayam, Tumis Kacang Panjang/Buncis dengan Bawang Putih.
└─ Timing: Maksimal jam 19:00.

### FOOD GUIDELINES (Traffic Light System)
🟢 **ENCOURAGED:** Ikan laut, Tempe, Tahu, Nasi Merah, Sayuran, Bawang Putih, Kayu Manis.
🟡 **MODERATE:** Buah-buahan manis sekali, Telur (maks 1/hari), Daging ayam tanpa kulit.
🔴 **AVOID/LIMIT:** Nasi Putih (porsi besar), Tepung-tepungan (Bakwan, Mendoan), Gula pasir, Miniak sawit berulang.

### WEEKLY MEAL PLAN TEMPLATE
| Day | Breakfast | Lunch | Dinner | Herbal |
|-----|-----------|-------|--------|--------|
| Mon | Ubi Rebus + Telur | Ikan Bakar + Nasi Merah | Sop Tahu Sayuran | 1x Kayu Manis |
| Tue | Bubur Kacang Hijau | Gado-gado (Bumbu sedikit) | Pepes Ayam + Lalapan | 1x Kayu Manis |
| Wed | Pepaya + Almond | Ikan Kembung + Sayur Bening | Tumis Buncis & Tempe | 1x Kayu Manis |

## 💪 LIFESTYLE RECOMMENDATIONS
├─ **The 'Power of 10':** Berjalan 10.000 langkah sehari atau 150 menit intensitas sedang seminggu.
├─ **Sleep Health:** Hindari paparan blue light (HP) 1 jam sebelum tidur untuk stabilitas hormon leptin/ghrelin.
└─ **Waist Tracking:** Ukur lingkar pinggang setiap 2 minggu sekali di pagi hari sebelum makan.

## 🗄️ FIRESTORE DATA MODEL
```json
{
  "userId": "string",
  "timestamp": "serverTimestamp",
  "disease": "metabolic_syndrome",
  "score": 85,
  "metSStatus": true,
  "criteriaMet": ["Waist", "BP", "HDL"],
  "inputs": {
    "waist": 95,
    "systolic": 140,
    "diastolic": 90,
    "tg": 160,
    "hdl": 35
  },
  "recommendations": {
    "herbal": "fenugreek-curcumin-extract",
    "weightLossTarget": "5kg"
  }
}
```

## ✅ SUCCESS METRICS
├─ **MetS Reversal:** Persentase user yang turun dari 3 kriteria MetS menjadi < 3 kriteria dalam 1 tahun.
├─ **Waist Reduction:** Rata-rata penurunan lingkar pinggang 2-4 cm dalam 3 bulan.
└─ **Adherence:** Konsistensi mencatat meal plan harian dalam aplikasi.

## 📱 UI COMPONENTS TO BUILD
├─ **Criteria Checklist Dashboard:** Visualisasi 5 kriteria MetS (Warna berubah jadi hijau jika terkontrol).
├─ **Waist-to-Height Ratio Tool:** Calculator sederhana tambahan untuk risiko kardiovaskular.
└─ **Activity Ring integration:** Menghubungkan data langkah kaki dari Google Fit/Apple Health.
