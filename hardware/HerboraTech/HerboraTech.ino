/*
 * HerboraTech - Waveshare ESP32-S3 Touch LCD 1.47" (172x320 JD9853)
 *
 * Display: JD9853 (SPI) via Arduino_GFX (ST7789 compatible)
 * Touch:   AXS5106L (I2C)
 * Sensor:  MPU6050 (Step Counter), MAX30102 (BPM & SpO2), MLX90614 (Suhu)
 *          — semua lokal via I2C
 * BLE:     Koneksi ke Web App
 * UI:      EEZ Studio LVGL v8
 */

#include <Arduino.h>
#include <SPI.h>
#include <Wire.h>

// === Arduino_GFX (pengganti TFT_eSPI untuk JD9853) ===
#include <Arduino_GFX_Library.h>

// === LVGL ===
#include <lvgl.h>

// === WiFi & NTP ===
#include <WiFi.h>
#include <time.h>

// === BLE ===
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// === Sensor MPU6050 (lokal) ===
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// === Sensor MAX30102 (BPM & SpO2) ===
#include <MAX30105.h>
#include <heartRate.h>
#include <spo2_algorithm.h>

// === Sensor MLX90614 (Suhu Tubuh) ===
#include <Adafruit_MLX90614.h>

// === EEZ Studio UI ===
extern "C" {
  #include "src/ui/ui.h"
  #include "src/ui/screens.h"
}

// ============================================================
// PIN DEFINITIONS - Waveshare ESP32-S3-Touch-LCD-1.47
// ============================================================
// LCD SPI (dari demo resmi Waveshare)
#define LCD_DC   45
#define LCD_CS   21
#define LCD_SCK  38
#define LCD_MOSI 39
#define LCD_RST  40
#define LCD_BL   46

// Touch I2C (AXS5106L) - I2C bus: SDA=42, SCL=41
#define TP_SDA   42
#define TP_SCL   41
#define TP_INT   47
#define TP_RST   48

// Sensor I2C (MPU6050)
// Menggunakan pin GPIO yang tersisa (header expansion)
// SESUAIKAN dengan pin yang Anda gunakan untuk menyambung sensor!
#define SENSOR_SDA 8
#define SENSOR_SCL 9

// ============================================================
// DISPLAY - Arduino_GFX (JD9853 menggunakan ST7789 base + custom init)
// ============================================================
Arduino_DataBus *bus = new Arduino_ESP32SPI(
  LCD_DC, LCD_CS, LCD_SCK, LCD_MOSI, -1 /* MISO */);

Arduino_GFX *gfx = new Arduino_ST7789(
  bus, LCD_RST, 0 /* rotation */, false /* IPS */,
  172 /* width */, 320 /* height */,
  34 /* col_offset1 */, 0 /* row_offset1 */,
  34 /* col_offset2 */, 0 /* row_offset2 */);

// JD9853 custom init sequence (berbeda dari ST7789)
static const uint8_t jd9853_init_operations[] = {
  BEGIN_WRITE,
  WRITE_COMMAND_8, 0x11,  // Sleep Out
  END_WRITE,
  DELAY, 120,

  BEGIN_WRITE,
  WRITE_C8_D16, 0xDF, 0x98, 0x53,  // JD9853 unlock
  WRITE_C8_D8, 0xB2, 0x23,

  WRITE_COMMAND_8, 0xB7,
  WRITE_BYTES, 4,
  0x00, 0x47, 0x00, 0x6F,

  WRITE_COMMAND_8, 0xBB,
  WRITE_BYTES, 6,
  0x1C, 0x1A, 0x55, 0x73, 0x63, 0xF0,

  WRITE_C8_D16, 0xC0, 0x44, 0xA4,
  WRITE_C8_D8, 0xC1, 0x16,

  WRITE_COMMAND_8, 0xC3,
  WRITE_BYTES, 8,
  0x7D, 0x07, 0x14, 0x06, 0xCF, 0x71, 0x72, 0x77,

  WRITE_COMMAND_8, 0xC4,
  WRITE_BYTES, 12,
  0x00, 0x00, 0xA0, 0x79, 0x0B, 0x0A, 0x16, 0x79, 0x0B, 0x0A, 0x16, 0x82,

  WRITE_COMMAND_8, 0xC8,
  WRITE_BYTES, 32,
  0x3F, 0x32, 0x29, 0x29, 0x27, 0x2B, 0x27, 0x28,
  0x28, 0x26, 0x25, 0x17, 0x12, 0x0D, 0x04, 0x00,
  0x3F, 0x32, 0x29, 0x29, 0x27, 0x2B, 0x27, 0x28,
  0x28, 0x26, 0x25, 0x17, 0x12, 0x0D, 0x04, 0x00,

  WRITE_COMMAND_8, 0xD0,
  WRITE_BYTES, 5,
  0x04, 0x06, 0x6B, 0x0F, 0x00,

  WRITE_C8_D16, 0xD7, 0x00, 0x30,
  WRITE_C8_D8, 0xE6, 0x14,
  WRITE_C8_D8, 0xDE, 0x01,

  WRITE_COMMAND_8, 0xB7,
  WRITE_BYTES, 5,
  0x03, 0x13, 0xEF, 0x35, 0x35,

  WRITE_COMMAND_8, 0xC1,
  WRITE_BYTES, 3,
  0x14, 0x15, 0xC0,

  WRITE_C8_D16, 0xC2, 0x06, 0x3A,
  WRITE_C8_D16, 0xC4, 0x72, 0x12,
  WRITE_C8_D8, 0xBE, 0x00,
  WRITE_C8_D8, 0xDE, 0x02,

  WRITE_COMMAND_8, 0xE5,
  WRITE_BYTES, 3,
  0x00, 0x02, 0x00,

  WRITE_COMMAND_8, 0xE5,
  WRITE_BYTES, 3,
  0x01, 0x02, 0x00,

  WRITE_C8_D8, 0xDE, 0x00,
  WRITE_C8_D8, 0x35, 0x00,
  WRITE_C8_D8, 0x3A, 0x05,  // 16-bit color (RGB565)

  WRITE_COMMAND_8, 0x2A,  // Column address set
  WRITE_BYTES, 4,
  0x00, 0x22, 0x00, 0xCD,

  WRITE_COMMAND_8, 0x2B,  // Row address set
  WRITE_BYTES, 4,
  0x00, 0x00, 0x01, 0x3F,

  WRITE_C8_D8, 0xDE, 0x02,

  WRITE_COMMAND_8, 0xE5,
  WRITE_BYTES, 3,
  0x00, 0x02, 0x00,

  WRITE_C8_D8, 0xDE, 0x00,
  WRITE_C8_D8, 0x36, 0x00,  // MADCTL: normal orientation
  WRITE_COMMAND_8, 0x21,    // Inversion ON
  END_WRITE,

  DELAY, 10,

  BEGIN_WRITE,
  WRITE_COMMAND_8, 0x29,  // Display ON
  END_WRITE
};

// ============================================================
// LVGL
// ============================================================
static const uint16_t SCREEN_WIDTH  = 172;
static const uint16_t SCREEN_HEIGHT = 320;

static lv_disp_draw_buf_t draw_buf;
static lv_color_t buf1[SCREEN_WIDTH * 40];
static lv_color_t buf2[SCREEN_WIDTH * 40];

// ============================================================
// BLE
// ============================================================
#define SERVICE_UUID        "12345678-1234-1234-1234-123456789abc"
#define CHAR_SENSOR_UUID    "abcd1234-ab12-cd34-ef56-123456789abc"
#define CHAR_COMMAND_UUID   "abcd1234-ab12-cd34-ef56-123456789abd"

BLEServer         *pServer       = nullptr;
BLECharacteristic *pSensorChar   = nullptr;
BLECharacteristic *pCommandChar  = nullptr;
bool bleConnected     = false;
bool prevBleConnected = false;

// ============================================================
// SENSOR (semua lokal via I2C pada Wire1)
// ============================================================
Adafruit_MPU6050   mpu;
MAX30105           particleSensor;
Adafruit_MLX90614  mlx;

bool mpu6050Ready   = false;
bool max30102Ready  = false;
bool mlx90614Ready  = false;

// MPU6050 step counter
int32_t   stepCount    = 0;
bool      stepDetected = false;
const float STEP_THRESHOLD = 1.2;

// MAX30102 heart rate
const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
byte rateCount = 0;  // Jumlah slot yang sudah terisi (maks RATE_SIZE)
long lastBeat = 0;
float beatsPerMinute = 0;
int32_t beatAvg = 0;

// MAX30102 SpO2 (non-blocking collection)
uint32_t irBuffer[100];
uint32_t redBuffer[100];
int32_t  spo2Calculated = 0;
int8_t   validSPO2 = 0;
int32_t  heartRateCalculated = 0;
int8_t   validHeartRate = 0;
uint8_t  spo2SampleIndex = 0;     // Index sample saat ini (0-99)
bool     spo2Collecting  = false;  // true = sedang mengumpulkan sample
unsigned long lastSpO2Start = 0;   // Waktu mulai collecting

// Data sensor global
int32_t   heartRate    = 0;
int32_t   spo2Value    = 0;
float     suhuTubuh    = 0.0;
bool      validHR      = false;
bool      validSpO2    = false;

// ============================================================
// BLE BLINKING & TIMERS
// ============================================================
unsigned long lastBlinkTime   = 0;
bool          blinkState      = false;
const int     BLINK_INTERVAL  = 500;
bool          bleButtonPressed = false;  // true setelah button BLE diklik

unsigned long lastSensorRead  = 0;
const int     SENSOR_INTERVAL = 1000;

// ============================================================
// WiFi & NTP
// ============================================================
const char* WIFI_SSID     = "enumatechz";     // Ganti dengan SSID WiFi Anda
const char* WIFI_PASSWORD = "3numaTechn0l0gy";  // Ganti dengan password WiFi Anda
const char* NTP_SERVER    = "pool.ntp.org";
const long  GMT_OFFSET    = 7 * 3600;  // WIB = UTC+7 (ganti sesuai timezone Anda)
const int   DST_OFFSET    = 0;

bool timeReady = false;
unsigned long lastTimeTick = 0;

// ============================================================
// TOUCH - AXS5106L (I2C address 0x63, dari demo resmi Waveshare)
// ============================================================
#define AXS5106L_ADDR 0x63

// Register AXS5106L (dari driver resmi)
#define AXS5106_TOUCH_POINTS_REG  0x01
#define AXS5106_P1_XH_REG        0x03
#define AXS5106_P1_XL_REG        0x04
#define AXS5106_P1_YH_REG        0x05
#define AXS5106_P1_YL_REG        0x06

void touchInit() {
  Wire.begin(TP_SDA, TP_SCL, 400000);

  // Reset touch controller
  pinMode(TP_RST, OUTPUT);
  digitalWrite(TP_RST, LOW);
  delay(10);
  digitalWrite(TP_RST, HIGH);
  delay(50);

  pinMode(TP_INT, INPUT);

  // Cek apakah touch controller merespons
  Wire.beginTransmission(AXS5106L_ADDR);
  uint8_t err = Wire.endTransmission();
  if (err == 0) {
    Serial.println("Touch AXS5106L found at 0x63");
  } else {
    Serial.printf("Touch AXS5106L NOT found (err=%d)\n", err);
  }
}

bool touchRead(int16_t *x, int16_t *y) {
  uint8_t data[14] = {0};

  // Baca dari register 0x01, 14 bytes (sesuai driver resmi)
  Wire.beginTransmission(AXS5106L_ADDR);
  Wire.write(AXS5106_TOUCH_POINTS_REG);
  if (Wire.endTransmission() != 0) return false;

  Wire.requestFrom((uint8_t)AXS5106L_ADDR, (uint8_t)14);
  for (int i = 0; i < 14 && Wire.available(); i++) {
    data[i] = Wire.read();
  }

  // data[1] = jumlah titik sentuh
  uint8_t points = data[1] & 0x0F;

  if (points > 0) {
    // Koordinat dari driver resmi: X = data[2]:data[3], Y = data[4]:data[5]
    // (offset dari register 0x01, jadi data[0]=reg 0x01 response)
    *x = ((uint16_t)(data[2] & 0x0F) << 8) | data[3];
    *y = ((uint16_t)(data[4] & 0x0F) << 8) | data[5];
    return true;
  }

  return false;
}

// ============================================================
// BLE CALLBACKS
// ============================================================
class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    bleConnected = true;
    Serial.println("BLE: Connected");
  }
  void onDisconnect(BLEServer* pServer) {
    bleConnected = false;
    Serial.println("BLE: Disconnected");
    pServer->startAdvertising();
  }
};

class MyCommandCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pCharacteristic) {
    std::string value = std::string(pCharacteristic->getValue().c_str());
    if (value.length() > 0) {
      Serial.print("BLE CMD: ");
      Serial.println(value.c_str());
    }
  }
};

// ============================================================
// LVGL DISPLAY FLUSH (via Arduino_GFX)
// ============================================================
void my_disp_flush(lv_disp_drv_t *disp, const lv_area_t *area, lv_color_t *color_p) {
  uint32_t w = (area->x2 - area->x1 + 1);
  uint32_t h = (area->y2 - area->y1 + 1);

  gfx->draw16bitRGBBitmap(area->x1, area->y1,
                           (uint16_t *)&color_p->full, w, h);

  lv_disp_flush_ready(disp);
}

// ============================================================
// LVGL TOUCH READ
// ============================================================
void my_touchpad_read(lv_indev_drv_t *indev_driver, lv_indev_data_t *data) {
  int16_t x, y;
  if (touchRead(&x, &y)) {
    data->state = LV_INDEV_STATE_PR;
    data->point.x = x;
    data->point.y = y;
  } else {
    data->state = LV_INDEV_STATE_REL;
  }
}

// ============================================================
// INIT BLE
// ============================================================
void initBLE() {
  BLEDevice::init("HerboraTech");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  pSensorChar = pService->createCharacteristic(
    CHAR_SENSOR_UUID,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_NOTIFY
  );
  pSensorChar->addDescriptor(new BLE2902());

  pCommandChar = pService->createCharacteristic(
    CHAR_COMMAND_UUID,
    BLECharacteristic::PROPERTY_WRITE
  );
  pCommandChar->setCallbacks(new MyCommandCallbacks());

  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  BLEDevice::startAdvertising();

  Serial.println("BLE: Advertising");
}

// ============================================================
// I2C BUS SCAN (debugging — menampilkan semua device yang terdeteksi)
// ============================================================
void scanI2C() {
  Serial.println("Scanning I2C bus (Wire1)...");
  int found = 0;
  for (uint8_t addr = 1; addr < 127; addr++) {
    Wire1.beginTransmission(addr);
    if (Wire1.endTransmission() == 0) {
      Serial.printf("  I2C device found at 0x%02X", addr);
      if (addr == 0x68) Serial.print(" (MPU6050)");
      else if (addr == 0x57) Serial.print(" (MAX30102)");
      else if (addr == 0x5A) Serial.print(" (MLX90614/GY-906)");
      Serial.println();
      found++;
    }
  }
  Serial.printf("I2C scan done: %d device(s) found\n", found);
}

// ============================================================
// INIT SENSORS (MPU6050, MAX30102, MLX90614 — semua lokal)
// ============================================================
void initSensors() {
  // Inisialisasi Wire1 dengan pin yang benar
  Wire1.begin(SENSOR_SDA, SENSOR_SCL);
  Wire1.setClock(100000);  // Standard speed 100kHz — paling kompatibel untuk semua sensor
  delay(100);  // Beri waktu I2C bus stabil

  // Debug: tampilkan semua device yang terdeteksi di bus
  scanI2C();

  // MPU6050
  // Library Adafruit memanggil Wire1.begin() internal — re-set pin setelahnya
  if (mpu.begin(0x68, &Wire1)) {
    mpu.setAccelerometerRange(MPU6050_RANGE_4_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    mpu6050Ready = true;
    Serial.println("MPU6050 OK");
  } else {
    Serial.println("MPU6050 not found");
  }

  // Pulihkan pin Wire1 — library sensor bisa me-reset konfigurasi pin
  Wire1.begin(SENSOR_SDA, SENSOR_SCL);
  Wire1.setClock(100000);
  delay(50);

  // MAX30102
  // Gunakan I2C_SPEED_STANDARD (100kHz) agar tidak mengganggu sensor lain di bus
  if (particleSensor.begin(Wire1, I2C_SPEED_STANDARD)) {
    // ledBrightness=60, sampleAvg=4, ledMode=2(Red+IR), sampleRate=100, pulseWidth=411, adcRange=4096
    particleSensor.setup(60, 4, 2, 100, 411, 4096);
    // Red & IR harus sama-sama terang agar SpO2 akurat
    particleSensor.setPulseAmplitudeRed(0x3C);   // Red = 60 (sama dengan IR)
    particleSensor.setPulseAmplitudeIR(0x3C);     // IR  = 60
    particleSensor.setPulseAmplitudeGreen(0);     // Green tidak dipakai
    max30102Ready = true;
    Serial.println("MAX30102 OK");
  } else {
    Serial.println("MAX30102 not found");
  }

  // Pulihkan pin Wire1 lagi setelah MAX30102 library memanggil Wire1.begin() internal
  Wire1.begin(SENSOR_SDA, SENSOR_SCL);
  Wire1.setClock(100000);
  delay(50);

  // MLX90614 (GY-906)
  if (mlx.begin(0x5A, &Wire1)) {
    mlx90614Ready = true;
    Serial.println("MLX90614 OK");
  } else {
    Serial.println("MLX90614 not found");
  }
}

// ============================================================
// BACA MAX30102 — dipanggil SETIAP LOOP (harus cepat & sering
// agar checkForBeat() bisa mendeteksi detak jantung)
// ============================================================
void readMAX30102() {
  if (!max30102Ready) return;

  // --- Heart Rate: baca semua sample yang tersedia di FIFO ---
  particleSensor.check();  // Baca FIFO dari sensor ke buffer library

  // Debug: tampilkan raw IR setiap 1 detik agar tahu apakah jari terdeteksi
  static unsigned long lastIRDebug = 0;
  long lastIRValue = 0;

  while (particleSensor.available()) {
    long irValue = particleSensor.getIR();
    long redValue = particleSensor.getRed();
    particleSensor.nextSample();
    lastIRValue = irValue;

    if (checkForBeat(irValue)) {
      long delta = millis() - lastBeat;
      lastBeat = millis();
      beatsPerMinute = 60.0 / (delta / 1000.0);

      if (beatsPerMinute > 20 && beatsPerMinute < 255) {
        rates[rateSpot % RATE_SIZE] = (byte)beatsPerMinute;
        rateSpot++;
        if (rateCount < RATE_SIZE) rateCount++;

        // Rata-rata hanya dari slot yang sudah terisi
        int32_t sum = 0;
        for (byte x = 0; x < rateCount; x++) sum += rates[x];
        beatAvg = sum / rateCount;

        Serial.printf("[HR] Beat! instant=%.0f avg=%d (slots=%d)\n",
                      beatsPerMinute, beatAvg, rateCount);
      }
    }

    if (irValue > 50000) {
      if (beatAvg > 0) {
        heartRate = beatAvg;
        validHR = true;
      }
      // Jika beatAvg masih 0, jangan set validHR=false — tunggu data dari SpO2 algorithm
    } else {
      // Jari dilepas → reset beat detection
      validHR = false;
      beatAvg = 0;
      rateCount = 0;
      rateSpot = 0;
    }

    // --- SpO2: kumpulkan sample secara non-blocking ---
    if (spo2Collecting && spo2SampleIndex < 100) {
      irBuffer[spo2SampleIndex]  = irValue;
      redBuffer[spo2SampleIndex] = redValue;
      spo2SampleIndex++;
    }
  }

  // Debug: print raw IR setiap 1 detik
  if (lastIRValue > 0 && millis() - lastIRDebug >= 1000) {
    lastIRDebug = millis();
    Serial.printf("[MAX] IR=%ld %s | collecting=%d (%d/100)\n",
                  lastIRValue,
                  lastIRValue > 50000 ? "JARI TERDETEKSI" : "TIDAK ADA JARI",
                  spo2Collecting, spo2SampleIndex);
  }

  // Mulai collecting SpO2 setiap 5 detik
  if (!spo2Collecting && millis() - lastSpO2Start >= 5000) {
    spo2Collecting = true;
    spo2SampleIndex = 0;
    lastSpO2Start = millis();
    Serial.println("[SpO2] Mulai collecting 100 samples...");
  }

  // Timeout: jika lebih dari 10 detik, abort
  if (spo2Collecting && millis() - lastSpO2Start > 10000) {
    Serial.printf("[SpO2] Timeout! Hanya dapat %d/100 samples\n", spo2SampleIndex);
    spo2Collecting = false;
  }

  // Selesai kumpulkan 100 sample -> hitung SpO2 dan Heart Rate
  if (spo2Collecting && spo2SampleIndex >= 100) {
    spo2Collecting = false;
    maxim_heart_rate_and_oxygen_saturation(irBuffer, 100, redBuffer,
      &spo2Calculated, &validSPO2, &heartRateCalculated, &validHeartRate);
    Serial.printf("[SpO2] Hitung selesai: spo2=%d valid=%d hr=%d validHR=%d\n",
                  spo2Calculated, validSPO2, heartRateCalculated, validHeartRate);
    if (validSPO2) {
      spo2Value = spo2Calculated;
      validSpO2 = true;
    } else {
      validSpO2 = false;
    }
    // Gunakan heart rate dari SpO2 algorithm (lebih akurat dari checkForBeat)
    if (validHeartRate && heartRateCalculated > 20 && heartRateCalculated < 255) {
      heartRate = heartRateCalculated;
      validHR = true;
      Serial.printf("[HR] Dari SpO2 algorithm: %d BPM\n", heartRateCalculated);
    }
  }
}

// ============================================================
// BACA SENSOR LAMBAT (MPU6050 & MLX90614 — cukup 1x per detik)
// ============================================================
void readSensors() {
  // --- MPU6050: Step Counter ---
  if (mpu6050Ready) {
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);

    float accMag = sqrt(a.acceleration.x * a.acceleration.x +
                        a.acceleration.y * a.acceleration.y +
                        a.acceleration.z * a.acceleration.z) / 9.81;

    if (accMag > STEP_THRESHOLD && !stepDetected) {
      stepDetected = true;
      stepCount++;
    }
    if (accMag < (STEP_THRESHOLD - 0.2)) {
      stepDetected = false;
    }
  }

  // --- MLX90614: Suhu Tubuh ---
  if (mlx90614Ready) {
    float objTemp = mlx.readObjectTempC();
    if (objTemp > 20.0 && objTemp < 45.0) {
      suhuTubuh = objTemp;
    }
  }
}

// ============================================================
// UPDATE UI
// ============================================================
void updateUI() {
  char buf[16];

  if (validHR && heartRate > 0 && heartRate < 250)
    snprintf(buf, sizeof(buf), "%d", (int)heartRate);
  else
    snprintf(buf, sizeof(buf), "--");
  lv_label_set_text(objects.heart_text, buf);

  if (validSpO2 && spo2Value > 0 && spo2Value <= 100)
    snprintf(buf, sizeof(buf), "%d", (int)spo2Value);
  else
    snprintf(buf, sizeof(buf), "--");
  lv_label_set_text(objects.spo2_text, buf);

  if (suhuTubuh > 20.0 && suhuTubuh < 45.0)
    snprintf(buf, sizeof(buf), "%.1f", suhuTubuh);
  else
    snprintf(buf, sizeof(buf), "--");
  lv_label_set_text(objects.suhu_tubuh_text, buf);

  snprintf(buf, sizeof(buf), "%d", (int)stepCount);
  lv_label_set_text(objects.steps_text, buf);

  // Debug: tampilkan status semua data sensor
  Serial.printf("[UI] HR=%d(valid=%d) SpO2=%d(valid=%d) Suhu=%.1f Steps=%d\n",
                heartRate, validHR, spo2Value, validSpO2, suhuTubuh, stepCount);
}

// ============================================================
// KIRIM DATA VIA BLE
// ============================================================
void sendBLEData() {
  if (!bleConnected) return;
  char data[64];
  snprintf(data, sizeof(data), "%d,%d,%.1f,%d",
           (int)heartRate, (int)spo2Value, suhuTubuh, (int)stepCount);
  pSensorChar->setValue(data);
  pSensorChar->notify();
}

// ============================================================
// BLE BUTTON EVENT (diklik -> mulai advertising & blinking)
// ============================================================
static void ble_btn_event_cb(lv_event_t *e) {
  if (bleButtonPressed) return;  // Sudah aktif, abaikan
  bleButtonPressed = true;
  initBLE();
  Serial.println("BLE Button pressed -> Advertising started");
}

// ============================================================
// HANDLE BLE BUTTON BLINKING & PAGE SWITCHING
// ============================================================
void handleBLEStatus() {
  unsigned long now = millis();

  // Belum diklik -> tidak ada blinking
  if (!bleButtonPressed) return;

  if (!bleConnected) {
    // Blink hijau <-> putih setiap 0.5 detik
    if (now - lastBlinkTime >= BLINK_INTERVAL) {
      lastBlinkTime = now;
      blinkState = !blinkState;
      lv_obj_set_style_text_color(objects.obj0,
        blinkState ? lv_color_hex(0x55c637) : lv_color_hex(0xffffff),
        LV_PART_MAIN | LV_STATE_DEFAULT);
    }
    // Disconnect -> kembali ke Main & mulai blinking lagi
    if (prevBleConnected) {
      loadScreen(SCREEN_ID_MAIN);
    }
  } else {
    // Baru connect -> pindah ke Screen_Data
    if (!prevBleConnected) {
      lv_obj_set_style_text_color(objects.obj0, lv_color_hex(0xffffff),
                                  LV_PART_MAIN | LV_STATE_DEFAULT);
      loadScreen(SCREEN_ID_SCREEN_DATA);
    }
  }
  prevBleConnected = bleConnected;
}

// ============================================================
// INIT WiFi & NTP (non-blocking, WiFi dimatikan setelah sync)
// ============================================================
void initTimeNTP() {
  Serial.print("WiFi connecting...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" OK");
    configTime(GMT_OFFSET, DST_OFFSET, NTP_SERVER);

    // Tunggu waktu valid (max 5 detik)
    struct tm ti;
    for (int i = 0; i < 10; i++) {
      if (getLocalTime(&ti)) {
        timeReady = true;
        Serial.printf("NTP Time: %02d:%02d:%02d\n", ti.tm_hour, ti.tm_min, ti.tm_sec);
        break;
      }
      delay(500);
    }

    // NTP selesai, disconnect WiFi
    WiFi.disconnect(true);
    WiFi.mode(WIFI_OFF);
    Serial.println("WiFi disconnected (NTP synced)");
  } else {
    Serial.println(" FAILED - using default time");
    WiFi.disconnect(true);
    WiFi.mode(WIFI_OFF);
  }
}

// ============================================================
// UPDATE WAKTU (hour_text, day_text, date_text)
// ============================================================
void updateClock() {
  unsigned long now = millis();
  if (now - lastTimeTick < 1000) return;
  lastTimeTick = now;

  struct tm ti;
  if (!getLocalTime(&ti)) return;

  // hour_text: "HH:MM"
  char timeBuf[8];
  snprintf(timeBuf, sizeof(timeBuf), "%02d:%02d", ti.tm_hour, ti.tm_min);
  lv_label_set_text(objects.hour_text, timeBuf);

  // day_text: "Monday", "Tuesday", dll
  const char* dayNames[] = {
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"
  };
  lv_label_set_text(objects.day_text, dayNames[ti.tm_wday]);

  // date_text: "01 Jan 2026"
  const char* monthNames[] = {
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  };
  char dateBuf[16];
  snprintf(dateBuf, sizeof(dateBuf), "%02d %s %d",
           ti.tm_mday, monthNames[ti.tm_mon], ti.tm_year + 1900);
  lv_label_set_text(objects.date_text, dateBuf);
}

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  Serial.println("HerboraTech Starting...");

  // Display init (Arduino_GFX)
  gfx->begin();

  // Kirim JD9853 custom init sequence (override ST7789 default)
  bus->batchOperation(jd9853_init_operations, sizeof(jd9853_init_operations));

  // Backlight ON (setelah display diinisialisasi)
  pinMode(LCD_BL, OUTPUT);
  digitalWrite(LCD_BL, HIGH);

  gfx->fillScreen(0x0000);

  // LVGL init
  lv_init();
  lv_disp_draw_buf_init(&draw_buf, buf1, buf2, SCREEN_WIDTH * 40);

  // Display driver
  static lv_disp_drv_t disp_drv;
  lv_disp_drv_init(&disp_drv);
  disp_drv.hor_res  = SCREEN_WIDTH;
  disp_drv.ver_res  = SCREEN_HEIGHT;
  disp_drv.flush_cb = my_disp_flush;
  disp_drv.draw_buf = &draw_buf;
  lv_disp_drv_register(&disp_drv);

  // Touch init
  touchInit();

  // Touch input driver
  static lv_indev_drv_t indev_drv;
  lv_indev_drv_init(&indev_drv);
  indev_drv.type    = LV_INDEV_TYPE_POINTER;
  indev_drv.read_cb = my_touchpad_read;
  lv_indev_drv_register(&indev_drv);

  // EEZ UI
  ui_init();

  // Sync waktu via NTP (WiFi dimatikan setelah sync)
  initTimeNTP();

  // Hapus flag clickable dari label di dalam button (agar klik tembus ke button)
  lv_obj_clear_flag(objects.obj0, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_CHECKABLE);

  // ============================================================
  // FIX CENTERING: Gunakan lv_obj_align agar semua item ter-center
  // secara horizontal, tidak bergantung pada padding theme.
  // ============================================================

  // --- Screen Main: center horizontal semua item ---
  lv_obj_align(objects.hour_text,    LV_ALIGN_TOP_MID, 0, 52);
  lv_obj_align(objects.day_text,     LV_ALIGN_TOP_MID, 0, 101);
  lv_obj_align(objects.date_text,    LV_ALIGN_TOP_MID, 0, 127);
  lv_obj_align(objects.connnect_ble, LV_ALIGN_TOP_MID, 0, 205);

  // Fix Screen Data: hapus padding & border agar tileview full-screen
  lv_obj_set_style_pad_all(objects.screen_data, 0, LV_PART_MAIN);
  lv_obj_set_style_border_width(objects.screen_data, 0, LV_PART_MAIN);

  // Fix TileView: EEZ Studio membuat tile dengan lv_obj_create, bukan lv_tileview_add_tile.
  // Kita hapus fake tiles dan buat ulang tile asli, lalu pindahkan konten.
  lv_obj_t *tileview = lv_obj_get_parent(objects.tile_01);
  lv_obj_add_flag(tileview, LV_OBJ_FLAG_SCROLLABLE);

  // Hapus padding & border dari tileview
  lv_obj_set_style_pad_all(tileview, 0, LV_PART_MAIN);
  lv_obj_set_style_border_width(tileview, 0, LV_PART_MAIN);

  // Buat 3 tile asli dengan lv_tileview_add_tile (x=0,1,2  y=0)
  lv_obj_t *real_tile1 = lv_tileview_add_tile(tileview, 0, 0, LV_DIR_RIGHT);
  lv_obj_t *real_tile2 = lv_tileview_add_tile(tileview, 1, 0, LV_DIR_LEFT | LV_DIR_RIGHT);
  lv_obj_t *real_tile3 = lv_tileview_add_tile(tileview, 2, 0, LV_DIR_LEFT);

  // Pindahkan semua child dari fake tile ke real tile
  while (lv_obj_get_child_cnt(objects.tile_01) > 0)
    lv_obj_set_parent(lv_obj_get_child(objects.tile_01, 0), real_tile1);
  while (lv_obj_get_child_cnt(objects.tile_02) > 0)
    lv_obj_set_parent(lv_obj_get_child(objects.tile_02, 0), real_tile2);
  while (lv_obj_get_child_cnt(objects.tile_03) > 0)
    lv_obj_set_parent(lv_obj_get_child(objects.tile_03, 0), real_tile3);

  // Hapus fake tiles
  lv_obj_del(objects.tile_01);
  lv_obj_del(objects.tile_02);
  lv_obj_del(objects.tile_03);

  // Update pointer agar updateUI tetap bekerja
  objects.tile_01 = real_tile1;
  objects.tile_02 = real_tile2;
  objects.tile_03 = real_tile3;

  // Hapus padding, border, dan background dari tile agar rapi (full screen)
  lv_obj_t *tiles[] = {real_tile1, real_tile2, real_tile3};
  for (int i = 0; i < 3; i++) {
    lv_obj_set_style_pad_all(tiles[i], 0, 0);
    lv_obj_set_style_border_width(tiles[i], 0, 0);
    lv_obj_set_style_bg_opa(tiles[i], LV_OPA_TRANSP, 0);

    // Fix background image: EEZ Studio menaruh di (-15,-15) untuk kompensasi padding,
    // tapi tile sekarang pad=0, jadi background perlu di-center ulang.
    lv_obj_t *bg_img = lv_obj_get_child(tiles[i], 0);
    if (bg_img) {
      lv_obj_align(bg_img, LV_ALIGN_CENTER, 0, 0);
    }
  }

  // --- Tile 01 (BPM & SpO2): center horizontal semua item ---
  // Child order: [0]bg, [1]line, [2]obj6, [3]spo2_text, [4]obj7, [5]obj8, [6]heart_text, [7]obj9
  lv_obj_align(objects.obj9,       LV_ALIGN_TOP_MID, 0, 2);    // heart icon
  lv_obj_align(objects.heart_text, LV_ALIGN_TOP_MID, 0, 52);   // BPM value
  lv_obj_align(objects.obj8,       LV_ALIGN_TOP_MID, 0, 101);  // "BPM" label
  lv_obj_t *line_div = lv_obj_get_child(objects.tile_01, 1);    // line divider (unnamed)
  lv_obj_align(line_div,           LV_ALIGN_TOP_MID, 0, 145);
  lv_obj_align(objects.obj7,       LV_ALIGN_TOP_MID, 0, 164);  // SpO2 icon
  lv_obj_align(objects.spo2_text,  LV_ALIGN_TOP_MID, 0, 215);  // SpO2 value
  lv_obj_align(objects.obj6,       LV_ALIGN_TOP_MID, 0, 264);  // "%" label

  // --- Tile 02 (Suhu Tubuh): center horizontal semua item ---
  // Child order: [0]bg, [1]suhu_tubuh_text, [2]obj4, [3]thermometer_img, [4]obj5
  lv_obj_align(objects.obj4,            LV_ALIGN_TOP_MID, 0, 21);   // "Suhu Tubuh" label
  lv_obj_t *thermo_img = lv_obj_get_child(objects.tile_02, 3);      // thermometer icon (unnamed)
  lv_obj_align(thermo_img,              LV_ALIGN_TOP_MID, 0, 82);
  lv_obj_align(objects.suhu_tubuh_text, LV_ALIGN_TOP_MID, 0, 168);  // suhu value
  lv_obj_align(objects.obj5,            LV_ALIGN_TOP_MID, 0, 220);  // "°C" label

  // --- Tile 03 (Step Counter): center horizontal semua item ---
  lv_obj_align(objects.obj2,       LV_ALIGN_TOP_MID, 0, 19);   // "Step Counter" label
  lv_obj_align(objects.obj1,       LV_ALIGN_TOP_MID, 0, 68);   // footprints icon
  lv_obj_align(objects.steps_text, LV_ALIGN_TOP_MID, 0, 153);  // steps value
  lv_obj_align(objects.obj3,       LV_ALIGN_TOP_MID, 0, 210);  // "Steps" label

  // BLE: register event pada button, BLE dimulai saat button diklik
  lv_obj_add_event_cb(objects.connnect_ble, ble_btn_event_cb, LV_EVENT_CLICKED, NULL);
  Serial.println("BLE button ready - tap to start");

  // Sensors
  initSensors();

  Serial.println("HerboraTech Ready!");
}

// ============================================================
// LOOP
// ============================================================
void loop() {
  lv_timer_handler();

  handleBLEStatus();

  // MAX30102: HARUS dipanggil setiap loop agar beat detection akurat
  readMAX30102();

  // MPU6050, MLX90614, UI update, dan BLE kirim data setiap 1 detik
  unsigned long now = millis();
  if (now - lastSensorRead >= SENSOR_INTERVAL) {
    lastSensorRead = now;
    readSensors();
    updateUI();
    sendBLEData();
  }

  updateClock();
  ui_tick();

  delay(5);
}
