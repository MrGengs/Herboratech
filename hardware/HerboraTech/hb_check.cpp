#include "hb_check.h"
#include "herboratech_config.h"
#include <math.h>

namespace {

HbCheckState s_state    = CHK_IDLE;
uint32_t     s_lastTick = 0;      // kapan detik terakhir dikurangi
uint8_t      s_left     = CHECK_SECONDS;
bool         s_hold     = false;  // sedang tertahan gerak

// Hasil
float s_spo2      = 0.0f;  bool s_spo2Valid = false;
float s_temp      = 0.0f;  bool s_tempValid = false;

// Tangan harus tenang beberapa saat dulu sebelum hitungan dilanjutkan.
// Tanpa jeda ini, hitungan tersendat-sendat mengikuti setiap getaran kecil
// dan pemakai melihat angka yang melompat-lompat.
const uint32_t CALM_BEFORE_RESUME_MS = 400;
uint32_t s_calmSince = 0;

} // namespace

void hbCheckStart() {
  s_state     = CHK_RUNNING;
  s_left      = CHECK_SECONDS;
  s_lastTick  = millis();
  s_hold      = false;
  s_calmSince = 0;
  s_spo2Valid = false;
  s_tempValid = false;
}

void hbCheckCancel() {
  if (s_state == CHK_RUNNING || s_state == CHK_PAUSED) s_state = CHK_CANCELLED;
}

HbCheckState hbCheckStateNow()   { return s_state; }
uint8_t      hbCheckSecondsLeft(){ return s_left; }
bool         hbCheckMotionHold() { return s_hold; }

float hbCheckResultSpo2()      { return s_spo2; }
bool  hbCheckResultSpo2Valid() { return s_spo2Valid; }
float hbCheckResultTemp()      { return s_temp; }
bool  hbCheckResultTempValid() { return s_tempValid; }

bool hbCheckWantsRedLed() {
#if PPG_ALWAYS_RED
  return true;
#else
  return s_state == CHK_RUNNING || s_state == CHK_PAUSED;
#endif
}

void hbCheckUpdate(float motionG, float spo2Value, bool spo2Ready,
                   float tempC, bool tempOk, uint32_t now) {

  if (s_state != CHK_RUNNING && s_state != CHK_PAUSED) return;

  const bool moving = fabsf(motionG) > CHECK_MOTION_G;

  // ── Tangan bergerak: tahan hitungan ──
  if (moving) {
    s_state     = CHK_PAUSED;
    s_hold      = true;
    s_calmSince = 0;
    // s_lastTick sengaja ikut digeser supaya detik yang sedang berjalan
    // tidak "terbayar" begitu tangan tenang kembali.
    s_lastTick  = now;
    return;
  }

  // ── Tangan tenang, tapi baru saja ──
  if (s_state == CHK_PAUSED) {
    if (s_calmSince == 0) s_calmSince = now;
    if (now - s_calmSince < CALM_BEFORE_RESUME_MS) {
      s_lastTick = now;
      return;
    }
    s_state = CHK_RUNNING;
    s_hold  = false;
  }

  // ── Hitungan berjalan ──
  if (now - s_lastTick >= 1000) {
    s_lastTick = now;
    if (s_left > 0) s_left--;
  }

  // SpO2 diambil kapan pun sampelnya matang selama pemeriksaan; nilai
  // terakhir yang matang itulah yang dipakai.
  if (spo2Ready && spo2Value > 70.0f && spo2Value <= 100.0f) {
    s_spo2      = spo2Value;
    s_spo2Valid = true;
  }

  // Suhu hanya diambil di detik-detik terakhir, saat tangan sudah paling
  // lama diam dan sensor sempat menyamakan diri dengan kulit.
  if (s_left <= CHECK_TEMP_TAIL_S && tempOk && tempC > 20.0f && tempC < 45.0f) {
    s_temp      = tempC;
    s_tempValid = true;
  }

  if (s_left == 0) s_state = CHK_DONE;
}
