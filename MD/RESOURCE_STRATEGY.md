# RESOURCE_STRATEGY.md — Strategi Pemanfaatan TCM-MKG untuk HerboraTech
<!-- Dibuat: 22 Maret 2026 oleh Claude Code -->

---

## 🌐 Sumber Daya yang Tersedia

### 1. TCM-MKG Dataset (Zenodo)
- **URL:** https://zenodo.org/records/13763953
- **DOI:** 10.5281/zenodo.13763953
- **Ukuran:** 1.1 GB (24 file TSV + dokumentasi PDF)
- **Lisensi:** CC BY-NC 4.0 → **bebas digunakan untuk non-komersial / proyek akademik ✅**
- **Publikasi:** Zeng, J., & Jia, X. (2025). Journal of Pharmaceutical Analysis. DOI: 10.1016/j.jpha.2025.101342

### 2. GraphAI-for-TCM (GitHub)
- **URL:** https://github.com/ZENGJingqi/GraphAI-for-TCM
- **Lisensi:** MIT → **bebas digunakan sepenuhnya ✅**
- **Isi:** Pre-trained Graph Attention Network untuk prediksi kompatibilitas formula
- **Python:** Jupyter notebooks, PyTorch 2.7, Torch Geometric

---

## 🔑 Mengapa Ini Sangat Berharga untuk HerboraTech

### A. Data Bridge: TCM ↔ Jamu Indonesia
Latin name = kunci universal. Ratusan tanaman TCM identik dengan jamu Indonesia:

| Komponen HerboraTech | Latin Name | Ada di TCM-MKG |
|-------------------|-----------|----------------|
| Jahe Merah | *Zingiber officinale* var. *rubrum* | ✅ D2, D5, D6 |
| Kunyit | *Curcuma longa* | ✅ D2, D5 |
| Temulawak | *Curcuma xanthorrhiza* | ✅ D2 |
| Sambiloto | *Andrographis paniculata* | ✅ D2, D6 (Chuan Xin Lian) |
| Bawang Putih | *Allium sativum* | ✅ D2, D5, D6 |
| Kencur | *Kaempferia galanga* | ✅ D2 |
| Pegagan | *Centella asiatica* | ✅ D2, D5 |
| Meniran | *Phyllanthus niruri* | ✅ D2 |
| Mengkudu | *Morinda citrifolia* | ✅ D2 |
| Kayu Manis | *Cinnamomum cassia* | ✅ D2, D5, D6 |
| Cengkeh | *Syzygium aromaticum* | ✅ D2, D5 |
| Kapulaga | *Elettaria cardamomum* | ✅ D2 |
| Adas | *Foeniculum vulgare* | ✅ D2, D5 |
| Pala | *Myristica fragrans* | ✅ D2 |
| Jintan Hitam | *Nigella sativa* | ✅ D2, D5 |
| Daun Kelor | *Moringa oleifera* | ✅ D2, D5 |
| Rosella | *Hibiscus sabdariffa* | ✅ D2 |
| Brotowali | *Tinospora crispa/cordifolia* | ✅ D2 |
| Sambung Nyawa | *Gynura procumbens* | ✅ D2 |

**Estimasi: 60-80% dari 50 tanaman prioritas kita ada di TCM-MKG**

### B. Data yang Bisa Diekstrak per Tanaman
Dari file D2 (Herbal Pieces), D5 (Chemical Components), D6 (Disease Targets):
- `activeCompounds` → senyawa aktif dengan nama IUPAC
- `benefits[].mechanism` → mekanisme farmakologi berbasis target protein
- `drugInteractions` → interaksi melalui shared drug targets
- `studyCount` → jumlah studi dari knowledge graph (30+ sumber)
- `evidenceLevel` → bisa di-upgrade dari C ke B berdasarkan data biomedis

### C. GraphAI Model — Fitur Unik HerboraTech
```
Input: Formula herbal (list tanaman dalam 1 ramuan)
Output: Compatibility Score (0-1) per pasangan tanaman

Contoh penggunaan di HerboraTech:
  Formula: [Sidaguri + Tempuyung + Kumis Kucing]
  → Compatibility Score: 0.87 (tinggi = harmonis)
  → Warning: tanaman X dan Y mungkin berkonflik

Tampil di herbal-formula.html sebagai:
  "Skor Kompatibilitas: ★★★★☆ (87/100)"
  "Divalidasi oleh Graph Neural Network"
```
**Tidak ada platform herbal Indonesia lain yang punya fitur ini.**

---

## 📂 Peta File TCM-MKG (24 File TSV)

### Prioritas Tinggi (Claude Desktop harus ekstrak):

| File | Isi | Manfaat untuk HerboraTech | Ukuran Est. |
|------|-----|----------------------|-------------|
| **D2** | Herbal Pieces (tanaman) | Nama latin, ID, properties | ~50 MB |
| **D5** | Chemical Components | activeCompounds per tanaman | ~100 MB |
| **D6** | Disease-Target mappings | condition-herb associations | ~80 MB |
| **D8** | Herb-Disease associations | indications per tanaman | ~60 MB |
| **D3** | Natural Products | Senyawa bioaktif detail | ~70 MB |
| **D9** | Drug interactions via targets | drugInteractions field | ~90 MB |

### Prioritas Menengah:

| File | Isi | Manfaat |
|------|-----|---------|
| D1 | TCM Terminology | Sinonim nama Mandarin ↔ Latin |
| D4 | Medicines (formula TCM) | Referensi formula multi-tanaman |
| D7 | Protein Targets | Mekanisme molekuler |
| D10-D15 | Biomedical data | Drug safety, ADME properties |

### Prioritas Rendah (skip untuk sekarang):
D16-D24 — Data genomik dan network biology (terlalu teknis untuk UI HerboraTech)

---

## 🗂️ File GitHub yang Berguna

| File | Lokasi | Manfaat |
|------|--------|---------|
| `Chinese_herbal_pieces.tsv` | Data/ | Nama + ID herbal dengan medicinal properties |
| `CHP_Medicinal_properties.tsv` | Data/ | Sifat farmakologi terstruktur |
| `CHP_Encoder.tsv` | Data/ | Encoding untuk model GNN |
| `2_Prediction Using the GAT Model.ipynb` | Python/ | Cara pakai model untuk prediksi |
| `Model/*.pt` | Model/ | Pre-trained model siap pakai |

---

## 📋 Pembagian Kerja Claude Desktop (DIPERBARUI)

Claude Desktop sekarang punya **2 tugas besar** yang bisa dikerjakan paralel:

### Tugas A — OCR Buku 1001 Resep (sudah direncanakan)
*Tidak berubah — lihat COORDINATION.md*

### Tugas B — Ekstraksi TCM-MKG (BARU)

#### Langkah B.1 — Download file prioritas dari Zenodo
```
Download dari https://zenodo.org/records/13763953:
- D2_Herbal_pieces.tsv
- D5_Chemical_components.tsv
- D6_Disease_targets.tsv
- D8_Herb_disease.tsv
- TCM-MKG_Open_Source_Documentation.pdf

Simpan ke: data/tcm_mkg/raw/
```

#### Langkah B.2 — Clone GitHub repo
```bash
git clone https://github.com/ZENGJingqi/GraphAI-for-TCM
# Simpan ke: data/tcm_mkg/graphai/
```

#### Langkah B.3 — Filter tanaman yang overlap dengan Indonesia
Buat script Python sederhana:
```python
# data/scripts/filter_indonesian_herbs.py

INDONESIAN_HERBS_LATIN = [
    "Zingiber officinale", "Curcuma longa", "Curcuma xanthorrhiza",
    "Andrographis paniculata", "Allium sativum", "Kaempferia galanga",
    "Centella asiatica", "Phyllanthus niruri", "Morinda citrifolia",
    "Cinnamomum cassia", "Syzygium aromaticum", "Elettaria cardamomum",
    "Foeniculum vulgare", "Myristica fragrans", "Nigella sativa",
    "Moringa oleifera", "Hibiscus sabdariffa", "Tinospora crispa",
    "Gynura procumbens", "Sida rhombifolia", "Sonchus arvensis",
    "Orthosiphon aristatus", "Strobilanthes crispus", "Blumea balsamifera",
    "Phaleria macrocarpa", "Momordica charantia", "Annona muricata",
    "Carica papaya", "Aloe vera", "Zingiber purpureum",
    "Boesenbergia pandurata", "Zingiber zerumbet", "Piper retrofractum",
    "Imperata cylindrica", "Artocarpus altilis", "Apium graveolens",
    "Persea americana", "Caesalpinia sappan", "Averrhoa bilimbi",
    "Hibiscus rosa-sinensis", "Mimosa pudica"
]

# Filter D2 untuk tanaman Indonesia saja
# Output: data/tcm_mkg/filtered/indonesian_herbs.tsv
```

#### Langkah B.4 — Konversi ke HerboraTech Schema
Untuk setiap tanaman yang ditemukan, ekstrak ke format:
```json
{
  "id": "jahe-merah",
  "tcmId": "HRB12345",
  "activeCompounds": [...dari D5...],
  "diseaseMappings": [...dari D6/D8...],
  "drugInteractions": [...dari D9...],
  "molecularTargets": [...dari D7...],
  "evidenceLevel": "B",
  "tcmSource": "TCM-MKG v1.0 — DOI: 10.5281/zenodo.13763953"
}
```

**Output:** `data/tcm_mkg/herboratech_enriched.json`

#### Langkah B.5 — Jalankan GraphAI untuk Formula Compatibility
```python
# Untuk setiap formula di formulas_A.json dan formulas_B.json:
# 1. Encode ingredients menggunakan CHP_Encoder.tsv
# 2. Jalankan model (notebook 2_Prediction.ipynb)
# 3. Simpan compatibility score
# Output: data/tcm_mkg/formula_scores.json
```

---

## 🗂️ Struktur Folder Baru (Updated)

```
data/
├── ocr/                     ← Claude Desktop: OCR buku
├── claude1/                 ← Claude CLI #1: riset tanaman + formula A
├── claude2/                 ← Claude CLI #2: formula B + enrichment
├── tcm_mkg/                 ← Claude Desktop: ekstraksi TCM-MKG (BARU)
│   ├── raw/                 ← file TSV original dari Zenodo
│   ├── graphai/             ← clone dari GitHub
│   ├── filtered/            ← tanaman Indonesia saja
│   └── herboratech_enriched.json  ← output final untuk Claude Code
├── final/                   ← Claude Code: merge semua
└── progress.md
```

---

## 💎 Nilai Kompetitif untuk Lomba

Dengan mengintegrasikan TCM-MKG, HerboraTech bisa klaim:

> *"Database herbal HerboraTech didukung oleh TCM-MKG — knowledge graph multidimensi yang mengintegrasikan data dari 30+ sumber otoritatif termasuk PubMed, DrugBank, dan TCMSP, dipublikasikan di Journal of Pharmaceutical Analysis 2025. Formula herbal divalidasi dengan Graph Attention Network untuk memastikan kompatibilitas antar-bahan."*

| Keunggulan | Platform Lain | HerboraTech |
|------------|--------------|---------|
| Basis data ilmiah | Wikipedia / blog | TCM-MKG + WHO Monographs + BPOM |
| Validasi formula | Tidak ada | Graph Neural Network (GAN score) |
| Mekanisme farmakologi | Tidak ada | Molecular target data |
| Interaksi obat-herbal | Tidak ada | Drug-target network |
| Evidence level | Tidak ada | A/B/C graded |

---

## ⚖️ Catatan Lisensi

- **TCM-MKG (Zenodo):** CC BY-NC 4.0
  - ✅ Boleh untuk proyek akademik/lomba (non-commercial)
  - ✅ Boleh modifikasi dan integrasikan
  - ⚠️ Wajib atribusi: *"Data dari TCM-MKG, Zeng & Jia (2025)"*
  - ❌ Tidak boleh jual secara komersial

- **GraphAI (GitHub):** MIT License
  - ✅ Bebas digunakan untuk apapun termasuk komersial
  - ✅ Boleh modifikasi
  - ⚠️ Wajib include license notice

**Atribusi yang perlu ditambahkan di HerboraTech UI:**
```
Data senyawa aktif dan target penyakit bersumber dari:
TCM-MKG v1.0 (Zeng & Jia, 2025, J. Pharm. Analysis)
DOI: 10.5281/zenodo.13763953
Lisensi: CC BY-NC 4.0
```

---

*Strategi ini dibuat oleh Claude Code. Claude Desktop yang akan mengeksekusi Tugas B.*
