# AI_WORKFLOW.md — Master Plan: 4 Claude Parallel Workflow
<!-- Update: 22 Maret 2026 — BACA INI SEBELUM MEMULAI KERJA -->

---

## 🏗️ Arsitektur Tim AI

```
┌──────────────────────────────────────────────────────────────────────┐
│                      HERBORATECH AI TASK FORCE                          │
├──────────────────┬──────────────────┬────────────────┬───────────────┤
│   Claude Code    │  Claude Desktop  │  Claude CLI #1 │ Claude CLI #2 │
│   (this session) │                  │  "Tanaman"     │ "Formula"     │
├──────────────────┼──────────────────┼────────────────┼───────────────┤
│  UI & Integrasi  │  OCR Buku        │ Profil Tanaman │ Formula Riset │
│  Firebase        │  1001 Resep      │ + Formula A    │ Kat. B +      │
│  Deployment      │  Jamu            │                │ Enrich OCR    │
├──────────────────┼──────────────────┼────────────────┼───────────────┤
│  www/ folder     │  data/ocr/       │  data/claude1/ │ data/claude2/ │
└──────────────────┴──────────────────┴────────────────┴───────────────┘
```

---

## 📂 Struktur Folder & Territory

```
herboratech/
│
├── www/                           ← 🔵 CLAUDE CODE — jangan disentuh AI lain
│   ├── shared/firebase.js
│   ├── admin/seed-data.html
│   ├── admin/import-herbal.html   (baru, dibuat Claude Code)
│   ├── patient/herbal.html
│   ├── patient/herbal-formula.html
│   ├── patient/disease-risk.html
│   └── doctor/prescription.html
│
├── data/
│   ├── ocr/                       ← 🟡 CLAUDE DESKTOP — jangan disentuh AI lain
│   │   ├── raw_formulas.json      OUTPUT utama Claude Desktop
│   │   ├── batch_001.json         (opsional: per 100 resep)
│   │   └── batch_002.json
│   │
│   ├── claude1/                   ← 🟢 CLAUDE CLI #1 — jangan disentuh AI lain
│   │   ├── herbals_profiles.json  OUTPUT: profil 50 tanaman
│   │   ├── formulas_A.json        OUTPUT: ~45 formula kategori A
│   │   └── DONE.flag              buat ini saat semua task selesai
│   │
│   ├── claude2/                   ← 🔴 CLAUDE CLI #2 — jangan disentuh AI lain
│   │   ├── formulas_B.json        OUTPUT: ~68 formula kategori B
│   │   ├── enriched_ocr.json      OUTPUT: OCR diperkaya (setelah ocr/ tersedia)
│   │   └── DONE.flag              buat ini saat semua task selesai
│   │
│   ├── tcm_mkg/                   ← 🟡 CLAUDE DESKTOP — ekstraksi TCM-MKG (Tugas B)
│   │   ├── raw/                   TSV original dari Zenodo (D2,D5,D6,D8,D9)
│   │   ├── graphai/               Clone GitHub ZENGJingqi/GraphAI-for-TCM
│   │   ├── filtered/              Tanaman Indonesia saja
│   │   └── herboratech_enriched.json OUTPUT: schema HerboraTech siap pakai
│   │
│   ├── final/                     ← 🔵 CLAUDE CODE — hasil merge akhir
│   │   ├── herbals_merged.json
│   │   └── formulas_merged.json
│   │
│   └── progress.md                ← SEMUA AI update di sini
│
├── scripts/                       ← 🟡 CLAUDE DESKTOP — Python OCR
│   ├── ocr_pipeline.py
│   └── parse_recipes.py
│
├── AI_WORKFLOW.md                 ← READ ONLY semua AI
├── COORDINATION.md                ← READ ONLY semua AI
├── CLAUDE_1_TASK.md               ← Instruksi untuk Claude CLI #1
└── CLAUDE_2_TASK.md               ← Instruksi untuk Claude CLI #2
```

---

## 🎯 Pembagian Tugas Detail

### 🔵 Claude Code — "Developer"
| Task | Keterangan | Bisa mulai? |
|------|-----------|-------------|
| Implementasi UI herbal pages | Upgrade herbal.html, herbal-formula.html | ✅ Sekarang |
| admin/import-herbal.html | Batch upload JSON → Firestore | ✅ Sekarang |
| VDB methods baru | Pagination, byCondition, byCategory | ✅ Sekarang |
| disease-risk + prescription | Link ke rekomendasi herbal | ✅ Sekarang |
| Merge semua JSON | Gabung output semua AI | ⏳ Setelah AI lain selesai |
| Final seeding | Import ke Firestore production | ⏳ Setelah merge |

---

### 🟡 Claude Desktop — "OCR Specialist + TCM Extractor"
| Task | Keterangan | Bisa mulai? |
|------|-----------|-------------|
| **Tugas A:** OCR 312 halaman PDF | Tesseract / AI OCR | ✅ Sekarang |
| **Tugas A:** Parse struktur resep | Nomor, Bahan, Cara, Aturan, Catatan | ✅ Sekarang |
| **Tugas A:** Output raw_formulas.json | Format sesuai schema | ✅ Sekarang |
| **Tugas B:** Download TSV dari Zenodo | D2,D5,D6,D8,D9 → data/tcm_mkg/raw/ | ✅ Sekarang (paralel) |
| **Tugas B:** Clone GraphAI-for-TCM | github.com/ZENGJingqi/GraphAI-for-TCM | ✅ Sekarang |
| **Tugas B:** Filter tanaman Indonesia | filter_indonesian_herbs.py | ✅ Sekarang |
| **Tugas B:** Konversi ke HerboraTech schema | Output: herboratech_enriched.json | ✅ Sekarang |
| **Tugas B:** Jalankan GraphAI scoring | formula_scores.json | ✅ Sekarang |

**⚠️ Claude Desktop menyentuh `data/ocr/`, `data/tcm_mkg/`, dan `scripts/`**
**📋 Instruksi lengkap Tugas B: baca `RESOURCE_STRATEGY.md`**

---

### 🟢 Claude CLI #1 — "Tanaman + Formula A"
| Task | Keterangan | Bisa mulai? |
|------|-----------|-------------|
| Profil 50 tanaman | Nama latin, senyawa, dosis, interaksi, BPOM | ✅ Sekarang |
| Formula Metabolisme | Asam Urat, Diabetes, Kolesterol, Obesitas | ✅ Sekarang |
| Formula Kardiovaskular | Hipertensi, Jantung | ✅ Sekarang |
| Formula Urologi | Batu Ginjal, ISK, Gagal Ginjal | ✅ Sekarang |

**⚠️ Claude CLI #1 HANYA menyentuh `data/claude1/`**
**📋 Instruksi lengkap: baca `CLAUDE_1_TASK.md`**

---

### 🔴 Claude CLI #2 — "Formula B + Enrichment"
| Task | Keterangan | Bisa mulai? |
|------|-----------|-------------|
| Formula Pencernaan | Maag, Sembelit, Disentri | ✅ Sekarang |
| Formula Imunitas | Batuk, TBC, Demam, Imunbooster | ✅ Sekarang |
| Formula Anti-inflamasi | Radang Sendi, Eksim, Psoriasis | ✅ Sekarang |
| Formula Dermatologi | Kudis, Kurap, Koreng, Bau Badan | ✅ Sekarang |
| Formula Relaksasi | Insomnia, Stres, Badan Lelah | ✅ Sekarang |
| Formula Hematologi | Anemia, Perdarahan | ✅ Sekarang |
| Enrichment OCR | Tambah latinName, tags, isTopical ke output Claude Desktop | ⏳ Setelah `data/ocr/raw_formulas.json` ada |

**⚠️ Claude CLI #2 HANYA menyentuh `data/claude2/`**
**📋 Instruksi lengkap: baca `CLAUDE_2_TASK.md`**

---

## 📊 Pembagian Kategori Penyakit

```
Dari buku 1001 Resep + Riset Ilmiah:

🟢 Claude CLI #1 (~290 resep/formula)         🔴 Claude CLI #2 (~710 resep/formula)
┌─────────────────────────────────┐           ┌──────────────────────────────────────┐
│ METABOLISME                     │           │ PENCERNAAN                           │
│   Asam Urat .............. ~150 │           │   Maag/Gastritis .............. ~80  │
│   Diabetes ............... ~80  │           │   Sembelit ................... ~40  │
│   Kolesterol ............. ~50  │           │   Disentri/BAB Berdarah ...... ~30  │
│   Obesitas ............... ~30  │           │   Perut Kembung/Mual ......... ~30  │
│                                 │           │ IMUNITAS                             │
│ KARDIOVASKULAR                  │           │   Batuk (kering + berdahak) ... ~80  │
│   Hipertensi ............. ~70  │           │   TBC (pendukung) ............ ~30  │
│   Lemah Jantung .......... ~20  │           │   Demam/Antipiretik .......... ~40  │
│                                 │           │   Imun booster ............... ~30  │
│ UROLOGI                         │           │ ANTI-INFLAMASI                       │
│   Batu Ginjal ............ ~50  │           │   Radang Sendi/Rematik ....... ~70  │
│   ISK .................... ~30  │           │   Eksim/Alergi ............... ~40  │
│   Gagal Ginjal ........... ~20  │           │   Psoriasis .................. ~20  │
│                                 │           │ DERMATOLOGI                          │
│                                 │           │   Kudis/Kurap/Koreng ......... ~50  │
│                                 │           │   Bau Badan .................. ~20  │
│                                 │           │ RELAKSASI                            │
│                                 │           │   Insomnia/Lelah/Stres ....... ~60  │
│                                 │           │ HEMATOLOGI                           │
│                                 │           │   Anemia/Perdarahan .......... ~40  │
└─────────────────────────────────┘           └──────────────────────────────────────┘
         ~290                                               ~710
```

---

## 🔄 Pipeline Data (Alur Lengkap)

```
                     FASE 1 — PARALEL (semua mulai sekarang)
                     ────────────────────────────────────────

  Buku PDF 312 hal          Pengetahuan Ilmiah         Pengetahuan Ilmiah
       │                    WHO/BPOM/PubMed            WHO/BPOM/FOHAI
       ▼                           │                          │
 Claude Desktop                Claude CLI #1            Claude CLI #2
 (OCR → JSON)                 (Tanaman + A)           (Formula B)
       │                           │                          │
       ▼                           ▼                          ▼
 data/ocr/                 data/claude1/              data/claude2/
 raw_formulas.json         herbals_profiles.json      formulas_B.json
                           formulas_A.json


                     FASE 2 — ENRICHMENT (setelah raw_formulas.json ada)
                     ────────────────────────────────────────────────────

 data/ocr/raw_formulas.json
       │
       └──→ Claude CLI #2 membaca dan memperkaya
                           │
                           ▼
                  data/claude2/enriched_ocr.json


                     FASE 3 — MERGE & SEED (Claude Code)
                     ────────────────────────────────────

  data/claude1/    data/claude2/    data/claude2/
  herbals_profiles  formulas_A      formulas_B        enriched_ocr
       │               │                │                  │
       └───────────────┴────────────────┴──────────────────┘
                                │
                         Claude Code MERGE
                                │
                     data/final/herbals_merged.json
                     data/final/formulas_merged.json
                                │
                      admin/import-herbal.html
                                │
                        Firestore Database ✅
                                │
           herbal.html + herbal-formula.html + disease-risk.html
```

---

## 📋 JSON Schema (WAJIB dipatuhi semua AI)

### Schema `herbals/{id}`:
```json
{
  "id": "sidaguri",
  "name": "Sidaguri",
  "latinName": "Sida rhombifolia L.",
  "family": "Malvaceae",
  "emoji": "🌿",
  "categories": ["metabolisme", "antiinflamasi"],
  "evidenceLevel": "B",
  "studyCount": 12,
  "partUsed": ["Akar", "Daun"],
  "benefits": [
    { "name": "Anti-gout", "mechanism": "Menghambat xanthine oxidase" }
  ],
  "activeCompounds": ["Alkaloid krisin", "Flavonoid", "Tanin"],
  "usageMethods": ["rebus", "ekstrak"],
  "dosage": [
    { "condition": "Asam Urat", "dose": "60g akar kering, rebus 3→1 gelas", "duration": "14 hari" }
  ],
  "contraindications": ["Ibu hamil (efek abortivum)"],
  "drugInteractions": [
    { "drug": "Warfarin", "severity": "sedang", "description": "Potensi meningkatkan efek antikoagulan" }
  ],
  "references": [
    { "author": "Patel et al.", "year": 2011, "journal": "Journal of Ethnopharmacology", "pmid": "21193027" }
  ],
  "bpomStatus": "Tanaman Obat Tradisional",
  "source": "Riset Claude CLI #1 — WHO Monographs + PubMed"
}
```

### Schema `herbalFormulas/{id}`:
```json
{
  "recipeNumber": 47,
  "name": "Ramuan Asam Urat Sidaguri",
  "indications": ["asam-urat"],
  "category": "metabolisme",
  "ingredients": [
    { "herb": "Akar Sidaguri", "latinName": "Sida rhombifolia", "amount": 60, "unit": "gram", "condition": "kering" }
  ],
  "preparationMethod": "Rebus dengan 3 gelas air hingga tersisa 1 gelas. Saring.",
  "preparationType": "rebus",
  "dosage": "Minum sekaligus pada pagi hari.",
  "frequency": "1x sehari",
  "duration": "14 hari",
  "warnings": ["Ibu hamil dilarang (efek abortivum)"],
  "isTopical": false,
  "evidenceLevel": "C",
  "doctorVerified": false,
  "source": "1001 Resep Herbal - Dr. Setiawan Dalimartha",
  "tags": ["asam-urat", "sidaguri", "rebus"]
}
```

> ⚠️ **preparationType** harus salah satu dari: `rebus` `seduh` `tumbuk` `tempel` `mandi` `peras`
> ⚠️ **evidenceLevel** harus: `A` (RCT/meta-analysis) `B` (clinical study) `C` (empiris/tradisional)
> ⚠️ **tags** lowercase, pakai tanda `-` bukan spasi

---

## 🚨 Aturan Anti-Konflik — WAJIB

1. **1 AI = 1 subfolder** — tidak boleh menulis ke subfolder milik AI lain
2. **Boleh baca, tidak boleh tulis** untuk file di luar territory sendiri
3. **Jangan seed ke Firestore langsung** — hanya Claude Code yang melakukan seeding
4. **Deklarasi selesai** dengan membuat file `DONE.flag` di folder sendiri
5. **Update `data/progress.md`** setelah setiap sesi kerja
6. **Jika ada plant yang sama** di claude1/ dan claude2/ → Claude Code yang handle merge/dedup

---

## ✅ Checklist Sebelum Mulai (untuk setiap AI)

- [ ] Baca AI_WORKFLOW.md ini sampai selesai
- [ ] Tahu folder territory saya
- [ ] Paham schema JSON yang harus dipatuhi
- [ ] Update `data/progress.md` dengan entry "Mulai: [tanggal] [nama AI]"
- [ ] Tidak akan menyentuh folder AI lain

---

*Dibuat oleh Claude Code. Berlaku untuk semua 4 Claude instance dalam proyek ini.*
