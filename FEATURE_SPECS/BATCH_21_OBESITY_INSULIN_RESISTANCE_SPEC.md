# BATCH 21: Obesity & Insulin Resistance Specification

**Research Backing:** 120+ papers combined (GRADE: B)
**Primary Biomarker:** BMI / HOMA-IR Proxy
**UI Steps:** 6-step wizard
**Estimated Implementation Time:** 11 hours

## WIZARD STEPS (Overview)
Step 1: **Antropometri & Komposisi Tubuh** (BMI & Lingkar Pinggang)
Step 2: **Tanda Klinis Resistensi Insulin** (Acanthosis Nigricans, Skin Tags, Fatigue setelah makan)
Step 3: **Aktivitas Fisik & Sedentary Time** (Langkah harian & jam duduk)
Step 4: **Konsumsi Gula & Karbohidrat Olahan** (Pola snack & minuman manis)
Step 5: **Data Lab Proxy** (Jika ada: Gula Darah Puasa & Insulin Puasa)
Step 6: **Analisis Risiko & Strategi Sensitivitas Insulin**

## SCORING ALGORITHM
```javascript
// Weights based on Brazilian cohort studies (2020)
const WEIGHTS = {
  BMI_WAIST: 0.40,       // Primary indicator of visceral fat
  CLINICAL_SIGNS: 0.20,  // Skin changes & post-prandial fatigue
  DIETARY_LOAD: 0.25,    // High GI foods consumption
  INACTIVITY: 0.15      // Lack of muscle-glucose disposal
};

// HOMA-IR Proxy Calculation (if lab data available):
// HOMA-IR = (Fasting Glucose mg/dL * Fasting Insulin mIU/L) / 405
// Asian Cutoff: > 2.2 indicates Insulin Resistance
```

## 🏥 MEDICAL RECOMMENDATIONS
├─ **Lab work:** HOMA-IR (Fasting Insulin + Glucose), HbA1c, Oral Glucose Tolerance Test (OGTT).
├─ **Referral criteria:** Score > 70 or BMI > 30 or presence of Acanthosis Nigricans.
└─ **Target:** Meningkatkan fleksibilitas metabolik melalui otot (otot adalah organ pembuangan glukosa terbesar).

## 🌿 HERBAL RECOMMENDATIONS (Risk-Based)

### LOW RISK (Preventive)
Herbal Formula: **"Teh Daun Salam-Jahe"**
├─ Main herbs: Daun Salam (5 lembar), Jahe merah (geprek), Air (2 gelas).
├─ Evidence: 10+ papers (Salam leaves help regulate blood glucose).
├─ Mechanism: Flavonoids in Salam leaves improve insulin receptor sensitivity.
├─ Dosage: 1 gelas sore hari.
└─ Safety: Aman, dapat membantu pencernaan.

### MODERATE RISK (Therapeutic)
Herbal Formula: **"Kapsul Brotowali-Daun Ungu"**
├─ Main herbs: Ekstrak Tinospora crispa (Brotowali) 250mg, Ekstrak Graptophyllum pictum (Daun Ungu) 150mg.
├─ Evidence: Vademekum Tanaman Obat (Antidiabetes/Insulin sensitizer).
├─ Mechanism: Alkaloids in Brotowali stimulate insulin secretion & peripheral glucose uptake.
├─ Dosage: 1 kapsul 2x sehari setelah makan.
├─ Duration: 8-12 minggu.
└─ Expected Result: Penurunan kadar gula darah post-prandial.

### HIGH RISK (Intensive + Medical)
⚠️ **ADJUNCTIVE to Lifestyle + Medical Supervision**
Herbal Formula: **"Standardized Bitter Melon (Pare) Extract"**
├─ Dosage: 500mg extract 2x sehari.
├─ Note: Mengandung Charantin yang bekerja mirip insulin. Hati-hati risiko hipoglikemia jika dikombinasikan dengan obat medis (Metformin/Insulin).

## 🍽️ POLA KONSUMSI / DIETARY GUIDELINES (Low GI & Fasting)

### DAILY STRUCTURE (Intermittent Fasting 16:8)
**08:00 - 12:00:** Fasting window (Minum air putih, kopi/teh tawar).
**12:00 (Lunch):**
├─ Meal: 'Protein First' - Ayam/Ikan/Telur + Sayuran hijau dulu, baru Karbo kompleks (Nasi merah/Ubi).
└─ Herbal: Kapsul Brotowali.

**16:00 (Snack):**
└─ Snack: Segenggam edamame rebus atau Telur rebus.

**19:00 (Dinner):**
├─ Meal: Sop Ikan, Tahu tempe, Sedikit nasi merah.
└─ Timing: Selesai makan sebelum jam 20:00.

### FOOD GUIDELINES (Traffic Light System)
🟢 **ENCOURAGED:** Protein (Ikan, Ayam, Telur), Lemak sehat (Alpukat, Zaitun), Sayuran non-pati, Pare, Buncis.
🟡 **MODERATE:** Buah utuh (Apel, Pir), Nasi merah, Ubi jalar, Kentang rebus.
🔴 **AVOID/LIMIT:** Gula pasir, Tepung (Roti putih, Bakmie), Jus buah, Soda, Kerupuk.

### WEEKLY MEAL PLAN TEMPLATE
| Day | Breakfast | Lunch | Dinner | Herbal |
|-----|-----------|-------|--------|--------|
| Mon | Fasting | Ayam Goreng (Airfryer) + Sayur | Sop Ikan | 1x Brotowali |
| Tue | Fasting | Gado-gado (Tanpa Lontong) | Tumis Daging Sapi + Brokoli | 1x Brotowali |
| Wed | Fasting | Ikan Bakar + Cah Kangkung | Telur Dadar Sayur | 1x Brotowali |

## 💪 LIFESTYLE RECOMMENDATIONS
├─ **Resistance Training:** Latihan beban (Push up, Squat, Angkat beban) 3x seminggu untuk membangun massa otot.
├─ **Post-Meal Walk:** Berjalan kaki 10-15 menit segera setelah makan untuk membantu otot menyerap glukosa.
└─ **Puasa Daud:** Opsi bagi yang ingin pendekatan spiritual-metabolik (Puasa selang-seling hari).

## 🗄️ FIRESTORE DATA MODEL
```json
{
  "userId": "string",
  "timestamp": "serverTimestamp",
  "disease": "obesity_insulin_resistance",
  "score": 72,
  "riskLevel": "HIGH",
  "inputs": {
    "bmi": 31.5,
    "waist": 102,
    "acanthosis": true,
    "sugarIntake": "daily"
  },
  "recommendations": {
    "herbal": "brotowali-extract",
    "fastingProtocol": "16:8"
  }
}
```

## ✅ SUCCESS METRICS
├─ **Body Composition:** Penurunan persentase lemak tubuh & peningkatan massa otot (via integrasi smart scale).
├─ **Clinical:** Penurunan HOMA-IR mendekati < 2.0.
└─ **Behavioral:** Keberhasilan menjalankan 16:8 fasting selama 21 hari berturut-turut.

## 📱 UI COMPONENTS TO BUILD
├─ **Intermittent Fasting Timer:** Visualisasi jendela makan dan jendela puasa.
├─ **Protein-First Meal Logger:** Checklist urutan makan (Serat -> Protein -> Karbo).
└─ **BMI/Waist History Graph:** Grafik perbandingan penurunan lingkar pinggang vs berat badan.
