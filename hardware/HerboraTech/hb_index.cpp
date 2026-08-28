#include "hb_index.h"
#include <Preferences.h>
#include <math.h>

namespace {

struct DayMean {
  float hr   = 0.0f;
  float hrv  = 0.0f;
  float temp = 0.0f;
  bool  used = false;
};

Preferences prefs;

DayMean  s_days[INDEX_BASELINE_DAYS];   // cincin rerata harian
uint8_t  s_head    = 0;                 // slot berikutnya yang akan ditulis
uint8_t  s_filled  = 0;                 // berapa slot yang sudah terisi
uint32_t s_dayKey  = 0;                 // hari yang sedang berjalan

// Tumpukan hari ini, dijumlahkan lalu dirata-rata saat hari berganti.
double   s_sumHr = 0, s_sumHrv = 0, s_sumTemp = 0;
uint32_t s_count = 0;

const char *NS = "hbindex";

void save() {
  prefs.begin(NS, false);
  prefs.putBytes("days", s_days, sizeof(s_days));
  prefs.putUChar("head", s_head);
  prefs.putUChar("fill", s_filled);
  prefs.putULong("day", s_dayKey);
  prefs.end();
}

// Rerata dan simpangan baku satu besaran di seluruh hari yang terkumpul.
void stats(float DayMean::*field, float &mean, float &sd) {
  mean = 0.0f; sd = 0.0f;
  if (s_filled == 0) return;

  uint8_t n = 0;
  for (uint8_t i = 0; i < INDEX_BASELINE_DAYS; i++) {
    if (!s_days[i].used) continue;
    mean += s_days[i].*field;
    n++;
  }
  if (n == 0) return;
  mean /= n;

  for (uint8_t i = 0; i < INDEX_BASELINE_DAYS; i++) {
    if (!s_days[i].used) continue;
    const float d = s_days[i].*field - mean;
    sd += d * d;
  }
  sd = sqrtf(sd / n);
}

// Seberapa jauh nilai hari ini dari kebiasaan, dalam satuan simpangan baku.
// Simpangan baku yang terlalu kecil diberi lantai supaya perbedaan sepele
// tidak meledak jadi skor besar.
float deviation(float today, float mean, float sd, float sdFloor) {
  if (sd < sdFloor) sd = sdFloor;
  return fabsf(today - mean) / sd;
}

} // namespace

void hbIndexBegin() {
  prefs.begin(NS, true);
  size_t got = prefs.getBytes("days", s_days, sizeof(s_days));
  if (got != sizeof(s_days)) {
    for (uint8_t i = 0; i < INDEX_BASELINE_DAYS; i++) s_days[i] = DayMean();
  }
  s_head   = prefs.getUChar("head", 0);
  s_filled = prefs.getUChar("fill", 0);
  s_dayKey = prefs.getULong("day", 0);
  prefs.end();

  if (s_head >= INDEX_BASELINE_DAYS) s_head = 0;
  if (s_filled > INDEX_BASELINE_DAYS) s_filled = INDEX_BASELINE_DAYS;
}

void hbIndexSample(float hr, float hrv, float tempC, uint32_t now) {
  (void)now;
  s_sumHr   += hr;
  s_sumHrv  += hrv;
  s_sumTemp += tempC;
  s_count++;
}

void hbIndexRollDay(uint32_t dayKey) {
  if (dayKey == s_dayKey) return;

  // Hari tanpa pembacaan yang cukup tidak dicatat. Satu-dua sampel bukan
  // gambaran sehari, dan memasukkannya justru merusak kebiasaan.
  if (s_count >= 20) {
    s_days[s_head].hr   = (float)(s_sumHr   / s_count);
    s_days[s_head].hrv  = (float)(s_sumHrv  / s_count);
    s_days[s_head].temp = (float)(s_sumTemp / s_count);
    s_days[s_head].used = true;

    s_head = (s_head + 1) % INDEX_BASELINE_DAYS;
    if (s_filled < INDEX_BASELINE_DAYS) s_filled++;
  }

  s_dayKey = dayKey;
  s_sumHr = s_sumHrv = s_sumTemp = 0;
  s_count = 0;
  save();
}

uint8_t hbIndexDaysCollected() { return s_filled; }

bool hbIndexReady() { return s_filled >= INDEX_BASELINE_DAYS; }

uint8_t hbIndexScore() {
  if (!hbIndexReady() || s_count == 0) return 0;

  const float todayHr   = (float)(s_sumHr   / s_count);
  const float todayHrv  = (float)(s_sumHrv  / s_count);
  const float todayTemp = (float)(s_sumTemp / s_count);

  float mHr, sHr, mHrv, sHrv, mT, sT;
  stats(&DayMean::hr,   mHr,  sHr);
  stats(&DayMean::hrv,  mHrv, sHrv);
  stats(&DayMean::temp, mT,   sT);

  // Lantai simpangan baku disetel sesuai besaran masing-masing: detak
  // jantung wajar bergerak beberapa bpm antar hari, suhu kulit jauh lebih
  // sempit. Tanpa lantai yang berbeda, suhu akan mendominasi skor.
  const float dHr  = deviation(todayHr,   mHr,  sHr,  2.5f);
  const float dHrv = deviation(todayHrv,  mHrv, sHrv, 4.0f);
  const float dT   = deviation(todayTemp, mT,   sT,   0.25f);

  // HRV diberi bobot lebih besar: ia yang paling dulu berubah saat tubuh
  // mulai terbebani, sering sebelum detak jantung ikut naik.
  const float combined = (dHr * 0.30f) + (dHrv * 0.45f) + (dT * 0.25f);

  // Dua simpangan baku dianggap penyimpangan penuh.
  float score = (combined / 2.0f) * 100.0f;
  if (score < 0)   score = 0;
  if (score > 100) score = 100;
  return (uint8_t)lroundf(score);
}

void hbIndexText(char *buf, size_t len) {
  if (hbIndexReady()) snprintf(buf, len, "%u", (unsigned)hbIndexScore());
  else                snprintf(buf, len, "%u/%u", (unsigned)s_filled, (unsigned)INDEX_BASELINE_DAYS);
}

void hbIndexReset() {
  for (uint8_t i = 0; i < INDEX_BASELINE_DAYS; i++) s_days[i] = DayMean();
  s_head = s_filled = 0;
  s_dayKey = 0;
  s_sumHr = s_sumHrv = s_sumTemp = 0;
  s_count = 0;
  save();
}
