// ============================================================
//  hb_check.h — Pemeriksaan Terpandu 30 detik
// ============================================================
//
//  Satu-satunya cara mendapatkan SpO2. Pengukuran oksigen dari pergelangan
//  butuh tangan yang benar-benar diam, jadi pemeriksaan ini punya satu
//  aturan yang membedakannya dari pembacaan biasa:
//
//      HITUNGAN BERHENTI SAAT TANGAN BERGERAK.
//
//  Bukan sekadar menandai datanya buruk, tapi benar-benar menahan hitungan
//  mundur sampai tangan tenang lagi. Lebih baik pemeriksaan terasa lama
//  daripada menghasilkan angka yang tidak bisa dipercaya.
//
//  Suhu diambil pada CHECK_TEMP_TAIL_S detik terakhir, saat tangan sudah
//  paling lama diam.
//
//  LED merah MAX30102 hanya menyala selama pemeriksaan (kecuali
//  PPG_ALWAYS_RED disetel 1). Merah boros; IR saja cukup untuk detak
//  jantung sehari-hari, dan merah hanya perlu untuk SpO2.
//
// ============================================================

#ifndef HB_CHECK_H
#define HB_CHECK_H

#include <Arduino.h>

enum HbCheckState {
  CHK_IDLE = 0,
  CHK_RUNNING,     // hitungan berjalan, tangan tenang
  CHK_PAUSED,      // hitungan berhenti, menunggu tangan tenang
  CHK_DONE,
  CHK_CANCELLED
};

void         hbCheckStart();
void         hbCheckCancel();

// Dipanggil tiap putaran loop. `motionG` adalah simpangan magnitudo
// percepatan terhadap 1 g. `spo2Ready` menandai sampel SpO2 sudah matang.
void         hbCheckUpdate(float motionG, float spo2Value, bool spo2Ready,
                           float tempC, bool tempOk, uint32_t now);

HbCheckState hbCheckStateNow();
uint8_t      hbCheckSecondsLeft();
bool         hbCheckMotionHold();      // true kalau sedang tertahan gerak

// Hasil, hanya berarti setelah CHK_DONE.
float        hbCheckResultSpo2();
bool         hbCheckResultSpo2Valid();
float        hbCheckResultTemp();
bool         hbCheckResultTempValid();

// true kalau LED merah harus menyala saat ini.
bool         hbCheckWantsRedLed();

#endif // HB_CHECK_H
