// ============================================================
//  hb_gesture.h — mengubah sentuhan mentah menjadi gestur
// ============================================================
//
//  Layar ini hanya 172 x 320 px, jadi jari menutupi sebagian besar
//  lebarnya. Karena itu ambang mendatar dibuat lebih kecil daripada
//  ambang tegak (lihat SWIPE_MIN_X dan SWIPE_MIN_Y di config).
//
//  Modul ini tidak tahu apa-apa soal halaman. Ia hanya melapor "barusan
//  terjadi geseran ke kiri". Yang memutuskan artinya adalah hb_pages.
//
// ============================================================

#ifndef HB_GESTURE_H
#define HB_GESTURE_H

#include <Arduino.h>

enum HbGesture {
  HB_NONE = 0,
  HB_TAP,
  HB_DOUBLE_TAP,
  HB_LONG_PRESS,
  HB_SWIPE_LEFT,
  HB_SWIPE_RIGHT,
  HB_SWIPE_UP,
  HB_SWIPE_DOWN
};

// Dipanggil setiap putaran loop dengan keadaan sentuhan saat ini.
// Mengembalikan HB_NONE selama tidak ada gestur yang selesai.
//
// Ketukan tunggal sengaja DITUNDA: ia baru dilaporkan setelah jendela
// ketukan-ganda lewat, supaya satu ketukan tidak terlanjur dijalankan
// ketika ternyata pemakai bermaksud mengetuk dua kali.
HbGesture hbGestureUpdate(bool pressed, int16_t x, int16_t y, uint32_t now);

// Membuang keadaan yang sedang berjalan. Dipakai saat layar baru bangun:
// sentuhan yang membangunkan layar tidak boleh ikut dijalankan.
void hbGestureReset();

// Titik saat jari pertama menyentuh pada gestur terakhir. Berguna untuk
// menentukan petak mana yang diketuk pada Menu dan Setelan Cepat.
int16_t hbGestureStartX();
int16_t hbGestureStartY();

// Nama gestur untuk keperluan log.
const char *hbGestureName(HbGesture g);

#endif // HB_GESTURE_H
