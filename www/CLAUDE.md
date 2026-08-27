# CLAUDE.md — HerboraTech UI Development Guide

## 🎯 Project Overview

**HerboraTech** adalah platform telemedisin AIoT-driven dengan 3 role (Patient, Doctor, Admin). UI menggunakan **Neumorphic Design** dengan HTML, CSS, JS murni. Proyek ini sedang dalam tahap pembuatan UI prototype — semua data adalah dummy/mock.

### Status Saat Ini (Update: Maret 2026)
- ✅ **SEMUA halaman sudah selesai dibuat (58 halaman)**
- ✅ **SEMUA halaman sudah terintegrasi Firebase Auth + Firestore**
- ✅ Design system (`shared/neumorphic.css`) sudah final
- ✅ Utility JS (`shared/app.js`) sudah final
- ✅ Firebase SDK (`shared/firebase.js`) — VAuth, VDB, VitalsManager, VWebRTC, VChatManager
- 🔧 **Fase saat ini: Debugging & penyempurnaan fitur**

---

## 📁 Struktur Proyek

```
herboratech/
├── index.html                    ← Landing page / role selector
├── shared/
│   ├── neumorphic.css            ← Design system (JANGAN DIUBAH kecuali menambah)
│   └── app.js                    ← Shared utilities (JANGAN DIUBAH kecuali menambah)
├── auth/                         ← ✅ SEMUA ADA + Firebase integrated
│   ├── login.html                ✅ VAuth.login, VAuth.loginGoogle, debug bypass
│   ├── register.html             ✅ VAuth.register, email verification
│   ├── forgot-password.html      ✅ VAuth.resetPassword
│   ├── verify-email.html         ✅ auto-check 5s, resend cooldown
│   ├── otp-verification.html     ✅
│   ├── pending-approval.html     ✅
│   ├── role-rejected.html        ✅
│   └── select-role.html          ✅
├── patient/                      ← ✅ SEMUA 27 halaman ada + Firebase integrated
│   ├── home.html                 ✅ guard, VitalsManager, notif badge, loadAds() carousel dari Firestore ads
│   ├── monitoring.html           ✅ VitalsManager subscribe 1s, Firestore history
│   ├── consultation.html         ✅ guard, getPatientConsultations, getAllUsers(doctor)
│   ├── herbal.html               ✅ guard
│   ├── lifestyle.html            ✅ guard
│   ├── disease-risk.html         ✅ guard
│   ├── profile.html              ✅ guard, VDB.getUser
│   ├── news.html                 ✅ guard, VDB.getPublishedArticles, filter kategori
│   ├── notification.html         ✅ VDB.subscribeNotifications, mark-read
│   ├── device.html               ✅ guard
│   ├── ai-consultation.html      ✅ guard, VDB
│   ├── doctor-detail.html        ✅ guard, VDB.getUser(doctorId)
│   ├── booking.html              ✅ guard, VDB.createConsultation, VDB.sendMessage
│   ├── chat-room.html            ✅ VChatManager real-time
│   ├── video-call.html           ✅ VWebRTC, ICE+TURN, Firestore signaling
│   ├── guided-examination.html   ✅ guard, VDB.createMedicalRecord
│   ├── examination-result.html   ✅ guard, VDB.getConsultation, VDB.createMedicalRecord
│   ├── clinic-map.html           ✅ guard
│   ├── herbal-detail.html        ✅ guard
│   ├── herbal-formula.html       ✅ guard
│   ├── news-detail.html          ✅ guard, VDB.getArticle (by ?id=)
│   ├── edit-profile.html         ✅ guard, VDB.updateUser, VDB.updatePatient
│   ├── medical-history.html      ✅ guard, VDB.getPatientRecords
│   ├── faq.html                  ✅ guard
│   ├── privacy-policy.html       ✅ guard
│   ├── emergency-contact.html    ✅ guard, Firestore emergency contacts
│   └── health-journal.html       ✅ guard, Firestore health journal
├── doctor/                       ← ✅ SEMUA 14 halaman ada + Firebase integrated
│   ├── home.html                 ✅ guard, getDoctorConsultations, notif badge
│   ├── patients.html             ✅ guard, Firestore assignedDoctors query
│   ├── chat.html                 ✅ guard, VDB
│   ├── profile.html              ✅ guard, VDB.getUser
│   ├── notification.html         ✅ VDB.subscribeNotifications, mark-read
│   ├── patient-detail.html       ✅ guard, VDB.getUser, VDB.getPatient, VitalsManager
│   ├── chat-room.html            ✅ VChatManager + WebRTC trigger
│   ├── guided-examination.html   ✅ guard, VDB.createMedicalRecord
│   ├── prescription.html         ✅ guard, VDB
│   ├── referral.html             ✅ guard, VDB
│   ├── schedule.html             ✅ guard, Firestore schedule
│   ├── earnings.html             ✅ guard, Firestore earnings
│   ├── reviews.html              ✅ guard, Firestore reviews
│   └── edit-profile.html         ✅ guard, VDB.updateUser, VDB updateDoctor
└── admin/                        ← ✅ SEMUA 13 halaman ada + Firebase integrated
    ├── home.html                 ✅ guard, VDB.getStats(), animateNumber
    ├── users.html                ✅ VDB.getAllUsers, filter, search, modal tambah user
    ├── notifications.html        ✅ broadcastNotifications, delete
    ├── news.html                 ✅ VDB.getAllArticles, publish/delete
    ├── advertise.html            ✅ guard, Firestore ads CRUD (add/toggle/delete banner images)
    ├── user-detail.html          ✅ guard, VDB.getUser, status management
    ├── doctor-verification.html  ✅ VDB.getAllUsers, approve/reject doctor
    ├── create-notification.html  ✅ VDB.sendNotificationToAll
    ├── create-article.html       ✅ VDB.createArticle
    ├── edit-article.html         ✅ VDB.updateArticle (by ?id=)
    ├── create-campaign.html      ✅ guard, Firestore campaigns
    ├── campaign-detail.html      ✅ guard, Firestore campaign detail
    └── seed-data.html            ✅ Firebase direct (dev tool)
```

---

## 🎨 Design System Rules (WAJIB DIPATUHI)

### Neumorphic Palette
```css
--bg: #E4EBF5;              /* Background utama */
--shadow-dark: #c8d0e7;     /* Shadow gelap */
--shadow-light: #FFFFFF;     /* Shadow terang */
--primary: #6FCF97;          /* Green */
--primary-dark: #27AE60;     /* Green dark */
--accent: #6C63FF;           /* Purple (fitur AI) */
--danger: #EB5757;           /* Red */
--warning: #F2994A;          /* Orange */
--info: #2F80ED;             /* Blue */
```

### Shadow System
```css
--shadow-out: 6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light);
--shadow-out-sm: 3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light);
--shadow-in: inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light);
```

### Font
- **Font family**: `'Poppins'` — sudah di-import via CSS
- **Weights**: 300, 400, 500, 600, 700, 800

### Teks — Kontras Aksesibel
```css
--text-primary: #2D3748;    /* Judul, teks utama */
--text-secondary: #4A5568;  /* Teks sekunder */
--text-tertiary: #6B7B8D;   /* Label, subtitle */
--text-muted: #8896A6;      /* HANYA dekoratif, bukan teks penting */
```

### Icon Library
- **Ionicons 5** via CDN (sudah ada di semua halaman)
- Gunakan `<ion-icon name="..."></ion-icon>`
- Referensi: https://ionic.io/ionicons/v5

### Boilerplate Setiap Halaman Baru

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HerboraTech — [JUDUL]</title>
  <!-- Sesuaikan path relatif ke shared/ -->
  <link rel="stylesheet" href="../shared/neumorphic.css">
  <script type='module' src='https://unpkg.com/ionicons@5.0.0/dist/ionicons/ionicons.esm.js'></script>
  <script nomodule src='https://unpkg.com/ionicons@5.0.0/dist/ionicons/ionicons.js'></script>
</head>
<body>
<div class="mobile-frame page-enter">

  <!-- HEADER: gunakan sub-header untuk halaman detail -->
  <header class="app-header">
    <button class="neu-icon-btn" onclick="nav('[BACK_URL]')">
      <ion-icon name="arrow-back-outline"></ion-icon>
    </button>
    <div style="font-size:1.05rem;font-weight:700;">[JUDUL HALAMAN]</div>
    <div style="width:42px"></div><!-- spacer jika tidak ada right button -->
  </header>

  <!-- CONTENT -->
  <div class="section">
    ...
  </div>

  <!-- BOTTOM NAV (kalau halaman utama) -->
  <nav class="bottom-nav">
    <a class="nav-item" href="home.html"><ion-icon name="home"></ion-icon><span>Beranda</span></a>
    <a class="nav-item" href="monitoring.html"><ion-icon name="pulse-outline"></ion-icon><span>Vitalis</span></a>
    <a class="nav-item" href="consultation.html"><ion-icon name="chatbubbles-outline"></ion-icon><span>Konsultasi</span></a>
    <a class="nav-item" href="herbal.html"><ion-icon name="leaf-outline"></ion-icon><span>Jamu</span></a>
    <a class="nav-item" href="profile.html"><ion-icon name="person-outline"></ion-icon><span>Profil</span></a>
  </nav>

</div>
<script src="../shared/app.js"></script>
</body>
</html>
```

### Halaman Admin — Boilerplate (Desktop Layout)

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HerboraTech — Admin [JUDUL]</title>
  <link rel="stylesheet" href="../shared/neumorphic.css">
  <script type='module' src='https://unpkg.com/ionicons@5.0.0/dist/ionicons/ionicons.esm.js'></script>
  <script nomodule src='https://unpkg.com/ionicons@5.0.0/dist/ionicons/ionicons.js'></script>
</head>
<body>
<div class="admin-layout">
  <aside class="admin-sidebar">
    <div class="sidebar-logo">Herbora<span>Tech</span></div>
    <nav class="sidebar-nav">
      <a class="sidebar-item" href="home.html"><ion-icon name="grid-outline"></ion-icon>Dashboard</a>
      <a class="sidebar-item" href="users.html"><ion-icon name="people-outline"></ion-icon>Users</a>
      <a class="sidebar-item" href="notifications.html"><ion-icon name="notifications-outline"></ion-icon>Notifikasi</a>
      <a class="sidebar-item" href="news.html"><ion-icon name="newspaper-outline"></ion-icon>News</a>
      <a class="sidebar-item" href="advertise.html"><ion-icon name="megaphone-outline"></ion-icon>Iklan</a>
    </nav>
    <a class="sidebar-item" href="../index.html" style="margin-top:auto;"><ion-icon name="log-out-outline"></ion-icon>Logout</a>
  </aside>
  <main class="admin-main">

    <div class="admin-topbar">
      <h1>[JUDUL]</h1>
      <div class="header-actions">...</div>
    </div>

    <!-- CONTENT -->
    ...

  </main>
</div>
<script src="../shared/app.js"></script>
</body>
</html>
```

### CSS Class yang Tersedia (Referensi Cepat)

| Class | Fungsi |
|---|---|
| `neu-card` | Card neumorphic standar (shadow out, padding 24px, radius 20px) |
| `neu-card-sm` | Card kecil (padding 16px, radius 15px) |
| `neu-card-primary` | Card gradient hijau dengan text putih |
| `neu-card-flat` | Card dengan shadow out, padding 20px |
| `neu-inset` | Box dengan shadow inset (efek "tertekan") |
| `neu-btn` | Tombol neumorphic dasar |
| `neu-btn-primary` | Tombol gradient hijau |
| `neu-btn-accent` | Tombol gradient ungu (untuk fitur AI) |
| `neu-btn-danger` | Tombol gradient merah |
| `neu-btn-sm` / `neu-btn-lg` | Ukuran tombol |
| `neu-btn-block` | Tombol full-width |
| `neu-input` | Input field neumorphic (shadow inset) |
| `neu-search` | Search bar dengan icon |
| `neu-switch` | Toggle switch |
| `neu-chip` | Chip/tag dasar |
| `neu-chip-primary` / `-danger` / `-warning` / `-info` / `-accent` | Chip berwarna |
| `neu-avatar` / `-sm` / `-lg` / `-xl` | Avatar circle |
| `neu-progress` + `neu-progress-fill` | Progress bar |
| `neu-tabs` + `neu-tab` | Tab bar rounded |
| `neu-list-item` | List item clickable |
| `neu-icon-btn` | Icon button bulat |
| `neu-table-wrap` + `neu-table` | Data table (admin) |
| `vital-grid` + `vital-card` | Grid vital sign cards |
| `stat-grid` + `stat-card` | Stats cards (admin) |
| `notif-item` | Notification list item |
| `chat-bubble sent/received` | Chat bubbles |
| `gauge-container` | Circular gauge chart |
| `section` + `section-header` + `section-title` + `section-link` | Section layout |

### JS Utilities yang Tersedia (`shared/app.js`)

```javascript
// Scroll animation (otomatis pada elemen dengan data-animate)
// Gunakan: data-animate="up|right|left|scale" data-delay="100"

sparkline(container, dataArray, color, height)  // SVG sparkline chart
createGauge(container, value, max, color)        // Circular gauge
miniBarChart(container, data, labels, color)      // Simple bar chart
simulateVital(elementId, baseValue, variance, decimals, interval)  // Live value
showToast(message, type)                          // Toast notification: success|error|warning|info
animateNumber(element, targetValue, duration)     // Count-up animation
nav(url)                                          // Page navigation
initCarousels()                                   // Auto-init carousels
initTabs(selector)                                // Auto-init tab switching
```

### Konvensi Penting
1. **Bahasa UI**: Bahasa Indonesia
2. **Data**: Semua dummy/mock — hardcoded di HTML
3. **Navigasi**: Gunakan `onclick="nav('file.html')"` atau `href="file.html"`
4. **Animasi masuk**: Tambahkan `data-animate="up" data-delay="100"` pada elemen
5. **CSS tambahan per halaman**: Tulis di `<style>` tag dalam `<head>`, JANGAN ubah `neumorphic.css`
6. **Tidak ada framework**: Murni HTML + CSS + vanilla JS
7. **Mobile frame**: Semua halaman patient & doctor dibungkus `<div class="mobile-frame">`
8. **Admin layout**: Gunakan `admin-layout` + `admin-sidebar` + `admin-main`
9. **Path CSS/JS**: `../shared/neumorphic.css` dan `../shared/app.js` (untuk auth: `../shared/...`)

---

## 📋 SPESIFIKASI HALAMAN YANG HARUS DIBUAT

### PRIORITAS 1 — Core Flow (12 halaman)

---

#### 🔐 `auth/login.html`
**Back**: tidak ada (halaman awal)
**Layout**: Centered card di tengah layar (tidak pakai mobile-frame)
**Komponen**:
- Logo HerboraTech di atas
- `neu-card` sebagai container form
- `neu-input` untuk Email/No. HP
- `neu-input` type password dengan toggle visibility
- `neu-btn-primary neu-btn-block` "Masuk"
- Divider "atau masuk dengan"
- 2 tombol `neu-btn neu-btn-block`: icon Google + icon Apple
- Link "Belum punya akun? Daftar" → `register.html`
- Link "Lupa password?" → `forgot-password.html`
- Tombol masuk mengarah ke `/patient/home.html` (hardcoded)

---

#### 🔐 `auth/register.html`
**Back**: `login.html`
**Layout**: Centered card, scrollable
**Komponen**:
- Header "Buat Akun Baru"
- Step indicator (1. Data Diri → 2. Verifikasi) — cukup visual saja
- Form fields (`neu-input`): Nama Lengkap, Email, No. HP, Password, Konfirmasi Password
- Pilih role: 2 buah `neu-card-sm` yang bisa dipilih (Pasien / Dokter) dengan visual radio
- Checkbox "Saya setuju dengan Syarat & Ketentuan"
- `neu-btn-primary neu-btn-block` "Daftar" → `otp-verification.html`

---

#### 🔐 `auth/forgot-password.html`
**Back**: `login.html`
**Komponen**:
- Ilustrasi/icon besar (🔒 emoji atau ion-icon `lock-closed-outline`)
- Teks penjelasan singkat
- `neu-input` Email atau No. HP
- `neu-btn-primary neu-btn-block` "Kirim Kode OTP" → `otp-verification.html`

---

#### 🔐 `auth/otp-verification.html`
**Back**: halaman sebelumnya
**Komponen**:
- Icon surat/verifikasi
- Teks "Kode telah dikirim ke 0812****3456"
- 6 buah input kotak OTP (masing-masing 1 digit, auto-focus ke berikutnya)
- Countdown timer "Kirim ulang dalam 00:59"
- Link "Kirim Ulang" (muncul setelah timer habis)
- `neu-btn-primary neu-btn-block` "Verifikasi"
- Auto-redirect ke `patient/home.html` saat berhasil (mock: onclick langsung nav)

---

#### 👤 `patient/doctor-detail.html`
**Back**: `consultation.html`
**Layout**: Mobile frame tanpa bottom nav
**Komponen**:
- Header transparan dengan tombol back
- Hero section: avatar besar, nama, spesialisasi, rating bintang
- Info cards row: pengalaman (tahun), pasien (jumlah), rating
- Tab: "Tentang" | "Jadwal" | "Ulasan"
- Tab Tentang: bio teks, pendidikan, STR/SIP info
- Tab Jadwal: kalender mini (grid tanggal), slot waktu yang bisa dipilih
- Tab Ulasan: list review (avatar, nama, rating, komentar, tanggal)
- Sticky bottom: bar harga + `neu-btn-primary` "Buat Janji" → `booking.html`

---

#### 👤 `patient/booking.html`
**Back**: `doctor-detail.html`
**Layout**: Mobile frame tanpa bottom nav
**Komponen**:
- Progress step: 1. Tipe → 2. Jadwal → 3. Konfirmasi (semua dalam 1 halaman pakai section)
- Step 1: 3 pilihan card (Chat / Video Call / Pemeriksaan Integratif) — masing-masing `neu-card-sm` dengan icon, nama, deskripsi, harga
- Step 2: Pilih tanggal (mini calendar row horizontal), pilih jam (grid slot button)
- Step 3: Ringkasan (info dokter, tipe, tanggal, jam, harga), input keluhan utama (`neu-input`)
- `neu-btn-primary neu-btn-block` "Konfirmasi & Bayar" → `showToast` sukses lalu nav ke `chat-room.html`

---

#### 👤 `patient/chat-room.html`
**Back**: `consultation.html`
**Layout**: Mobile frame TANPA bottom nav, full height
**Komponen**:
- Header: avatar dokter, nama, status online/offline, tombol video call & info
- Chat area (scrollable):
  - Bubbles: `chat-bubble sent` dan `chat-bubble received`
  - Sisipan card: "📊 Data Vital Sign Dibagikan" (neu-card-sm)
  - Sisipan card: "📋 Resep Digital" (neu-card-sm clickable)
  - Timestamp per grup pesan
- Input bar (sticky bottom): input text, tombol attach (foto), tombol kirim
- Mock beberapa percakapan dummy

---

#### 👤 `patient/video-call.html`
**Back**: `chat-room.html`
**Layout**: Fullscreen, dark background, TANPA mobile-frame
**Komponen**:
- Area video besar (mock: gradient/blur background dengan icon kamera)
- PiP kecil di pojok kanan atas (self-view mock)
- Overlay vital sign di pojok kiri atas: HR, SpO2 (teks kecil semi-transparan)
- Durasi call "05:23" di atas tengah
- Bottom control bar: Mute mic, Toggle kamera, Share screen, End call (merah)
- Tombol end call → nav ke `chat-room.html`

---

#### 👤 `patient/guided-examination.html`
**HALAMAN PALING PENTING — NOVELTY UTAMA**

**Back**: `chat-room.html` atau `consultation.html`
**Layout**: Mobile frame TANPA bottom nav

**Konsep**: Halaman multi-step dimana pasien dipandu oleh dokter. Setiap step harus diselesaikan (dikonfirmasi dokter) sebelum lanjut ke step berikutnya. Simulasikan dengan tombol "Menunggu konfirmasi dokter..." yang berubah jadi "Lanjut ke Step X" setelah delay/klik.

**Komponen Utama**:
- Progress bar horizontal di atas: 8 step dengan angka, step aktif berwarna hijau
- Judul step saat ini
- Konten step (berubah tiap step)
- Tombol "Menunggu Konfirmasi Dokter..." (disabled, abu-abu) yang berubah menjadi "Lanjut →" (hijau) setelah diklik / setelah 2 detik delay (simulasi konfirmasi)

**Detail 8 Step**:

**Step 1 — Pre-Examination Review**:
- Card: ringkasan data monitoring 7 hari (HR avg, SpO2 avg, langkah avg, tidur avg)
- Card: riwayat obat/herbal yang dikonsumsi
- Card: keluhan utama (teks yang sudah diisi saat booking)
- Status: "Dokter sedang mereview data Anda..."

**Step 2 — Anamnesa (Wawancara)**:
- Card pertanyaan dari dokter (styled sebagai chat bubble received)
- Form jawaban: beberapa `neu-input` untuk: Keluhan utama detail, Sejak kapan, Riwayat penyakit dahulu, Riwayat penyakit keluarga, Obat yang dikonsumsi, Alergi
- Tombol "Kirim Jawaban"

**Step 3 — Pemeriksaan Vital Sign**:
- Instruksi: "Pastikan sensor terpasang dengan benar" + animasi ikon sensor
- Live vital signs: HR, SpO2, Suhu, Respiratory Rate (pakai `simulateVital`)
- Timer: "Mengukur... 1:45 / 2:00" (progress bar)
- Catatan: "Minimal 2 menit untuk data HRV yang akurat"

**Step 4 — Inspeksi Visual**:
- Instruksi: "Dokter akan memeriksa melalui kamera"
- Mock kamera area (kotak gelap dengan icon kamera)
- Checklist inspeksi: Wajah, Mata, Lidah, Area keluhan — masing-masing dengan checkbox
- Tombol "📸 Ambil Foto" (mock)

**Step 5 — Palpasi Terpandu**:
- Instruksi dari dokter (chat bubble)
- Body map interaktif: gambar tubuh SVG sederhana dimana pasien bisa tap area untuk menandai lokasi nyeri
- Skala nyeri slider: 1-10
- Input: deskripsi temuan

**Step 6 — Auskultasi (Opsional)**:
- Keterangan: "Fitur ini memerlukan digital stethoscope"
- Tombol "Lewati" dan "Mulai Auskultasi"
- Jika mulai: panduan titik auskultasi + mock audio indicator

**Step 7 — Pemeriksaan Tambahan**:
- Kuesioner PHQ-9 (mock: 3-4 pertanyaan dengan radio pilihan)
- Input: berat badan, lingkar pinggang
- Tombol "Selesai"

**Step 8 — Menunggu Assessment**:
- Animasi loading/spinner
- Teks: "Dokter sedang menyusun hasil pemeriksaan..."
- Setelah delay: "Hasil pemeriksaan sudah siap!" + `neu-btn-primary` → `examination-result.html`

---

#### 👤 `patient/examination-result.html`
**Back**: tidak ada (hasil final)
**Layout**: Mobile frame tanpa bottom nav
**Komponen**:
- Header: "Hasil Pemeriksaan" + tanggal
- Card diagnosis: nama diagnosis, ICD-10 code (mock), severity badge (ringan/sedang/berat)
- Card catatan klinis dari dokter (teks paragraf)

- **3 Opsi Output** (tampilkan yang relevan sebagai card):

  **Opsi 1 — Rujukan Klinik** (jika ada):
  - `neu-card` border-left merah: "Diperlukan pemeriksaan fisik langsung"
  - Tombol "Lihat Klinik Terdekat →" → `clinic-map.html`
  - Info surat rujukan digital

  **Opsi 2 — Resep & Perawatan** (jika ada):
  - `neu-card` border-left biru: resep obat (list obat + dosis)
  - `neu-card` border-left hijau: rekomendasi herbal (formula jamu + cara buat)
  - Jadwal follow-up
  - Instruksi perawatan rumah

  **Opsi 3 — Laporan Sehat** (jika ada):
  - `neu-card` border-left hijau: "Tidak teridentifikasi penyakit"
  - Saran: istirahat cukup, pola makan, olahraga
  - Jadwal check-up berikutnya

- Tombol "Download PDF" dan "Kembali ke Beranda"

---

#### 👤 `patient/clinic-map.html`
**Back**: `examination-result.html`
**Komponen**:
- Header "Klinik Terdekat"
- Mock peta: `neu-card` besar dengan background gradient yang menyimulasikan peta, beberapa pin marker (emoji 📍)
- Filter: chips untuk spesialisasi, BPJS, jam buka
- List klinik di bawah peta: masing-masing `neu-card-sm` dengan nama, alamat, jarak, rating, jam buka, tombol "Navigasi" dan "Daftar Online"
- Card surat rujukan: preview singkat + tombol "Lihat Surat Rujukan"

---

#### 👩‍⚕️ `doctor/patient-detail.html`
**Back**: `patients.html`
**Layout**: Mobile frame tanpa bottom nav
**Komponen**:
- Header: nama pasien + tombol chat
- Profil card: avatar, nama, umur, jenis kelamin, golongan darah, alergi
- Tab: "Monitoring" | "Riwayat" | "Risk Score" | "Catatan"
- Tab Monitoring: vital grid (HR, SpO2, Suhu, Langkah) + sparkline 7 hari
- Tab Riwayat: timeline konsultasi sebelumnya (tanggal, diagnosa, dokter)
- Tab Risk Score: gauge + detail per penyakit metabolik (mirip patient/disease-risk.html)
- Tab Catatan: list catatan klinis + tombol tambah catatan baru
- Sticky bottom: "Mulai Konsultasi" button

---

#### 👩‍⚕️ `doctor/chat-room.html`
**Back**: `chat.html`
**Layout**: Mobile frame TANPA bottom nav
**Komponen**:
- Header: avatar pasien, nama, umur, tombol info (ke patient-detail) & video call
- **Sidebar panel kanan** (bisa toggle): mini vital signs pasien real-time
- Chat area: bubbles + sisipan data
- Quick actions di atas input: "📋 Resep" → `prescription.html`, "📄 Rujukan" → `referral.html`, "🔬 Mulai Pemeriksaan Integratif" → `guided-examination.html`
- Input bar: text input + attach + send

---

#### 👩‍⚕️ `doctor/guided-examination.html`
**HALAMAN PALING PENTING — SISI DOKTER**

**Back**: `chat-room.html`
**Layout**: Mobile frame tanpa bottom nav

**Konsep**: Dokter mengontrol alur pemeriksaan. Setiap step, dokter bisa melihat data/jawaban pasien, menambah catatan, dan menekan tombol konfirmasi untuk membuka step berikutnya.

**Komponen Utama**:
- Progress bar 8 step (sama seperti pasien tapi dari perspektif dokter)
- Setiap step menampilkan: data/jawaban dari pasien + area catatan dokter + tombol "Konfirmasi & Lanjut"

**Detail Step (dari perspektif dokter)**:

**Step 1**: Review dashboard data monitoring pasien (charts, vital grid)
**Step 2**: Baca jawaban anamnesa + bisa kirim pertanyaan follow-up + catatan
**Step 3**: Monitor vital sign real-time pasien + quality indicator sinyal + tombol "Minta Ukur Ulang"
**Step 4**: Video feed dari pasien + checklist inspeksi yang bisa dicentang + capture foto
**Step 5**: Lihat body map yang ditandai pasien + catatan palpasi
**Step 6**: Audio stream (mock) + catatan auskultasi
**Step 7**: Lihat jawaban kuesioner + data tambahan
**Step 8**: Form assessment: input diagnosis (autocomplete ICD-10 mock), severity, differential diagnosis, catatan klinis, pilih output (3 checkbox: rujukan / resep+herbal / laporan sehat) + detail masing-masing output. Tombol "Kirim Hasil ke Pasien"

---

### PRIORITAS 2 — Output & Detail (5 halaman Patient + 2 Doctor)

---

#### 👤 `patient/herbal-detail.html`
**Back**: `herbal.html`
**Komponen**: Gambar/emoji tanaman besar, nama lokal + ilmiah, khasiat (list), cara penggunaan, dosis per kondisi, kontraindikasi (danger card), evidence level badge, interaksi obat, tombol "Tambah ke Tracker"

#### 👤 `patient/herbal-formula.html`
**Back**: `herbal.html`
**Komponen**: Nama formula jamu, indikasi, list bahan + takaran (table), instruksi preparasi step-by-step (numbered), durasi penggunaan, warning, tombol "Beli Bahan" (mock marketplace link)

#### 👤 `patient/news-detail.html`
**Back**: `news.html`
**Komponen**: Hero image (gradient mock), kategori chip, judul, tanggal + read time, penulis, body teks (paragraf + subheading), share button, bookmark, "Artikel Terkait" di bawah

#### 👩‍⚕️ `doctor/prescription.html`
**Back**: `chat-room.html`
**Komponen**: Info pasien (card), form resep: search obat + pilih dari dropdown, input dosis/frekuensi/durasi, tombol tambah obat lain, section "Rekomendasi Herbal": pilih formula jamu, catatan untuk pasien, preview resep, tombol "Kirim Resep"

#### 👩‍⚕️ `doctor/referral.html`
**Back**: `chat-room.html` atau `guided-examination.html`
**Komponen**: Auto-filled info pasien, diagnosis + alasan rujuk, pilih tipe faskes tujuan, catatan klinis, preview surat rujukan, tombol "Kirim Surat Rujukan"

---

### PRIORITAS 3 — Settings & Profil (9 halaman)

---

#### 👤 `patient/edit-profile.html`
**Back**: `profile.html`
**Komponen**: Avatar + tombol ganti foto, form fields: Nama, Tanggal Lahir (date), Jenis Kelamin (radio), BB (kg), TB (cm), Golongan Darah (dropdown), Riwayat Alergi (multi-input/tags), Riwayat Penyakit Keluarga (checkboxes: DM, Hipertensi, Jantung, Kanker, dll). Tombol "Simpan"

#### 👤 `patient/medical-history.html`
**Back**: `profile.html`
**Komponen**: Timeline vertikal: setiap item = tanggal + diagnosa + dokter + aksi. Filter berdasarkan tahun. Sections: Diagnosa, Obat Aktif, Riwayat Operasi, Vaksinasi

#### 👤 `patient/faq.html`
**Back**: `profile.html`
**Komponen**: Search bar, accordion items (click untuk expand/collapse): ~8-10 pertanyaan tentang sensor, konsultasi, AI, herbal, pembayaran, privasi

#### 👤 `patient/privacy-policy.html`
**Back**: `profile.html`
**Komponen**: Teks panjang dalam `neu-card`, subheading per section, toggle consent "Izinkan data saya untuk analisis AI"

#### 👤 `patient/emergency-contact.html`
**Back**: `profile.html`
**Komponen**: List kontak darurat (card per kontak: nama, hubungan, no telp, switch aktif), tombol "Tambah Kontak", form modal: nama, hubungan (dropdown), nomor HP, auto-notify toggle

#### 👩‍⚕️ `doctor/schedule.html`
**Back**: `profile.html`
**Komponen**: Tampilan mingguan (7 kolom), setiap hari bisa di-toggle aktif/nonaktif, set jam mulai-selesai, durasi per slot (dropdown 15/30/45/60 min), max pasien per slot, block istirahat, tombol "Simpan Jadwal"

#### 👩‍⚕️ `doctor/earnings.html`
**Back**: `profile.html`
**Komponen**: Total saldo card (besar, hijau), tombol "Tarik Dana", statistik row: pendapatan hari/minggu/bulan, bar chart mini pendapatan 7 hari terakhir, list detail transaksi (tanggal, pasien, tipe, jumlah)

#### 👩‍⚕️ `doctor/reviews.html`
**Back**: `profile.html`
**Komponen**: Rating overview (angka besar + bintang + total ulasan), distribusi rating (5 progress bar untuk bintang 1-5), list ulasan: avatar pasien, nama, rating, komentar, tanggal, tombol "Balas"

#### 👩‍⚕️ `doctor/edit-profile.html`
**Back**: `profile.html`
**Komponen**: Avatar + ganti foto, fields: Nama, Spesialisasi, Bio, Pendidikan (multi-entry), Pengalaman (tahun), upload STR, upload SIP, tarif per tipe konsultasi (3 input)

---

### PRIORITAS 4 — Fitur Tambahan & Admin (9 halaman)

---

#### 👤 `patient/ai-consultation.html`
**Back**: `consultation.html`
**Komponen**: Header "AI Health Assistant" dengan badge AI, chat interface mirip chat-room tapi dengan AI (avatar robot/ungu), guided symptom checker (pertanyaan berurutan), hasil assessment card, tombol "Rujuk ke Dokter Manusia", auto-tampilkan data sensor dalam konteks

#### 👤 `patient/health-journal.html`
**Back**: `profile.html` atau `lifestyle.html`
**Komponen**: Kalender bulan di atas (dot indicator pada tanggal yang ada entry), list entry per tanggal terpilih, tombol "+ Entry Baru", form entry: tanggal, gejala (tag input), mood (emoji picker 5 pilihan), makanan (text), catatan (textarea), tombol simpan

#### 🛡️ `admin/user-detail.html`
**Back**: `users.html`
**Komponen**: Info lengkap user (semua field), status badge (active/suspended/banned), tombol aksi (suspend/activate/delete), audit log tabel (tanggal, aksi, detail), statistik penggunaan (konsultasi, device, engagement)

#### 🛡️ `admin/doctor-verification.html`
**Back**: `users.html`
**Komponen**: List dokter pending verifikasi, per dokter: card dengan nama, spesialisasi, tanggal daftar, preview dokumen (STR/SIP/Ijazah mock: kotak placeholder), tombol "Approve" (hijau) + "Reject" (merah) + textarea catatan

#### 🛡️ `admin/create-notification.html`
**Back**: `notifications.html`
**Komponen**: Form: judul, body (textarea), upload gambar (mock), deep link URL, target audience (radio: Semua/Pasien/Dokter/Custom), scheduled time (datetime input), preview card, tombol "Kirim Sekarang" / "Jadwalkan"

#### 🛡️ `admin/create-article.html`
**Back**: `news.html`
**Komponen**: Input judul, pilih kategori (dropdown), tags (multi-input), textarea konten (mock WYSIWYG: cukup textarea besar), upload gambar utama (mock), assign reviewer (dropdown), tombol "Simpan Draft" / "Kirim untuk Review" / "Publish"

#### 🛡️ `admin/edit-article.html`
**Back**: `news.html`
**Komponen**: Sama seperti create-article tapi pre-filled dengan data dummy, status workflow badge (Draft/Review/Published), tombol "Update" / "Unpublish"

#### 🛡️ `admin/create-campaign.html`
**Back**: `advertise.html`
**Komponen**: Upload banner (mock: drag-drop area), judul kampanye, URL target, tanggal mulai-selesai (date inputs), budget (input number), targeting (checkboxes: lokasi, usia, gender), preview banner, tombol "Luncurkan Kampanye"

#### 🛡️ `admin/campaign-detail.html`
**Back**: `advertise.html`
**Komponen**: Preview banner, info kampanye, statistik cards (impressions, clicks, CTR, conversions), mini bar chart performa 7 hari, tombol "Pause" / "Edit" / "Hapus"

---

## 🔄 Urutan Pengerjaan yang Disarankan

```
Batch 1 (Auth):           auth/login → register → forgot-password → otp-verification
Batch 2 (Patient Core):   doctor-detail → booking → chat-room → video-call
Batch 3 (Guided Exam):    patient/guided-examination → doctor/guided-examination
Batch 4 (Exam Result):    examination-result → clinic-map
Batch 5 (Doctor Core):    doctor/patient-detail → doctor/chat-room → prescription → referral
Batch 6 (Detail Pages):   herbal-detail → herbal-formula → news-detail
Batch 7 (Patient Prof):   edit-profile → medical-history → faq → privacy-policy → emergency-contact
Batch 8 (Doctor Prof):    schedule → earnings → reviews → edit-profile
Batch 9 (AI + Journal):   ai-consultation → health-journal
Batch 10 (Admin):         user-detail → doctor-verification → create-notification → create-article → edit-article → create-campaign → campaign-detail
```

## ⚡ Quick Command untuk Claude Code

Untuk memulai, cukup ketik di Claude Code:

```
Baca file CLAUDE.md, lalu buatkan [NAMA_FILE] sesuai spesifikasi di dalamnya. 
Gunakan design system dari shared/neumorphic.css dan referensikan halaman yang sudah ada (misal patient/home.html) untuk konsistensi style.
```

Atau untuk batch:

```
Baca CLAUDE.md, lalu buatkan semua file di Batch 1 (auth/login.html, auth/register.html, auth/forgot-password.html, auth/otp-verification.html) sesuai spesifikasi.
```
