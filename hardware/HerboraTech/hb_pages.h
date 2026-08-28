// ============================================================
//  hb_pages.h — halaman, navigasi, dan tampilannya
// ============================================================
//
//  Empat halaman utama tersusun melingkar:
//
//      Wajah Jam -> Vital -> Indeks -> Herbal -> kembali ke Wajah Jam
//
//  Di luar keempatnya ada halaman sisipan: Menu, Setelan Cepat,
//  Pemeriksaan, Sinkronisasi, dan Dokter. Geser kiri atau kanan dari
//  halaman sisipan mengembalikan pemakai ke halaman utama TERAKHIR yang
//  dibuka — bukan ke halaman pertama. Itu sebabnya s_lastMain disimpan.
//
//  Layar dibuat sekali di hbPagesBegin() lalu ditukar dengan
//  lv_scr_load_anim. Membuat ulang objek LVGL setiap perpindahan akan
//  menyisakan memori dan membuat animasi tersendat.
//
// ============================================================

#ifndef HB_PAGES_H
#define HB_PAGES_H

#include <Arduino.h>
#include <lvgl.h>
#include "hb_gesture.h"
#include "hb_value.h"

enum HbPage {
  PG_WATCH = 0,
  PG_VITAL,
  PG_INDEX,
  PG_HERBAL,
  PG_MAIN_COUNT,      // penanda batas halaman utama

  PG_MENU,
  PG_QUICK,
  PG_CHECK,
  PG_SYNC,
  PG_DOCTOR,
  PG_TOTAL
};

// Data yang ditampilkan halaman. Diisi oleh sketch utama dari sensor,
// lalu hbPagesRender() menuliskannya ke layar.
struct HbDisplayData {
  HbValue  hr;
  HbValue  hrv;
  HbValue  spo2;      // hanya terisi setelah Pemeriksaan Terpandu
  HbTemp   temp;
  uint32_t steps   = 0;
  uint8_t  battery = 0;
  bool     bleLinked = false;
  char     clockHHMM[8]  = "--:--";
  char     dateText[24]  = "";
  char     herbalText[192] = "Belum ada anjuran. Buka aplikasi di ponsel.";
};

void   hbPagesBegin();
void   hbPagesRender(const HbDisplayData &d);

// Menyalurkan satu gestur. Mengembalikan true kalau gestur itu dipakai;
// false berarti sketch utama boleh menanganinya sendiri.
bool   hbPagesHandleGesture(HbGesture g, int16_t x, int16_t y);

void   hbPagesGoto(HbPage p);
HbPage hbPagesCurrent();
HbPage hbPagesLastMain();
bool   hbPagesOnMain();

// Setelan Cepat
uint8_t hbBrightnessLevel();      // 0..BRIGHTNESS_LEVELS-1
void    hbSetBrightnessLevel(uint8_t lvl);
bool    hbDndOn();
bool    hbTorchOn();
void    hbTorchOff();

#endif // HB_PAGES_H
