#include "hb_value.h"
#include "herboratech_config.h"
#include <math.h>

void hbValueUpdate(HbValue &v, float reading, bool ok, uint32_t now) {
  if (ok) {
    v.value    = reading;
    v.valid    = true;
    v.lastGood = now;
    return;
  }
  // Pembacaan buruk. Angka lama masih ditahan sebentar supaya layar tidak
  // berkedip; setelah tenggangnya habis, barulah menyerah dan jadi "-".
  if (v.valid && (now - v.lastGood) > VALUE_HOLD_MS) {
    v.valid = false;
  }
}

void hbValueClear(HbValue &v) {
  v.valid    = false;
  v.value    = 0.0f;
  v.lastGood = 0;
}

void hbValueText(const HbValue &v, char *buf, size_t len, uint8_t decimals, const char *prefix) {
  if (!v.valid) {
    snprintf(buf, len, "-");
    return;
  }
  switch (decimals) {
    case 0:  snprintf(buf, len, "%s%d",   prefix, (int)lroundf(v.value)); break;
    case 1:  snprintf(buf, len, "%s%.1f", prefix, v.value);               break;
    default: snprintf(buf, len, "%s%.2f", prefix, v.value);               break;
  }
}

// ── Suhu ────────────────────────────────────────────────────

bool hbTempSettling(const HbTemp &t, uint32_t now) {
  return t.settleAt != 0 && now < t.settleAt;
}

void hbTempUpdate(HbTemp &t, float reading, bool sensorOk, uint32_t now) {
  if (!sensorOk) {
    hbValueUpdate(t.v, 0.0f, false, now);
    return;
  }

  // Lonjakan tajam dianggap perpindahan ruangan. Tubuh tidak berubah
  // 1,5 derajat dalam satu pembacaan; yang berubah lingkungannya.
  if (t.hasPrev && fabsf(reading - t.previous) >= TEMP_JUMP_C) {
    t.settleAt = now + TEMP_SETTLE_MS;
    hbValueClear(t.v);          // langsung "-", tanpa masa tahan
  }

  t.previous = reading;
  t.hasPrev  = true;

  if (hbTempSettling(t, now)) {
    hbValueUpdate(t.v, 0.0f, false, now);
    return;
  }

  // Suhu kulit di luar rentang ini bukan suhu tubuh manusia.
  const bool plausible = reading > 20.0f && reading < 45.0f;
  hbValueUpdate(t.v, reading, plausible, now);
}
