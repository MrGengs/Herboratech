# COORDINATION.md — Panduan Kerja 4 AI (All-Claude Team)
<!-- Update: 22 Maret 2026 v2.0 — Fase 2: Health Intelligence + ML -->
<!-- Baca file ini SEBELUM memulai pekerjaan apapun -->

---

## ⚠️ PENTING — Baca Ini Dulu

Proyek ini dikerjakan oleh **empat Claude instance secara paralel** dalam dua fase:

- **Fase 1** ✅ SELESAI — Herbal Database (OCR, seeding, UI)
- **Fase 2** 🔄 AKTIF — Health Intelligence (ML, kuesioner, sensor)

| AI | Role | Territory |
|----|------|-----------|
| **Claude Code** | Developer — UI, Firebase, TF.js inference | `www/` |
| **Claude Desktop** | Data/ML Engineer — dataset, training, model export | `data/`, `scripts/`, `models_src/` |
| **Claude CLI #1** | Riset Tanaman + Formula A | `data/claude1/` |
| **Claude CLI #2** | Formula B + Enrichment | `data/claude2/` |

---

## 🗂️ PEMBAGIAN TERRITORY (v2.0)

### 🟡 Claude Desktop — BOLEH menyentuh:
```
data/
├── ocr/                        ✅ SELESAI
├── tcm_mkg/                    ✅ SELESAI
├── kaggle/                     ← dataset CSV (READ ONLY)
├── ml_models/                  ← OUTPUT training (BARU)
│   ├── preprocessed/           ← CSV hasil preprocessing
│   ├── trained/                ← file .pkl model scikit-learn
│   └── tfjs/                   ← model TF.js siap pakai
│       ├── metabolic/          ← model.json + weights.bin
│       ├── diabetes/
│       ├── heart/
│       ├── hypertension/
│       ├── stroke/
│       ├── sleep/
│       └── stress_wesad/       ← model WESAD
├── wesad/                      ← file pkl WESAD (jika didownload)
└── progress.md                 ← update log saja

scripts/
├── (file lama OCR)             ✅ SELESAI
├── preprocess_datasets.py      ← BARU
├── train_risk_models.py        ← BARU
├── train_wesad.py              ← BARU
└── export_tfjs.py              ← BARU
```

### 🔵 Claude Code — BOLEH menyentuh:
```
www/
├── shared/
│   ├── firebase.js             ← tambah metode health profile
│   ├── risk-engine.js          ← BARU: rule-based + TF.js scoring
│   └── sensor-ble.js           ← BARU: Web Bluetooth handler
├── patient/
│   ├── health-profile.html     ← BARU: form kuesioner 5 bagian
│   ├── health-dashboard.html   ← BARU: dashboard risiko komprehensif
│   ├── sensor-monitor.html     ← BARU: monitoring sensor realtime
│   ├── disease-risk.html       ← UPDATE: integrasikan risk-engine.js
│   └── lifestyle.html          ← UPDATE: link ke health-profile
├── doctor/
│   └── patient-detail.html     ← UPDATE: tampilkan risk scores
├── admin/
│   └── ml-models.html          ← BARU: halaman upload/manage model
└── models/                     ← BARU: folder TF.js models (diisi Claude Desktop)
    ├── metabolic/
    ├── diabetes/
    ├── heart/
    ├── hypertension/
    ├── stroke/
    ├── sleep/
    └── stress_wesad/

firestore.indexes.json          ← tambah index userHealthProfile
```

### 🟢 Claude CLI #1 — BOLEH menyentuh:
```
data/claude1/                   ← FOLDER EKSKLUSIF
progress.md                     ← update log saja
```

### 🔴 Claude CLI #2 — BOLEH menyentuh:
```
data/claude2/                   ← FOLDER EKSKLUSIF
progress.md                     ← update log saja
```

### 🚫 JANGAN disentuh siapapun tanpa koordinasi:
```
www/shared/neumorphic.css       ← design system FINAL
www/shared/app.js               ← utilities FINAL
www/shared/webrtc-manager.js    ← stabil
www/shared/chat-manager.js      ← stabil
www/firestore.rules             ← dev rules
```

---

## 📦 PROTOKOL HANDOFF DATA (v2.0)

### [A] Claude Desktop → Claude Code: TF.js Models

Setelah training selesai, Claude Desktop menaruh model di:
```
data/ml_models/tfjs/{nama_model}/
  ├── model.json          ← arsitektur + metadata
  ├── weights.bin         ← bobot model
  └── metadata.json       ← feature_names, scaler_params, thresholds
```

Claude Code kemudian menyalin ke `www/models/{nama_model}/` saat deploy.

**Format metadata.json (wajib):**
```json
{
  "modelName": "diabetes",
  "version": "1.0",
  "trainedAt": "2026-03-22",
  "accuracy": 0.84,
  "featureNames": ["age","bmi","waist_cm","stress_level","sleep_hours",
                   "family_history_diabetes","sugar_intake","exercise_freq"],
  "featureOrder": [0,1,2,3,4,5,6,7],
  "scalerMean": [45.2, 27.1, 88.3, 5.2, 7.1, 0.3, 1.4, 2.1],
  "scalerStd":  [12.1,  4.8, 11.2, 2.1, 1.3, 0.4, 0.8, 1.1],
  "outputLabels": ["Low Risk","Prediabetes","High Risk"],
  "thresholds": { "low": 0.33, "medium": 0.66 }
}
```

### [B] Claude Desktop → Claude Code: WESAD Stress Model

File output:
```
data/ml_models/tfjs/stress_wesad/
  ├── model.json
  ├── weights.bin
  └── metadata.json       ← sertakan: feature_names GSR, sampling_rate, window_sec
```

### [C] Handoff Herbal (Fase 1 — sudah berjalan)
Tidak berubah. File `data/ocr/raw_formulas.json` sudah tersedia.

---

## 📋 STATUS PEKERJAAN

### ✅ SELESAI (Fase 1)
- [Claude Desktop] OCR 941 resep → `data/ocr/raw_formulas.json`
- [Claude Desktop] TCM-MKG enrichment → `data/tcm_mkg/herboratech_enriched.json`
- [Claude Code] firebase.js + 5 metode VDB baru
- [Claude Code] admin/import-herbal.html + OCR cleaning engine
- [Claude Code] patient/herbal.html + herbal-formula.html + disease-risk.html
- [Claude Code] scripts/merge_herbals.js
- [Claude Code] firestore.indexes.json + firebase deploy

### 🔄 AKTIF (Fase 2 — Health Intelligence)

**Claude Desktop sedang mengerjakan:**
- [ ] `scripts/preprocess_datasets.py` — normalisasi 10 dataset CSV
- [ ] `scripts/train_risk_models.py` — training 6 model (RF/LR)
- [ ] `scripts/train_wesad.py` — training stress detection dari WESAD
- [ ] `scripts/export_tfjs.py` — konversi semua model ke TF.js
- [ ] Output ke `data/ml_models/tfjs/` (7 folder model)

**Claude Code sedang mengerjakan:**
- Lihat file **CLAUDE_CODE_ML_TASKS.md** untuk detail lengkap

---

## 🤝 CARA BERKOMUNIKASI

Gunakan `data/progress.md` sebagai papan tulis bersama.
Format: `- [YYYY-MM-DD HH:MM] AI — deskripsi`

**Signal "model siap":**
Claude Desktop menulis di progress.md:
```
- [2026-03-XX] Claude Desktop — ✅ TF.js models SIAP di data/ml_models/tfjs/
  Models: metabolic, diabetes, heart, hypertension, stroke, sleep, stress_wesad
  Claude Code: silakan copy ke www/models/ dan aktifkan di risk-engine.js
```

---

## ⚡ QUICK REFERENCE

**Claude Desktop** — jika ragu: "Apakah file ini di dalam `www/`?" → YA = jangan sentuh.

**Claude Code** — jika ragu: "Apakah file ini di dalam `data/` atau `scripts/`?" → YA = jangan sentuh.
Pengecualian: `www/models/` boleh diisi dari hasil copy `data/ml_models/tfjs/`.

---

*File ini adalah panduan koordinasi. Jangan hapus. Update STATUS PEKERJAAN secara berkala.*
