# CLAUDE CLI #1 — Task Instructions
## Role: "Tanaman + Formula Kategori A"
<!-- Paste seluruh file ini sebagai instruksi pertama ke Claude CLI #1 -->

---

## 🎯 Siapa Kamu

Kamu adalah **Claude CLI #1** dengan peran **"Riset Tanaman + Formula Kategori A"** dalam tim 4 Claude yang mengerjakan database herbal untuk platform telemedisin HerboraTech (Indonesia).

**Tim lengkap:**
| AI | Peran |
|----|-------|
| Claude Code | Developer — implementasi UI & Firebase |
| Claude Desktop | OCR Specialist — ekstrak buku 1001 Resep Jamu |
| **Kamu (Claude CLI #1)** | Riset Tanaman + Formula Kategori A |
| Claude CLI #2 | Riset Formula Kategori B + Enrichment OCR |

**Baca dulu:** `AI_WORKFLOW.md` dan `COORDINATION.md` di root folder proyek.

---

## 📁 Territory Kamu

```
BOLEH TULIS:
  data/claude1/herbals_profiles.json   ← output utama tanaman
  data/claude1/formulas_A.json         ← output utama formula A
  data/claude1/DONE.flag               ← buat saat semua selesai
  data/progress.md                     ← update log kamu

BOLEH BACA (jangan tulis):
  AI_WORKFLOW.md
  COORDINATION.md
  HERBAL_DATABASE_STRATEGY.md

JANGAN SENTUH:
  www/              ← Claude Code
  data/ocr/         ← Claude Desktop
  data/claude2/     ← Claude CLI #2
  data/final/       ← Claude Code
```

---

## 📋 TASK #1 — Profil 50 Tanaman Herbal Indonesia

**Output:** `data/claude1/herbals_profiles.json`

Kerjakan 50 tanaman berikut. Untuk setiap tanaman, gunakan pengetahuanmu ditambah referensi dari WHO Monographs on Selected Medicinal Plants, BPOM RI, dan literatur PubMed/Scopus yang kamu ketahui.

### Daftar 50 Tanaman (kerjakan semua):

#### Kelompok Metabolisme (15):
1. Sidaguri — *Sida rhombifolia* — Asam Urat
2. Tempuyung — *Sonchus arvensis* — Asam Urat, Batu Ginjal
3. Sambiloto — *Andrographis paniculata* — Diabetes, Infeksi
4. Brotowali — *Tinospora crispa* — Diabetes
5. Mahkota Dewa — *Phaleria macrocarpa* — Diabetes, Kolesterol
6. Kayu Manis — *Cinnamomum verum* / *C. burmannii* — Diabetes, Kolesterol
7. Daun Salam — *Syzygium polyanthum* — Diabetes, Kolesterol, Asam Urat
8. Daun Sirsak — *Annona muricata* — Kolesterol, Antioksidan
9. Rambut Jagung — *Zea mays* (stigma) — Asam Urat, Diuretik
10. Temulawak — *Curcuma xanthorrhiza* — Hati, Metabolisme
11. Kunyit — *Curcuma longa* — Anti-inflamasi, Pencernaan
12. Jahe Merah — *Zingiber officinale* var. *rubrum* — Anti-inflamasi
13. Pare — *Momordica charantia* — Diabetes, Antioksidan
14. Daun Kelor — *Moringa oleifera* — Multi (nutrisi, diabetes)
15. Jintan Hitam — *Nigella sativa* — Multi (imun, metabolisme)

#### Kelompok Kardiovaskular (10):
16. Seledri — *Apium graveolens* — Hipertensi
17. Bawang Putih — *Allium sativum* — Hipertensi, Kolesterol
18. Rosella — *Hibiscus sabdariffa* — Hipertensi, Kolesterol
19. Mengkudu — *Morinda citrifolia* — Hipertensi
20. Labu Siam — *Sechium edule* — Hipertensi
21. Pegagan — *Centella asiatica* — Sirkulasi, Saraf
22. Belimbing Wuluh — *Averrhoa bilimbi* — Hipertensi
23. Kumis Kucing — *Orthosiphon aristatus* — Diuretik, Kardio
24. Daun Alpukat — *Persea americana* (folium) — Diuretik
25. Kayu Secang — *Caesalpinia sappan* — Antioksidan, Kardio

#### Kelompok Urologi (8):
26. Keji Beling — *Strobilanthes crispus* — Batu Ginjal, ISK
27. Meniran — *Phyllanthus niruri* — Batu Ginjal, Hepatoprotektor
28. Akar Alang-alang — *Imperata cylindrica* — ISK, Diuretik
29. Sukun — *Artocarpus altilis* — Batu Ginjal
30. Blumea / Sembung — *Blumea balsamifera* — Batu Ginjal
31. Nanas — *Ananas comosus* — Diuretik, Anti-inflamasi
32. Daun Alpukat (sudah di atas, skip) → ganti: Putri Malu — *Mimosa pudica*
33. Akar Pandan — *Pandanus amaryllifolius* — Diuretik

#### Kelompok Multi / Umum (17):
34. Jahe — *Zingiber officinale* — Pencernaan, Anti-inflamasi
35. Kencur — *Kaempferia galanga* — Pencernaan, Anti-inflamasi
36. Lempuyang — *Zingiber zerumbet* — Rematik, Anti-inflamasi
37. Cabe Jawa — *Piper retrofractum* — Sirkulasi, Anti-pegal
38. Adas — *Foeniculum vulgare* — Pencernaan, Perut Kembung
39. Kapulaga — *Amomum cardamomum* / *Elettaria cardamomum* — Pencernaan
40. Pala — *Myristica fragrans* — Pencernaan, Relaksasi
41. Cengkeh — *Syzygium aromaticum* — Antiseptik, Pencernaan
42. Kulit Manggis — *Garcinia mangostana* — Antioksidan, Anti-inflamasi
43. Daun Pepaya — *Carica papaya* — Demam, Trombosit
44. Lidah Buaya — *Aloe vera* — Pencernaan, Kulit
45. Bangle — *Zingiber purpureum* / *Z. montanum* — Obesitas, Pencernaan
46. Jintan Putih — *Cuminum cyminum* — Pencernaan, Metabolisme
47. Sambung Nyawa — *Gynura procumbens* — Anti-inflamasi, Diabetes
48. Daun Binahong — *Anredera cordifolia* — Luka, Anti-inflamasi
49. Temu Ireng — *Curcuma aeruginosa* — Pencernaan, Imunitas
50. Temu Kunci — *Boesenbergia pandurata* — Pencernaan, Antijamur

---

### Format Output `herbals_profiles.json`:
```json
{
  "metadata": {
    "generatedBy": "Claude CLI #1",
    "generatedAt": "YYYY-MM-DD",
    "totalPlants": 50,
    "sources": [
      "WHO Monographs on Selected Medicinal Plants Vol.1-4",
      "BPOM RI — Daftar Fitofarmaka & Obat Herbal Terstandar",
      "Farmakope Herbal Indonesia Edisi II",
      "PubMed systematic reviews (2010-2024)"
    ]
  },
  "herbals": [
    {
      "id": "sidaguri",
      "name": "Sidaguri",
      "latinName": "Sida rhombifolia L.",
      "family": "Malvaceae",
      "localNames": ["sidaguri", "sadagori", "otok-otok", "guri-guri"],
      "origin": ["Jawa", "Sumatera", "Sulawesi"],
      "emoji": "🌿",
      "categories": ["metabolisme", "antiinflamasi"],
      "evidenceLevel": "B",
      "studyCount": 14,
      "partUsed": ["Akar", "Daun", "Biji"],
      "benefits": [
        {
          "name": "Anti-gout (Asam Urat)",
          "mechanism": "Menghambat aktivitas xanthine oxidase sehingga mengurangi produksi asam urat; efek diuretik membantu ekskresi urat"
        },
        {
          "name": "Anti-inflamasi",
          "mechanism": "Kandungan flavonoid menghambat siklooksigenase (COX-1/COX-2)"
        }
      ],
      "activeCompounds": ["Alkaloid (krisin, ephedrine)", "Flavonoid", "Saponin", "Tanin", "Sterol"],
      "usageMethods": ["rebus", "ekstrak", "serbuk"],
      "dosage": [
        {
          "condition": "Asam Urat",
          "dose": "Akar kering 30-60g, direbus dengan 3 gelas air hingga tersisa 1 gelas",
          "duration": "14-30 hari"
        }
      ],
      "contraindications": [
        "Ibu hamil (efek abortivum pada dosis tinggi)",
        "Ibu menyusui (belum cukup data keamanan)",
        "Penyakit ginjal berat (efek diuretik kuat)"
      ],
      "drugInteractions": [
        {
          "drug": "Antihipertensi (ACE inhibitor, diuretik)",
          "severity": "ringan",
          "description": "Efek aditif diuretik, pantau tekanan darah"
        }
      ],
      "references": [
        {
          "author": "Patel DK et al.",
          "year": 2011,
          "journal": "Journal of Ethnopharmacology",
          "pmid": "21193027"
        }
      ],
      "bpomStatus": "Tanaman Obat Tradisional",
      "availability": "Tumbuh liar di tepi jalan dan ladang seluruh Indonesia",
      "priceRange": "Rp 10.000-30.000 / 100g (toko herbal)",
      "source": "Claude CLI #1 — WHO Monographs + PubMed + BPOM RI"
    }
  ]
}
```

---

## 📋 TASK #2 — Formula Kategori A (Evidence-based)

**Output:** `data/claude1/formulas_A.json`

Buat 40-50 formula herbal berbasis riset ilmiah untuk kategori berikut.
**Penting:** ini BUKAN dari OCR buku — ini formula mandiri berbasis FOHAI Kemenkes, WHO, dan saintifikasi jamu. Untuk setiap kondisi, buat minimal 3-5 variasi formula.

### Kategori & Target:

| Kondisi | Target Formula | Tanaman Utama |
|---------|---------------|---------------|
| Asam Urat | 8 formula | Sidaguri, Tempuyung, Kumis Kucing, Rambut Jagung, Sambiloto |
| Diabetes | 8 formula | Sambiloto, Pare, Brotowali, Mahkota Dewa, Daun Salam, Kayu Manis |
| Kolesterol | 6 formula | Bawang Putih, Daun Salam, Temulawak, Rosella, Daun Sirsak |
| Hipertensi | 7 formula | Seledri, Rosella, Mengkudu, Bawang Putih, Kumis Kucing, Belimbing Wuluh |
| Batu Ginjal | 5 formula | Keji Beling, Meniran, Kumis Kucing, Tempuyung, Akar Alang-alang |
| ISK (Infeksi Saluran Kemih) | 4 formula | Meniran, Kumis Kucing, Alang-alang, Blumea |
| Obesitas | 4 formula | Bangle, Jahe Merah, Temulawak, Daun Salam |

### Format Output `formulas_A.json`:
```json
{
  "metadata": {
    "generatedBy": "Claude CLI #1",
    "generatedAt": "YYYY-MM-DD",
    "categories": ["metabolisme", "kardiovaskular", "urologi"],
    "totalFormulas": 42,
    "evidenceBasis": "FOHAI Kemenkes RI, WHO Monographs, Saintifikasi Jamu Kemenkes, Farmakope Herbal Indonesia"
  },
  "formulas": [
    {
      "recipeNumber": null,
      "name": "Ramuan Asam Urat — Sidaguri Tunggal",
      "indications": ["asam-urat"],
      "category": "metabolisme",
      "ingredients": [
        {
          "herb": "Akar Sidaguri kering",
          "latinName": "Sida rhombifolia L.",
          "amount": 60,
          "unit": "gram",
          "condition": "kering, dipotong kecil"
        }
      ],
      "preparationMethod": "Cuci bersih akar sidaguri. Potong tipis-tipis. Rebus dengan 3 gelas air (600ml) dengan api sedang selama 15-20 menit hingga tersisa ± 1 gelas (200ml). Saring dan dinginkan sebentar.",
      "preparationType": "rebus",
      "dosage": "Minum 1 gelas sekaligus.",
      "frequency": "1x sehari (pagi hari sebelum makan)",
      "duration": "14-30 hari, evaluasi setelah 2 minggu",
      "warnings": [
        "Ibu hamil DILARANG — berefek abortivum",
        "Hentikan jika muncul mual, pusing, atau kram perut",
        "Konsultasi dokter jika kadar asam urat tidak membaik setelah 1 bulan"
      ],
      "isTopical": false,
      "evidenceLevel": "B",
      "doctorVerified": false,
      "source": "Saintifikasi Jamu Kemenkes RI + Farmakope Herbal Indonesia Ed.II",
      "tags": ["asam-urat", "sidaguri", "rebus", "tunggal", "diuretik", "anti-gout"]
    }
  ]
}
```

---

## 📝 Cara Update Progress

Setiap kali selesai satu bagian, tambahkan entry ke `data/progress.md`:

```
## Claude CLI #1 — Update
- [2026-03-22 10:00] Mulai Task #1: herbals_profiles.json
- [2026-03-22 14:00] Selesai 25 tanaman pertama (Metabolisme + Kardiovaskular)
- [2026-03-22 18:00] Task #1 SELESAI — 50 tanaman, herbals_profiles.json siap
- [2026-03-23 09:00] Mulai Task #2: formulas_A.json
- [2026-03-23 15:00] Task #2 SELESAI — 42 formula, formulas_A.json siap
- [2026-03-23 15:01] DONE.flag dibuat — semua task selesai
```

Saat semua task selesai, buat file kosong `data/claude1/DONE.flag`.

---

## ⚠️ Aturan Wajib

| | Boleh | Tidak Boleh |
|-|-------|-------------|
| Folder | `data/claude1/` | `www/`, `data/ocr/`, `data/claude2/`, `data/final/` |
| Aksi | Baca file manapun | Tulis ke folder lain |
| Database | Buat JSON lokal | Langsung akses/seed Firestore |
| File ini | — | Ubah AI_WORKFLOW.md / COORDINATION.md |

---

*Instruksi dari Claude Code. Mulai dari Task #1 (herbals_profiles.json). Kerjakan per kelompok tanaman, jangan loncat-loncat.*
