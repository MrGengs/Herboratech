# CLAUDE CLI #2 — Task Instructions
## Role: "Formula Kategori B + Enrichment OCR"
<!-- Paste seluruh file ini sebagai instruksi pertama ke Claude CLI #2 -->

---

## 🎯 Siapa Kamu

Kamu adalah **Claude CLI #2** dengan peran **"Formula Kategori B + Enrichment OCR"** dalam tim 4 Claude yang mengerjakan database herbal untuk platform telemedisin HerboraTech (Indonesia).

**Tim lengkap:**
| AI | Peran | Status |
|----|-------|--------|
| Claude Code | Developer — UI & Firebase | Aktif |
| Claude Desktop | OCR buku 1001 Resep Jamu | Aktif |
| Claude CLI #1 | Profil Tanaman + Formula Kategori A | Aktif |
| **Kamu (Claude CLI #2)** | Formula Kategori B + Enrichment OCR | Kamu |

**Baca dulu:** `AI_WORKFLOW.md` dan `COORDINATION.md` di root folder proyek.

---

## 📁 Territory Kamu

```
BOLEH TULIS:
  data/claude2/formulas_B.json        ← output Task #1 (formula 6 kategori)
  data/claude2/enriched_ocr.json      ← output Task #2 (enrichment OCR)
  data/claude2/DONE.flag              ← buat saat semua selesai
  data/progress.md                    ← update log kamu

BOLEH BACA (jangan tulis):
  AI_WORKFLOW.md
  COORDINATION.md
  HERBAL_DATABASE_STRATEGY.md
  data/claude1/herbals_profiles.json  ← referensi nama latin (jika sudah ada)
  data/ocr/raw_formulas.json          ← INPUT Task #2 (jika sudah ada)

JANGAN SENTUH:
  www/             ← Claude Code
  data/ocr/        ← Claude Desktop
  data/claude1/    ← Claude CLI #1
  data/final/      ← Claude Code
```

---

## 📋 TASK #1 — Formula Kategori B (Mandiri, Berbasis Riset)

**Output:** `data/claude2/formulas_B.json`
**Bisa mulai sekarang, tidak perlu menunggu siapapun.**

Buat 55-70 formula herbal evidence-based untuk 6 kategori berikut:

---

### Kategori 1: PENCERNAAN (~15 formula)

#### Maag / Gastritis (5 formula):
- Kunyit + madu (anti-inflamasi lambung, terbukti klinis)
- Lidah Buaya segar (coating mukosa lambung)
- Kayu Manis + madu (antibakteri H. pylori)
- Jahe merah + akar manis (antasida alami)
- Daun pisang batu (proteksi mukosa)

#### Sembelit / Susah BAB (4 formula):
- Daun senna + air hangat (laksatif stimulan)
- Lidah buaya + jeruk nipis (laksatif)
- Pepaya matang + biji selasih (fiber + bulking)
- Minyak kelapa virgin + air hangat (lubrikasi usus)

#### Disentri / Diare (3 formula):
- Daun jambu biji + kulit delima (astringen, antimikroba)
- Temu ireng + kunyit (antiparasit)
- Daun sirih + kapur sirih (antiseptik ringan)

#### Perut Kembung / Mual (3 formula):
- Jahe + kencur + gula merah (karminatif, antiemetik)
- Adas + biji jintan putih (karminatif)
- Kapulaga + kayu manis (digestif, antiemetik)

---

### Kategori 2: IMUNITAS (~15 formula)

#### Batuk Kering (5 formula):
- Kencur + madu + jeruk nipis (ekspektoran tradisional, riset positif)
- Jahe merah + bawang putih + madu (antimikroba + soothing)
- Thyme / Timi + madu (WHO approved untuk batuk anak)
- Daun sirih + madu (antiseptik saluran napas)
- Licorice (akar manis) + jahe (demulcent + anti-inflamasi)

#### Batuk Berdahak (4 formula):
- Jahe + bawang putih + kencur + madu (ekspektoran)
- Herba meniran + sambiloto (antiinfeksi)
- Daun mint + eucalyptus (inhalasi, mukolitik alami)
- Bunga kamboja putih (ekspektoran tradisional)

#### Demam / Antipiretik (3 formula):
- Bangle + air asam jawa (antipiretik, empiris kuat)
- Daun pepaya + air kelapa muda (antipiretik + rehidrasi)
- Sambiloto + air (antipiretik, anti-inflamasi, ev. B)

#### Imun Booster / Preventif (3 formula):
- Jintan hitam + madu (imunomodulator, ev. A untuk beberapa kondisi)
- Daun kelor + jahe (nutrisi + antioksidan)
- Meniran + sambiloto + temulawak (triple imunomodulator)

---

### Kategori 3: ANTI-INFLAMASI (~12 formula)

#### Radang Sendi / Rematik (5 formula):
- Cabe Puyang (Cabe Jawa + Lempuyang) — formula FOHAI klasik
- Jahe merah + kunyit + lada hitam (sinergis anti-inflamasi)
- Temulawak + kunyit + kencur (FOHAI, terbukti klinis)
- Sambiloto + bangle (anti-inflamasi sistemik)
- Daun dewa + kunyit (rematik akut)

#### Nyeri Otot / Pegal Linu (4 formula):
- Minyak kayu putih + jahe (pemakaian luar, topikal)
- Rebusan serai + jahe (mandi rendam, topikal)
- Biji pala + minyak kelapa (olesan, topikal)
- Cengkeh + minyak zaitun (olesan, topikal, analgesik)

#### Eksim / Alergi Kulit (3 formula):
- Lidah buaya gel (topikal, ev. A untuk eksim)
- Kunyit + air (minum + olesan, anti-inflamasi)
- Daun binahong (tumbuk, topikal untuk kulit meradang)

---

### Kategori 4: DERMATOLOGI (~10 formula)

#### Kudis / Scabies (3 formula):
- Belerang + minyak kelapa + daun sirih (topikal, klasik)
- Lengkuas parut + air perasan (topikal, antifungal)
- Bawang putih + minyak kelapa (topikal, antimikroba)

#### Kurap / Panu (3 formula):
- Lengkuas + bawang putih (topikal, antifungal kuat)
- Daun sirih + kapur sirih (topikal, antiseptik)
- Kunyit + jeruk nipis (topikal, antifungal ringan)

#### Koreng / Luka Infeksi (2 formula):
- Lidah buaya gel + kunyit (topikal, wound healing ev. B)
- Daun binahong + madu (topikal, antibakteri)

#### Bau Badan (2 formula):
- Daun sirih segar (digosok, antiseptik tubuh)
- Rebusan daun sirih + belimbing wuluh (mandi, deodoran alami)

---

### Kategori 5: RELAKSASI & SARAF (~8 formula)

#### Insomnia / Susah Tidur (3 formula):
- Pala + susu hangat + madu (sedatif ringan, Myristica)
- Daun kemangi + chamomile kering (jika tersedia) + madu
- Bunga lavender lokal + serai (aromaterapi + seduhan)

#### Badan Lelah / Kelelahan Fisik (3 formula):
- Jahe merah + temulawak + madu (tonik + adaptogen)
- Wedang Uwuh (jahe, cengkeh, kayu secang, kayu manis) — ev. C tapi sangat populer
- Kencur + beras + gula merah (beras kencur) — ev. C, tonik fisik

#### Stres / Kecemasan (2 formula):
- Pegagan + jahe + madu (adaptogen, sirkulasi otak)
- Daun mengkudu + madu (relaksasi ringan)

---

### Kategori 6: HEMATOLOGI (~8 formula)

#### Anemia (4 formula):
- Daun kelor (rebus/kukus) + perasan jeruk nipis (bioavailabilitas Fe meningkat)
- Bayam merah + wortel + bit (jus, kaya zat besi)
- Kurma + madu + susu (kaya Fe + B12)
- Temulawak + kacang hijau (tonik darah, tradisional)

#### Perdarahan Ringan (4 formula):
- Kulit delima + daun jambu biji (astringen, hemostasis)
- Daun pepaya (rebus, trombosit — khususnya untuk dengue pendukung)
- Akar alang-alang + kunyit (perdarahan internal ringan)
- Daun binahong (topikal untuk luka berdarah)

---

### Format Output `formulas_B.json`:
```json
{
  "metadata": {
    "generatedBy": "Claude CLI #2",
    "generatedAt": "YYYY-MM-DD",
    "categories": ["pencernaan", "imunitas", "antiinflamasi", "dermatologi", "relaksasi", "hematologi"],
    "totalFormulas": 68,
    "evidenceBasis": "FOHAI Kemenkes RI, WHO Monographs, Saintifikasi Jamu, Farmakope Herbal Indonesia"
  },
  "formulas": [
    {
      "recipeNumber": null,
      "name": "Wedang Jahe Kencur Anti-Kembung",
      "indications": ["perut-kembung", "mual", "pencernaan"],
      "category": "pencernaan",
      "ingredients": [
        { "herb": "Jahe segar", "latinName": "Zingiber officinale Rosc.", "amount": 20, "unit": "gram", "condition": "segar, memarkan" },
        { "herb": "Kencur segar", "latinName": "Kaempferia galanga L.", "amount": 10, "unit": "gram", "condition": "segar, memarkan" },
        { "herb": "Gula merah", "latinName": null, "amount": 1, "unit": "sendok makan", "condition": "serut halus" }
      ],
      "preparationMethod": "Memarkan jahe dan kencur. Rebus dengan 2 gelas air (400ml) hingga mendidih ± 10 menit. Masukkan gula merah, aduk rata hingga larut. Saring dan sajikan hangat.",
      "preparationType": "rebus",
      "dosage": "Minum 1 gelas selagi hangat.",
      "frequency": "2-3x sehari atau saat perut kembung",
      "duration": "Sesuai kebutuhan (gejala akut)",
      "warnings": [
        "Tidak untuk penderita GERD atau tukak lambung aktif (jahe dapat memperburuk)",
        "Batasi pada ibu hamil trimester pertama"
      ],
      "isTopical": false,
      "evidenceLevel": "B",
      "doctorVerified": false,
      "source": "Adaptasi dari FOHAI Kemenkes RI + Saintifikasi Jamu",
      "tags": ["pencernaan", "perut-kembung", "mual", "jahe", "kencur", "rebus", "minuman-hangat"]
    }
  ]
}
```

> 💡 Untuk formula **topikal** (dioles/ditempel): set `"isTopical": true`
> 💡 `preparationType`: `rebus` `seduh` `tumbuk` `tempel` `mandi` `peras` `olesan`

---

## 📋 TASK #2 — Enrichment OCR (Mulai Setelah data/ocr/raw_formulas.json Ada)

### Cek Dulu Ketersediaan File:
```
Cek apakah file ada: data/ocr/raw_formulas.json
Cek progress.md untuk update dari Claude Desktop
```

Jika belum ada → **lanjut Task #1 dulu**, kembali ke Task #2 nanti.

### Yang Dilakukan:
Baca setiap resep dari `data/ocr/raw_formulas.json` → tambahkan field yang kurang → simpan ke `data/claude2/enriched_ocr.json`

### Field yang Ditambahkan ke Setiap Resep OCR:
```json
{
  "...semua field dari OCR tetap dipertahankan apa adanya...",

  "latinNames": {
    "Sidaguri": "Sida rhombifolia L.",
    "Tempuyung": "Sonchus arvensis L."
  },
  "preparationType": "rebus",
  "isTopical": false,
  "duration": "14 hari",
  "tags": ["asam-urat", "sidaguri", "rebus"],
  "evidenceLevel": "C",
  "enrichedBy": "Claude CLI #2",
  "enrichedAt": "YYYY-MM-DD"
}
```

### Aturan Enrichment:
1. **Jangan ubah** field original OCR (recipeNumber, ingredients raw, cara, dll)
2. **Tambahkan saja** field baru di samping field existing
3. Prioritas enrichment:
   - `latinName` untuk setiap ingredient
   - `preparationType` (rebus/seduh/tumbuk/tempel/mandi/peras)
   - `isTopical` (true/false)
   - `duration` standar (14 hari / sesuai kebutuhan)
   - `tags` (lowercase, pakai "-")
   - `evidenceLevel: "C"` untuk semua resep dari buku (empiris)
4. Untuk `warnings` yang menyebut nama penyakit/kondisi → tambahkan kode ICD-10 jika diketahui

---

## 📝 Update Progress

Update `data/progress.md` setiap selesai satu bagian:

```
## Claude CLI #2 — Update
- [2026-03-22 10:00] Mulai Task #1: formulas_B.json
- [2026-03-22 12:00] Selesai kategori Pencernaan (15 formula)
- [2026-03-22 14:00] Selesai kategori Imunitas (15 formula)
- [2026-03-22 16:00] Selesai Anti-inflamasi + Dermatologi (22 formula)
- [2026-03-22 18:00] Selesai Relaksasi + Hematologi (16 formula)
- [2026-03-22 18:05] Task #1 SELESAI — formulas_B.json (68 formula)
- [2026-03-23 09:00] raw_formulas.json dari Claude Desktop tersedia, mulai Task #2
- [2026-03-23 17:00] Task #2 SELESAI — enriched_ocr.json siap
- [2026-03-23 17:01] DONE.flag dibuat
```

Saat semua selesai → buat `data/claude2/DONE.flag`.

---

## ⚠️ Aturan Wajib

| | Boleh | Tidak Boleh |
|-|-------|-------------|
| Folder | `data/claude2/` | `www/`, `data/ocr/`, `data/claude1/`, `data/final/` |
| Baca | File manapun | — |
| Aksi | Buat/edit JSON di claude2/ | Edit `data/ocr/raw_formulas.json` langsung |
| Seeding | — | Langsung akses Firestore |

---

*Instruksi dari Claude Code. Mulai dari Task #1 (formulas_B.json) sambil menunggu OCR dari Claude Desktop.*
