#include "hb_power.h"
#include "herboratech_config.h"
#include <esp_sleep.h>

namespace {

uint8_t  s_blPin      = 0;
bool     s_screenOn   = true;
bool     s_wakeTouch  = false;   // sentuhan berikutnya harus ditelan
uint32_t s_lastAct    = 0;

// Tombol
bool     s_btnDown    = false;
uint32_t s_btnAt      = 0;
bool     s_holdFired  = false;   // BTN_HOLD sudah dilaporkan untuk tekanan ini

// Angkat pergelangan: butuh transisi, bukan keadaan. Kalau memakai keadaan,
// layar akan terus menyala selama tangan diangkat dan tidak pernah padam.
bool     s_wristPrev  = false;

const uint8_t PWM_CH   = 7;
const uint32_t PWM_HZ  = 5000;
const uint8_t PWM_BITS = 8;

bool buttonPressed() {
  const int v = digitalRead(PIN_SIDE_BUTTON);
#if SIDE_BUTTON_ACTIVE_LOW
  return v == LOW;
#else
  return v == HIGH;
#endif
}

void writeBacklight(uint8_t duty) {
  ledcWrite(PWM_CH, duty);
}

} // namespace

void hbPowerBegin(uint8_t blPin) {
  s_blPin = blPin;
  pinMode(PIN_SIDE_BUTTON, SIDE_BUTTON_ACTIVE_LOW ? INPUT_PULLUP : INPUT);

  ledcSetup(PWM_CH, PWM_HZ, PWM_BITS);
  ledcAttachPin(s_blPin, PWM_CH);

  s_screenOn = true;
  s_lastAct  = millis();
  hbApplyBrightness(BRIGHTNESS_DEFAULT, false);
}

bool hbScreenOn() { return s_screenOn; }

bool hbConsumeWakeTouch() {
  if (!s_wakeTouch) return false;
  s_wakeTouch = false;
  return true;
}

void hbPowerNoteActivity(uint32_t now) { s_lastAct = now; }

void hbApplyBrightness(uint8_t level, bool torchOn) {
  if (!s_screenOn) { writeBacklight(0); return; }
  if (torchOn)     { writeBacklight(TORCH_BRIGHTNESS); return; }
  if (level >= BRIGHTNESS_LEVELS) level = BRIGHTNESS_LEVELS - 1;
  writeBacklight(BRIGHTNESS_TABLE[level]);
}

void hbScreenWake(uint32_t now, bool byTouch) {
  if (!s_screenOn) {
    s_screenOn  = true;
    s_wakeTouch = byTouch;
  }
  s_lastAct = now;
}

void hbPowerOff() {
  writeBacklight(0);
  s_screenOn = false;
  // Tombol dipakai sebagai sumber bangun. Papan yang sedang dicolok USB
  // tidak akan benar-benar mati; ia hanya berhenti dan menunggu.
  esp_sleep_enable_ext0_wakeup((gpio_num_t)PIN_SIDE_BUTTON,
                               SIDE_BUTTON_ACTIVE_LOW ? 0 : 1);
  delay(40);
  esp_deep_sleep_start();
}

HbButtonEvent hbPowerUpdate(bool wristRaised, uint32_t now) {

  // ── Angkat pergelangan ──
  if (wristRaised && !s_wristPrev) hbScreenWake(now, false);
  s_wristPrev = wristRaised;

  // ── Tombol ──
  HbButtonEvent ev = BTN_NONE;
  const bool down = buttonPressed();

  if (down && !s_btnDown) {
    s_btnDown   = true;
    s_btnAt     = now;
    s_holdFired = false;
    hbScreenWake(now, false);
  } else if (down && s_btnDown) {
    if (!s_holdFired && (now - s_btnAt) >= PWR_HOLD_MS) {
      s_holdFired = true;
      ev = BTN_HOLD;
    }
  } else if (!down && s_btnDown) {
    s_btnDown = false;
    // Tekanan yang sudah jadi BTN_HOLD tidak boleh ikut jadi BTN_SHORT.
    if (!s_holdFired) ev = BTN_SHORT;
  }

  // ── Redup lalu padam ──
#if !SCREEN_ALWAYS_ON
  if (s_screenOn) {
    const uint32_t idle = now - s_lastAct;
    if (idle >= SCREEN_OFF_MS) {
      s_screenOn = false;
      writeBacklight(0);
    } else if (idle >= SCREEN_DIM_MS) {
      writeBacklight(BRIGHTNESS_DIMMED);
    }
  }
#endif

  return ev;
}
