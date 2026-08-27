# 🌿 Strategi Database Jamu HerboraTech
## Berdasarkan: "1001 Resep Herbal Dr. Setiawan Dalimartha"
<!-- Dibuat: 22 Maret 2026 -->

---

## 1. Temuan Analisis PDF

### Isi Buku
- **Total halaman:** 312 halaman (PDF scan/gambar, bukan teks)
- **Total resep:** 1.001 resep herbal tradisional
- **Penyusun:** dr. Setiawan Dalimartha (dokter sekaligus peneliti herbal)
- **Penerbit:** Penebar Swadaya
- **Sumber khasiat:** Empiris + sebagian sudah diteliti secara klinis

### Struktur Setiap Resep
```
[Nomor Resep] [Nama Penyakit/Kondisi]

Bahan:
  - [Nama bahan], [kuantitas + satuan]
  - ...

Cara Meramu Resep:
  - Langkah 1...
  - Langkah 2...

Aturan Pakai:
  Minum ... kali sehari, masing-masing ... gelas.

Catatan (opsional):
  Peringatan / kontraindikasi.
```

### Contoh Nyata (hasil OCR)
```
47 | Asam Urat
Bahan: Akar sidaguri kering, 60g.
Cara: Rebus dengan 3 gelas air bersih hingga tersisa 1 gelas. Saring.
Aturan Pakai: Minum sekaligus pada pagi hari.
Catatan: Ibu hamil DILARANG (efek abortivum).

31 | Asam Urat
Bahan: Rambut jagung 50g, Herba tempuyung 50g, Herba kumis kucing 100g.
Cara: Rebus dengan 3 gelas air hingga tersisa 1 gelas. Saring.
Aturan Pakai: Minum sekaligus pagi hari. Ampas direbus lagi untuk sore.
```

### Penyakit yang Dicakup (Daftar Isi)
| Kategori HerboraTech | Penyakit dalam Buku |
|---|---|
| **Metabolisme** | Asam Urat, Kolesterol Tinggi, Diabetes (Kencing Manis), Obesitas |
| **Pencernaan** | Batu Empedu, Buang Air Besar Berdarah, Disentri, Perut Kembung, Sembelit |
| **Imunitas** | Amandel, Batuk, Pneumonia, Malaria, TBC |
| **Anti-inflamasi** | Radang Ginjal, Radang Sendi, Eksim, Psoriasis |
| **Relaksasi/Saraf** | Badan Lelah, Epilepsi, Lemah Saraf, Insomnia |
| **Kardiovaskular** | Lemah Jantung, Perdarahan di Otak, Hipertensi |
| **Urologi** | Batu Kandung Kencing, Gagal Ginjal, Infeksi Saluran Kencing |
| **Dermatologi** | Bau Badan, Koreng, Kudis, Kurap, Kulit Kasar, Kutil |
| **Hematologi** | Kurang Darah (Anemia), Perdarahan |

---

## 2. Pemetaan ke Firestore HerboraTech

### Collection yang Sudah Ada
HerboraTech sudah memiliki dua Firestore collection yang **siap diisi**:

```
herbals/{id}          ← Data tanaman individual (12 tanaman seed saat ini)
herbalFormulas/{id}   ← Data formula/ramuan (5 formula seed saat ini)
```

### A. Collection `herbalFormulas` — Target Utama PDF

Setiap resep dari buku = 1 dokumen `herbalFormulas`. Pemetaan schema:

```javascript
// herbalFormulas/{auto_id}
{
  // === DARI PDF ===
  recipeNumber: 47,                        // Nomor resep dalam buku
  name: "Ramuan Asam Urat - Sidaguri",     // Nama formula (penyakit + bahan utama)
  indications: ["asam-urat", "rematik"],   // Cocok dengan filter herbal.html

  ingredients: [
    {
      herb: "Akar Sidaguri",               // Nama bahan
      latinName: "Sida rhombifolia",       // Opsional (diperkaya)
      amount: 60,
      unit: "gram",
      condition: "kering"                  // segar / kering / dll
    }
  ],

  preparationMethod: "Potong akar sidaguri tipis-tipis. Rebus dengan 3 gelas " +
                     "air bersih hingga tersisa 1 gelas. Saring dan biarkan dingin.",
  preparationType: "rebus",               // rebus | seduh | giling | tempel | mandi

  dosage: "Minum air rebusan sekaligus pada pagi hari.",
  frequency: "1x sehari",
  duration: "Sesuai kebutuhan",

  warnings: ["Ibu hamil dilarang minum (efek abortivum)"],

  // === METADATA ===
  source: "1001 Resep Herbal - Dr. Setiawan Dalimartha",
  evidenceLevel: "C",                     // C = Empiris/tradisional
  isTopical: false,                       // true jika dioles/balur, false jika diminum

  // === UNTUK HERBORATECH ===
  category: "metabolisme",                // cocok filter di herbal.html
  tags: ["asam-urat", "sidaguri", "rebus", "empiris"],
  doctorVerified: false,                  // dokter bisa verifikasi via admin

  createdAt: serverTimestamp()
}
```

### B. Collection `herbals` — Tanaman Baru dari PDF

Dari 1001 resep akan muncul ±150-200 jenis tanaman unik. Tanaman yang belum ada di `herbals` perlu ditambahkan:

```javascript
// herbals/{slug}  contoh: "sidaguri"
{
  name: "Sidaguri",
  latinName: "Sida rhombifolia L.",
  family: "Malvaceae",
  emoji: "🌿",
  categories: ["metabolisme", "antiinflamasi"],
  evidenceLevel: "C",                     // dari buku = empiris
  studyCount: 0,                          // update jika ada riset

  benefits: [
    { name: "Anti-gout", mechanism: "Menghambat xanthine oxidase (empiris)" }
  ],

  partUsed: "Akar",
  usageMethods: ["rebus"],

  // Resep yang menggunakannya (referensi silang)
  relatedFormulas: ["formula_id_1", "formula_id_2"],

  source: "1001 Resep Herbal - Dr. Setiawan Dalimartha",
  bpomStatus: "Tanaman Obat Tradisional",

  createdAt: serverTimestamp()
}
```

---

## 3. Pipeline Ekstraksi PDF → Database

Karena PDF berformat **scan gambar** (bukan teks), diperlukan pipeline OCR:

```
PDF (312 hal, scan)
      │
      ▼ (pdf2image)
  Gambar per halaman (JPG/PNG)
      │
      ▼ (Tesseract OCR + bahasa Indonesia)
  Raw text per halaman
      │
      ▼ (Python parser / regex)
  Structured JSON
      │
      ├── herbals_new.json      → tanaman baru
      └── herbalFormulas.json   → 1001 formula
            │
            ▼ (Firebase Admin SDK atau seed-data.html)
      Firestore Database ✅
```

### Script Python yang Dibutuhkan
```python
# Diperlukan:
# pip install pdf2image pytesseract
# apt install tesseract-ocr tesseract-ocr-ind

import re, json
from pdf2image import convert_from_path
import pytesseract

def parse_recipe(text_block):
    """
    Parse 1 blok teks resep menjadi dict terstruktur.
    Pattern: [nomor] [nama_penyakit] → Bahan → Cara → Aturan Pakai → Catatan
    """
    result = {
        "recipeNumber": None,
        "condition": None,
        "ingredients": [],
        "preparationMethod": "",
        "dosage": "",
        "warnings": []
    }

    # Ekstrak nomor dan nama penyakit
    header = re.search(r'^(\d+)\s+([A-Za-z\s]+)', text_block)
    if header:
        result["recipeNumber"] = int(header.group(1))
        result["condition"] = header.group(2).strip()

    # Ekstrak bahan
    bahan_match = re.search(r'Bahan\s*(.+?)(?=Cara Meramu|$)', text_block, re.DOTALL)
    if bahan_match:
        bahan_text = bahan_match.group(1)
        for line in bahan_text.split('\n'):
            line = line.strip().lstrip('•+-*')
            if line:
                result["ingredients"].append({"raw": line.strip()})

    # Ekstrak cara meramu
    cara_match = re.search(r'Cara Meramu Resep\s*(.+?)(?=Aturan Pakai|$)', text_block, re.DOTALL)
    if cara_match:
        result["preparationMethod"] = cara_match.group(1).strip()

    # Ekstrak aturan pakai
    aturan_match = re.search(r'Aturan Pakai\s*(.+?)(?=Catatan|$)', text_block, re.DOTALL)
    if aturan_match:
        result["dosage"] = aturan_match.group(1).strip()

    # Ekstrak catatan/peringatan
    catatan_match = re.search(r'Catatan\s*(.+?)$', text_block, re.DOTALL)
    if catatan_match:
        result["warnings"].append(catatan_match.group(1).strip())

    return result
```

**Estimasi effort:** 3-5 hari kerja untuk OCR + parsing + quality check semua 312 halaman.

---

## 4. Integrasi dengan Fitur HerboraTech yang Sudah Ada

### A. `patient/herbal.html` — Katalog Jamu ✅
**Status saat ini:** Sudah ada UI, sudah connect ke `VDB.getHerbals()`, tapi database kosong.

**Setelah PDF diekstrak:**
- Filter kategori (Pencernaan, Imunitas, dll) → tersedia otomatis dari field `category`
- Pencarian → bisa search `name`, `indications`, `tags`
- 1001 resep = konten yang sangat kaya untuk pasien

### B. `patient/herbal-formula.html` — Detail Formula ✅
**Status saat ini:** Sudah ada UI, memanggil `VDB.getHerbalFormula(id)`.

**Setelah PDF:**
- Setiap resep dari buku langsung tampil di halaman ini
- Field `warnings` → tampil sebagai notifikasi merah
- Field `isTopical` → tampil petunjuk "Untuk pemakaian luar" vs "Diminum"

### C. `doctor/prescription.html` — Resep Dokter 🔗
**Peluang baru:** Dokter integratif di HerboraTech bisa merekomendasikan formula dari database PDF ini.

```javascript
// Di prescription.html, tambahkan:
const herbalSuggestions = await VDB.getHerbalFormulas(diagnosis.toLowerCase());
// → sistem saran otomatis resep herbal berdasarkan diagnosis ICD-10
```

### D. `medicalRecords` — Rekam Medis ✅
Schema HerboraTech sudah mendukung:
```javascript
herbal: {
  formula: "herbalFormulas/formula_id",   // referensi ke collection
  ingredients: ["Sidaguri 60g", "..."]    // teks ringkas
}
```
→ Dokter bisa langsung pilih dari 1001 resep saat mengisi rekam medis.

### E. `patient/ai-consultation.html` — AI Chat 🤖
Database 1001 resep bisa dijadikan **knowledge base** untuk AI assistant:
- Pasien tanya: *"Herbal apa untuk asam urat?"*
- AI langsung referensikan resep dari database Dr. Dalimartha
- Tambahkan disclaimer medis

### F. `patient/disease-risk.html` — Risiko Penyakit 🔗
- Halaman ini menampilkan risiko penyakit berdasarkan vitals
- Bisa ditambahkan: *"Herbal yang direkomendasikan untuk kondisi ini"*
- Linked ke herbalFormulas berdasarkan condition

---

## 5. Rencana Kerja (Prioritas)

### Fase 1 — Quick Win (1-2 minggu)
- [ ] Buat 50 formula resep pilihan secara manual (dari penyakit paling umum: Asam Urat, Batuk, Maag, Hipertensi, Diabetes, Kolesterol, dll) sebagai seed data awal
- [ ] Tambahkan ke `seed-data.html` fungsi `seedHerbalFormulas1001()`
- [ ] Test tampilan di `herbal.html` dan `herbal-formula.html`

### Fase 2 — Full Extraction (2-4 minggu)
- [ ] Setup pipeline OCR Python di server
- [ ] OCR semua 312 halaman dengan Tesseract + bahasa Indonesia
- [ ] Build parser untuk ekstrak struktur resep
- [ ] Manual QC untuk 1001 resep (koreksi OCR error)
- [ ] Seed ke Firestore via Firebase Admin SDK

### Fase 3 — Enrichment (ongoing)
- [ ] Tambahkan nama latin ke setiap tanaman dari buku
- [ ] Upgrade evidenceLevel (C→B atau A) jika ada riset mendukung
- [ ] Tambahkan gambar tanaman dari public domain / Wikimedia
- [ ] Verifikasi dokter untuk setiap formula

### Fase 4 — Smart Features
- [ ] Integrasi ke AI consultation sebagai knowledge base
- [ ] Herbal recommendation di disease-risk page
- [ ] Herbal prescription di doctor/prescription.html

---

## 6. Pertimbangan Penting

### Legalitas & Hak Cipta
- Buku "1001 Resep Herbal" diterbitkan Penebar Swadaya (komersial)
- **Rekomendasi:** Gunakan sebagai referensi internal, bukan redistribute konten verbatim
- Ubah formulasi teks (paraphrase) saat memasukkan ke database
- Tambahkan atribusi: `source: "Adaptasi dari 1001 Resep Herbal, dr. Setiawan Dalimartha"`

### Keamanan Medis
- Semua resep di buku bersifat **empiris tradisional** (evidenceLevel: "C")
- Wajib tampilkan disclaimer di UI: *"Selalu konsultasikan dengan dokter sebelum mengonsumsi"*
- Warning khusus untuk resep dengan kontraindikasi (ibu hamil, penyakit tertentu)
- Fitur **Cek Interaksi Herbal-Obat** yang sudah ada di herbal.html sangat penting

### Firestore Quota
- 1001 dokumen herbalFormulas = 1001 reads saat load semua
- **Solusi:** Implementasi pagination (sudah ada filter kategori)
- Estimasi: <100 formulas per kategori → aman dalam limit gratis

---

## 7. Nilai Bisnis untuk HerboraTech

| Keunggulan | Dampak |
|---|---|
| 1001 resep terstruktur | Konten terlengkap di antara platform telemedisin Indonesia |
| Berbasis buku terpercaya (dr. dokter) | Kredibilitas tinggi |
| Terintegrasi dengan rekam medis digital | Dokter integratif bisa prescribe herbal secara resmi |
| AI bisa reference ke database | Fitur AI consultation lebih relevan untuk pengguna Indonesia |
| Edukasi pasien kaya | Retensi pengguna lebih tinggi |

**Tagline potensial:** *"HerboraTech: Telemedisin modern dengan kearifan herbal Indonesia"*

---

## 8. Rekomendasi Langkah Pertama

1. **Mulai dari 20 resep manual** untuk penyakit paling dicari (Asam Urat, Batuk, Maag, Diabetes) → seed ke Firestore hari ini
2. **Test flow end-to-end:** herbal.html → tap formula → herbal-formula.html
3. **Setup OCR pipeline** di environment Python untuk ekstraksi massal
4. **Diskusikan legalitas** dengan tim sebelum go-live ke production

---

*Dokumen ini dibuat berdasarkan analisis PDF "1001 Resep Herbal Dr. Setiawan Dalimartha" (312 hal, 1001 resep) dan eksplorasi codebase HerboraTech (www/ folder, Firebase schema, seed-data.html).*
