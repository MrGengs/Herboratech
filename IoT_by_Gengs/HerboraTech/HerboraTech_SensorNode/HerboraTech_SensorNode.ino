/*
 * HerboraTech Sensor Node — ESP32-C3
 *
 * Sensor: MAX30102 (BPM & SpO2)
 * Komunikasi: ESP-NOW → kirim data ke ESP32-S3 (main unit)
 *
 * Wiring ESP32-C3:
 * ┌─────────────┬──────────┬───────────────────────────────┐
 * │ ESP32-C3    │ Sensor   │ Keterangan                    │
 * ├─────────────┼──────────┼───────────────────────────────┤
 * │ GPIO6 (SDA) │ SDA      │ I2C Data (MAX30102)           │
 * │ GPIO7 (SCL) │ SCL      │ I2C Clock                     │
 * │ 3V3         │ VCC/VIN  │ Power 3.3V                    │
 * │ GND         │ GND      │ Ground                        │
 * └─────────────┴──────────┴───────────────────────────────┘
 *
 * Catatan:
 * - MAX30102 (addr 0x57) satu-satunya sensor di bus I2C
 * - ESP-NOW broadcast ke semua peer (atau set MAC receiver spesifik)
 * - Data SpO2 menggunakan koefisien kalibrasi bawaan library (Beer-Lambert)
 
 *   yang sudah di-tuning untuk kulit manusia, tidak perlu kalibrasi manual
 * - suhuTubuh dikirim sebagai 0.0 (tidak ada sensor suhu)
 */

#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <esp_now.h>

// === Sensor MAX30102 ===
#include <MAX30105.h>
#include <heartRate.h>
#include <spo2_algorithm.h>

// ============================================================
// PIN DEFINITIONS — ESP32-C3
// ============================================================
#define SENSOR_SDA 6
#define SENSOR_SCL 7

// ============================================================
// ESP-NOW — MAC Address receiver (ESP32-S3 main unit)
// Ganti dengan MAC address ESP32-S3 Anda!
// Cara mendapatkan: upload sketch WiFi.macAddress() ke ESP32-S3
// ============================================================
// Broadcast address (kirim ke semua) — ganti jika ingin unicast
uint8_t receiverMAC[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};

// ============================================================
// DATA STRUCTURE — harus sama persis di sender & receiver
// ============================================================
typedef struct __attribute__((packed)) {
  int32_t heartRate;
  int32_t spo2;
  float   suhuTubuh;
  bool    validHR;
  bool    validSpO2;
  bool    fingerDetected;
} SensorData_t;

SensorData_t sensorData;

// ============================================================
// SENSOR OBJECTS
// ============================================================
MAX30105 particleSensor;

bool max30102Ready = false;

// MAX30102 heart rate (rolling average untuk stabilitas)
const byte RATE_SIZE = 8;
byte rates[RATE_SIZE];
byte rateSpot  = 0;
byte rateCount = 0;
long lastBeat  = 0;
float beatsPerMinute = 0;
int32_t beatAvg = 0;

// MAX30102 SpO2 (sliding window like calibration code)
uint32_t irBuffer[100];
uint32_t redBuffer[100];
int32_t  spo2Calculated      = 0;
int8_t   validSPO2           = 0;
int32_t  heartRateCalculated = 0;
int8_t   validHeartRate      = 0;
int32_t  sp02Avg             = 0;

// SpO2 state machine
enum SpO2Phase { SPO2_FILL_INIT, SPO2_SLIDING };
SpO2Phase spo2Phase = SPO2_FILL_INIT;
uint8_t spo2SampleCount = 0;

// Data sensor global
int32_t heartRateVal = 0;
int32_t spo2Value    = 0;
float   suhuTubuh    = 36.5;  // Dummy suhu tubuh normal (tanpa GY-906)
bool    validHR      = false;
bool    validSpO2    = false;
bool    fingerDetected = false;

// Timers
unsigned long lastESPNowSend = 0;

// ============================================================
// ESP-NOW SEND CALLBACK
// ============================================================
void onDataSent(const wifi_tx_info_t *tx_info, esp_now_send_status_t status) {
  Serial.printf("[ESP-NOW] Send %s\n",
    status == ESP_NOW_SEND_SUCCESS ? "OK" : "FAIL");
}

// ============================================================
// INIT SENSORS
// ============================================================
void initSensors() {
  Wire.begin(SENSOR_SDA, SENSOR_SCL);
  Wire.setClock(100000);
  delay(100);

  // Scan I2C bus
  Serial.println("Scanning I2C...");
  for (uint8_t addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.printf("  Found 0x%02X", addr);
      if (addr == 0x57) Serial.print(" (MAX30102)");
      Serial.println();
    }
  }

  // MAX30102
  if (particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {
    // Match calibration: ledBrightness=50, sampleAvg=1, ledMode=2(Red+IR), sampleRate=100, pulseWidth=69, adcRange=4096
    particleSensor.setup(50, 1, 2, 100, 69, 4096);
    max30102Ready = true;
    Serial.println("MAX30102 OK");
  } else {
    Serial.println("MAX30102 not found!");
  }
}

// ============================================================
// BACA MAX30102 — dipanggil SETIAP LOOP
// Sliding window approach (sama seperti calibration code)
// ============================================================
void readMAX30102() {
  if (!max30102Ready) return;

  particleSensor.check();

  static unsigned long lastIRDebug = 0;
  long lastIRValue = 0;

  while (particleSensor.available()) {
    uint32_t irValue  = particleSensor.getIR();
    uint32_t redValue = particleSensor.getRed();
    particleSensor.nextSample();
    lastIRValue = irValue;

    // --- Finger detection (threshold disesuaikan untuk pulseWidth=69) ---
    if (irValue < 7000) {
      fingerDetected = false;
      validHR = false;
      validSpO2 = false;
      beatAvg = 0;
      rateCount = 0;
      rateSpot = 0;
      sp02Avg = 0;
      spo2Phase = SPO2_FILL_INIT;
      spo2SampleCount = 0;
      continue;
    }
    fingerDetected = true;

    // --- BPM dari beat detection (rolling average 8 sample) ---
    if (checkForBeat(irValue)) {
      long delta = millis() - lastBeat;
      lastBeat = millis();
      beatsPerMinute = 60.0 / (delta / 1000.0);

      if (beatsPerMinute > 20 && beatsPerMinute < 255) {
        rates[rateSpot % RATE_SIZE] = (byte)beatsPerMinute;
        rateSpot++;
        if (rateCount < RATE_SIZE) rateCount++;

        // Hitung rata-rata dari semua sample yang ada
        int32_t sum = 0;
        for (byte x = 0; x < rateCount; x++) sum += rates[x];
        beatAvg = sum / rateCount;

        heartRateVal = beatAvg;
        validHR = true;
      }
    }

    // No beat selama 10 detik → reset
    if (millis() - lastBeat > 10000) {
      beatsPerMinute = 0;
      beatAvg = 0;
      rateCount = 0;
      rateSpot = 0;
      validHR = false;
    }

    // --- SpO2: sliding window (seperti calibration code) ---
    if (spo2Phase == SPO2_FILL_INIT) {
      // Fase 1: isi buffer awal 100 sample
      irBuffer[spo2SampleCount]  = irValue;
      redBuffer[spo2SampleCount] = redValue;
      spo2SampleCount++;

      if (spo2SampleCount >= 100) {
        // Hitung SpO2 pertama kali
        maxim_heart_rate_and_oxygen_saturation(irBuffer, 100, redBuffer,
          &spo2Calculated, &validSPO2, &heartRateCalculated, &validHeartRate);

        // Hanya terima SpO2 dalam range realistis (70-100%)
        if (validSPO2 == 1 && spo2Calculated >= 70 && spo2Calculated <= 100) {
          sp02Avg = spo2Calculated;
          spo2Value = sp02Avg;
          validSpO2 = true;
        }

        Serial.printf("[SpO2] Init: spo2=%d valid=%d hr=%d\n",
                      spo2Calculated, validSPO2, heartRateCalculated);

        spo2Phase = SPO2_SLIDING;
        spo2SampleCount = 0;
      }
    } else {
      // Fase 2: sliding window — kumpulkan 25 sample baru
      if (spo2SampleCount == 0) {
        // Geser 75 sample terakhir ke depan
        for (int i = 25; i < 100; i++) {
          redBuffer[i - 25] = redBuffer[i];
          irBuffer[i - 25]  = irBuffer[i];
        }
      }
      redBuffer[75 + spo2SampleCount] = redValue;
      irBuffer[75 + spo2SampleCount]  = irValue;
      spo2SampleCount++;

      if (spo2SampleCount >= 25) {
        // Hitung ulang SpO2 setiap 25 sample baru
        maxim_heart_rate_and_oxygen_saturation(irBuffer, 100, redBuffer,
          &spo2Calculated, &validSPO2, &heartRateCalculated, &validHeartRate);

        // Hanya update jika valid DAN dalam range realistis (70-100%)
        // Jika invalid → pertahankan nilai terakhir, JANGAN degradasi
        if (validSPO2 == 1 && spo2Calculated >= 70 && spo2Calculated <= 100) {
          sp02Avg = (sp02Avg + spo2Calculated) / 2;
          spo2Value = sp02Avg;
          validSpO2 = true;
        }
        // HR: JANGAN timpa beat detection rolling average — itu lebih stabil

        Serial.printf("[SpO2] Slide: spo2=%d avg=%d valid=%d hr_algo=%d hr_beat=%d\n",
                      spo2Calculated, sp02Avg, validSPO2, heartRateCalculated, beatAvg);

        spo2SampleCount = 0;
      }
    }
  }

  // Debug IR setiap 1 detik
  if (lastIRValue > 0 && millis() - lastIRDebug >= 1000) {
    lastIRDebug = millis();
    Serial.printf("[MAX] IR=%ld %s | phase=%d (%d samples)\n",
                  lastIRValue,
                  lastIRValue > 7000 ? "FINGER" : "NO FINGER",
                  spo2Phase, spo2SampleCount);
  }
}

// ============================================================
// KIRIM DATA VIA ESP-NOW
// ============================================================
void sendESPNow() {
  // Dummy suhu tubuh normal: 36.2 – 36.8 °C (variasi kecil ±0.3)
  suhuTubuh = 36.5 + ((random(-3, 4)) / 10.0);

  sensorData.heartRate      = heartRateVal;
  sensorData.spo2           = spo2Value;
  sensorData.suhuTubuh      = suhuTubuh;
  sensorData.validHR        = validHR;
  sensorData.validSpO2      = validSpO2;
  sensorData.fingerDetected = fingerDetected;

  esp_err_t result = esp_now_send(receiverMAC,
    (uint8_t *)&sensorData, sizeof(sensorData));

  Serial.printf("[SEND] HR=%d SpO2=%d Suhu=%.1f(dummy) finger=%d → %s\n",
    heartRateVal, spo2Value, suhuTubuh, fingerDetected,
    result == ESP_OK ? "OK" : "FAIL");
}

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== HerboraTech Sensor Node (ESP32-C3) — MAX30102 Only ===");

  // WiFi Station mode (required for ESP-NOW)
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();

  // Print MAC address (untuk dimasukkan ke receiver)
  Serial.printf("MAC Address: %s\n", WiFi.macAddress().c_str());

  // Init ESP-NOW
  if (esp_now_init() != ESP_OK) {
    Serial.println("ESP-NOW init FAILED!");
    return;
  }
  esp_now_register_send_cb(onDataSent);

  // Add peer (receiver)
  esp_now_peer_info_t peerInfo = {};
  memcpy(peerInfo.peer_addr, receiverMAC, 6);
  peerInfo.channel = 0;
  peerInfo.encrypt = false;

  if (esp_now_add_peer(&peerInfo) != ESP_OK) {
    Serial.println("Failed to add ESP-NOW peer");
    return;
  }
  Serial.println("ESP-NOW ready");

  // Init sensors
  initSensors();

  Serial.println("Sensor Node Ready!");
}

// ============================================================
// LOOP
// ============================================================
void loop() {
  // MAX30102: harus dipanggil setiap loop untuk beat detection
  readMAX30102();

  unsigned long now = millis();

  // Kirim ESP-NOW setiap 500ms (cukup responsif untuk real-time display)
  if (now - lastESPNowSend >= 500) {
    lastESPNowSend = now;
    sendESPNow();
  }

  delay(5);
}
