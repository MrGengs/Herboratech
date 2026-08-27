# CLAUDE_DESKTOP_ML_TASKS.md
<!-- Instruksi untuk Claude Desktop — Fase 2: ML Training Pipeline -->
<!-- 22 Maret 2026 -->

---

## 🎯 TUGAS FASE 2: Training 7 Model ML + Export ke TF.js

Dataset tersedia di: `data/kaggle/`
Output ke: `data/ml_models/tfjs/` (7 folder)
Scripts ke: `scripts/`

---

## LANGKAH 1 — Preprocessing Dataset

**File:** `scripts/preprocess_datasets.py`

Untuk setiap model, gabungkan dataset yang relevan, normalisasi fitur, dan simpan:

| Model | Dataset Utama | Fitur Kuesioner yang Dipakai |
|-------|--------------|------------------------------|
| metabolic | Metabolic Syndrome.csv | age, bmi, waist_cm, glucose, hdl, triglycerides, uric_acid |
| diabetes | diabetes_risk_dataset.csv + BRFSS | age, bmi, waist_cm, family_history, sugar_intake, exercise_freq, sleep_hours, stress_level |
| heart | heart_disease.csv | age, bmi, bp_diagnosed, cholesterol_diagnosed, smoking, alcohol, exercise, stress, sleep |
| hypertension | hypertension_dataset.csv | age, bmi, salt_intake, stress_score, sleep_duration, family_history, exercise_level, smoking |
| stroke | healthcare-dataset-stroke-data.csv | age, hypertension_diagnosed, heart_disease, ever_married, work_type, bmi, smoking_status |
| sleep | Sleep_health_and_lifestyle_dataset.csv | age, sleep_duration, quality_of_sleep, stress_level, bmi_category, heart_rate, daily_steps |
| stress_wesad | WESAD pkl files | eda_mean, eda_std, eda_n_peaks, eda_max_amp, hr_mean, hr_std, temp_mean |

---

## LANGKAH 2 — Training 6 Model Risiko

**File:** `scripts/train_risk_models.py`

Gunakan RandomForestClassifier atau LogisticRegression dari scikit-learn.
Train-test split: 80/20, random_state=42.
Simpan model sebagai `.pkl` ke `data/ml_models/trained/`.

---

## LANGKAH 3 — Training Model WESAD (Stres)

**File:** `scripts/train_wesad.py`

Jika file pkl WESAD tersedia di `data/wesad/`:
- Load S2.pkl–S17.pkl dengan `pickle.load(f, encoding='latin1')`
- Ambil sinyal wrist: `data['signal']['wrist']['EDA']` (4Hz) dan `['BVP']` (64Hz)
- Filter label: 1 = baseline, 2 = stress (buang label 0 dan 3)
- Window 60 detik, extract 7 fitur EDA per window (mean, std, min, max, n_peaks, max_amp, mean_amp)
- Train binary classifier (baseline vs stress)
- Jika WESAD belum didownload: buat model rule-based placeholder saja

---

## LANGKAH 4 — Export ke TF.js

**File:** `scripts/export_tfjs.py`

```python
import tensorflowjs as tfjs
# Konversi setiap model sklearn → TF.js
# Gunakan: tfjs.converters.convert_sklearn_to_tfjs(model, output_dir)
# Atau: train ulang dengan Keras Sequential, lalu tfjs.converters.save_keras_model()
```

Untuk setiap model, buat `metadata.json`:

```json
{
  "modelName": "diabetes",
  "version": "1.0",
  "trainedAt": "2026-XX-XX",
  "accuracy": 0.84,
  "featureNames": ["age","bmi","waist_cm","stress_level","sleep_hours","family_history_diabetes","sugar_intake","exercise_freq"],
  "scalerMean": [...],
  "scalerStd": [...],
  "outputLabels": ["Low Risk","Prediabetes","High Risk"],
  "thresholds": { "low": 0.33, "medium": 0.66 }
}
```

---

## OUTPUT YANG DIHARAPKAN

```
data/ml_models/tfjs/
├── metabolic/      model.json  weights.bin  metadata.json
├── diabetes/       model.json  weights.bin  metadata.json
├── heart/          model.json  weights.bin  metadata.json
├── hypertension/   model.json  weights.bin  metadata.json
├── stroke/         model.json  weights.bin  metadata.json
├── sleep/          model.json  weights.bin  metadata.json
└── stress_wesad/   model.json  weights.bin  metadata.json
```

---

## SETELAH SELESAI — Update progress.md

```markdown
- [2026-XX-XX] Claude Desktop — ✅ TF.js models SIAP di data/ml_models/tfjs/
  Models: metabolic, diabetes, heart, hypertension, stroke, sleep, stress_wesad
  Akurasi: metabolic=XX%, diabetes=XX%, heart=XX%, hypertension=XX%, stroke=XX%, sleep=XX%, stress=XX%
  Claude Code: silakan copy ke www/models/ dan aktifkan di risk-engine.js
```
