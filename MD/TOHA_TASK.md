# TOHA_TASK.md — Batch Task untuk Programmer Toha
> **Update:** 2026-03-22 · Dibuat oleh Claude Code
> **Stack:** HTML/CSS/JS + Firebase Firestore/Auth (compat SDK 10.12.2) + Neumorphic design system

---

## STATUS SEBELUMNYA (Sudah Dikerjakan Claude Code)

| Task | File | Status |
|------|------|--------|
| AI Health Chat | `patient/ai-chat.html` | ✅ Selesai — perlu Gemini API key |
| Tab switching dokter | `doctor/chat.html` | ✅ Selesai |
| Fix save profil dokter | `doctor/edit-profile.html` | ✅ Selesai |
| Tambah phone + redirect | `patient/edit-profile.html` | ✅ Selesai |
| Health Intelligence System | `shared/risk-engine.js`, `patient/health-dashboard.html`, dll | ✅ Selesai |
| Admin ML Models | `admin/ml-models.html` | ✅ Selesai |

---

## RINGKASAN TEMUAN — Apa yang Belum Ada

### Onboarding/Personalisasi
`welcome.html` = hanya animasi intro visual (THREE.js). Setelah register, user langsung ke home
**tanpa pernah ditanya info dasar apapun**. Tidak ada wizard "kenali saya dulu".

### Status CRUD Admin
| Halaman | Create | Read | Update | Delete | Status |
|---------|--------|------|--------|--------|--------|
| users.html | ✅ | ✅ | via detail | via detail | |
| user-detail.html | — | ✅ | ✅ real | ❌ **FAKE** (toast saja) | Suspend juga fake |
| doctor-verification.html | — | ✅ | ✅ | — | |
| news.html | ✅ | ✅ | ✅ | ✅ | Lengkap |
| notifications.html | ✅ | ✅ | — | ✅ | |
| advertise.html | ✅ | ✅ | ✅ | ✅ | Lengkap |
| **herbals** | ❌ | ❌ | ❌ | ❌ | **Halaman belum ada** |
| **herbal formulas** | ❌ | ❌ | ❌ | ❌ | **Halaman belum ada** |
| **consultations** | — | ❌ | — | — | **Halaman belum ada** |
| **reports/export** | — | ❌ | — | — | **Halaman belum ada** |
| **settings** | — | ❌ | ❌ | — | **Halaman belum ada** |

---

# 📅 JADWAL EKSEKUSI OPTIMAL (Off-Peak Anthropic Promo — s/d 27 Maret 2026)

**Current date: 24 Maret 2026 (Selasa)**
**Zona waktu Anda: WIB (UTC+7)**

## Tabel Off-Peak Hours — 2x Usage Limit

| Kapan | Jam WIB | Status Usage | Rekomendasi |
|-------|---------|-------------|-------------|
| **Weekdays (Senin–Jumat)** | **01:00–19:00** | ✅ **2x limit** | 🚀 Eksekusi Batch berat (8, 9, 12, 13) |
| **Weekdays (Senin–Jumat)** | **19:00–01:00** | ⚠️ Normal | 📝 Task ringan, review, dokumentasi |
| **Weekends (Sabtu–Minggu)** | **24 jam** | ✅ **2x limit** | 🏆 Heavy lifting, ML training |

## Jadwal Recommended Execution

```
HARI INI (Selasa 24 Mar 2026):
  19:00–01:00 WIB: Persiapan, dokumentasi, setup (normal limit OK)

BESOK (Rabu 25 Mar):
  08:00–18:00 WIB: ⭐ Mulai Batch 8 + Batch 9 (2x limit aktif)

KAMIS–JUMAT (26–27 Mar):
  08:00–18:00 WIB: Lanjut Batch 10, 11, 12 (2x limit masih aktif)

AKHIR PEKAN (28–29 Mar):
  Anytime: ⭐ Batch 13 (Vademekum OCR) — Heavy lifting dengan 2x limit full day
  ⚠️ Jika masih ada yang belum selesai: Lanjut dengan 2x limit
```

---

## BATCH 1 — Onboarding Pasien Baru
> **Scope:** 1 file baru + 1 file dimodifikasi
> **Dampak:** Langsung dirasakan semua user baru — paling kritis untuk UX

### File yang dibuat
- `www/patient/onboarding.html` — wizard 4 langkah

### File yang dimodifikasi
- `www/patient/home.html` — tambah cek `onboardingDone` di awal init

---

### 1A — Trigger di `patient/home.html`

Tambahkan di awal async init, **sebelum** render konten:
```javascript
const { user, profile } = await VAuth.guard('patient', 1);
if (!profile.onboardingDone) {
  nav('onboarding.html');
  return;
}
```

---

### 1B — Buat `patient/onboarding.html`

**Wizard 4 Step dengan progress bar** (lihat pola di `patient/health-profile.html`):

**Step 1 — Sapaan**
```
Ikon besar: 🌿 (ion-icon leaf-outline, besar 5rem)
Judul: "Halo, [nama]!"
Sub: "Sebelum mulai, bantu kami mengenal Anda. Hanya 1 menit."
Tombol: [Ayo Mulai →]
```

**Step 2 — Info Dasar**
```
- Tanggal lahir → input type="date"
- Jenis kelamin → 2 tombol visual (Laki-laki / Perempuan) dengan toggle active
- Tinggi badan → range slider 140–200 cm, tampilkan angka live
- Berat badan → range slider 40–130 kg, tampilkan angka live + BMI realtime
Tombol: [Lanjut →]
```

**Step 3 — Tujuan Kesehatan (multi-select, max 3)**
```
Grid chip 2 kolom:
  🎯 Pantau kesehatan rutin
  💊 Kelola kondisi kronis
  🌿 Eksplorasi herbal & jamu
  🏃 Perbaiki gaya hidup
  🩺 Konsultasi dokter mudah
  🧠 Cegah penyakit lebih awal
  😴 Perbaiki kualitas tidur
  ⚖️ Turunkan/naikkan berat badan

Style chip yang dipilih: background gradient + shadow + checkmark ikon
Validasi: minimal 1 harus dipilih
Tombol: [Lanjut →]
```

**Step 4 — Kondisi yang Dipantau (opsional)**
```
Toggle card list:
  ☐ Diabetes / Gula darah
  ☐ Hipertensi / Tekanan darah
  ☐ Kolesterol tinggi
  ☐ Asam urat
  ☐ Jantung
  ☐ Maag / GERD
  ☐ Obesitas / Berat badan

Tombol utama: [Selesai & Mulai →]
Tombol sekunder: [Lewati]  ← kecil, warna abu
```

**Yang disimpan ke Firestore saat Step 4 selesai:**
```javascript
await VDB.updateUser(user.uid, {
  onboardingDone: true,
  healthGoals: selectedGoals,         // array string dari Step 3
  monitoredConditions: selectedConds, // array string dari Step 4
});
await VDB.updatePatient(user.uid, {
  dob: dobValue,
  gender: selectedGender,
  heightCm: heightValue,
  weightKg: weightValue,
});
```

**Setelah simpan:** `nav('home.html?welcome=1')`

Di `home.html`, jika URL ada `?welcome=1`, tampilkan toast: `showToast('Selamat datang di HerboraTech! 🎉', 'success')`

---

## BATCH 2 — Fix Admin: Suspend & Delete User
> **Scope:** 1 file dimodifikasi
> **Dampak:** Admin bisa benar-benar suspend/hapus akun (sekarang hanya toast palsu)

### File yang dimodifikasi
- `www/admin/user-detail.html`

---

### 2A — Fix tombol Suspend

**Cari tombol ini** (di dalam `#suspendModal`):
```html
<button onclick="document.getElementById('suspendModal').classList.remove('open');
  showToast('Akun telah disuspend.','warning')">Suspend Akun</button>
```

**Ganti onclick-nya** jadi panggil function:
```javascript
async function suspendUser() {
  const reason = document.querySelector('#suspendModal textarea')?.value.trim()
    || 'Melanggar kebijakan platform';
  document.getElementById('suspendModal').classList.remove('open');
  try {
    await VDB.updateUser(uid, {
      isActive: false,
      suspended: true,
      suspendedAt: firebase.firestore.FieldValue.serverTimestamp(),
      suspendReason: reason
    });
    // Update UI chip
    const chip = document.getElementById('status-chip');
    chip.textContent = 'Suspended';
    chip.style.cssText = 'background:rgba(235,87,87,0.12);color:#EB5757;';
    document.getElementById('btn-deactivate').style.display = 'none';
    document.getElementById('btn-activate').style.display = '';
    showToast('Akun berhasil disuspend', 'warning');
  } catch (e) {
    showToast('Gagal: ' + (e.message || e), 'error');
  }
}
```

---

### 2B — Fix tombol Delete

**Cari tombol ini:**
```html
<button onclick="showToast('Fitur hapus memerlukan konfirmasi lebih lanjut.','warning')">
```

**Ganti jadi:** tampilkan modal konfirmasi (buat modal baru jika belum ada), lalu:
```javascript
async function deleteUserSoft() {
  document.getElementById('deleteModal').classList.remove('open');
  try {
    await VDB.updateUser(uid, {
      deleted: true,
      isActive: false,
      deletedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast('Akun berhasil dihapus', 'success');
    setTimeout(() => nav('users.html'), 1500);
  } catch (e) {
    showToast('Gagal: ' + (e.message || e), 'error');
  }
}
```

**Modal konfirmasi delete** (tambah di bawah suspendModal):
```html
<div class="modal-overlay" id="deleteModal">
  <div class="modal-box">
    <div class="modal-title" style="color:var(--danger);">
      <ion-icon name="warning-outline"></ion-icon> Hapus Akun?
    </div>
    <p style="font-size:0.8rem;color:var(--text-secondary);margin:12px 0;">
      Akun <strong id="modal-delete-name"></strong> akan dihapus permanen.
      Data konsultasi tetap tersimpan untuk keperluan medis.
    </p>
    <div class="modal-actions">
      <button class="neu-btn neu-btn-sm"
        onclick="document.getElementById('deleteModal').classList.remove('open')">Batal</button>
      <button class="neu-btn-danger neu-btn-sm" onclick="deleteUserSoft()">
        <ion-icon name="trash-outline"></ion-icon> Hapus Akun
      </button>
    </div>
  </div>
</div>
```

---

## BATCH 3 — Admin: Kelola Herbal Catalog
> **Scope:** 1 file baru
> **Dampak:** Admin bisa lihat, edit, dan hapus semua herbal di database

### File yang dibuat
- `www/admin/herbals.html`

---

### Struktur Halaman

**Layout:** Ikuti pola `admin/users.html` (sidebar + topbar + tabel)

**Topbar:**
```
Judul: "Kelola Herbal"
Tombol kanan: [+ Tambah Herbal] → buka modal add / link ke herbal-submit.html
```

**Filter bar** (di atas tabel):
```
- Input search: "Cari nama atau nama latin..."
- Dropdown: Evidence Level → Semua / A / B / C / D
- Dropdown: Kategori → Semua / Antiinflamasi / Antidiabetes / Antihipertensi / dll
```

**Tabel kolom:**
```
Nama | Nama Latin | Kategori | Evidence | Studi | Aksi
```

**Kolom Aksi per baris:**
```
[Edit] [Hapus]
```

---

### Modal Edit Herbal

Field yang bisa diedit:
```
- Nama (input text)
- Nama Latin (input text)
- Evidence Level (select: A/B/C/D)
- Manfaat (textarea, satu per baris)
- Kontraindikasi (textarea, satu per baris)
- Jumlah Studi (number)
- Status BPOM (text)
Tombol: [Simpan Perubahan]
```

---

### Firestore Queries
```javascript
const db = firebase.firestore();

// READ — list paginated
let lastDoc = null;
async function loadHerbals(search = '') {
  let query = db.collection('herbals').orderBy('name', 'asc').limit(25);
  if (lastDoc) query = query.startAfter(lastDoc);
  const snap = await query.get();
  lastDoc = snap.docs[snap.docs.length - 1];
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// UPDATE — edit modal
await db.collection('herbals').doc(herbalId).update({
  name, latinName, evidenceLevel, benefits, contraindications, studyCount
});

// DELETE — dengan konfirmasi modal
await db.collection('herbals').doc(herbalId).delete();
```

---

### Navigasi
Tambah link di sidebar **semua** halaman admin (home, users, news, dll):
```html
<a class="sidebar-item" href="herbals.html">
  <ion-icon name="leaf-outline"></ion-icon>Kelola Herbal
</a>
```

---

## BATCH 4 — Admin: Kelola Formula Jamu
> **Scope:** 1 file baru
> **Dampak:** Admin bisa lihat, buat, edit, dan hapus formula jamu

### File yang dibuat
- `www/admin/herbal-formulas.html`

---

### Struktur Halaman

**Topbar:**
```
Judul: "Formula Jamu"
Tombol: [+ Tambah Formula]
```

**Filter bar:**
```
- Search: "Cari nama atau indikasi..."
- Toggle: Semua / Oral / Topikal (isTopical)
- Dropdown kondisi: Semua / Diabetes / Hipertensi / Maag / dll
```

**Tabel kolom:**
```
Nama Formula | Indikasi Utama | Jumlah Bahan | Jenis | Tanggal | Aksi
```

---

### Modal Tambah/Edit Formula

```
- Nama formula (input text)
- Indikasi/kondisi (multi-select atau comma-separated)
- isTopical toggle (Oral / Topikal)
- Bahan-bahan: dynamic list → [Nama bahan] [Takaran] [+ Tambah baris]
- Cara pembuatan (textarea)
- Durasi penggunaan (text)
- Peringatan (textarea, opsional)
Tombol: [Simpan]
```

---

### Firestore Queries
```javascript
// READ
const snap = await db.collection('herbalFormulas')
  .orderBy('name', 'asc').limit(30).get();

// CREATE
await db.collection('herbalFormulas').add({
  name, indications, isTopical, ingredients, preparation, duration,
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
});

// UPDATE
await db.collection('herbalFormulas').doc(id).update({ name, indications, ... });

// DELETE
await db.collection('herbalFormulas').doc(id).delete();
```

---

### Navigasi — tambah di sidebar semua admin page
```html
<a class="sidebar-item" href="herbal-formulas.html">
  <ion-icon name="flask-outline"></ion-icon>Formula Jamu
</a>
```

---

## BATCH 5 — Admin: Manajemen Konsultasi
> **Scope:** 1 file baru
> **Dampak:** Admin bisa monitoring semua konsultasi real-time

### File yang dibuat
- `www/admin/consultations.html`

---

### Struktur Halaman

**4 stat chip di atas tabel:**
```
Total | Pending | Aktif | Selesai Hari Ini
```

**Filter bar:**
```
- Dropdown status: Semua / Pending / Aktif / Selesai / Dibatalkan
- Dropdown tipe: Semua / Chat / Video / Integratif
- Date range: dari — sampai (input date)
- Search: nama pasien atau dokter
```

**Tabel kolom:**
```
Pasien | Dokter | Tipe | Status | Waktu Mulai | Durasi | Aksi
```

**Kolom Aksi:**
```
[Detail] ← buka modal atau halaman detail
```

---

### Modal Detail Konsultasi (read-only)
```
Pasien: [nama] · [email]
Dokter: [nama] · [spesialisasi]
Status: [badge]
Tipe: Chat / Video / Integratif
Keluhan: [complaint text]
Waktu: [startTime] — [endTime]
Durasi: [X menit]
```

---

### Firestore Queries
```javascript
// Semua konsultasi
const snap = await db.collection('consultations')
  .orderBy('startTime', 'desc').limit(30).get();

// Filter by status
const snap = await db.collection('consultations')
  .where('status', '==', filterStatus)
  .orderBy('startTime', 'desc').limit(30).get();

// Count stats
const stats = { total: 0, pending: 0, active: 0, completedToday: 0 };
// Hitung dari hasil query, bukan pakai aggregate (gratis tier)
```

---

### Navigasi — tambah di sidebar semua admin page
```html
<a class="sidebar-item" href="consultations.html">
  <ion-icon name="chatbubbles-outline"></ion-icon>Konsultasi
</a>
```

---

## BATCH 6 — Admin: Laporan & Export Data
> **Scope:** 1 file baru
> **Dampak:** Admin bisa export data untuk laporan manajemen

### File yang dibuat
- `www/admin/reports.html`

---

### Struktur Halaman

**Section 1 — Ringkasan Statistik**
```
4 stat cards:
  Total User | User Baru Bulan Ini | Total Konsultasi | Konsultasi Bulan Ini
```

**Section 2 — Grafik Tren (30 hari)**
```
Pakai sparkline() dari app.js:
  - Konsultasi per hari (last 30 days)
  - User baru per hari (last 30 days)
Data: query Firestore, aggregate by date di client-side
```

**Section 3 — Export CSV**

Tabel dengan tombol export per kategori:
```
Data User     → export: id, nama, email, role, tanggal daftar, status
Konsultasi    → export: id, pasien, dokter, tipe, status, durasi, tanggal
Artikel       → export: id, judul, kategori, status, tanggal publish, penulis
```

---

### Export CSV Pattern
```javascript
function exportToCSV(data, filename) {
  if (!data.length) { showToast('Tidak ada data', 'warning'); return; }
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv, { type: 'text/csv;charset=utf-8;' }]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename + '_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}
```

---

### Navigasi — tambah di sidebar semua admin page
```html
<a class="sidebar-item" href="reports.html">
  <ion-icon name="bar-chart-outline"></ion-icon>Laporan
</a>
```

---

## BATCH 7 — Admin: Pengaturan Aplikasi
> **Scope:** 1 file baru + integrasi ke firebase.js (tambah VDB.getAppConfig)
> **Dampak:** Admin bisa kontrol fitur aplikasi tanpa deploy ulang

### File yang dibuat
- `www/admin/settings.html`

### File yang dimodifikasi
- `www/shared/firebase.js` — tambah `VDB.getAppConfig()` dan `VDB.saveAppConfig()`

---

### Struktur Halaman

**Section 1 — Konfigurasi Umum**
```
- Mode Maintenance: toggle ON/OFF
- Pesan maintenance: textarea (tampil ke user jika maintenance ON)
- Banner pengumuman global: textarea (jika tidak kosong, tampil di home pasien)
```

**Section 2 — Feature Flags**
```
Toggle list:
  ✅ AI Chat aktif          → aiChatEnabled
  ✅ Video Call aktif        → videoCallEnabled
  ✅ Booking herbal aktif    → herbalBookingEnabled
  ✅ Formula jamu tampil     → formulaVisible
  ✅ Registrasi terbuka      → registrationOpen
```

**Section 3 — Batas Konsultasi**
```
- Max booking per dokter per hari (number, default 10)
- Durasi sesi default: dropdown [15 / 30 / 45 / 60 menit]
```

**Tombol bawah:** [Simpan Pengaturan]

---

### Firestore — Collection `appConfig`, doc `global`
```javascript
// Di firebase.js — tambahkan 2 method ini ke VDB:
VDB.getAppConfig = async function() {
  const snap = await firebase.firestore().collection('appConfig').doc('global').get();
  return snap.exists ? snap.data() : {};
};

VDB.saveAppConfig = async function(config) {
  await firebase.firestore().collection('appConfig').doc('global').set(
    { ...config, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );
};
```

---

### Navigasi — tambah di sidebar semua admin page
```html
<a class="sidebar-item" href="settings.html">
  <ion-icon name="settings-outline"></ion-icon>Pengaturan
</a>
```

---

## SIDEBAR ADMIN — Template Final
> Setelah semua batch selesai, **setiap** halaman admin harus pakai sidebar ini.
> Set class `.active` di item yang sesuai halaman saat ini.

```html
<aside class="admin-sidebar">
  <div class="sidebar-logo">Herbora<span>Tech</span></div>
  <nav class="sidebar-nav">
    <a class="sidebar-item [active]" href="home.html">
      <ion-icon name="grid-outline"></ion-icon>Dashboard</a>
    <a class="sidebar-item [active]" href="users.html">
      <ion-icon name="people-outline"></ion-icon>Users</a>
    <a class="sidebar-item [active]" href="doctor-verification.html">
      <ion-icon name="checkmark-circle-outline"></ion-icon>Verifikasi Role</a>
    <a class="sidebar-item [active]" href="consultations.html">
      <ion-icon name="chatbubbles-outline"></ion-icon>Konsultasi</a>
    <a class="sidebar-item [active]" href="notifications.html">
      <ion-icon name="notifications-outline"></ion-icon>Notifikasi</a>
    <a class="sidebar-item [active]" href="news.html">
      <ion-icon name="newspaper-outline"></ion-icon>News</a>
    <a class="sidebar-item [active]" href="advertise.html">
      <ion-icon name="megaphone-outline"></ion-icon>Iklan</a>
    <a class="sidebar-item [active]" href="herbals.html">
      <ion-icon name="leaf-outline"></ion-icon>Kelola Herbal</a>
    <a class="sidebar-item [active]" href="herbal-formulas.html">
      <ion-icon name="flask-outline"></ion-icon>Formula Jamu</a>
    <a class="sidebar-item [active]" href="ml-models.html">
      <ion-icon name="analytics-outline"></ion-icon>Model Risiko</a>
    <a class="sidebar-item [active]" href="reports.html">
      <ion-icon name="bar-chart-outline"></ion-icon>Laporan</a>
    <a class="sidebar-item [active]" href="settings.html">
      <ion-icon name="settings-outline"></ion-icon>Pengaturan</a>
  </nav>
  <a class="sidebar-item" href="../index.html" style="margin-top:auto;">
    <ion-icon name="log-out-outline"></ion-icon>Logout</a>
</aside>
```

---

## CATATAN TEKNIS WAJIB

### Design System — Jangan ubah `neumorphic.css`
```
Cards   : .neu-card  .neu-card-sm  .neu-card-flat
Tombol  : .neu-btn-primary  .neu-btn  .neu-btn-sm  .neu-btn-danger
Input   : .neu-input-full  .neu-input-field  .neu-textarea-field
Tab     : .neu-tabs  .neu-tab  .neu-tab.active
Tabel   : .neu-table  .neu-table-wrap
Stat    : .stat-card  .stat-grid  .sc-value  .sc-label  .sc-change
Sidebar : .sidebar-item  .sidebar-item.active
```

### Firebase SDK — SELALU compat (bukan modular)
```javascript
✅  firebase.firestore().collection('x').get()
✅  VDB.updateUser(uid, data)
❌  import { getFirestore } from 'firebase/firestore'
```

### Auth guard — wajib di awal setiap halaman
```javascript
// Patient
const { user, profile } = await VAuth.guard('patient', 1);

// Admin
const { user, profile } = await VAuth.guard('admin', 1);
```

### Urutan script — admin pages
```html
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
<script src="../shared/firebase.js"></script>
<script src="../shared/app.js"></script>
```

### Referensi pola yang sudah ada
| Butuh pola | Lihat file ini |
|------------|----------------|
| Tabel list + search + pagination | `admin/users.html` |
| CRUD lengkap dengan delete | `admin/news.html` |
| Wizard multi-step | `patient/health-profile.html` |
| Modal konfirmasi | `admin/user-detail.html` (suspendModal) |
| Toggle feature card | `patient/health-profile.html` (step D) |
| Sidebar admin | `admin/home.html` |

---

*Pertanyaan teknis → baca CLAUDE.md di root folder.*

---

## BATCH 8 — Hardening Chat & Video Call
> **Scope:** 3 file dimodifikasi + 1 file baru + 1 index Firestore
> **Dampak:** Video call tidak lagi gagal silent, pasien dapat notifikasi panggilan masuk, dokter punya halaman video-call sendiri

### 8A — Tambah Composite Index `calls` di `firestore.indexes.json`

**Masalah:** Query `listenForIncomingCall` menggunakan 2 kondisi `where` (calleeId + status). Tanpa index composite, query ini bisa gagal silent setelah deploy ulang ke Firebase.

Buka `firestore.indexes.json`, tambah entry berikut **sebelum** `]` penutup array `indexes`:

```json
,
{
  "collectionGroup": "calls",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "calleeId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" }
  ]
}
```

Lalu deploy: `firebase deploy --only firestore:indexes`

---

### 8B — Error Handler di `listenForIncomingCall`

**File:** `www/shared/webrtc-manager.js`

**Cari kode:**
```javascript
return db.collection('calls')
      .where('calleeId', '==', calleeId)
      .where('status', '==', 'ringing')
      .onSnapshot(snap => {
```

**Ganti dengan** (tambah error handler sebagai argumen ke-2):
```javascript
return db.collection('calls')
      .where('calleeId', '==', calleeId)
      .where('status', '==', 'ringing')
      .onSnapshot(
        snap => {
          snap.docChanges().forEach(change => {
            if (change.type === 'added') {
              onIncoming({ callId: change.doc.id, ...change.doc.data() });
            }
          });
        },
        err => console.error('[VWebRTC] listenForIncomingCall error:', err.message)
      );
```

---

### 8C — Incoming Call Overlay di `patient/chat-room.html`

**Masalah:** Jika dokter klik tombol Video Call dari chat room-nya, pasien tidak tahu kecuali sudah membuka `video-call.html` duluan.

**Tambahkan overlay HTML** ini sebelum `</div>` penutup `.mobile-frame`:
```html
<!-- Incoming Call Overlay -->
<div id="incomingCallOverlay" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.75);z-index:100;align-items:center;justify-content:center;">
  <div class="neu-card" style="width:280px;text-align:center;padding:28px 20px;">
    <div style="font-size:3rem;margin-bottom:12px;">📹</div>
    <div style="font-weight:700;font-size:1rem;margin-bottom:6px;">Video Call Masuk</div>
    <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:20px;">Dokter mengundang video call</div>
    <div style="display:flex;gap:10px;justify-content:center;">
      <button class="neu-btn-danger" onclick="rejectIncomingCall()" style="flex:1;">Tolak</button>
      <button class="neu-btn-primary" onclick="acceptIncomingCall()" style="flex:1;">
        <ion-icon name="videocam-outline"></ion-icon> Terima
      </button>
    </div>
  </div>
</div>
```

**Tambahkan variabel + fungsi** di bagian `<script>`:
```javascript
let _pendingCallId = null;
let _unsubCall = null;

function acceptIncomingCall() {
  document.getElementById('incomingCallOverlay').style.display = 'none';
  if (_pendingCallId) nav('video-call.html?callId=' + _pendingCallId + '&consultId=' + consultId);
}
function rejectIncomingCall() {
  document.getElementById('incomingCallOverlay').style.display = 'none';
  _pendingCallId = null;
}
```

**Di dalam DOMContentLoaded, setelah** `chat.onMessages(renderMessages)`:
```javascript
// Listen untuk incoming video call dari dokter
_unsubCall = VWebRTCManager.listenForIncomingCall(user.uid, incoming => {
  if (_unsubCall) { _unsubCall(); _unsubCall = null; }
  _pendingCallId = incoming.callId;
  document.getElementById('incomingCallOverlay').style.display = 'flex';
});
```

---

### 8D — Buat `doctor/video-call.html` (Halaman Khusus Dokter)

**Masalah:** Saat ini dokter menggunakan `../patient/video-call.html?isDoctor=true` — rawan bug jika ada perubahan di sisi pasien.

**Buat file baru** `www/doctor/video-call.html`:
- Salin struktur dari `patient/video-call.html`
- Guard: `VAuth.guard('doctor', 1)` langsung (hapus pengecekan `isDoctor` flag)
- Langsung masuk branch `startCall` menggunakan `consultId` dari URL
- Warna header: biru dokter `linear-gradient(135deg, #0C2352, #1D5DB5)`
- Remote label default: nama pasien dari konsultasi

Setelah file dibuat, **update `www/doctor/chat-room.html`**:
```javascript
// Cari:
nav('../patient/video-call.html?consultId=' + consultId + '&isDoctor=true');

// Ganti dengan:
nav('video-call.html?consultId=' + consultId);
```

---

## BATCH 9 — Aktifkan ML Models di Halaman Risiko
> **Scope:** 2 file dimodifikasi
> **Dampak:** Scoring risiko menggunakan 60% ML + 40% rule-based dengan badge visual

### Pages yang diupdate
- `www/patient/health-dashboard.html`
- `www/patient/disease-risk.html`

**1. Tambah script** (jika belum ada, sebelum script lain):
```html
<script src="../shared/risk-engine.js"></script>
```

**2. Tambah badge HTML** di dekat judul halaman atau di header card:
```html
<span id="ml-badge" style="display:none;font-size:0.6rem;background:#E8F5E9;color:#27AE60;padding:2px 8px;border-radius:20px;font-weight:600;margin-left:8px;">
  🧠 ML Aktif
</span>
```

**3. Di dalam DOMContentLoaded, setelah auth guard:**
```javascript
// Load ML models — graceful degradation ke rule-based jika gagal
RiskEngine.loadModels()
  .then(() => {
    const badge = document.getElementById('ml-badge');
    if (badge) badge.style.display = 'inline-flex';
  })
  .catch(() => {});
```

---

## BATCH 10 — Aktifkan Gemini AI Chat
> **Scope:** 2 file dimodifikasi + 1 method tambah di firebase.js
> **Dampak:** API key bisa dikonfigurasi admin, AI chat aktif tanpa hardcode di kode

### 10A — Update `patient/ai-chat.html`

**Cari:**
```javascript
const GEMINI_KEY = 'YOUR_GEMINI_API_KEY';
```

**Ganti dengan:**
```javascript
let GEMINI_KEY = '';
```

**Di DOMContentLoaded, SEBELUM render apapun:**
```javascript
try {
  const config = await VDB.getAppConfig();
  GEMINI_KEY = config?.geminiApiKey || '';
} catch (e) { GEMINI_KEY = ''; }
```

### 10B — Pastikan `VDB.getAppConfig` ada di `firebase.js`

Jika belum ada, tambahkan di `www/shared/firebase.js` (dalam objek `window.VDB`):
```javascript
getAppConfig: async function() {
  const snap = await _db.collection('appConfig').doc('global').get();
  return snap.exists ? snap.data() : {};
},
saveAppConfig: async function(config) {
  await _db.collection('appConfig').doc('global').set(
    { ...config, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );
},
```

### 10C — Tambah Section "Konfigurasi AI" di `admin/settings.html` (Batch 7)

Tambah sebelum tombol "Simpan Pengaturan":
```html
<div class="neu-card" style="margin-bottom:20px;">
  <div style="font-weight:700;font-size:0.88rem;margin-bottom:14px;">
    <ion-icon name="chatbubble-ellipses-outline"></ion-icon> Konfigurasi AI Chat
  </div>
  <div style="margin-bottom:12px;">
    <label style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);">Gemini API Key</label>
    <input id="input-gemini-key" type="password" class="neu-input-full" placeholder="AIza..." style="margin-top:6px;">
    <div style="font-size:0.65rem;color:var(--text-muted);margin-top:4px;">
      Dapatkan di Google AI Studio — gratis 1500 req/hari
    </div>
  </div>
  <div style="display:flex;gap:8px;align-items:center;">
    <button class="neu-btn neu-btn-sm" onclick="testGeminiKey()">
      <ion-icon name="flash-outline"></ion-icon> Test Koneksi
    </button>
    <span id="gemini-status" style="font-size:0.72rem;"></span>
  </div>
</div>
```

Fungsi test:
```javascript
async function testGeminiKey() {
  const key = document.getElementById('input-gemini-key').value.trim();
  const statusEl = document.getElementById('gemini-status');
  if (!key) { statusEl.textContent = '⚠️ Masukkan API key dulu'; return; }
  statusEl.textContent = 'Testing...';
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Hi' }] }] }) }
    );
    if (res.ok) {
      statusEl.innerHTML = '<span style="color:var(--primary-dark);">✅ API key valid</span>';
    } else {
      statusEl.innerHTML = '<span style="color:var(--danger);">❌ Key tidak valid</span>';
    }
  } catch (e) {
    statusEl.innerHTML = `<span style="color:var(--danger);">❌ ${e.message}</span>`;
  }
}
```

Saat load config (init), pre-fill:
```javascript
if (config.geminiApiKey) {
  document.getElementById('input-gemini-key').value = config.geminiApiKey;
  document.getElementById('gemini-status').innerHTML = '<span style="color:var(--primary-dark);">✅ Key tersimpan</span>';
}
```

Saat save, tambahkan key ke payload:
```javascript
const geminiKey = document.getElementById('input-gemini-key')?.value.trim();
if (geminiKey) config.geminiApiKey = geminiKey;
```

---

## BATCH 11 — Stress Detection UI
> **Scope:** 1 file baru + 1 file dimodifikasi
> **Dampak:** Pasien bisa cek tingkat stres dengan input manual, hasil disimpan ke Firestore

### File yang dibuat
- `www/patient/stress-check.html`

### Struktur Halaman

**Layout:** Header (back ke home.html) + 4 card input + tombol submit + result card (hidden)

**Card 1 — Heart Rate Variability (HRV)**
```
Slider: 10–100 ms
Live text: "HRV: 65 ms" + label dinamis
Panduan: HRV < 30 = Rendah (stres tinggi), 30–60 = Normal, > 60 = Baik
```

**Card 2 — Kualitas Tidur Semalam**
```
Slider: 1–10
Live label: 1-3 = Sangat Buruk, 4-5 = Kurang, 6-7 = Cukup, 8-10 = Baik
```

**Card 3 — Aktivitas Fisik Hari Ini**
```
4 tombol toggle (satu aktif pada satu waktu):
[Tidak Ada] [Ringan] [Sedang] [Berat]
```

**Card 4 — Mood Hari Ini**
```
5 emoji toggle (satu aktif):
[😞 1] [😕 2] [😐 3] [🙂 4] [😄 5]
```

**Tombol:** `[🔍 Analisis Stres Saya →]`

**Result card** (hidden, `display:none`, muncul setelah klik analisis):
```
Gauge setengah lingkaran (pakai createGauge() dari app.js)
Skor: 0–100
Label: Rendah (0-40) / Sedang (41-70) / Tinggi (71-100)
3 rekomendasi berdasarkan input + skor

Tombol: [💾 Simpan] [🔄 Coba Lagi]
```

### Scoring Logic (rule-based, tanpa ML dependency)
```javascript
function calcStressScore({ hrv, sleep, activity, mood }) {
  let score = 50;
  // HRV — rendah = stres tinggi
  if (hrv < 30) score += 25;
  else if (hrv < 50) score += 10;
  else if (hrv > 70) score -= 15;
  // Tidur — buruk = stres tinggi
  if (sleep <= 3) score += 20;
  else if (sleep <= 5) score += 10;
  else if (sleep >= 8) score -= 12;
  // Aktivitas fisik (sedang = terbaik)
  if (activity === 'sedang') score -= 10;
  else if (activity === 'ringan') score -= 5;
  else if (activity === 'berat') score += 5; // overtraining
  // Mood (skala 1–5)
  score -= (mood - 3) * 8;
  return Math.min(100, Math.max(0, Math.round(score)));
}
```

### Firestore Write
```javascript
await firebase.firestore()
  .collection('users').doc(user.uid)
  .collection('stressChecks')
  .add({
    score: stressScore,
    level: stressScore < 41 ? 'low' : stressScore < 71 ? 'medium' : 'high',
    inputs: { hrv, sleep, activity, mood },
    checkedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
```

### Tambah Quick Action di `patient/home.html`
Cari baris quick-item lain (misalnya `AI Health`) dan tambahkan setelahnya:
```html
<div class="quick-item" onclick="nav('stress-check.html')">
  <div class="qi-icon"><ion-icon name="happy-outline"></ion-icon></div>
  <span class="qi-label">Cek Stres</span>
</div>
```

---

## BATCH 12 — Health Trend Analytics
> **Scope:** 1 file dimodifikasi
> **Dampak:** Pasien bisa lihat tren risiko penyakit dari waktu ke waktu (membaik/stabil/memburuk)

### File yang dimodifikasi
- `www/patient/health-dashboard.html`

### Section Baru

Tambah di bawah gauge risk score utama:
```html
<div class="section" id="trend-section" style="display:none;">
  <div class="section-header">
    <span class="section-title">Tren Risiko</span>
  </div>
  <div id="trend-list" style="display:flex;flex-direction:column;gap:8px;margin-top:12px;"></div>
</div>
```

### Data Source
```javascript
async function loadRiskTrend(uid) {
  try {
    const snap = await firebase.firestore()
      .collection('users').doc(uid)
      .collection('riskScores')
      .orderBy('calculatedAt', 'desc')
      .limit(10)
      .get();
    if (snap.empty) return;
    const history = snap.docs.map(d => d.data()).reverse(); // lama ke baru
    renderTrend(history);
    document.getElementById('trend-section').style.display = 'block';
  } catch (e) {
    console.warn('[trend] gagal load:', e.message);
  }
}
```

### Render Function
```javascript
const DISEASE_LABELS = {
  diabetes: 'Diabetes', heart: 'Jantung', hypertension: 'Hipertensi',
  stroke: 'Stroke', metabolic: 'Metabolik', sleep: 'Tidur'
};

function renderTrend(history) {
  const listEl = document.getElementById('trend-list');
  const latest   = history[history.length - 1]?.scores || {};
  const earliest = history[0]?.scores || {};

  Object.keys(DISEASE_LABELS).forEach(key => {
    const now   = Math.round(latest[key]?.score || 0);
    const start = Math.round(earliest[key]?.score || 0);
    const diff  = now - start;
    const sparkData = history.map(h => h.scores?.[key]?.score || 0);

    let label, color;
    if (diff <= -5)  { label = '↓ Membaik';          color = 'var(--primary-dark)'; }
    else if (diff >= 5) { label = '↑ Perlu perhatian'; color = 'var(--danger)'; }
    else               { label = '→ Stabil';           color = 'var(--text-muted)'; }

    const row = document.createElement('div');
    row.className = 'neu-card-flat';
    row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px 14px;';
    row.innerHTML = `
      <div style="width:76px;font-size:0.72rem;font-weight:600;">${DISEASE_LABELS[key]}</div>
      <div id="spark-${key}" style="flex:1;height:32px;"></div>
      <div style="text-align:right;min-width:68px;">
        <div style="font-size:0.8rem;font-weight:700;">${now}%</div>
        <div style="font-size:0.6rem;color:${color};">${label}</div>
      </div>
    `;
    listEl.appendChild(row);
    setTimeout(() => sparkline(document.getElementById('spark-' + key), sparkData, color, 32), 50);
  });
}
```

### Panggil di Init
Di dalam DOMContentLoaded, setelah auth guard (non-blocking):
```javascript
loadRiskTrend(user.uid);
```

---

---

# BAGIAN II — ML / AI IMPLEMENTATION

> **Prasyarat:** Batch 1–7 sebaiknya selesai dulu (terutama Batch 7 — `admin/settings.html`)
> **Stack tambahan:** ML models sudah ada di `www/models/` (7 model: metabolic, diabetes, heart, hypertension, stroke, sleep, stress_wesad). `RiskEngine.loadModels()` sudah ada di `shared/risk-engine.js` tapi BELUM pernah dipanggil dari halaman manapun.

---

## STATUS ML/AI SAAT INI

| Komponen | Ada? | Status |
|----------|------|--------|
| ML model files (`www/models/*/model.json` + `metadata.json`) | ✅ | 7 model lengkap |
| `shared/risk-engine.js` — `loadModels()` + `_mlInfer()` | ✅ | Siap, belum dipanggil |
| Model accuracies (diabetes 92.2%, sleep 87.1%, stroke 86.8%, metabolic 86.5%, heart 80.6%, hypertension 77.1%, stress 99.9%) | ✅ | — |
| `patient/disease-risk.html` memanggil `RiskEngine.calculateAll()` | ✅ | Rule-based only (ML belum aktif) |
| `patient/health-dashboard.html` — chart tren historis | ⚠️ | Container ada, tapi hanya pesan "Belum ada data" |
| `patient/ai-chat.html` — Gemini AI | ⚠️ | Selesai, tapi GEMINI_KEY = placeholder |
| `patient/stress-check.html` | ❌ | Belum ada |
| Sensor integration (Web Bluetooth) di `device.html` | ❌ | Belum ada |

---

## BATCH 8 — Aktifkan ML Hybrid Mode
> **Scope:** 2 file dimodifikasi
> **Dampak:** Risk score sekarang menggunakan ML model (60% ML + 40% rule-based) → hasil lebih akurat

### Mengapa perlu ini?
`RiskEngine.loadModels()` sudah diimplementasikan di `risk-engine.js` tapi tidak pernah dipanggil dari halaman manapun. Semua halaman masih pakai rule-based saja. Cukup tambah satu baris pemanggilan sebelum `calculateAll()` dan tambah badge UI.

---

### 8A — `patient/disease-risk.html`

**Tambah script tag** sebelum tag `<script src="../shared/app.js">`:
```html
<script src="../shared/risk-engine.js"></script>
```
(Jika belum ada)

**Di bagian init** (fungsi yang load health profile), **sebelum** `RiskEngine.calculateAll(profile)`:
```javascript
// Aktifkan ML hybrid mode
await RiskEngine.loadModels();
```

**Tambah badge ML status** di header halaman (di bawah judul/subheader):
```javascript
const mlBadge = document.getElementById('ml-status-badge');
if (mlBadge) {
  const loaded = RiskEngine._modelsLoaded; // expose via window atau cek langsung
  mlBadge.textContent = loaded ? '🧠 AI Aktif' : '📊 Mode Rule-Based';
  mlBadge.style.cssText = loaded
    ? 'background:rgba(39,174,96,0.12);color:#27AE60;font-size:0.65rem;padding:2px 10px;border-radius:10px;font-weight:600;'
    : 'background:rgba(242,153,74,0.12);color:#F2994A;font-size:0.65rem;padding:2px 10px;border-radius:10px;';
}
```

**Tambah `id="ml-status-badge"`** di HTML, misalnya di bawah judul halaman (cari elemen judul "Analisis Risiko" atau subheader):
```html
<span id="ml-status-badge" style="display:inline-block;margin-top:4px;"></span>
```

**Expose `_modelsLoaded`** agar bisa dicek dari luar — tambah ke return object di `risk-engine.js`:
```javascript
// Di bagian return { ... } paling bawah risk-engine.js, tambahkan:
get modelsLoaded() { return _modelsLoaded; },
```

---

### 8B — `patient/health-dashboard.html`

Sama persis dengan 8A:
1. Pastikan `risk-engine.js` sudah di-include
2. Panggil `await RiskEngine.loadModels()` sebelum `calculateAll()`
3. Tambah badge ML status di dashboard header

---

### Catatan Teknis Batch 8

- `loadModels()` fetch ke `/models/*/model.json` — pastikan path relatif benar dari folder `patient/`
  → Path yang benar: `'../models/diabetes/model.json'` (bukan `/models/...`)
  → Cek `risk-engine.js` baris 580-603 untuk memverifikasi base URL yang dipakai
- Jika `_modelsLoaded = false` setelah await, cek browser console — mungkin path 404
- Jika sukses, score diabetes misalnya bisa berbeda dari pure rule-based (karena blending 60%/40%)

---

## BATCH 9 — Gemini API Key & Aktivasi AI Chat
> **Scope:** 2 file dimodifikasi (admin/settings.html + patient/ai-chat.html)
> **Prasyarat:** Batch 7 (`admin/settings.html`) sudah ada
> **Dampak:** Admin bisa set Gemini key lewat UI, AI chat langsung aktif tanpa deploy ulang

---

### 9A — Tambah Field Gemini Key di `admin/settings.html`

Di **Section 2 — Feature Flags** (atau buat section baru "Konfigurasi AI"):
```html
<!-- Section baru di settings.html -->
<div class="neu-card" style="margin-top:20px;">
  <div class="section-header">
    <div class="section-title">Konfigurasi AI Chat</div>
  </div>
  <div style="margin-top:12px;">
    <label class="neu-label">Gemini API Key</label>
    <div style="display:flex;gap:8px;align-items:center;">
      <input type="password" id="input-gemini-key" class="neu-input-full"
        placeholder="AIza..." style="font-family:monospace;font-size:0.75rem;">
      <button class="neu-btn neu-btn-sm" onclick="toggleShowKey()">
        <ion-icon name="eye-outline" id="key-eye-icon"></ion-icon>
      </button>
    </div>
    <div style="font-size:0.68rem;color:var(--text-muted);margin-top:6px;">
      Dapatkan gratis di <strong>aistudio.google.com</strong> — 1500 req/hari (free tier)
    </div>
    <div id="gemini-status" style="font-size:0.7rem;margin-top:8px;"></div>
  </div>
</div>
```

**Fungsi toggle key visibility:**
```javascript
function toggleShowKey() {
  const input = document.getElementById('input-gemini-key');
  const icon = document.getElementById('key-eye-icon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.name = 'eye-off-outline';
  } else {
    input.type = 'password';
    icon.name = 'eye-outline';
  }
}
```

**Pre-fill dari Firestore** (di fungsi load settings):
```javascript
const config = await VDB.getAppConfig();
if (config.geminiApiKey) {
  document.getElementById('input-gemini-key').value = config.geminiApiKey;
  document.getElementById('gemini-status').innerHTML =
    '<span style="color:var(--success);">✅ Key tersimpan</span>';
}
```

**Di fungsi simpan settings** (ikut disimpan bersama config lain):
```javascript
const geminiKey = document.getElementById('input-gemini-key').value.trim();
const configToSave = {
  // ... field lain ...
  geminiApiKey: geminiKey || ''
};
await VDB.saveAppConfig(configToSave);
```

---

### 9B — `patient/ai-chat.html` — Load Key dari Firestore

**Ganti baris:**
```javascript
const GEMINI_KEY = 'YOUR_GEMINI_API_KEY';
```

**Jadi:** (di awal init, setelah `VAuth.guard()`)
```javascript
let GEMINI_KEY = 'YOUR_GEMINI_API_KEY';
try {
  const appConfig = await VDB.getAppConfig();
  if (appConfig.geminiApiKey && appConfig.geminiApiKey.startsWith('AIza')) {
    GEMINI_KEY = appConfig.geminiApiKey;
  }
} catch(e) { /* gunakan default/placeholder */ }
```

**Catatan:** Kode fallback ("Fitur AI Chat Belum Aktif") sudah ada di ai-chat.html jika key masih placeholder — tidak perlu diubah.

---

### 9C — Status Gemini di `admin/ml-models.html`

Di bagian "Model Status" atau card Gemini, tampilkan status key aktif/tidak:
```javascript
// Di loadStats() atau section terpisah
const config = await VDB.getAppConfig();
const geminiActive = config.geminiApiKey && config.geminiApiKey.startsWith('AIza');
document.getElementById('gemini-status-badge').textContent =
  geminiActive ? '✅ API Key Aktif' : '⚠️ Belum dikonfigurasi';
```

---

## BATCH 10 — Stress Check (Manual Input Mode)
> **Scope:** 1 file baru + 1 file dimodifikasi
> **Dampak:** Pasien bisa cek level stres tanpa sensor fisik

### Latar Belakang
Model `stress_wesad` butuh data sensor EDA/GSR (galvanic skin response) yang tidak bisa diambil via browser biasa. Solusi: buat stress assessment berbasis kuesioner singkat yang menghitung stress proxy score, lalu simpan ke Firestore sama seperti risk score lainnya.

---

### File yang dibuat
- `www/patient/stress-check.html`

### File yang dimodifikasi
- `www/patient/home.html` — tambah quick action atau card "Cek Stres Hari Ini"

---

### Struktur Halaman `stress-check.html`

**Header:**
```
Icon: brain-outline (besar, 3rem)
Judul: "Cek Level Stres"
Sub: "Jawab 5 pertanyaan singkat — hanya 1 menit"
```

**5 Pertanyaan (satu per satu, slider/toggle):**

```
Q1 — Tingkat kegelisahan
"Seberapa gelisah/tegang Anda hari ini?"
Slider 1-10 dengan label: 1=Sangat Tenang, 10=Sangat Gelisah

Q2 — Detak jantung
"Apakah jantung Anda terasa berdebar lebih cepat dari biasa?"
3 tombol: [Tidak] [Kadang] [Ya]

Q3 — Fokus & konsentrasi
"Seberapa mudah Anda berkonsentrasi hari ini?"
Slider 1-5: 1=Sangat Sulit, 5=Sangat Fokus (terbalik!)

Q4 — Kualitas tidur semalam
"Berapa jam Anda tidur semalam?"
Dropdown atau input number: 0-12 jam

Q5 — Level energi
"Bagaimana level energi Anda hari ini?"
Slider 1-5: 1=Sangat Lelah, 5=Sangat Berenergi (terbalik!)
```

**Tombol:** [Hitung Level Stres →]

---

### Algoritma Scoring Stress Proxy

```javascript
function calculateStressScore({ anxiety, heartRace, focus, sleepHours, energy }) {
  let score = 0;

  // Anxiety (0-40 poin): tinggi = stres tinggi
  score += (anxiety / 10) * 40;

  // Heart racing (0-15 poin)
  if (heartRace === 'Ya') score += 15;
  else if (heartRace === 'Kadang') score += 7;

  // Focus (0-20 poin): fokus buruk = stres tinggi (terbalik)
  score += ((5 - focus) / 4) * 20;

  // Sleep (0-15 poin): kurang tidur = stres lebih tinggi
  if (sleepHours < 6) score += 15;
  else if (sleepHours < 7) score += 8;
  else if (sleepHours > 9) score += 5;

  // Energy (0-10 poin): energi rendah = stres lebih tinggi (terbalik)
  score += ((5 - energy) / 4) * 10;

  return Math.round(Math.min(100, Math.max(0, score)));
}
```

---

### Tampilan Hasil

```javascript
// 3 kategori hasil:
// score < 35: Rendah — "Anda dalam kondisi santai 😊"
// score 35-65: Sedang — "Ada sedikit tekanan. Istirahat yuk."
// score > 65: Tinggi — "Stres tinggi. Prioritaskan istirahat!"

// Warna gauge: hijau / kuning / merah (ikuti pola disease-risk.html)

// Rekomendasi herbal otomatis:
const herbs = score > 65
  ? ['Ashwagandha', 'Lavender', 'Chamomile']
  : ['Peppermint', 'Lemon Balm'];
```

---

### Simpan ke Firestore

```javascript
// Simpan ke users/{uid}/riskScores/stress (sama seperti disease risk)
await VFirebase.db
  .collection('users').doc(user.uid)
  .collection('riskScores').doc('stress')
  .set({
    score: stressScore,
    category: stressScore > 65 ? 'high' : stressScore > 35 ? 'medium' : 'low',
    inputs: { anxiety, heartRace, focus, sleepHours, energy },
    calculatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    calculatedWith: 'stress-proxy-v1.0'
  });
```

---

### Tambah Quick Action di `patient/home.html`

Di section quick actions (di bawah "AI Health"):
```html
<div class="quick-item" onclick="nav('stress-check.html')">
  <div class="qi-icon" style="background:linear-gradient(135deg,#6C63FF,#8B83FF);">
    <ion-icon name="body-outline"></ion-icon>
  </div>
  <span class="qi-label">Cek Stres</span>
</div>
```

---

## BATCH 11 — Health Trend Chart di Dashboard
> **Scope:** 1 file dimodifikasi
> **Dampak:** Pasien bisa lihat tren skor risiko dari waktu ke waktu

### File yang dimodifikasi
- `www/patient/health-dashboard.html`

---

### Apa yang Perlu Diperbaiki

`health-dashboard.html` sudah punya `<div class="trend-canvas-wrap" id="trendWrap">` tapi isinya hanya pesan "Belum ada data historis". Perlu diimplementasikan chart sesungguhnya.

---

### Implementasi Trend Chart

**Load historical risk scores:**
```javascript
async function loadRiskHistory(userId) {
  const snap = await VFirebase.db
    .collection('users').doc(userId)
    .collection('riskScores')
    .orderBy('calculatedAt', 'asc')
    .limit(30)
    .get();

  return snap.docs.map(d => ({
    id: d.id,           // nama penyakit: 'diabetes', 'heart', dll
    ...d.data(),
    dateStr: d.data().calculatedAt?.toDate?.()
      .toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) || '?'
  }));
}
```

**Render simple bar chart menggunakan CSS (tanpa library):**

```javascript
function renderTrendChart(historyDocs) {
  const container = document.getElementById('trendWrap');
  if (!historyDocs.length) {
    container.innerHTML = `<div style="text-align:center;color:var(--text-muted);">
      <ion-icon name="trending-up-outline" style="font-size:1.8rem;"></ion-icon>
      <div style="margin-top:6px;font-size:0.75rem;">Belum ada data historis</div>
      <div style="font-size:0.65rem;">Lakukan cek risiko untuk mulai menyimpan tren</div>
    </div>`;
    return;
  }

  // Group by disease name, take the latest score per disease
  const byDisease = {};
  historyDocs.forEach(doc => {
    if (!byDisease[doc.id]) byDisease[doc.id] = [];
    byDisease[doc.id].push(doc);
  });

  // Render horizontal bar per disease
  const diseases = ['diabetes', 'heart', 'hypertension', 'stroke', 'metabolic', 'sleep', 'stress'];
  const colors = {
    diabetes: '#EB5757', heart: '#6C63FF', hypertension: '#2F80ED',
    stroke: '#F2994A', metabolic: '#27AE60', sleep: '#56CCF2', stress: '#9B51E0'
  };
  const labels = {
    diabetes: 'Diabetes', heart: 'Jantung', hypertension: 'Hipertensi',
    stroke: 'Stroke', metabolic: 'Metabolik', sleep: 'Tidur', stress: 'Stres'
  };

  const rows = diseases
    .filter(d => byDisease[d] && byDisease[d].length > 0)
    .map(d => {
      const latest = byDisease[d][byDisease[d].length - 1];
      const score = latest.score || 0;
      const color = colors[d] || '#2F80ED';
      return `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <div style="width:70px;font-size:0.65rem;color:var(--text-secondary);text-align:right;flex-shrink:0;">${labels[d]}</div>
          <div style="flex:1;background:var(--bg);border-radius:6px;height:14px;box-shadow:var(--shadow-in);overflow:hidden;">
            <div style="height:100%;width:${score}%;background:${color};border-radius:6px;transition:width 0.6s;"></div>
          </div>
          <div style="width:28px;font-size:0.65rem;font-weight:700;color:${color};">${score}</div>
        </div>`;
    }).join('');

  container.innerHTML = `
    <div style="width:100%;padding:4px 0;">
      ${rows || '<div style="color:var(--text-muted);font-size:0.75rem;">Tidak ada data risiko</div>'}
    </div>`;
}
```

**Panggil di init** (setelah loadRiskHistory):
```javascript
const historyDocs = await loadRiskHistory(user.uid);
renderTrendChart(historyDocs);
document.getElementById('trendMsg').textContent =
  historyDocs.length + ' pengukuran tersimpan';
```

---

### Tambahan: Dropdown Pilih Penyakit (Opsional, jika ingin grafik per penyakit)

Jika ingin grafik per penyakit dari waktu ke waktu (bukan snapshot):
```html
<select id="trend-disease-select" class="neu-input-field" onchange="renderTrendByDisease(this.value)">
  <option value="all">Semua Penyakit</option>
  <option value="diabetes">Diabetes</option>
  <option value="heart">Jantung</option>
  <option value="hypertension">Hipertensi</option>
  <option value="stroke">Stroke</option>
  <option value="metabolic">Metabolik</option>
  <option value="sleep">Tidur</option>
  <option value="stress">Stres</option>
</select>
```

---

## BATCH 12 — Sensor Integration (Web Bluetooth)
> **Scope:** 1 file dimodifikasi (`patient/device.html`)
> **Dampak:** Pasien dengan perangkat BLE bisa baca detak jantung langsung di app
> **⚠️ Catatan:** Web Bluetooth hanya didukung Chrome & Edge. Safari/Firefox tidak support. Ini fitur **opsional/advanced**.

---

### File yang dimodifikasi
- `www/patient/device.html` (file sudah ada)

---

### Implementasi Web Bluetooth API

**Tambah tombol "Hubungkan Perangkat":**
```html
<button class="neu-btn-primary" onclick="connectBLE()" id="btn-ble">
  <ion-icon name="bluetooth-outline"></ion-icon> Hubungkan Perangkat BLE
</button>
<div id="ble-status" style="font-size:0.75rem;color:var(--text-muted);margin-top:8px;text-align:center;">
  Mendukung: chest strap HR, smartwatch (GATT HR Profile)
</div>
```

**JavaScript Web Bluetooth:**
```javascript
let bleDevice = null;
let bleCharacteristic = null;

async function connectBLE() {
  if (!navigator.bluetooth) {
    showToast('Web Bluetooth tidak didukung di browser ini. Gunakan Chrome/Edge.', 'error');
    return;
  }
  try {
    showToast('Mencari perangkat...', 'info');
    bleDevice = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['heart_rate'] }],
      optionalServices: ['battery_service']
    });
    const server = await bleDevice.gatt.connect();
    const service = await server.getPrimaryService('heart_rate');
    bleCharacteristic = await service.getCharacteristic('heart_rate_measurement');
    await bleCharacteristic.startNotifications();
    bleCharacteristic.addEventListener('characteristicvaluechanged', onHRData);

    document.getElementById('btn-ble').textContent = '✅ ' + (bleDevice.name || 'Terhubung');
    document.getElementById('ble-status').textContent = 'Perangkat aktif — membaca detak jantung...';
    showToast('Perangkat terhubung!', 'success');
  } catch (e) {
    if (e.name !== 'NotFoundError') {
      showToast('Gagal terhubung: ' + e.message, 'error');
    }
  }
}

function onHRData(event) {
  const value = event.target.value;
  const flags = value.getUint8(0);
  const rate = flags & 0x01 ? value.getUint16(1, true) : value.getUint8(1);

  document.getElementById('live-hr-value').textContent = rate;
  document.getElementById('live-hr-time').textContent = new Date().toLocaleTimeString('id-ID');

  // Simpan ke Firestore setiap 60 detik (throttle)
  throttleSaveHR(rate);
}

// Throttle: simpan max 1x per menit
let lastHRSave = 0;
function throttleSaveHR(rate) {
  const now = Date.now();
  if (now - lastHRSave < 60000) return;
  lastHRSave = now;
  VFirebase.db.collection('users').doc(currentUserId)
    .collection('vitalSigns').add({
      heartRate: rate,
      source: 'ble',
      deviceName: bleDevice?.name || 'BLE Device',
      recordedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}
```

**Display live heart rate** (tambah ke UI `device.html`):
```html
<div class="neu-card" style="text-align:center;">
  <div style="font-size:0.7rem;color:var(--text-muted);">Detak Jantung Live</div>
  <div style="font-size:3rem;font-weight:700;color:#EB5757;" id="live-hr-value">--</div>
  <div style="font-size:0.65rem;color:var(--text-muted);">BPM · <span id="live-hr-time">--</span></div>
</div>
```

**Fallback jika Bluetooth tidak tersedia** — tambah input manual:
```html
<div id="manual-input-section" style="display:none;">
  <div class="neu-card">
    <div class="section-title">Input Manual</div>
    <label class="neu-label">Detak Jantung (BPM)</label>
    <input type="number" class="neu-input-full" id="manual-hr" min="40" max="220" placeholder="72">
    <button class="neu-btn neu-btn-sm" onclick="saveManualHR()" style="margin-top:8px;">Simpan</button>
  </div>
</div>
```

**Deteksi support saat load:**
```javascript
if (!navigator.bluetooth) {
  document.getElementById('btn-ble').style.display = 'none';
  document.getElementById('manual-input-section').style.display = '';
  document.getElementById('ble-status').textContent =
    'Browser tidak support BLE. Gunakan input manual.';
}
```

---

## BATCH 13 — OCR Vademekum Tanaman Obat (Database Baru)

> **Scope:** 2 script baru + update admin/import-herbal.html
> **Durasi:** ~6–8 jam (termasuk OCR semua halaman)
> **Engine:** Alibaba Qwen-VL-OCR via Model Studio API
> **Output:** ~200–400 entri tanaman ke Firestore `herbals` collection
> **Evidence Level:** A (Kemenkes-validated Saintifikasi Jamu)

### Tentang Sumber Buku

**Vademekum Tanaman Obat untuk Saintifikasi Jamu Jilid 1 (Edisi Revisi)**
- Publisher: Kemenkes RI (Ministry of Health Indonesia)
- Kategori: Saintifikasi Jamu — penelitian ilmiah tanaman obat tradisional
- Evidence Level: **A** — data tervalidasi Kemenkes RI
- Benefit: Menambah ~200–400 entri tanaman berkualitas tinggi ke herbals database

---

### Strategi OCR: Alibaba Qwen-VL-OCR vs Tesseract

| Aspek | Alibaba Qwen-VL-OCR | Tesseract |
|-------|---------------------|-----------|
| **Harga** | ✅ Free quota (token existing) | ✅ Gratis |
| **Akurasi Cetakan** | 95–98% | 90–95% |
| **Tabel/Layout Kompleks** | ✅ Sangat baik | ⚠️ Perlu preprocessing |
| **Bahasa Indonesia** | ✅ Optimal | ⚠️ Kurang optimal |
| **Setup** | API call (cloud) | Local processing |
| **Kecepatan** | 1–3 detik/halaman | 0.5–1 detik/halaman |

**Kesimpulan:** Pakai **Alibaba Qwen-VL-OCR** karena:
- Token sudah ada (gratis)
- Hasil lebih akurat untuk dokumen kompleks Kemenkes
- Dukungan bahasa Indonesia lebih baik

---

### 13A — Scripts yang Harus Disiapkan

#### **`scripts/vademekum_ocr.py`** — OCR Halaman ke Text

```python
import os
import json
import base64
from pathlib import Path
from dashscope import MultiModalConversation

ALIBABA_API_KEY = os.environ.get('ALIBABA_API_KEY', '')

def ocr_page(image_path: str) -> str:
    """Kirim satu halaman ke Qwen-VL-OCR, return teks hasil."""
    with open(image_path, 'rb') as f:
        img_b64 = base64.b64encode(f.read()).decode()

    messages = [{
        'role': 'user',
        'content': [
            {'image': f'data:image/jpeg;base64,{img_b64}'},
            {'text': '''Ekstrak SEMUA teks dari halaman ini secara lengkap dan akurat.
Pertahankan struktur: nama tanaman, nama latin, keluarga (family),
bagian yang digunakan, kandungan aktif, manfaat, dosis, kontraindikasi,
efek samping, interaksi obat, status BPOM.
Jika ada tabel, preserve struktur dengan tab/newline.
Output: teks mentah tanpa formatting.'''}
        ]
    }]

    response = MultiModalConversation.call(
        model='qwen-vl-ocr',
        messages=messages,
        api_key=ALIBABA_API_KEY
    )
    return response.output.choices[0].message.content[0]['text']

def ocr_all_pages(img_folder: str, output_file: str):
    """OCR semua image di folder → JSON."""
    results = {}
    imgs = sorted(Path(img_folder).glob('*.jpg'))

    if not imgs:
        print(f'❌ No JPG files found in {img_folder}')
        return

    print(f'Found {len(imgs)} images. Starting OCR...\n')

    for i, img in enumerate(imgs, 1):
        print(f'[{i}/{len(imgs)}] {img.name}...', end=' ', flush=True)
        try:
            results[img.stem] = ocr_page(str(img))
            print('✅')
        except Exception as e:
            print(f'❌ ERROR: {e}')
            results[img.stem] = ''

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f'\n✅ Done! Output → {output_file}')

if __name__ == '__main__':
    ocr_all_pages('data/vademekum/pages', 'data/vademekum/ocr_raw.json')
```

#### **`scripts/parse_vademekum.py`** — Parse Text ke Schema Firestore

```python
import json
import re

SCHEMA_TEMPLATE = {
    'name': '',
    'latinName': '',
    'family': '',
    'partsUsed': [],
    'activeCompounds': [],
    'benefits': [],
    'mechanism': '',
    'dosage': '',
    'frequency': '',
    'contraindications': [],
    'sideEffects': [],
    'drugInteractions': [],
    'bpomStatus': 'Jamu Saintifikasi',
    'evidenceLevel': 'A',
    'source': 'Vademekum Tanaman Obat Saintifikasi Jamu Jilid 1, Kemenkes RI',
    'sourceType': 'kemenkes',
    'categories': [],
    'notes': ''
}

def parse_entry(raw_text: str) -> dict:
    """Parse raw OCR text satu tanaman → dict schema Firestore."""
    entry = SCHEMA_TEMPLATE.copy()

    if not raw_text or len(raw_text) < 20:
        return None

    # ⚠️ TOHA akan implement detail parsing logic di sini berdasarkan struktur actual buku
    # Regex patterns untuk ekstrak field (nama, latin, family, benefits, dll)

    lines = [l.strip() for l in raw_text.split('\n') if l.strip()]
    entry['name'] = lines[0] if lines else ''

    return entry if entry['name'] else None

def parse_all(ocr_json: str, output_json: str):
    """Parse semua OCR mentah → schema terstruktur."""
    with open(ocr_json, 'r', encoding='utf-8') as f:
        raw = json.load(f)

    entries = []
    for page_name, text in raw.items():
        if not text or len(text) < 20:
            continue

        parsed = parse_entry(text)
        if parsed and parsed['name']:
            entries.append(parsed)

    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)

    print(f'✅ Parsed {len(entries)} tanaman → {output_json}')

if __name__ == '__main__':
    parse_all('data/vademekum/ocr_raw.json', 'data/vademekum/herbals_vademekum.json')
```

---

### 13B — Langkah-Langkah Eksekusi TOHA (Step by Step)

**Prasyarat:**
- File PDF: Vademekum Tanaman Obat Jilid 1
- Alibaba Model Studio account (sudah ada)
- API key Alibaba (export sebagai env var)

```bash
# STEP 1: Install dependencies
pip install dashscope pdf2image pillow

# STEP 2: Konversi PDF → images (300 DPI, JPEG)
# (Jika belum ada poppler: brew install poppler atau apt-get install poppler-utils)
pdftoppm -r 300 -jpeg data/vademekum/vademekum_jilid1.pdf data/vademekum/pages/page
# Hasilnya: page-1.jpg, page-2.jpg, ... (satu per halaman)

# STEP 3: Set environment variable (Alibaba API key)
export ALIBABA_API_KEY=sk-xxxxx...
# (Verify: echo $ALIBABA_API_KEY)

# STEP 4: Jalankan OCR (JPEG → text JSON)
python scripts/vademekum_ocr.py
# Output: data/vademekum/ocr_raw.json (~2–5MB)
# Waktu: 5–15 menit (depend jumlah halaman + rate limit)

# STEP 5: Parse OCR → Firestore schema
python scripts/parse_vademekum.py
# Output: data/vademekum/herbals_vademekum.json
# File siap untuk import

# STEP 6: Upload ke Firestore via Admin UI
# Buka browser: https://herboratech.web.app/admin/import-herbal.html
# Login dengan akun admin
# - Collection: pilih "herbals"
# - Klik tombol "Upload File" atau drag-drop
# - Select: data/vademekum/herbals_vademekum.json
# - Klik [Import] button
# - Monitor progress bar
# - Verifikasi: Cek Firestore Console → `herbals` collection → lihat entries baru

# SELESAI! ✅
```

---

### 13C — Verifikasi Setelah Batch 13 Selesai

1. ✅ **Images ada:** `data/vademekum/pages/` berisi 300+ JPG files
2. ✅ **OCR berhasil:** `ocr_raw.json` ada, ukuran >1MB, berisi text dari semua halaman
3. ✅ **Parse berhasil:** `herbals_vademekum.json` ada, berisi array objek tanaman dengan field yang benar
4. ✅ **Import ke Firestore:** Buka `admin/import-herbal.html` → cek import history atau Firestore Console
5. ✅ **Firestore entries:** Di Firestore Console, collection `herbals` → filter `sourceType == 'kemenkes'` → minimal 200 entries muncul
6. ✅ **Evidence badge:** entries baru punya `evidenceLevel: 'A'` dan `source: 'Vademekum...'`
7. ✅ **Visible di app:** Buka `patient/herbal.html` → scroll ke bawah → kelihatan tanaman dari Vademekum dengan badge "Evidence: A"

---

## RINGKASAN PRIORITAS BATCH ML/AI

| Batch | Task | Dampak | Difficulty |
|-------|------|--------|------------|
| **8** | Aktifkan ML hybrid mode (loadModels) | ⭐⭐⭐⭐ | Mudah — 2 file, +2 baris kode |
| **9** | Gemini key via admin settings | ⭐⭐⭐⭐ | Mudah-Sedang — wiring form ke Firestore |
| **10** | Stress Check UI | ⭐⭐⭐ | Sedang — form baru + algoritma scoring |
| **11** | Trend chart di dashboard | ⭐⭐⭐ | Sedang — query Firestore + render CSS bar |
| **12** | Sensor BLE (device.html) | ⭐⭐ | Sulit — Web Bluetooth API, hardware-dependent |

**Rekomendasi urutan:** 8 → 9 → 11 → 10 → 12

---

*Pertanyaan teknis → baca CLAUDE.md di root folder.*
