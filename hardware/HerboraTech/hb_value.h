// ============================================================
//  hb_value.h — kapan sebuah angka boleh ditampilkan
// ============================================================
//
//  Jam ini tidak menampilkan angka yang tidak bisa dipertanggungjawabkan.
//  Kalau sensor belum yakin, layar menulis "-" daripada menebak. Modul ini
//  yang memutuskan itu.
//
//  Dua perilaku yang mudah terlewat kalau logikanya disebar:
//
//  1. TAHAN. Angka yang sudah tampil bertahan VALUE_HOLD_MS walau sensor
//     sesaat ragu. Tanpa ini angka berkedip-kedip setiap kali pemakai
//     bergeser sedikit, dan jam terasa rusak padahal tidak.
//
//  2. TENANG. Setelah suhu melonjak tajam — biasanya karena pemakai baru
//     masuk atau keluar ruangan ber-AC — suhu kulit tidak dipercaya
//     selama TEMP_SETTLE_MS. Yang berubah suhu ruangannya, bukan tubuhnya.
//
// ============================================================

#ifndef HB_VALUE_H
#define HB_VALUE_H

#include <Arduino.h>

struct HbValue {
  float    value    = 0.0f;
  bool     valid    = false;
  uint32_t lastGood = 0;
};

// Menyetor pembacaan baru. `ok` adalah penilaian sensor: apakah pembacaan
// ini masuk akal. Kalau tidak, angka lama masih ditahan sebentar.
void hbValueUpdate(HbValue &v, float reading, bool ok, uint32_t now);

// Menulis angka ke buffer, atau "-" kalau tidak bisa dipercaya.
// `prefix` dipakai untuk menandai perkiraan, misalnya "~" pada SpO2.
void hbValueText(const HbValue &v, char *buf, size_t len, uint8_t decimals, const char *prefix = "");

// Melupakan nilai sepenuhnya, tanpa masa tahan. Dipakai saat jam lepas
// dari pergelangan: menahan angka lama di situ justru menyesatkan.
void hbValueClear(HbValue &v);

// ── Suhu ────────────────────────────────────────────────────
//
//  Dipisah karena punya aturan sendiri: lonjakan tajam berarti pindah
//  ruangan, dan sesudahnya ada masa tenang.

struct HbTemp {
  HbValue  v;
  float    previous = 0.0f;
  bool     hasPrev  = false;
  uint32_t settleAt = 0;   // sebelum waktu ini, suhu tidak dipercaya
};

void hbTempUpdate(HbTemp &t, float reading, bool sensorOk, uint32_t now);

// true kalau suhu sedang dalam masa tenang setelah lonjakan.
bool hbTempSettling(const HbTemp &t, uint32_t now);

#endif // HB_VALUE_H
