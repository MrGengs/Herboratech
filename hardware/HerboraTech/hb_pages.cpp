#include "hb_pages.h"
#include "hb_check.h"
#include "hb_index.h"
#include "herboratech_config.h"

// ── Warna ───────────────────────────────────────────────────
// Latar gelap, bukan pilihan gaya semata: layar ini menyala di pergelangan
// dalam gelap, dan latar terang akan menyilaukan sekaligus boros.
#define C_BG      lv_color_hex(0x0F1A14)
#define C_CARD    lv_color_hex(0x18261E)
#define C_ACCENT  lv_color_hex(0x17A05C)
#define C_TEXT    lv_color_hex(0xE6EFE9)
#define C_MUTED   lv_color_hex(0x7C8A82)
#define C_WARN    lv_color_hex(0xE0A73E)

// ── Tata letak petak ────────────────────────────────────────
// Dipakai bersama oleh penggambar dan penebak-ketukan. Kalau salah satu
// diubah tanpa yang lain, petak yang tersentuh jadi meleset.
static const int16_t TILE_X0 = 6,  TILE_Y0 = 48;
static const int16_t TILE_W  = 78, TILE_H  = 78;
static const int16_t TILE_DX = 84, TILE_DY = 84;

static const int16_t QS_BRIGHT_Y0 = 58,  QS_BRIGHT_Y1 = 112;
static const int16_t QS_DND_Y0    = 128, QS_DND_Y1    = 182;
static const int16_t QS_TORCH_Y0  = 198, QS_TORCH_Y1  = 252;
static const int16_t QS_SEG_X0    = 10,  QS_SEG_W     = 30;

namespace {

lv_obj_t *scr[PG_TOTAL] = { nullptr };

// Wajah jam
lv_obj_t *lbClock, *lbDate, *lbWfHr, *lbWfSteps, *lbWfBle;
// Vital
lv_obj_t *lbVhr, *lbVhrv, *lbVtemp, *lbVsteps, *lbVspo2;
// Indeks
lv_obj_t *lbIdxBig, *lbIdxNote;
// Herbal
lv_obj_t *lbHerbal;
// Pemeriksaan
lv_obj_t *lbChkCount, *lbChkNote;
// Sinkronisasi
lv_obj_t *lbSyncNote;
// Setelan cepat
lv_obj_t *segBright[BRIGHTNESS_LEVELS];
lv_obj_t *lbDnd, *lbTorch;

HbPage s_cur      = PG_WATCH;
HbPage s_lastMain = PG_WATCH;

uint8_t s_bright = BRIGHTNESS_DEFAULT;
bool    s_dnd    = false;
bool    s_torch  = false;

// ── Pembantu pembuatan objek ────────────────────────────────

lv_obj_t *makeScreen() {
  lv_obj_t *s = lv_obj_create(NULL);
  lv_obj_set_style_bg_color(s, C_BG, 0);
  lv_obj_set_style_bg_opa(s, LV_OPA_COVER, 0);
  lv_obj_set_style_border_width(s, 0, 0);
  lv_obj_set_style_pad_all(s, 0, 0);
  lv_obj_clear_flag(s, LV_OBJ_FLAG_SCROLLABLE);
  return s;
}

lv_obj_t *makeLabel(lv_obj_t *parent, const char *txt, const lv_font_t *font,
                    lv_color_t color, lv_coord_t x, lv_coord_t y) {
  lv_obj_t *l = lv_label_create(parent);
  lv_label_set_text(l, txt);
  lv_obj_set_style_text_font(l, font, 0);
  lv_obj_set_style_text_color(l, color, 0);
  lv_obj_set_pos(l, x, y);
  return l;
}

lv_obj_t *makeCard(lv_obj_t *parent, lv_coord_t x, lv_coord_t y,
                   lv_coord_t w, lv_coord_t h) {
  lv_obj_t *c = lv_obj_create(parent);
  lv_obj_set_pos(c, x, y);
  lv_obj_set_size(c, w, h);
  lv_obj_set_style_bg_color(c, C_CARD, 0);
  lv_obj_set_style_bg_opa(c, LV_OPA_COVER, 0);
  lv_obj_set_style_border_width(c, 0, 0);
  lv_obj_set_style_radius(c, 12, 0);
  lv_obj_set_style_pad_all(c, 0, 0);
  lv_obj_clear_flag(c, LV_OBJ_FLAG_SCROLLABLE);
  return c;
}

void makeHeader(lv_obj_t *s, const char *title) {
  makeLabel(s, title, &lv_font_montserrat_14, C_MUTED, 12, 14);
}

// ── Halaman ─────────────────────────────────────────────────

void buildWatch() {
  lv_obj_t *s = scr[PG_WATCH] = makeScreen();
  lbClock   = makeLabel(s, "--:--", &lv_font_montserrat_28, C_TEXT,  16,  92);
  lbDate    = makeLabel(s, "",      &lv_font_montserrat_14, C_MUTED, 16, 132);
  lbWfBle   = makeLabel(s, "",      &lv_font_montserrat_14, C_ACCENT,16,  18);
  lbWfHr    = makeLabel(s, "- bpm", &lv_font_montserrat_14, C_TEXT,  16, 208);
  lbWfSteps = makeLabel(s, "0 langkah", &lv_font_montserrat_14, C_MUTED, 16, 232);
  makeLabel(s, "ketuk 2x: periksa", &lv_font_montserrat_14, C_MUTED, 16, 282);
}

void buildVital() {
  lv_obj_t *s = scr[PG_VITAL] = makeScreen();
  makeHeader(s, "Vital");
  struct { const char *lab; lv_obj_t **out; } rows[] = {
    { "Detak",   &lbVhr   },
    { "HRV",     &lbVhrv  },
    { "SpO2",    &lbVspo2 },
    { "Suhu",    &lbVtemp },
    { "Langkah", &lbVsteps},
  };
  int16_t y = 46;
  for (auto &r : rows) {
    makeCard(s, 8, y, 156, 44);
    makeLabel(s, r.lab, &lv_font_montserrat_14, C_MUTED, 20, y + 14);
    *r.out = makeLabel(s, "-", &lv_font_montserrat_20, C_TEXT, 96, y + 10);
    y += 50;
  }
}

void buildIndex() {
  lv_obj_t *s = scr[PG_INDEX] = makeScreen();
  makeHeader(s, "Indeks Preemptif");
  lbIdxBig  = makeLabel(s, "0/7", &lv_font_montserrat_28, C_ACCENT, 16, 120);
  lbIdxNote = makeLabel(s, "", &lv_font_montserrat_14, C_MUTED, 16, 168);
  lv_obj_set_width(lbIdxNote, 140);
  lv_label_set_long_mode(lbIdxNote, LV_LABEL_LONG_WRAP);
}

void buildHerbal() {
  lv_obj_t *s = scr[PG_HERBAL] = makeScreen();
  makeHeader(s, "Herbal");
  lbHerbal = makeLabel(s, "", &lv_font_montserrat_14, C_TEXT, 12, 52);
  lv_obj_set_width(lbHerbal, 148);
  lv_label_set_long_mode(lbHerbal, LV_LABEL_LONG_WRAP);
}

void buildMenu() {
  lv_obj_t *s = scr[PG_MENU] = makeScreen();
  makeHeader(s, "Menu");
  static const char *names[6] = { "Vital", "Periksa", "Indeks", "Herbal", "Dokter", "Atur" };
  for (uint8_t i = 0; i < 6; i++) {
    const int16_t col = i % 2, row = i / 2;
    const int16_t x = TILE_X0 + col * TILE_DX;
    const int16_t y = TILE_Y0 + row * TILE_DY;
    makeCard(s, x, y, TILE_W, TILE_H);
    makeLabel(s, names[i], &lv_font_montserrat_14, C_TEXT, x + 10, y + 30);
  }
}

void buildQuick() {
  lv_obj_t *s = scr[PG_QUICK] = makeScreen();
  makeHeader(s, "Setelan Cepat");

  makeLabel(s, "Kecerahan", &lv_font_montserrat_14, C_MUTED, 12, QS_BRIGHT_Y0 - 18);
  for (uint8_t i = 0; i < BRIGHTNESS_LEVELS; i++) {
    segBright[i] = makeCard(s, QS_SEG_X0 + i * QS_SEG_W, QS_BRIGHT_Y0,
                            QS_SEG_W - 4, QS_BRIGHT_Y1 - QS_BRIGHT_Y0);
  }

  makeCard(s, 8, QS_DND_Y0, 156, QS_DND_Y1 - QS_DND_Y0);
  makeLabel(s, "Jangan Ganggu", &lv_font_montserrat_14, C_MUTED, 20, QS_DND_Y0 + 10);
  lbDnd = makeLabel(s, "Mati", &lv_font_montserrat_20, C_TEXT, 20, QS_DND_Y0 + 26);

  makeCard(s, 8, QS_TORCH_Y0, 156, QS_TORCH_Y1 - QS_TORCH_Y0);
  makeLabel(s, "Senter", &lv_font_montserrat_14, C_MUTED, 20, QS_TORCH_Y0 + 10);
  lbTorch = makeLabel(s, "Mati", &lv_font_montserrat_20, C_TEXT, 20, QS_TORCH_Y0 + 26);
}

void buildCheck() {
  lv_obj_t *s = scr[PG_CHECK] = makeScreen();
  makeHeader(s, "Pemeriksaan");
  lbChkCount = makeLabel(s, "30", &lv_font_montserrat_28, C_ACCENT, 16, 110);
  lbChkNote  = makeLabel(s, "Diamkan tangan Anda", &lv_font_montserrat_14, C_MUTED, 16, 160);
  lv_obj_set_width(lbChkNote, 140);
  lv_label_set_long_mode(lbChkNote, LV_LABEL_LONG_WRAP);
  makeLabel(s, "geser bawah: batal", &lv_font_montserrat_14, C_MUTED, 16, 282);
}

void buildSync() {
  lv_obj_t *s = scr[PG_SYNC] = makeScreen();
  makeHeader(s, "Sinkronisasi");
  lbSyncNote = makeLabel(s, "Mengirim hasil ke ponsel", &lv_font_montserrat_14, C_TEXT, 16, 130);
  lv_obj_set_width(lbSyncNote, 140);
  lv_label_set_long_mode(lbSyncNote, LV_LABEL_LONG_WRAP);
  makeLabel(s, "ketuk: kembali", &lv_font_montserrat_14, C_MUTED, 16, 282);
}

void buildDoctor() {
  lv_obj_t *s = scr[PG_DOCTOR] = makeScreen();
  makeHeader(s, "Dokter");
  lv_obj_t *l = makeLabel(s, "Antrean konsultasi dikelola dari aplikasi di ponsel.",
                          &lv_font_montserrat_14, C_MUTED, 12, 120);
  lv_obj_set_width(l, 148);
  lv_label_set_long_mode(l, LV_LABEL_LONG_WRAP);
}

// ── Ketukan pada petak ──────────────────────────────────────

int8_t menuTileAt(int16_t x, int16_t y) {
  if (y < TILE_Y0) return -1;
  const int16_t col = (x - TILE_X0) / TILE_DX;
  const int16_t row = (y - TILE_Y0) / TILE_DY;
  if (col < 0 || col > 1 || row < 0 || row > 2) return -1;
  // Tolak ketukan yang jatuh di celah antar petak.
  if ((x - TILE_X0) % TILE_DX > TILE_W) return -1;
  if ((y - TILE_Y0) % TILE_DY > TILE_H) return -1;
  return (int8_t)(row * 2 + col);
}

void applyTileAction(int8_t tile) {
  switch (tile) {
    case 0: hbPagesGoto(PG_VITAL);  break;
    case 1: hbCheckStart(); hbPagesGoto(PG_CHECK); break;
    case 2: hbPagesGoto(PG_INDEX);  break;
    case 3: hbPagesGoto(PG_HERBAL); break;
    case 4: hbPagesGoto(PG_DOCTOR); break;
    case 5: hbPagesGoto(PG_QUICK);  break;
    default: break;
  }
}

void quickTap(int16_t x, int16_t y) {
  if (y >= QS_BRIGHT_Y0 && y <= QS_BRIGHT_Y1) {
    int16_t seg = (x - QS_SEG_X0) / QS_SEG_W;
    if (seg < 0) seg = 0;
    if (seg >= BRIGHTNESS_LEVELS) seg = BRIGHTNESS_LEVELS - 1;
    hbSetBrightnessLevel((uint8_t)seg);
    return;
  }
  if (y >= QS_DND_Y0 && y <= QS_DND_Y1) { s_dnd = !s_dnd; return; }
  if (y >= QS_TORCH_Y0 && y <= QS_TORCH_Y1) { s_torch = !s_torch; return; }
}

} // namespace

// ── API ─────────────────────────────────────────────────────

void hbPagesBegin() {
  buildWatch(); buildVital(); buildIndex(); buildHerbal();
  buildMenu();  buildQuick(); buildCheck(); buildSync(); buildDoctor();
  lv_scr_load(scr[PG_WATCH]);
  s_cur = s_lastMain = PG_WATCH;
}

HbPage hbPagesCurrent()  { return s_cur; }
HbPage hbPagesLastMain() { return s_lastMain; }
bool   hbPagesOnMain()   { return s_cur < PG_MAIN_COUNT; }

uint8_t hbBrightnessLevel() { return s_bright; }
void    hbSetBrightnessLevel(uint8_t lvl) {
  if (lvl >= BRIGHTNESS_LEVELS) lvl = BRIGHTNESS_LEVELS - 1;
  s_bright = lvl;
}
bool hbDndOn()   { return s_dnd; }
bool hbTorchOn() { return s_torch; }
void hbTorchOff(){ s_torch = false; }

void hbPagesGoto(HbPage p) {
  if (p >= PG_TOTAL || p == PG_MAIN_COUNT || !scr[p]) return;
  // Arah animasi mengikuti arah perpindahan supaya perpindahan terasa
  // punya ruang, bukan sekadar berganti gambar.
  lv_scr_load_anim_t dir = LV_SCR_LOAD_ANIM_FADE_ON;
  if (p < PG_MAIN_COUNT && s_cur < PG_MAIN_COUNT) {
    dir = (p > s_cur) ? LV_SCR_LOAD_ANIM_MOVE_LEFT : LV_SCR_LOAD_ANIM_MOVE_RIGHT;
  } else if (p == PG_MENU)  dir = LV_SCR_LOAD_ANIM_MOVE_TOP;
  else if (p == PG_QUICK)   dir = LV_SCR_LOAD_ANIM_MOVE_BOTTOM;

  lv_scr_load_anim(scr[p], dir, 180, 0, false);
  s_cur = p;
  if (p < PG_MAIN_COUNT) s_lastMain = p;
}

bool hbPagesHandleGesture(HbGesture g, int16_t x, int16_t y) {

  // ── Pemeriksaan menelan hampir semua gestur ──
  // Hanya geser bawah yang dikenali. Kalau gestur lain diteruskan, pemakai
  // bisa tidak sengaja keluar dan membuang 30 detik yang sudah berjalan.
  if (s_cur == PG_CHECK && hbCheckStateNow() != CHK_DONE) {
    if (g == HB_SWIPE_DOWN) { hbCheckCancel(); hbPagesGoto(s_lastMain); }
    return true;
  }

  // Senter dimatikan oleh sentuhan apa pun, sesuai panduan.
  if (s_torch && g != HB_NONE) { s_torch = false; return true; }

  switch (g) {

    case HB_SWIPE_LEFT:
    case HB_SWIPE_RIGHT: {
      if (!hbPagesOnMain()) { hbPagesGoto(s_lastMain); return true; }
      int8_t n = (int8_t)s_cur + (g == HB_SWIPE_LEFT ? 1 : -1);
      if (n < 0) n = PG_MAIN_COUNT - 1;
      if (n >= PG_MAIN_COUNT) n = 0;
      hbPagesGoto((HbPage)n);
      return true;
    }

    case HB_SWIPE_UP:
      // Dari Setelan Cepat, geser atas mengembalikan ke halaman utama —
      // bukan membuka Menu. Kalau membuka Menu, pemakai akan merasa
      // terlempar makin dalam padahal maksudnya menutup.
      if (s_cur == PG_QUICK) hbPagesGoto(s_lastMain);
      else                   hbPagesGoto(PG_MENU);
      return true;

    case HB_SWIPE_DOWN:
      if (s_cur == PG_MENU) hbPagesGoto(s_lastMain);
      else                  hbPagesGoto(PG_QUICK);
      return true;

    case HB_DOUBLE_TAP:
      if (s_cur == PG_WATCH) { hbCheckStart(); hbPagesGoto(PG_CHECK); return true; }
      return false;

    case HB_LONG_PRESS:
      hbPagesGoto(PG_WATCH);
      return true;

    case HB_TAP:
      if (s_cur == PG_MENU) {
        const int8_t t = menuTileAt(x, y);
        if (t >= 0) applyTileAction(t);
        return true;
      }
      if (s_cur == PG_QUICK) { quickTap(x, y); return true; }
      if (s_cur == PG_SYNC)  { hbPagesGoto(s_lastMain); return true; }
      if (s_cur == PG_CHECK && hbCheckStateNow() == CHK_DONE) {
        hbPagesGoto(PG_SYNC); return true;
      }
      return false;

    default:
      return false;
  }
}

void hbPagesRender(const HbDisplayData &d) {
  char buf[40];

  // ── Wajah jam ──
  lv_label_set_text(lbClock, d.clockHHMM);
  lv_label_set_text(lbDate,  d.dateText);
  lv_label_set_text(lbWfBle, d.bleLinked ? LV_SYMBOL_BLUETOOTH : "");
  hbValueText(d.hr, buf, sizeof(buf), 0);
  { char t[48]; snprintf(t, sizeof(t), "%s bpm", buf); lv_label_set_text(lbWfHr, t); }
  snprintf(buf, sizeof(buf), "%lu langkah", (unsigned long)d.steps);
  lv_label_set_text(lbWfSteps, buf);

  // ── Vital ──
  hbValueText(d.hr,   buf, sizeof(buf), 0); lv_label_set_text(lbVhr,   buf);
  hbValueText(d.hrv,  buf, sizeof(buf), 0); lv_label_set_text(lbVhrv,  buf);
  // Tanda "~" menegaskan SpO2 dari pergelangan adalah perkiraan, bukan
  // setara alat jepit jari.
  hbValueText(d.spo2, buf, sizeof(buf), 0, "~"); lv_label_set_text(lbVspo2, buf);
  hbValueText(d.temp.v, buf, sizeof(buf), 1); lv_label_set_text(lbVtemp, buf);
  snprintf(buf, sizeof(buf), "%lu", (unsigned long)d.steps);
  lv_label_set_text(lbVsteps, buf);

  // ── Indeks ──
  hbIndexText(buf, sizeof(buf));
  lv_label_set_text(lbIdxBig, buf);
  lv_label_set_text(lbIdxNote,
    hbIndexReady() ? "Simpangan dari kebiasaan tubuh Anda sendiri."
                   : "Indeks butuh 7 hari pemakaian untuk mengenal ritme Anda.");

  // ── Herbal ──
  lv_label_set_text(lbHerbal, d.herbalText);

  // ── Pemeriksaan ──
  snprintf(buf, sizeof(buf), "%u", (unsigned)hbCheckSecondsLeft());
  lv_label_set_text(lbChkCount, buf);
  switch (hbCheckStateNow()) {
    case CHK_PAUSED:
      lv_label_set_text(lbChkNote, "Tangan bergerak. Hitungan menunggu.");
      lv_obj_set_style_text_color(lbChkCount, C_WARN, 0);
      break;
    case CHK_DONE:
      lv_label_set_text(lbChkNote, "Selesai. Ketuk untuk mengirim.");
      lv_obj_set_style_text_color(lbChkCount, C_ACCENT, 0);
      break;
    default:
      lv_label_set_text(lbChkNote, "Diamkan tangan Anda.");
      lv_obj_set_style_text_color(lbChkCount, C_ACCENT, 0);
      break;
  }

  // ── Setelan cepat ──
  for (uint8_t i = 0; i < BRIGHTNESS_LEVELS; i++) {
    lv_obj_set_style_bg_color(segBright[i], i <= s_bright ? C_ACCENT : C_CARD, 0);
  }
  lv_label_set_text(lbDnd,   s_dnd   ? "Nyala" : "Mati");
  lv_label_set_text(lbTorch, s_torch ? "Nyala" : "Mati");

  // ── Sinkronisasi ──
  lv_label_set_text(lbSyncNote, d.bleLinked ? "Mengirim hasil ke ponsel"
                                            : "Ponsel belum tersambung");
}
