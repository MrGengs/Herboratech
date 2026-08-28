#include "hb_gesture.h"
#include "herboratech_config.h"

namespace {

bool     s_down       = false;   // jari sedang menempel
bool     s_consumed   = false;   // gestur untuk sentuhan ini sudah dilaporkan
int16_t  s_startX     = 0;
int16_t  s_startY     = 0;
int16_t  s_lastX      = 0;
int16_t  s_lastY      = 0;
uint32_t s_startMs    = 0;

// Ketukan tunggal ditahan di sini sampai jendela ketukan-ganda lewat.
bool     s_pendingTap = false;
uint32_t s_pendingAt  = 0;

int16_t  absDiff(int16_t a, int16_t b) { return a > b ? a - b : b - a; }

} // namespace

void hbGestureReset() {
  s_down       = false;
  s_consumed   = false;
  s_pendingTap = false;
}

int16_t hbGestureStartX() { return s_startX; }
int16_t hbGestureStartY() { return s_startY; }

HbGesture hbGestureUpdate(bool pressed, int16_t x, int16_t y, uint32_t now) {

  // ── Ketukan tunggal yang sudah cukup lama menunggu ──
  // Kalau tidak ada ketukan kedua yang menyusul, barulah ia dilaporkan.
  if (s_pendingTap && !pressed && (now - s_pendingAt) > DOUBLE_TAP_GAP_MS) {
    s_pendingTap = false;
    return HB_TAP;
  }

  // ── Jari baru menempel ──
  if (pressed && !s_down) {
    s_down     = true;
    s_consumed = false;
    s_startX   = x;
    s_startY   = y;
    s_lastX    = x;
    s_lastY    = y;
    s_startMs  = now;
    return HB_NONE;
  }

  // ── Jari masih menempel ──
  if (pressed && s_down) {
    s_lastX = x;
    s_lastY = y;

    if (s_consumed) return HB_NONE;

    const int16_t dx = absDiff(x, s_startX);
    const int16_t dy = absDiff(y, s_startY);

    // Tekan lama hanya berlaku kalau jari nyaris tidak bergerak. Kalau
    // bergerak, pemakai sedang menggeser, bukan menahan.
    if ((now - s_startMs) >= LONG_PRESS_MS && dx < TAP_MAX_MOVE && dy < TAP_MAX_MOVE) {
      s_consumed   = true;
      s_pendingTap = false;   // tekan lama membatalkan ketukan yang tertunda
      return HB_LONG_PRESS;
    }
    return HB_NONE;
  }

  // ── Jari baru lepas ──
  if (!pressed && s_down) {
    s_down = false;
    if (s_consumed) return HB_NONE;

    const uint32_t held = now - s_startMs;
    const int16_t  dx   = s_lastX - s_startX;
    const int16_t  dy   = s_lastY - s_startY;
    const int16_t  adx  = dx < 0 ? -dx : dx;
    const int16_t  ady  = dy < 0 ? -dy : dy;

    // Geseran: harus cukup jauh, cukup cepat, dan satu sumbu harus jelas
    // lebih dominan daripada sumbu lainnya. Tanpa syarat dominasi, gerakan
    // menyerong akan terbaca sebagai dua arah sekaligus.
    if (held <= SWIPE_MAX_MS) {
      if (adx >= SWIPE_MIN_X && adx > ady) {
        s_pendingTap = false;
        return dx < 0 ? HB_SWIPE_LEFT : HB_SWIPE_RIGHT;
      }
      if (ady >= SWIPE_MIN_Y && ady > adx) {
        s_pendingTap = false;
        return dy < 0 ? HB_SWIPE_UP : HB_SWIPE_DOWN;
      }
    }

    // Ketukan: pendek dan nyaris diam.
    if (held <= TAP_MAX_MS && adx < TAP_MAX_MOVE && ady < TAP_MAX_MOVE) {
      if (s_pendingTap && (now - s_pendingAt) <= DOUBLE_TAP_GAP_MS) {
        s_pendingTap = false;
        return HB_DOUBLE_TAP;
      }
      s_pendingTap = true;
      s_pendingAt  = now;
      return HB_NONE;   // ditahan dulu, menunggu kemungkinan ketukan kedua
    }
  }

  return HB_NONE;
}

const char *hbGestureName(HbGesture g) {
  switch (g) {
    case HB_TAP:         return "ketuk";
    case HB_DOUBLE_TAP:  return "ketuk-dua-kali";
    case HB_LONG_PRESS:  return "tekan-lama";
    case HB_SWIPE_LEFT:  return "geser-kiri";
    case HB_SWIPE_RIGHT: return "geser-kanan";
    case HB_SWIPE_UP:    return "geser-atas";
    case HB_SWIPE_DOWN:  return "geser-bawah";
    default:             return "-";
  }
}
