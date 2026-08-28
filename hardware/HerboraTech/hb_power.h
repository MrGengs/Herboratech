// ============================================================
//  hb_power.h — layar, tombol samping, dan daya
// ============================================================
//
//  Tiga hal yang saling terkait dan karena itu disatukan:
//
//  1. KECERAHAN. Lampu latar dikendalikan PWM. Setelan Cepat memilih satu
//     dari lima tingkat; senter memaksa penuh; masa redup sebelum padam
//     memakai tingkat tersendiri.
//
//  2. BANGUN. Layar menyala oleh angkat pergelangan, sentuhan, atau tombol.
//     Sentuhan yang MEMBANGUNKAN tidak boleh ikut dijalankan — kalau ikut,
//     geseran pertama pemakai akan langsung memindahkan halaman sebelum ia
//     sempat melihat apa yang ada di layar.
//
//  3. MATI. Menahan tombol PWR_HOLD_MS mematikan papan lewat deep sleep.
//     Saat kabel USB tercolok, papan tidak benar-benar mati karena arus
//     tetap masuk; layar padam dan papan menunggu. Itu sifat papannya, dan
//     panduan pengguna menyebutkannya apa adanya.
//
// ============================================================

#ifndef HB_POWER_H
#define HB_POWER_H

#include <Arduino.h>

enum HbButtonEvent {
  BTN_NONE = 0,
  BTN_SHORT,      // tekan sebentar: pulang ke wajah jam
  BTN_HOLD        // tahan PWR_HOLD_MS: matikan
};

// `blPin` adalah pin lampu latar; modul ini yang memegang kanal PWM-nya.
void hbPowerBegin(uint8_t blPin);

// Dipanggil tiap loop. `wristRaised` dari akselerometer.
// Mengembalikan kejadian tombol bila ada.
HbButtonEvent hbPowerUpdate(bool wristRaised, uint32_t now);

// Menandai bahwa pemakai baru berinteraksi, sehingga hitungan padam
// dimulai ulang. Dipanggil setiap kali ada gestur yang dipakai.
void hbPowerNoteActivity(uint32_t now);

// true kalau layar sedang menyala.
bool hbScreenOn();

// true kalau sentuhan berikutnya harus DIABAIKAN karena ia yang barusan
// membangunkan layar. Menjadi false sendiri setelah dibaca sekali.
bool hbConsumeWakeTouch();

// Menyalakan layar. `byTouch` menandai bahwa penyebabnya sentuhan, agar
// sentuhan itu bisa ditelan.
void hbScreenWake(uint32_t now, bool byTouch);

// Menerapkan kecerahan. Dipanggil setelah Setelan Cepat berubah atau
// senter dinyalakan.
void hbApplyBrightness(uint8_t level, bool torchOn);

// Mematikan papan.
void hbPowerOff();

#endif // HB_POWER_H
