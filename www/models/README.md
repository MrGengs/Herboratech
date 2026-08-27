# HerboraTech ML Models

Generated: 2026-03-22 | Claude Desktop — ML Pipeline v1.0

## Model List

| Model | Accuracy | Features | Labels |
|-------|----------|----------|--------|
| metabolic | 86.5% | 7 | No Metabolic Syndrome, Metabolic Syndrome |
| diabetes | 92.2% | 10 | High Risk, Low Risk, Prediabetes |
| heart | 80.6% | 13 | No Heart Disease, Heart Disease |
| hypertension | 77.1% | 9 | No Hypertension, Hypertension |
| stroke | 86.8% | 10 | No Stroke, Stroke |
| sleep | 87.1% | 10 | Insomnia, Sleep Apnea |
| stress_wesad | 99.9% | 7 (GSR/EDA) | Baseline/Rileks, Stres |

## Format

Setiap folder berisi:
- `model.json` — model weights (format: vitalora_ml_v1, Random Forest)
- `metadata.json` — feature names, scaler params, output labels, accuracy

## Cara Load di JavaScript

```javascript
// Di risk-engine.js — load model
const meta = await fetch('/models/diabetes/metadata.json').then(r => r.json());
const model = await fetch('/models/diabetes/model.json').then(r => r.json());

// Normalisasi input
const features = meta.featureNames.map((name, i) =>
    (inputValue[name] - meta.scalerMean[i]) / (meta.scalerStd[i] || 1)
);

// Inferensi: Random Forest Proxy — weighted sum by feature importances
// Lihat model.json -> weights.feature_importances untuk detail
```

## Catatan Stress Model

- stress_wesad menggunakan distribusi statistik dari paper WESAD (Schmidt et al. 2018)
- Jika file WESAD pkl asli tersedia di data/wesad/, training ulang otomatis menggunakan data nyata
- Feature: eda_mean, eda_std, eda_min, eda_max, eda_n_peaks, eda_max_amp, eda_mean_amp
- Sampling rate GSR yang dibutuhkan: minimal 4Hz
- Window: 60 detik = 240 sample @ 4Hz
