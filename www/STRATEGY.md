# HerboraTech — Technical Strategy
<!-- Last updated: 2026-03-21 -->

## Stack 100% Gratis

| Kebutuhan | Solusi | Tier Gratis |
|---|---|---|
| Auth (email + Google) | Firebase Auth | Unlimited |
| Database | Firebase Firestore | 50K reads / 20K writes / hari |
| File Storage | Firebase Storage | 5 GB |
| WebRTC Signaling | Firebase Firestore | (termasuk atas) |
| STUN Server | Google STUN | Gratis selamanya |
| TURN Server | Open Relay Project | Gratis (openrelay.metered.ca) |
| Email Verifikasi | Firebase Auth bawaan | Gratis |
| Hosting (opsional) | Firebase Hosting | 10 GB bandwidth/bulan |

**Total biaya infrastruktur: Rp 0**

---

## Setup Firebase (Wajib Dilakukan Sekali)

1. Buka https://console.firebase.google.com
2. **Create project** → nama: `herboratech`
3. **Authentication** → Get started → Sign-in method:
   - Enable **Email/Password**
   - Enable **Google** (tambahkan email support@herboratech.id)
4. **Firestore Database** → Create database → Start in **test mode**
5. **Web App** → Project Settings → Your apps → klik icon `</>`
   - Register app: `herboratech-web`
   - Copy `firebaseConfig` → paste ke `www/shared/firebase.js` (ganti bagian CONFIG)
6. Deploy Security Rules dari `www/firestore.rules`

---

## Database Schema (Firestore)

```
users/{uid}
  uid, email, name, role (patient|doctor|admin)
  photoURL, createdAt, isActive

patients/{uid}
  dob, gender, bloodType, weight (kg), height (cm)
  allergies[], familyHistory[], assignedDoctors[]

doctors/{uid}
  specialty, bio, education[], licenseSTR, licenseSIP
  consultationRates: { chat, video, integrative }
  rating, totalPatients

vitals/{patientId}/readings/{autoId}           ← 1 dokumen per menit
  timestamp, hr, spo2, temperature, gsr
  steps, hrv, respirationRate, source

consultations/{consultId}
  patientId, doctorId, type (chat|video|integrative)
  status (pending|active|completed|cancelled)
  complaint, startTime, endTime, price

messages/{consultId}/items/{msgId}
  senderId, senderName, senderRole
  text, type (text|vital_share|prescription)
  timestamp, metadata{}

medicalRecords/{recordId}
  patientId, doctorId, consultationId, date
  diagnosis: { name, icd10, severity }
  prescription: [{ drug, dose, frequency, duration }]
  herbal: { formula, ingredients[] }
  clinicalNotes, followUpDate

notifications/{uid}/items/{notifId}
  title, body, type, read, timestamp
  data: { link }

articles/{articleId}
  title, body, category, author: {id, name}
  tags[], coverImage, status, createdAt, publishedAt, readTime

calls/{callId}                                 ← WebRTC signaling
  callerId, calleeId, consultationId, status
  offer: { type, sdp }
  answer: { type, sdp } | null
  createdAt

calls/{callId}/callerCandidates/{id}           ← ICE candidates
calls/{callId}/calleeCandidates/{id}
```

---

## Auth Flow

```
REGISTER (Email):
  createUserWithEmailAndPassword(email, password)
  → updateProfile({ displayName: name })
  → Firestore: users/{uid} = { role, name, email, createdAt }
  → sendEmailVerification()
  → redirect: /auth/verify-email.html

REGISTER (Google):
  signInWithPopup(GoogleAuthProvider)
  → if new user: Firestore users/{uid} = { role, name, email }
  → Google sudah verified → redirect beranda langsung

LOGIN (Email):
  signInWithEmailAndPassword(email, password)
  → if !emailVerified → redirect verify-email.html
  → get role from Firestore users/{uid}
  → redirect: patient→/patient/home.html | doctor→/doctor/home.html | admin→/admin/home.html

LOGIN (Google):
  signInWithPopup(GoogleAuthProvider)
  → get role → redirect

EMAIL VERIFICATION:
  verify-email.html: tombol "Sudah Verifikasi" → reload currentUser
  Tombol "Kirim Ulang" → sendEmailVerification()

AUTH GUARD (setiap halaman app):
  firebase.auth().onAuthStateChanged(user => {
    if (!user) → redirect login
    if (!user.emailVerified && !isGoogleUser) → redirect verify-email
    check role matches page → else redirect correct home
  })
```

---

## Vitals Data Flow

```
SmartWatch BLE
    │
    ▼ (Web Bluetooth API / simulasi)
VitalsManager.buffer (memory, update tiap 1 detik)
    │                          │
    ▼                          ▼ (setiap 60 detik)
UI Display real-time    Firestore: vitals/{uid}/readings/{autoId}
(1s interval)           (1 dokumen per menit, ~1440 dokumen/hari/pasien)
```

**Estimasi Firestore usage per 100 pasien aktif/hari:**
- Writes: 100 × 1440 = 144,000 → dalam limit gratis 50K writes per hari
- Perlu aktifkan pasien secara bertahap atau batasi write ke 720/hari (setiap 2 menit)

---

## WebRTC Architecture (100% Free)

```
ICE Servers (iceServers config):
  stun:stun.l.google.com:19302      ← Google STUN (gratis)
  stun:stun1.l.google.com:19302     ← Google STUN backup
  turn:openrelay.metered.ca:80      ← Open Relay TURN (gratis)
  turn:openrelay.metered.ca:443     ← Open Relay TURN TLS (gratis)
  turn:openrelay.metered.ca:443?transport=tcp

Signaling via Firestore:
  [Dokter] klik "Video Call"
    → createPeerConnection()
    → createOffer() → calls/{callId}.offer = { sdp }
    → listen calleeCandidates → addIceCandidate()

  [Pasien] terima notif "Dokter memanggil..."
    → createPeerConnection()
    → setRemoteDescription(offer)
    → createAnswer() → calls/{callId}.answer = { sdp }
    → listen callerCandidates → addIceCandidate()

  → P2P video call terhubung (STUN/TURN)

  [End call] calls/{callId}.status = 'ended' → kedua sisi cleanup
```

---

## Implementation Batches

| Batch | Files | Status |
|---|---|---|
| A — Foundation | firebase.js, auth.js, db.js | ✅ Done |
| B — Auth Pages | login, register, forgot-pw, verify-email | ✅ Done |
| C — Vitals System | vitals-manager.js, patient/home, monitoring | ✅ Done |
| D — Chat System | chat-manager.js, patient/chat-room, doctor/chat-room | ✅ Done |
| E — WebRTC | webrtc-manager.js, video-call.html | ✅ Done |
| F — Notifications | notification pages (patient+doctor), admin create+list | ✅ Done |
| G — News/Articles | news pages, admin create+edit | ✅ Done |
| H — Patient Data | profile, edit-profile, medical-history, monitoring deep | Pending |
| I — Doctor Data | patient-detail, schedule, earnings | Pending |
| J — Admin CRUD | users, user-detail, doctor-verification | Pending |

---

## Firestore Security Rules (ringkasan)

```
users → baca: diri sendiri + admin | tulis: diri sendiri
patients → baca: diri sendiri + dokter yang ditugaskan + admin
vitals → tulis: pasien sendiri | baca: pasien + dokternya
consultations → baca/tulis: patient/doctor yang terlibat + admin
messages → baca/tulis: participant konsultasi
medicalRecords → tulis: dokter | baca: pasien + dokternya
notifications → baca: pemilik | tulis: admin + sistem
articles → baca: authenticated (published) | tulis: admin
calls → baca/tulis: authenticated (dalam konsultasi aktif)
```

File lengkap: `www/firestore.rules`
