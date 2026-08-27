# CLAUDE_CODE_ML_TASKS.md
<!-- Instruksi eksklusif untuk Claude Code — Fase 2: Health Intelligence -->
<!-- Disiapkan oleh: Claude Desktop | 22 Maret 2026 -->
<!-- Baca COORDINATION.md terlebih dahulu sebelum memulai -->

---

## 📌 KONTEKS SINGKAT

Fase 1 (herbal database) sudah selesai. Sekarang Fase 2: membangun sistem **Health Intelligence** — kuesioner kesehatan + engine prediksi risiko penyakit + integrasi sensor. Dataset yang digunakan: 10 dataset kaggle (280.550 baris), termasuk WESAD untuk deteksi stres dari sensor GSR.

**Panduan teknis lengkap:** baca `herboratech_ml_guide.docx`
**Rencana kerja detail (dengan kode):** baca `claude_code_plan.docx`
**File ini:** ringkasan perintah yang langsung bisa dieksekusi

---

## ✅ SUDAH SELESAI (Fase 1 — JANGAN DIUBAH)

| File | Status |
|------|--------|
| `www/shared/firebase.js` | ✅ Ada 5 metode VDB herbal |
| `www/admin/import-herbal.html` | ✅ Import + OCR cleaning |
| `www/patient/herbal.html` | ✅ Pagination, filter, tab |
| `www/patient/herbal-formula.html` | ✅ Schema baru + disclaimer |
| `www/patient/disease-risk.html` | ✅ Rekomendasi herbal |
| `scripts/merge_herbals.js` | ✅ Siap dijalankan |
| `data/ocr/raw_formulas.json` | ✅ 941 resep (READ ONLY) |
| `data/tcm_mkg/herboratech_enriched.json` | ✅ 32 tanaman (READ ONLY) |

---

## 🔵 BATCH 1 — Firestore + Kuesioner Kesehatan
**Mulai sekarang. Tidak ada dependensi.**

### 1.A — Tambah 8 metode baru di `www/shared/firebase.js`

Tambahkan di bawah metode herbal yang sudah ada (JANGAN hapus yang lama):

```javascript
// ── HEALTH PROFILE ──────────────────────────────────────────────────
VDB.saveHealthProfile = async (userId, profileData) => {
  const bmi = profileData.weightKg && profileData.heightCm
    ? profileData.weightKg / Math.pow(profileData.heightCm / 100, 2)
    : null;
  const completeness = VDB._calcCompleteness(profileData);
  return db.collection('userHealthProfile').doc(userId).set({
    ...profileData,
    bmi: bmi ? parseFloat(bmi.toFixed(1)) : null,
    profileCompleteness: completeness,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
};

VDB.getHealthProfile = async (userId) => {
  const doc = await db.collection('userHealthProfile').doc(userId).get();
  return doc.exists ? doc.data() : null;
};

VDB.updateHealthSection = async (userId, sectionData) => {
  return db.collection('userHealthProfile').doc(userId).set({
    ...sectionData,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
};

VDB.saveLabResults = async (userId, labData) => {
  return db.collection('userHealthProfile').doc(userId).set({
    labResults: { ...labData, labDate: firebase.firestore.FieldValue.serverTimestamp() },
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
};

VDB.saveRiskScore = async (userId, scores) => {
  return db.collection('userHealthProfile').doc(userId)
    .collection('riskScores').add({
      ...scores,
      calculatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
};

VDB.getLatestRiskScore = async (userId) => {
  const snap = await db.collection('userHealthProfile').doc(userId)
    .collection('riskScores')
    .orderBy('calculatedAt', 'desc').limit(1).get();
  return snap.empty ? null : snap.docs[0].data();
};

VDB.getRiskScoreHistory = async (userId, limitN = 30) => {
  const snap = await db.collection('userHealthProfile').doc(userId)
    .collection('riskScores')
    .orderBy('calculatedAt', 'desc').limit(limitN).get();
  return snap.docs.map(d => d.data());
};

VDB._calcCompleteness = (p) => {
  const required = ['dateOfBirth','gender','heightCm','weightKg','waistCircumferenceCm',
    'smokingStatus','exerciseFreqPerWeek','sleepHoursPerNight',
    'sugarIntake','saltIntake','familyHistory','knownConditions'];
  const filled = required.filter(k => p[k] !== undefined && p[k] !== null);
  return Math.round((filled.length / required.length) * 100);
};
```

**Schema Firestore lengkap** → lihat `claude_code_plan.docx` Section 3.1

---

### 1.B — Buat `www/patient/health-profile.html`

Form kuesioner 5 langkah (step wizard). Ikuti desain neumorphic dari halaman lain (contoh: `lifestyle.html`).

**5 Step yang harus ada:**

| Step | Tab | Field Wajib |
|------|-----|-------------|
| A | Profil Dasar | Tanggal lahir, jenis kelamin, tinggi (slider), berat (slider), lingkar pinggang (slider) + BMI otomatis real-time |
| B | Gaya Hidup | Status merokok (radio), alkohol (radio), frekuensi olahraga (slider 0-7x/minggu), intensitas (radio), jam tidur (slider 4-12), kualitas tidur (slider 1-10), konsumsi gula (radio), konsumsi garam (radio), jenis pekerjaan (radio) |
| C | Riwayat Keluarga | 4 toggle: Jantung / Diabetes / Hipertensi / Stroke (default: tidak) |
| D | Kondisi Diketahui | 5 toggle: HT didiagnosis / DM didiagnosis / Kolesterol tinggi / Pernah serangan jantung / Sedang minum obat BP |
| E | Hasil Lab (opsional) | Gula darah puasa, HbA1c, Kolesterol total, HDL, LDL, Trigliserida, TD Sistolik, TD Diastolik, Asam Urat, Kreatinin, Tanggal lab |

**Behaviour:**
- Progress bar di atas (Step X dari 5)
- Setiap klik "Lanjut" → simpan ke Firestore via `VDB.updateHealthSection()`
- Saat halaman dimuat → load data tersimpan dengan `VDB.getHealthProfile()` untuk pre-fill
- BMI dihitung otomatis dan ditampilkan real-time saat user geser slider tinggi/berat
- Setelah Step D: tampilkan tombol **"Hitung Risiko Saya →"** (link ke `health-dashboard.html`)
- Step E bersifat opsional, ada tombol "Lewati" di setiap field

---

### 1.C — Update `firestore.indexes.json`

Tambahkan (jangan hapus index yang sudah ada):

```json
{
  "collectionGroup": "riskScores",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "calculatedAt", "order": "DESCENDING" }
  ]
}
```

---

### 1.D — Update navigasi di `www/patient/home.html`

Tambahkan link ke `health-profile.html` di menu cepat atau navigasi bawah. Label: **"Profil Kesehatan"**, gunakan ikon yang sesuai gaya neumorphic.

---

## 🔵 BATCH 2 — Risk Engine Rule-Based
**Mulai setelah Batch 1 selesai.**

### 2.A — Buat `www/shared/risk-engine.js`

File baru. Kelas `RiskEngine` dengan 6 model scoring + helper. Interface wajib:

```javascript
// Interface publik yang HARUS diimplementasikan:
RiskEngine.calculateAll(profile)    // → { metabolic, diabetes, heart, hypertension, stroke, sleep, ... }
RiskEngine.metabolicScore(profile)  // → { score: 0-100, category: 'low'|'medium'|'high', factors: [] }
RiskEngine.diabetesScore(profile)   // → idem
RiskEngine.heartScore(profile)      // → idem
RiskEngine.hypertensionScore(profile) // → idem
RiskEngine.strokeScore(profile)     // → idem
RiskEngine.sleepScore(profile)      // → idem
RiskEngine.getTopConditions(scores) // → string[] kondisi untuk query herbal
RiskEngine.loadModels()             // → Promise (stub dulu, diisi di Batch 5)

// Di setiap scoring method, factors[] berisi string penjelasan:
// Contoh: ["BMI 27.3 — di atas normal", "Jarang berolahraga (1x/minggu)"]
```

**Bobot scoring lengkap** → lihat `claude_code_plan.docx` Section 4.1 tabel "Logika Scoring per Model"

```javascript
// Mapping risiko ke kondisi herbal (wajib ada):
RiskEngine.RISK_TO_CONDITION_MAP = {
  metabolic:    ['Sindrom Metabolik', 'Obesitas', 'Asam Urat', 'Kolesterol'],
  diabetes:     ['Diabetes Melitus', 'Gula Darah Tinggi', 'Prediabetes'],
  heart:        ['Jantung Koroner', 'Kolesterol', 'Hipertensi'],
  hypertension: ['Hipertensi', 'Tekanan Darah Tinggi'],
  stroke:       ['Stroke', 'Hipertensi', 'Kolesterol'],
  sleep:        ['Insomnia', 'Gangguan Tidur', 'Stres'],
};
```

---

### 2.B — Update `www/patient/disease-risk.html`

Integrasikan `risk-engine.js`:
1. Tambahkan `<script src="../shared/risk-engine.js"></script>` di head
2. Saat halaman load → `VDB.getHealthProfile(userId)` → jika null: tampilkan CTA ke `health-profile.html`
3. Jika profil ada → `RiskEngine.calculateAll(profile)` → `VDB.saveRiskScore(userId, scores)`
4. Tampilkan 6 gauge/progress bar berwarna (hijau < 33 / kuning 33–66 / merah > 66)
5. Di bawah setiap gauge: tampilkan `factors[]` sebagai chip/tag kecil
6. Pertahankan seksi rekomendasi herbal yang sudah ada — sekarang gunakan `RiskEngine.getTopConditions(scores)` untuk query yang lebih tepat

---

## 🔵 BATCH 3 — Dashboard & Integrasi
**Mulai setelah Batch 2 selesai.**

### 3.A — Buat `www/patient/health-dashboard.html`

Halaman pusat Health Intelligence. 6 seksi utama:

| Seksi | Konten |
|-------|--------|
| Header | Foto profil, nama, BMI badge, progress bar completeness |
| Risk Cards | 6 kartu risiko mini (gauge + kategori + tanggal hitung) |
| Tren | Line chart 30 hari — gunakan library chart yang sudah ada di project |
| Faktor Aktif | Daftar faktor risiko tertinggi dari semua model |
| Rekomendasi Herbal | Top 3 formula herbal berdasarkan `getTopConditions()` |
| Aksi Cepat | Tombol: Update Profil / Hitung Ulang / Detail Herbal / Booking Dokter |

---

### 3.B — Update `www/doctor/patient-detail.html`

Tambahkan seksi baru **"Risk Assessment"**:
- 6 badge risiko berwarna
- Tabel faktor risiko utama
- Link ke profil kesehatan lengkap pasien

---

### 3.C — Buat `www/admin/ml-models.html`

Halaman admin untuk monitoring status model:
- Tabel 7 model (6 risiko + 1 stress) dengan status: tersedia/belum
- Jika tersedia: tampilkan versi, akurasi, tanggal training dari `www/models/{name}/metadata.json`
- Tampilkan versi engine aktif: "Rule-Based v1.0" atau "TF.js vX.X"

---

## 🟠 BATCH 4 — Sensor Integration
**TUNGGU konfirmasi Andre bahwa hardware siap.**

Ketika siap, buat:
- `www/shared/sensor-ble.js` — Web Bluetooth handler (MAX30102 + GSR)
- `www/shared/stress-monitor.js` — GSR processing → stress score
- `www/patient/sensor-monitor.html` — halaman monitoring realtime

Detail implementasi lengkap → `claude_code_plan.docx` Section 6

---

## 🟠 BATCH 5 — TF.js Model Integration
**TUNGGU sinyal dari Claude Desktop di `data/progress.md`.**

Signal yang harus dicari:
```
- [2026-XX-XX] Claude Desktop — ✅ TF.js models SIAP di data/ml_models/tfjs/
```

Ketika sinyal diterima:
1. Salin `data/ml_models/tfjs/*` → `www/models/*`
2. Upgrade `risk-engine.js` → gunakan TF.js inference dengan fallback rule-based
3. Upgrade `stress-monitor.js` → gunakan model WESAD
4. Update `admin/ml-models.html` → tampilkan status model live

Detail teknis → `claude_code_plan.docx` Section 7

---

## 📝 CARA UPDATE PROGRESS

Setelah selesai setiap tugas, tambahkan log di `data/progress.md`:

```markdown
## 🔵 Claude Code — Implementation Log
- [2026-XX-XX HH:MM] ✅ Batch 1.A — firebase.js: +8 metode health profile
- [2026-XX-XX HH:MM] ✅ Batch 1.B — health-profile.html: form 5 step selesai
- [2026-XX-XX HH:MM] ✅ Batch 2.A — risk-engine.js: 6 model rule-based
- [2026-XX-XX HH:MM] ✅ Batch 2.B — disease-risk.html: RiskEngine terintegrasi
- [2026-XX-XX HH:MM] ✅ firebase deploy — Batch 1+2 live
```

**Setelah setiap batch: lakukan `firebase deploy` dan test di browser.**

---

## ⚡ QUICK REFERENCE — File Baru yang Harus Dibuat

| File | Batch | Keterangan |
|------|-------|-----------|
| `www/patient/health-profile.html` | 1 | Form kuesioner 5 langkah |
| `www/shared/risk-engine.js` | 2 | Engine scoring 6 penyakit |
| `www/patient/health-dashboard.html` | 3 | Dashboard utama |
| `www/admin/ml-models.html` | 3 | Status model TF.js |
| `www/shared/sensor-ble.js` | 4 | Web Bluetooth handler |
| `www/shared/stress-monitor.js` | 4 | GSR → stress score |
| `www/patient/sensor-monitor.html` | 4 | Monitoring realtime |
| `www/models/*/` | 5 | TF.js model files |

---

*Disiapkan oleh Claude Desktop berdasarkan analisis 10 dataset Kaggle + WESAD.*
*Panduan teknis lengkap: herboratech_ml_guide.docx + claude_code_plan.docx*
