// ============================================================
//  herboratech_config.h — sakelar perilaku jam
// ============================================================
//
//  Berkas ini satu-satunya tempat menyetel perilaku yang berbeda antara
//  meja kerja dan perangkat yang dipakai orang. Jangan menyebar nilai-nilai
//  ini ke berkas lain; kalau ada yang perlu disetel, tambahkan di sini.
//
//  Nilai bawaan di bawah adalah SETELAN MEJA — layar tidak pernah padam,
//  batas waktu dilonggarkan. Sebelum rilis, baca kolom "sebelum rilis".
//
// ============================================================

#ifndef HERBORATECH_CONFIG_H
#define HERBORATECH_CONFIG_H

// ── Sakelar utama ───────────────────────────────────────────
//
//  Sakelar          bawaan  sebelum rilis  keterangan
//  ---------------- ------- -------------- ------------------------------
//  SCREEN_ALWAYS_ON      1               0  layar tidak pernah padam sendiri
//  BENCH_MODE            1               0  batas padam dilonggarkan
//  PPG_ALWAYS_RED        0               0  LED merah hanya saat pemeriksaan
//  DEMO_DATA             0               0  tidak ada angka palsu

#define SCREEN_ALWAYS_ON   1
#define BENCH_MODE         1
#define PPG_ALWAYS_RED     0
#define DEMO_DATA          0

// ── Daya & tombol ───────────────────────────────────────────

// Lama menahan tombol samping untuk mematikan papan (milidetik).
#define PWR_HOLD_MS        1500

// Tombol samping. Papan Waveshare ESP32-S3-Touch-LCD-1.47 tidak punya
// tombol khusus, jadi tombol BOOT dipakai. Ia tersambung ke ground saat
// ditekan, karena itu INPUT_PULLUP dan logikanya terbalik.
#define PIN_SIDE_BUTTON    0
#define SIDE_BUTTON_ACTIVE_LOW 1

// ── Batas waktu layar ───────────────────────────────────────
//
//  Dua angka: redup dulu, baru padam. BENCH_MODE melonggarkan keduanya
//  supaya layar tidak terus mati saat sedang dikerjakan di meja.

#if BENCH_MODE
  #define SCREEN_DIM_MS    45000UL
  #define SCREEN_OFF_MS    60000UL
#else
  #define SCREEN_DIM_MS     4000UL
  #define SCREEN_OFF_MS     6000UL
#endif

// ── Kecerahan ───────────────────────────────────────────────
//
//  Lima tingkat, sesuai lima petak pada Setelan Cepat. Nilainya duty PWM
//  0-255. Tingkat terendah sengaja tidak nol agar layar tidak tampak mati.

#define BRIGHTNESS_LEVELS  5
#define BRIGHTNESS_DEFAULT 3
static const uint8_t BRIGHTNESS_TABLE[BRIGHTNESS_LEVELS] = { 20, 60, 120, 190, 255 };

// Kecerahan saat senter dinyalakan.
#define TORCH_BRIGHTNESS   255

// Kecerahan saat layar sedang meredup sebelum padam.
#define BRIGHTNESS_DIMMED  15

// ── Gestur ──────────────────────────────────────────────────
//
//  Jarak minimum agar sebuah sapuan dianggap geseran, bukan ketukan yang
//  melenceng. Layar ini hanya selebar 172 px, jadi ambang mendatar dibuat
//  lebih kecil daripada ambang tegak.

#define SWIPE_MIN_X        38
#define SWIPE_MIN_Y        52
#define SWIPE_MAX_MS       600
#define TAP_MAX_MOVE       14
#define TAP_MAX_MS         320
#define DOUBLE_TAP_GAP_MS  380
#define LONG_PRESS_MS      650

// ── Pemeriksaan Terpandu ────────────────────────────────────

// Lama pemeriksaan dalam detik. Hitungan berhenti saat tangan bergerak,
// jadi durasi sebenarnya bisa lebih panjang dari angka ini.
#define CHECK_SECONDS      30

// Ambang gerak yang membuat hitungan berhenti. Satuannya g, diukur dari
// simpangan magnitudo percepatan terhadap 1 g.
#define CHECK_MOTION_G     0.06f

// Suhu diambil pada beberapa detik terakhir, saat tangan paling tenang.
#define CHECK_TEMP_TAIL_S  5

// ── Indeks Preemptif ────────────────────────────────────────

// Jumlah hari yang harus terkumpul sebelum indeks boleh ditampilkan.
// Indeks membandingkan hari ini dengan kebiasaan tubuh pemakai sendiri,
// jadi ia tidak berarti apa-apa sebelum kebiasaannya dikenal.
#define INDEX_BASELINE_DAYS 7

// ── Kepercayaan angka ───────────────────────────────────────
//
//  Jam ini menulis "-" daripada menebak. Nilai di bawah menentukan kapan
//  sebuah angka dianggap tidak bisa dipertanggungjawabkan.

// Angka yang sudah tampil bertahan selama ini walau sensor sesaat ragu,
// supaya tidak berkedip-kedip setiap kali pemakai bergeser.
#define VALUE_HOLD_MS      6000UL

// Setelah perubahan suhu ruangan yang tajam, suhu kulit tidak dipercaya
// selama tenggang ini.
#define TEMP_SETTLE_MS     600000UL

// Perubahan suhu sebesar ini dalam satu pembacaan dianggap perpindahan
// ruangan, bukan perubahan suhu tubuh.
#define TEMP_JUMP_C        1.5f

// ── Bluetooth ───────────────────────────────────────────────
//
//  Nama ini harus cocok dengan DEVICE_NAME_PREFIX di
//  www/shared/ble-manager.js. Kalau salah satu diubah, aplikasi tidak
//  akan menemukan jam.
#define BLE_DEVICE_NAME    "HerboraTech"

#endif // HERBORATECH_CONFIG_H
