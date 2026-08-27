# Progress Log — Herbal Database Pipeline
<!-- Update setiap sesi kerja. Format: - [YYYY-MM-DD HH:MM] Nama AI — deskripsi -->

---

## 📊 Dashboard Status

| AI | Role | Territory | Status |
|----|------|-----------|--------|
| 🔵 Claude Code | UI & Integrasi | `www/` | ✅ Aktif |
| 🟡 Claude Desktop | OCR Buku Jamu | `data/ocr/` | ✅ Selesai |
| 🟢 Claude CLI #1 | Tanaman + Formula A | `data/claude1/` | ✅ Selesai |
| 🔴 Claude CLI #2 | Formula B + Enrichment | `data/claude2/` | ✅ Selesai |
| 🟣 Claude Cowork | Batch 13 — OCR Vademekum + Data Pipeline | `data/vademekum/`, `data/final/` | ✅ Selesai |

---

## 📁 File Status

| File | Status | Dibuat oleh |
|------|--------|-------------|
| data/ocr/raw_formulas.json | ✅ Ada — 941 resep, 113 kondisi | Claude Desktop (Tugas A) ✅ |
| data/tcm_mkg/herboratech_enriched.json | ✅ Ada — 32 tanaman Indonesia | Claude Desktop (Tugas B) ✅ |
| data/claude1/herbals_profiles.json | ✅ Ada — 50 tanaman + references[] | Claude CLI #1 ✅ |
| data/claude1/formulas_A.json | ✅ Ada — 42 formula + sourceRef | Claude CLI #1 ✅ |
| data/claude2/formulas_B.json | ✅ Ada — 68 formula + sourceRef | Claude CLI #2 ✅ |
| data/claude2/enriched_ocr.json | ✅ Ada — 941 resep + sourceRef | Claude CLI #2 ✅ |
| data/vademekum/ocr_raw.json | ✅ Ada — 212 halaman (205 berisi teks) | Claude Cowork Batch 13 ✅ |
| data/vademekum/herbals_vademekum.json | ✅ Ada — 25 tanaman Evidence Level A | Claude Cowork Batch 13 ✅ |
| data/final/herbals_merged.json | ✅ Ada — 60 tanaman (CLI#1 + Vademekum) | Claude Cowork ✅ |
| data/final/formulas_merged.json | ✅ Ada — 1051 formula (A+B+OCR) | Claude Cowork ✅ |
| Firestore: herbals collection | ✅ Seeded — 60 tanaman | SEED_FIRESTORE.bat ✅ |
| Firestore: herbalFormulas collection | ✅ Seeded — 1051 formula | SEED_FIRESTORE.bat ✅ |

---

## 🔄 Dependency & Unlock

```
Semua bisa mulai SEKARANG (paralel):
  Claude Desktop  → OCR buku
  Claude CLI #1   → herbals_profiles.json + formulas_A.json
  Claude CLI #2   → formulas_B.json
  Claude Code     → UI implementation

Unlock Task #2 Claude CLI #2:
  data/ocr/raw_formulas.json tersedia
        └──→ Claude CLI #2 mulai enriched_ocr.json

Unlock Fase Merge (Claude Code):
  data/claude1/DONE.flag    ✅ ada
  data/claude2/DONE.flag    ✅ ada
  data/ocr/raw_formulas.json ✅ ada
        └──→ Claude Code merge + seed Firestore
```

---

## 🟡 Claude Desktop — OCR + TCM Log
<!-- Claude Desktop: tambah entry di sini setiap sesi -->
- [2026-03-22] Setup: folder data/ocr/ siap — instruksi ada di COORDINATION.md
- [2026-03-22] Setup: folder data/tcm_mkg/ siap — instruksi Tugas B ada di RESOURCE_STRATEGY.md
- [2026-03-22 13:26] ✅ **OCR SELESAI** — Tesseract 4.1.1 (English engine), split-column
  - 312 halaman PDF → 624 kolom gambar terpisah → OCR → parsed
  - **941 resep valid** diekstrak dari 983 blok "Bahan" yang ditemukan
  - **183 kondisi/penyakit** unik dicakup (sesuai daftar isi buku)
  - **Catatan jumlah:** "1001" adalah kiasan marketing — jumlah aktual ~941 resep
  - File tersimpan: `data/ocr/raw_formulas.json` (860 KB) + `data/herbal-formulas-raw.json`
  - DONE flag dibuat: `data/ocr/DONE.flag`
  - Scripts disimpan: `scripts/parse_recipes.py`, `scripts/ocr_split_cols.py`, `scripts/requirements.txt`
  - **QC yang masih perlu:** ~10% herb names ada OCR noise, perlu normalisasi nama tanaman
- [2026-03-22] ✅ **TUGAS B SELESAI** — TCM-MKG filtering + enrichment
  - 9 file tidak relevan dihapus dari data/tcm_mkg/raw/ (277 MB → 11 MB)
  - Filter D6 (Chinese herbal pieces) + D7 (medicinal properties) + D8 (CHP→NP)
  - **32 tanaman Indonesia** berhasil di-match dari 6207 entri TCM-MKG
  - Data yang diekstrak: flavor, nature/temperature, meridian affinity, therapeutic actions
  - File tersimpan: `data/tcm_mkg/herboratech_enriched.json`
  - Script: `/sessions/build_enriched.py`
- [2026-03-22] ✅ **FASE 2 PLANNING SELESAI** — Health Intelligence setup
  - 10 dataset Kaggle dianalisis (280.550 baris gabungan)
  - WESAD dataset dipelajari — pipeline GSR → stress score dirancang
  - `COORDINATION.md` diperbarui ke v2.0 (tambah territory ML)
  - `CLAUDE_CODE_ML_TASKS.md` dibuat — perintah batch 1–5 untuk Claude Code
  - `CLAUDE_DESKTOP_ML_TASKS.md` dibuat — pipeline training 7 model
  - `herboratech_ml_guide.docx` dibuat — panduan teknis lengkap
  - `claude_code_plan.docx` dibuat — rencana kerja detail Claude Code
  - **Claude Code: silakan mulai Batch 1 (lihat CLAUDE_CODE_ML_TASKS.md)**
  - **Claude Desktop: tunggu instruksi Andre untuk mulai training ML**
- [2026-03-22] ✅ **ML TRAINING SELESAI** — 7 model terlatih dan siap pakai
  - scikit-learn 1.7.2 | RandomForestClassifier
  - metabolic:    acc=86.5% | 7 features  | dataset=2.401 baris
  - diabetes:     acc=92.2% | 10 features | dataset=6.000 baris
  - heart:        acc=80.6% | 13 features | dataset=10.000 baris
  - hypertension: acc=77.1% | 9 features  | dataset=1.985 baris
  - stroke:       acc=86.8% | 10 features | dataset=5.110 baris (class_weight=balanced)
  - sleep:        acc=87.1% | 10 features | dataset=374 baris
  - stress_wesad: synthetic WESAD distributions | 7 GSR features
  - Script: scripts/preprocess_train_export.py
  - Model JSON: data/ml_models/tfjs/ + **sudah dicopy ke www/models/**
  - **→ Claude Code: TIDAK perlu copy manual — mulai langsung Batch 2 (risk-engine.js)**

---

## 🟢 Claude CLI #1 — Research Log
<!-- Claude CLI #1: tambah entry di sini setiap selesai bagian -->
- [2026-03-22] Setup: folder data/claude1/ siap — instruksi ada di CLAUDE_1_TASK.md
- [2026-03-22] ✅ **Task #1 SELESAI** — herbals_profiles.json (50 tanaman herbal Indonesia)
  - 25 tanaman kelompok Metabolisme+Kardiovaskular+Urologi
  - 25 tanaman kelompok Multi/Umum (pencernaan, antiinflamasi, dll)
  - Setiap tanaman: nama latin, benefits+mechanism, activeCompounds, dosage, kontraindikasi, drug interactions, BPOM status
  - Sumber: WHO Monographs Vol.1-4, BPOM RI, Farmakope Herbal Indonesia Ed.II, PubMed
- [2026-03-22] ✅ **Task #2 SELESAI** — formulas_A.json (42 formula evidence-based)
  - Asam Urat: 8, Diabetes: 8, Kolesterol: 6, Hipertensi: 7, Batu Ginjal: 5, ISK: 4, Obesitas: 4
  - Basis: FOHAI Kemenkes RI + Saintifikasi Jamu + Farmakope Herbal Indonesia
- [2026-03-22] DONE.flag dibuat ✅

---

## 🔴 Claude CLI #2 — Research Log
<!-- Claude CLI #2: tambah entry di sini setiap selesai bagian -->
- [2026-03-22] Setup: folder data/claude2/ siap — instruksi ada di CLAUDE_2_TASK.md
- [2026-03-22] ✅ **Task #1 SELESAI** — formulas_B.json (68 formula evidence-based)
  - Pencernaan: 15, Imunitas: 15, Anti-Inflamasi: 12, Dermatologi: 10, Relaksasi: 8, Hematologi: 8
  - 18 formula topikal (isTopical: true)
  - Basis: FOHAI Kemenkes RI, WHO Monographs, Saintifikasi Jamu
- [2026-03-22] ✅ **Task #2 SELESAI** — enriched_ocr.json (941 resep OCR diperkaya)
  - 941 resep dari buku "1001 Resep Herbal" dipertahankan apa adanya
  - Tambah field: latinNames (150+ herbs mapped), tags, isTopical, duration, evidenceLevel:"C"
  - 721 formula topikal, 220 formula oral teridentifikasi
- [2026-03-22] DONE.flag dibuat ✅

---

## 🔵 Claude Code — Implementation Log
- [2026-03-22] Master plan dibuat: AI_WORKFLOW.md (versi Claude all-Claude)
- [2026-03-22] Instruksi dibuat: CLAUDE_1_TASK.md + CLAUDE_2_TASK.md
- [2026-03-22] Folder struktur dibuat: data/ocr/, claude1/, claude2/, final/
- [2026-03-22] RESOURCE_STRATEGY.md dibuat: strategi TCM-MKG + GraphAI
- [2026-03-22] AI_WORKFLOW.md diperbarui: tambah Tugas B Claude Desktop (TCM-MKG)
- [2026-03-22] Folder data/tcm_mkg/ + subfolders dibuat
- [2026-03-22] ✅ shared/firebase.js — tambah 5 method baru: getHerbalFormulasByCondition, getHerbalFormulasPage, getHerbalsByCategory, batchSeedHerbals, batchSeedFormulas
- [2026-03-22] ✅ admin/seed-data.html — tambah 20 resep manual schema baru (Asam Urat×4, Batuk×4, Maag×3, DM×3, Hipertensi×3, Kolesterol×3)
- [2026-03-22] ✅ admin/import-herbal.html — dibuat: halaman import JSON batch ke Firestore (490 docs/batch)
- [2026-03-22] ✅ patient/herbal-formula.html — support schema baru + lama: evidenceLevel badge, isTopical, preparationType, warnings, disclaimer medis
- [2026-03-22] ✅ patient/herbal.html — tab Formula wired up + pagination 20/halaman + filter isTopical + filter kategori + disclaimer
- [2026-03-22] ✅ patient/disease-risk.html — tambah seksi Rekomendasi Herbal (load dari Firestore by condition)
- [2026-03-22] ✅ firestore.indexes.json — tambah index: indications array-contains, isTopical, categories array-contains
- [2026-03-22] ✅ firebase deploy — hosting + indexes deployed ke herboratech.web.app
- [2026-03-22] ✅ admin/import-herbal.html — tambah OCR cleaning engine: cleanText (7-step), cleanWarnings (keyword filter), mapPrepType, cleanOCRFormula + auto-detect + cleaning stats
- [2026-03-22] ✅ shared/firebase.js — tambah VDB.searchHerbalFormulas(query, limitN) — client-side search by name/condition/ingredients
- [2026-03-22] ✅ Fix OCR cleaning edge cases: (1) noise setelah ½ gelas "oA x, 2 =~ ap", (2) backslash bleed "\"3\ Iscam..." — tambah step 4b operator-strip regex
- [2026-03-22] ✅ scripts/merge_herbals.js — dibuat: merge herbals_profiles.json + herboratech_enriched.json → data/final/herbals_merged.json (siap dijalankan setelah Claude CLI #1 selesai)
- [2026-03-22] ✅ **Batch 1 — Health Intelligence Foundation**
  - admin/import-herbal.html: tambah cleanTCMHerb() + auto-detect TCM schema (herboratech_enriched.json → herbals collection)
  - shared/firebase.js: tambah 8 VDB methods: saveHealthProfile, getHealthProfile, updateHealthSection, saveLabResults, saveRiskScore, getLatestRiskScore, getRiskScoreHistory, _calcCompleteness
  - firestore.indexes.json: tambah riskScores collectionGroup index (calculatedAt DESC)
  - patient/home.html: tambah quick action "Profil Kesehatan" → health-profile.html
- [2026-03-22] ✅ **Batch 2 — Risk Engine + Disease Risk**
  - shared/risk-engine.js: dibuat — 6 scoring models (IDF/Metabolik, FINDRISC/Diabetes, Framingham/Jantung, JNC-8/Hipertensi, ASCVD/Stroke, PSQI/Tidur), output {score 0-100, category, factors[]}
  - patient/disease-risk.html: ditulis ulang — load health profile → RiskEngine.calculateAll() → saveRiskScore, 6 gauge bars dinamis + factor chips + herbal recs dari getTopConditions
- [2026-03-22] ✅ **Batch 3 — Dashboard + Doctor View + Admin ML**
  - patient/health-profile.html: dibuat — wizard 5 langkah (basic, lifestyle, riwayat keluarga, kondisi, lab) + BMI real-time + saves via updateHealthSection
  - patient/health-dashboard.html: dibuat — hero card, 6 mini risk cards, active factors, herbal recs, quick actions
  - doctor/patient-detail.html: Risk Score tab diperbarui — dynamic load VDB.getLatestRiskScore(patientId), renderRiskScores() semua 6 penyakit, gauge warna dinamis, no-data state
  - admin/ml-models.html: dibuat — monitoring 6 model aktif, distribusi risiko (collectionGroup query), pengguna risiko tinggi, roadmap v1/v2/v3
- [2026-03-22] ✅ **Batch 5 — ML Model Integration (risk-engine.js upgrade)**
  - shared/risk-engine.js: loadModels() sekarang nyata — fetch /models/*/model.json + metadata.json (vitalora_ml_v1 format)
  - Tambah _extractFeatures(): map health profile → feature vector per model (6 model, per-model mapping)
  - Tambah _mlInfer(): weighted-directional z-score + sigmoid → skor 0–100 per model
  - calculateAll() diperbarui: blend 60% ML + 40% rule-based saat _modelsLoaded=true, fallback pure rule-based
  - calculatedWith field: 'ml-hybrid-v2.0' atau 'rule-based-v1.0'
  - admin/ml-models.html: tambah loadMLModelStatus() — fetch metadata.json setiap model, update badge akurasi live
  - Roadmap v2.0 ditandai AKTIF di admin page
- [2026-03-22 AKHIR] ✅ **TOHA TASKS — FINAL COMPLETION + BUG FIXES**
  - admin/import-herbal.html: **DIPERBAIKI** — Error handling lengkap di semua fungsi (parseJSON, startImport, clearAll, switchTab, selectCollection, readFile, dll)
  - Defensive programming: cek element ada + Firebase ready check sebelum operasi
  - Initialization verification: Firebase readiness monitor (5s timeout) + function availability check
  - Logging detail: console.error untuk debugging, UI log untuk user feedback
  - Button handlers (Parse, Import, Clear, etc) sekarang fully functional dengan try-catch protection
  - **DEPLOY**: firebase deploy --only hosting:herboratech + firestore:indexes ✅
  - **Live URL**: https://herboratech.web.app
- [2026-03-23] ✅ **BATCH 4 — Admin Formula CRUD**
  - admin/formulas.html: dibuat — complete admin interface untuk manajemen formula herbal (1051 formulas dari merged dataset)
  - Features: search by name/indications, filter by evidence level (A/B/C) + preparation type (rebus/seduh/minum/salep), 15 items/page with pagination
  - Edit modal: name, indications, category, prep type, prep method, ingredients list, dosage, frequency, duration, warnings, evidence level, doctor verified, source
  - Delete modal: confirmation dialog sebelum delete
  - Real-time Firestore integration: create, update, delete dengan serverTimestamp
  - scripts/seed_formulas.js: Firebase Admin SDK utility untuk seed 1051 formulas ke Firestore (batch size 500)
  - admin/home.html: sidebar updated dengan navigation links ke herbals.html + formulas.html
  - Formulas schema: recipeNumber, name, indications[], category, ingredients[], preparationMethod, preparationType, dosage, frequency, duration, warnings[], evidenceLevel, doctorVerified, source, tags[], sourceType
- [2026-03-23] ✅ **BATCH 5 — Admin Consultations**
  - admin/consultations.html: dibuat — complete admin interface untuk manajemen semua konsultasi dalam sistem
  - Dashboard stats: Total konsultasi, Aktif, Selesai hari ini, Rata-rata durasi
  - Features: search by patient/doctor name, filter by status (pending/active/completed/cancelled) + type (chat/video/integratif)
  - Table: 15 items/page with pagination, shows patient, doctor, type, status (color-coded badge), start time, duration
  - Detail modal: full consultation details (patient, doctor, type, status, timestamps, duration, rating, notes)
  - Actions: Cancel consultation (for pending/active only) dengan confirmation dialog
  - Export CSV: generate laporan konsultasi dengan filter applied
  - Real-time Firestore queries: orderBy startTime DESC, with where clauses untuk filtering
  - admin/home.html: sidebar updated dengan navigation link ke consultations.html
- [2026-03-23] ✅ **BATCH 6 — Admin Reports/Export**
  - admin/reports.html: dibuat — comprehensive reporting dashboard dengan 6 report types
  - Report types: Users (total, role distribution), Doctors (specialties, ratings), Consultations (status breakdown, avg duration), Herbals (evidence levels, categories), Formulas (indications, evidence), Health Profiles (completion rate, risk scores)
  - Each report features: statistics dashboard with key metrics, data table preview (20-50 rows), export button
  - Export modal: 3 format options (CSV, JSON, XLSX) dengan descriptions
  - Statistics cards: grid-based display dengan color-coded numbers
  - Real-time data loading: semua reports menggunakan Firestore queries
  - admin/home.html: sidebar updated dengan navigation link ke reports.html
- [2026-03-23] ✅ **BATCH 7 — Admin Settings**
  - admin/settings.html: dibuat — comprehensive admin configuration dashboard
  - Settings sections (3 cards × 4 sections):
    * Platform: maintenance mode, registration/consultation toggle, consultation fees, commission %
    * Notifications: email config, email/push/SMS alerts, SMS gateway integration
    * Security: 2FA enforcement, session timeout, login attempts limit, GDPR mode, data retention
    * Maintenance: backup schedule, cache clearing, database optimization, reset data (danger zone)
  - UI components: toggle switches, text/number/select inputs, buttons with actions
  - State management: localStorage persistence dengan `adminSettings` key
  - Confirmation modals untuk aksi-aksi destructive (reset data, database optimization)
  - Notification system dengan success/error/warning states dan auto-hide
  - admin/home.html: sidebar updated dengan navigation link ke settings.html
- [2026-03-24] ✅ **BATCH 13 — OCR Vademekum Tanaman Obat (SELESAI)**
  - **Engine:** Claude Vision (multimodal) — bukan Tesseract/Qwen-VL/pihak ketiga
  - **Input:** 212 halaman JPG dari "Vademekum Tanaman Obat untuk Saintifikasi Jamu Jilid 1" (Kemenkes RI 2012)
  - **OCR:** 7 agent Claude Vision paralel → 205 halaman berisi teks, 7 halaman kosong
  - **Output OCR:** `data/vademekum/ocr_raw.json` (299 KB, 212 entries)
  - **Tanaman terdeteksi:** 25 tanaman Evidence Level A (Kemenkes-validated):
    Lengkuas, Pule, Sambiloto, Seledri, Sembung, Pegagan, Kunyit, Temulawak, Adas,
    Daun Ungu, Jati Belanda, Sambungyawa, Kencur, Menta, Kemuning, Kumis Kucing,
    Meniran, Purwoceng, Sirih, Cabe Jawa, Daun Sendok, Tempuyung, Jombang, Brotowali, Jahe
  - **Output parse:** `data/vademekum/herbals_vademekum.json` (25 tanaman, schema Firestore lengkap)
  - **Fields per tanaman:** name, latinName, family, categories, activeCompounds, benefits,
    mechanism, indications, contraindications, sideEffects, drugInteractions, warnings,
    storage, exampleFormulas, partUsed, evidenceLevel:A, sourceType:kemenkes, references[]
  - **Script parser:** `scripts/smart_parser.py` (dibuat baru, lebih akurat dari parse_vademekum.py bawaan)
- [2026-03-24] ✅ **DATA PIPELINE — References + Merge + Seed Firestore**
  - **Step 1:** Tambah `references[]` ke semua 50 herbals CLI#1 (WHO + BPOM + PubMed)
  - **Step 2:** Tambah `references[]` ke 25 herbals Vademekum (Kemenkes RI 2012)
  - **Step 3:** Tambah `sourceRef` ke 42 formulas_A (FOHAI + Saintifikasi Jamu)
  - **Step 4:** Tambah `sourceRef` ke 68 formulas_B (FOHAI + WHO Monographs)
  - **Step 5:** Tambah `sourceRef` ke 941 enriched_ocr (1001 Resep Herbal - Dalimartha)
  - **Step 6:** Merge herbals → `data/final/herbals_merged.json` (60 tanaman: 15 di-enrich ke Ev.A, 10 baru)
  - **Step 7:** Merge formulas → `data/final/formulas_merged.json` (1051 formula)
  - **Seed:** SEED_FIRESTORE.bat → 60 herbals + 1051 formulas → Firestore ✅
  - **Script pipeline:** `add_references.py`
  - **Distribusi evidence:** 30×A (Kemenkes), 22×B (WHO/riset), 8×C (empiris)
- [2026-03-24] ✅ **UI UPDATE — Tampilan Sumber & Referensi**
  - `patient/herbal-detail.html`: seksi "Sumber & Referensi" diperbarui — support schema baru (title/publisher/year/isbn/url) + schema lama PubMed (author/journal/pmid), badge warna per sourceType
  - `patient/herbal-formula.html`: blok sumber diperkaya — badge tipe, nama sumber utama, daftar referensi lengkap, info collectedBy, catatan OCR
  - `scripts/seed_formulas.js`: fix bug statistik post-seeding (TypeError metadata.categories)
  - `SEED_FIRESTORE.bat`: dibuat — one-click seed herbals + formulas dari CMD
  - `DEPLOY.bat`: dibuat — one-click deploy hosting ke herboratech.web.app
