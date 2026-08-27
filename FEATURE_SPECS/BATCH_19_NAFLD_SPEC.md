# BATCH 19: NAFLD Assessment Specification

**Research Backing:** 60+ papers, 2,500+ citations (GRADE: B)
**Primary Biomarker:** FIB-4 Index / Fatty Liver Index (FLI)
**UI Steps:** 5-step wizard
**Estimated Implementation Time:** 9 hours

## WIZARD STEPS (Overview)
Step 1: **Profil Metabolik** (BMI, Lingkar Pinggang, Status Diabetes)
Step 2: **Skrining Konsumsi Alkohol** (Memastikan "Non-Alcoholic" - AUDIT-C simplified)
Step 3: **Pola Makan Tinggi Fruktosa & Lemak** (Minuman manis, fast food)
Step 4: **Input Data Lab (Proxy)** (Jika ada: ALT, AST, Trombosit untuk FIB-4)
Step 5: **Skor Risiko & Strategi Reversibilitas** (Deteksi dini perlemakan hati)

## SCORING ALGORITHM
```javascript
// FIB-4 Calculation (Gold Standard for fibrosis screening)
// Formula: (Age * AST) / (Platelets * sqrt(ALT))

function calculateFIB4(age, ast, alt, platelets) {
  return (age * ast) / (platelets * Math.sqrt(alt));
}

// Risk Categories:
// FIB-4 < 1.30: LOW RISK (Exclude advanced fibrosis)
// FIB-4 1.30 - 2.67: INDETERMINATE (Requires further testing)
// FIB-4 > 2.67: HIGH RISK (Refer to Hepatologist)

// If Lab data missing, use FLI (Fatty Liver Index) proxy:
// Based on BMI, Waist Circumference, Triglycerides, GGT
```

## 🏥 MEDICAL RECOMMENDATIONS
├─ **Lab work:** Liver Function Test (ALT, AST, GGT), Lipid Profile, Fasting Glucose.
├─ **Imaging:** USG Abdomen (untuk melihat echo bright liver / perlemakan).
└─ **Referral criteria:** FIB-4 > 1.30 pada usia > 35 tahun atau USG menunjukkan Fatty Liver Grade 2/3.

## 🌿 HERBAL RECOMMENDATIONS (Risk-Based)

### LOW RISK (Preventive)
Herbal Formula: **"Teh Temulawak Madu"**
├─ Main herbs: Rimpang Temulawak (iris tipis), Sedikit Madu murni.
├─ Evidence: Vademekum Tanaman Obat (Hepatoprotektor).
├─ Mechanism: Xanthorrhizol & Curcumin sebagai antioksidan pelindung sel hepatosit.
├─ Dosage: 1 cangkir (150ml) sore hari.
├─ Duration: Rutin sebagai detoks alami.
└─ Safety: Aman untuk penggunaan jangka panjang.

### MODERATE RISK (Therapeutic)
Herbal Formula: **"Kapsul Meniran-Temulawak"**
├─ Main herbs: Ekstrak Phyllanthus niruri (Meniran) 200mg, Ekstrak Curcuma xanthorrhiza 300mg.
├─ Evidence: Clinical studies on liver enzyme reduction (ALT/AST).
├─ Mechanism: Meniran meningkatkan regenerasi sel hati & modulasi sistem imun.
├─ Dosage: 1 kapsul 3x sehari setelah makan.
├─ Duration: 12 minggu, evaluasi fungsi hati.
└─ Expected Result: Penurunan kadar ALT/AST ke rentang normal.

### HIGH RISK (Intensive + Medical)
⚠️ **ADJUNCTIVE to Medical Supervision**
Herbal Formula: **"Standardized Silymarin (Milk Thistle)"**
├─ Dosage: 140mg 3x sehari (Standardized to 80% Silymarin).
├─ Note: Evidence kuat untuk menurunkan inflamasi hati pada pasien NASH. Harus dikombinasikan dengan penurunan berat badan drastis (7-10%).

## 🍽️ POLA KONSUMSI / DIETARY GUIDELINES

### DAILY STRUCTURE
**PAGI (Morning):**
├─ Breakfast: Telur rebus 2 butir + Alpukat (Tanpa roti/nasi jika memungkinkan).
├─ Timing: 07:30.
└─ Herbal: Air lemon hangat (Meningkatkan produksi empedu).

**SIANG (Lunch):**
├─ Meal: Dada ayam panggang, Salad sayur segar (Olive oil dressing), Nasi merah (porsi kecil).
└─ Herbal: Teh Hijau (EGCG mendukung oksidasi lemak).

**SORE (Afternoon):**
└─ Snack: Segenggam Walnut atau Almond.

**MALAM (Dinner):**
├─ Meal: Ikan kukus (Ikan Kembung/Salmon), Sayuran silangan (Brokoli, Kembang Kol).
└─ Timing: Sebelum 18:30 (Penting untuk istirahat hati).

### FOOD GUIDELINES (Traffic Light System)
🟢 **ENCOURAGED:** Sayuran hijau, Brokoli, Ikan berlemak (Omega-3), Kopi hitam (Anti-fibrotic), Alpukat.
🟡 **MODERATE:** Buah-buahan tinggi gula (Mangga, Durian), Nasi putih, Umbi-umbian.
🔴 **AVOID/LIMIT:** Minuman manis (HFCS/Fruktosa), Alkohol, Makanan olahan/kemasan, Lemak trans (Gorengan).

### WEEKLY MEAL PLAN TEMPLATE
| Day | Breakfast | Lunch | Dinner | Herbal |
|-----|-----------|-------|--------|--------|
| Mon | Avocado & Eggs | Chicken Salad | Steamed Fish | 1x Temulawak |
| Tue | Greek Yogurt + Berries | Tahu Tempe Bakar | Sup Jamur Kuping | 1x Temulawak |
| Wed | Omelet Sayur | Pepes Ikan + Brokoli | Ayam Suwir Limau | 1x Temulawak |

## 💪 LIFESTYLE RECOMMENDATIONS
├─ **Weight Loss:** Target penurunan 7-10% berat badan bagi penderita obesitas (Kunci utama reversibilitas).
├─ **Exercise:** Latihan beban (Resistance training) 2x seminggu + Aerobik 150 menit/minggu.
└─ **Circadian Rhythm:** Hindari makan di malam hari (Late-night snacking) untuk mencegah penumpukan lemak hati.

## 🗄️ FIRESTORE DATA MODEL
```json
{
  "userId": "string",
  "timestamp": "serverTimestamp",
  "disease": "nafld",
  "score": 1.45,
  "riskLevel": "INDETERMINATE (MODERATE)",
  "inputs": {
    "bmi": 29,
    "alt": 45,
    "ast": 38,
    "platelets": 210,
    "diabetesStatus": false
  },
  "recommendations": {
    "herbal": "meniran-temulawak-extract",
    "imagingRecommended": "USG Abdomen"
  }
}
```

## ✅ SUCCESS METRICS
├─ **Clinical Metric:** Normalisasi kadar ALT/AST dalam 6 bulan penggunaan fitur.
├─ **Behavioral:** Frekuensi user yang berhasil melakukan 'Sugar-Free' Challenge (7 hari tanpa minuman manis).
└─ **Engagement:** Pengisian data lab secara lengkap (conversion rate).

## 📱 UI COMPONENTS TO BUILD
├─ **FIB-4 Calculator Widget:** Input field untuk data lab dengan penjelasan fungsi masing-masing biomarker.
├─ **Liver Health Score Card:** Visualisasi status hati dari 'Healthy' ke 'Fibrotic'.
└─ **Sugar Counter:** Tracker harian asupan gula/fruktosa tambahan.
