// ============================================================
//  hb_index.h — Indeks Preemptif
// ============================================================
//
//  Indeks ini TIDAK membandingkan pemakai dengan orang lain. Ia
//  membandingkan pemakai dengan kebiasaan tubuhnya sendiri: seberapa jauh
//  hari ini menyimpang dari tujuh hari terakhir.
//
//  Karena itu ia tidak berarti apa-apa sebelum kebiasaannya dikenal. Sampai
//  tujuh hari terkumpul, layar menampilkan hitungan "3/7", bukan angka
//  indeks. Ini bukan kerusakan, dan panduan pengguna menjelaskannya begitu.
//
//  Rerata harian disimpan di NVS supaya tidak hilang saat jam dimatikan.
//  Tanpa itu hitungan mundur ke nol setiap kali baterai habis, dan indeks
//  tidak akan pernah tampil.
//
// ============================================================

#ifndef HB_INDEX_H
#define HB_INDEX_H

#include <Arduino.h>
#include "herboratech_config.h"

// Membaca riwayat dari NVS. Dipanggil sekali di setup().
void hbIndexBegin();

// Menyetor satu pembacaan ke tumpukan hari ini. Hanya pembacaan yang
// dipercaya (bukan "-") yang boleh masuk; nilai buruk akan mencemari
// kebiasaan yang justru sedang dibangun.
void hbIndexSample(float hr, float hrv, float tempC, uint32_t now);

// Dipanggil saat tanggal berganti. `dayKey` cukup bilangan yang naik satu
// setiap hari; hb_index hanya memakainya untuk tahu bahwa hari berganti.
void hbIndexRollDay(uint32_t dayKey);

// Berapa hari kebiasaan yang sudah terkumpul, 0..INDEX_BASELINE_DAYS.
uint8_t hbIndexDaysCollected();

// true kalau indeks sudah boleh ditampilkan.
bool hbIndexReady();

// Skor 0..100. Semakin tinggi semakin jauh menyimpang dari kebiasaan.
// Hanya berarti kalau hbIndexReady() true.
uint8_t hbIndexScore();

// Teks siap tampil: "72" bila sudah siap, atau "3/7" bila belum.
void hbIndexText(char *buf, size_t len);

// Menghapus seluruh riwayat. Dipakai kalau jam berpindah pemakai —
// kebiasaan orang sebelumnya tidak berlaku untuk orang baru.
void hbIndexReset();

#endif // HB_INDEX_H
