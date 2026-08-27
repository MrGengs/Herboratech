/*
 * HerboraTech - Waveshare ESP32-S3 Touch LCD 1.47" (172x320 JD9853)
 *
 * Display: JD9853 (SPI) via Arduino_GFX (ST7789 compatible)
 * Touch:   AXS5106L (I2C)
 * Sensor:  MPU6050 (Step Counter) — lokal via I2C
 *          MAX30102 + MLX90614 — via ESP-NOW dari ESP32-C3 Sensor Node
 * BLE:     Koneksi ke Web App
 * UI:      EEZ Studio LVGL v8
 */

#include <Arduino.h>
#include <SPI.h>
#include <Wire.h>
extern TwoWire Wire1;

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

// === ESP-NOW (terima data dari ESP32-C3 Sensor Node) ===
#include <esp_now.h>

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
static lv_color_t buf1[SCREEN_WIDTH * 10];

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
// SENSOR — MPU6050 lokal, MAX30102 & MLX90614 via ESP-NOW
// ============================================================
Adafruit_MPU6050   mpu;
bool mpu6050Ready   = false;

// ESP-NOW data structure (harus sama persis dengan sender ESP32-C3)
typedef struct __attribute__((packed)) {
  int32_t heartRate;
  int32_t spo2;
  float   suhuTubuh;
  bool    validHR;
  bool    validSpO2;
  bool    fingerDetected;
} SensorData_t;

volatile bool espNowDataReady = false;
SensorData_t  espNowData;

// ============================================================
// MPU6050 PEDOMETER — Neil Zhao Dynamic Threshold Algorithm
// (Analog Devices AN-602 / Analog Dialogue June 2010)
//
// Pipeline: Raw Accel → Magnitude → Low-Pass Filter (EMA) →
//           Dynamic Threshold (update per window) →
//           Negative Zero-Crossing → Time Window Validation → Step
//
// Calibration-free, orientation-independent, adapts to user gait.
// ============================================================
int32_t stepCount = 0;

// Low-pass filter (Exponential Moving Average)
const float EMA_ALPHA   = 0.15;   // Balance: cukup smooth tapi tidak kehilangan langkah
float       filteredAcc  = 1.0;    // Filtered magnitude (init ~1g)

// Dynamic threshold — updated setiap WINDOW_SIZE samples
const int   WINDOW_SIZE  = 50;     // 50 samples @ 50Hz = 1 detik
int         windowCount  = 0;
float       windowMax    = -999.0;
float       windowMin    =  999.0;
float       dynamicThreshold = 1.0; // (max+min)/2, init ~1g
float       lastRange    = 0.0;     // range terakhir untuk amplitude scaling

// Zero-crossing detection
bool        aboveThreshold = false;
float       lastPeak       = 0.0;   // track puncak sebelum crossing

// Debounce — interval antara 2 langkah valid
const unsigned long STEP_MIN_INTERVAL = 280;   // ms (max ~3.5 langkah/detik = lari cepat)
const unsigned long STEP_MAX_INTERVAL = 2000;  // ms (min ~0.5 langkah/detik = jalan pelan)
unsigned long lastStepTime = 0;

// Consecutive step validation — cegah gerakan acak dihitung
const int   STEPS_TO_CONFIRM = 2;   // butuh 2 crossing berturut-turut sebelum mulai hitung
int         pendingSteps     = 0;    // crossing yang belum dikonfirmasi
bool        walkingConfirmed = false;

// Sampling timer (50 Hz = 20ms interval)
unsigned long lastPedometerSample = 0;
const unsigned long PEDOMETER_SAMPLE_INTERVAL = 20; // ms

// Data sensor global (HR, SpO2, Suhu dari ESP-NOW)
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
  uint8_t data[8] = {0};

  Wire.beginTransmission(AXS5106L_ADDR);
  Wire.write(0x00);
  if (Wire.endTransmission() != 0) return false;

  Wire.requestFrom((uint8_t)AXS5106L_ADDR, (uint8_t)8);
  for (int i = 0; i < 8 && Wire.available(); i++) {
    data[i] = Wire.read();
  }

  // AXS5106L format: data[3]=event(0x40=press,0x80=release), data[4]=X, data[5:6]=Y
  // Hanya report touch saat event = press/contact (0x00-0x7F, bukan 0x80+ release)
  if (data[3] != 0x00 && data[3] != 0xFF && !(data[3] & 0x80)) {
    int16_t tx = data[4];
    int16_t ty = ((uint16_t)data[5] << 8) | data[6];
    // Validasi koordinat dalam range layar
    if (tx >= 0 && tx <= SCREEN_WIDTH && ty >= 0 && ty <= SCREEN_HEIGHT) {
      *x = tx;
      *y = ty;
      return true;
    }
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
// ESP-NOW RECEIVE CALLBACK
// ============================================================
void onESPNowDataRecv(const esp_now_recv_info_t *info, const uint8_t *data, int data_len) {
  if (data_len == sizeof(SensorData_t)) {
    // Copy data dan set flag secara atomic
    noInterrupts();
    memcpy((void *)&espNowData, data, sizeof(SensorData_t));
    espNowDataReady = true;
    interrupts();
    Serial.printf("[ESP-NOW] Recv HR=%d SpO2=%d Suhu=%.1f finger=%d\n",
      espNowData.heartRate, espNowData.spo2, espNowData.suhuTubuh, espNowData.fingerDetected);
  }
}

// ============================================================
// INIT ESP-NOW (receiver)
// ============================================================
void initESPNow() {
  // WiFi STA mode diperlukan untuk ESP-NOW
  // Catatan: WiFi akan di-disconnect setelah NTP sync, tapi mode tetap STA
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();

  Serial.printf("ESP32-S3 MAC: %s\n", WiFi.macAddress().c_str());

  if (esp_now_init() != ESP_OK) {
    Serial.println("ESP-NOW init FAILED!");
    return;
  }

  esp_now_register_recv_cb(onESPNowDataRecv);
  Serial.println("ESP-NOW receiver ready"); 
}

// ============================================================
// INIT SENSORS — hanya MPU6050 lokal (MAX30102 & MLX90614 via ESP-NOW)
// ============================================================
void initSensors() {
  Wire1.begin(SENSOR_SDA, SENSOR_SCL);
  Wire1.setClock(100000);
  delay(100);

  // MPU6050 — range 2G untuk sensitivitas terbaik (pedometer)
  if (mpu.begin(0x68, &Wire1)) {
    mpu.setAccelerometerRange(MPU6050_RANGE_2_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    mpu6050Ready = true;
    Serial.println("MPU6050 OK (2G range, pedometer mode)");
  } else {
    Serial.println("MPU6050 not found");
  }
}

// ============================================================
// PROSES DATA ESP-NOW (dari ESP32-C3 Sensor Node)
// ============================================================
void processESPNowData() {
  if (!espNowDataReady) return;

  // Copy ke local dulu (atomic-safe), baru clear flag
  SensorData_t localData;
  noInterrupts();
  memcpy(&localData, (const void *)&espNowData, sizeof(SensorData_t));
  espNowDataReady = false;
  interrupts();

  heartRate = localData.heartRate;
  spo2Value = localData.spo2;
  suhuTubuh = localData.suhuTubuh;
  validHR   = localData.validHR;
  validSpO2 = localData.validSpO2;
}

// ============================================================
// PEDOMETER — dipanggil setiap loop, internal timer 50Hz
// Neil Zhao Dynamic Threshold Algorithm (Analog Devices)
// ============================================================
void readPedometer() {
  if (!mpu6050Ready) return;

  unsigned long now = millis();
  if (now - lastPedometerSample < PEDOMETER_SAMPLE_INTERVAL) return;
  lastPedometerSample = now;

  // 1. Baca raw accelerometer
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  // 2. Hitung magnitude (dalam g) — orientation-independent
  float accMag = sqrt(a.acceleration.x * a.acceleration.x +
                      a.acceleration.y * a.acceleration.y +
                      a.acceleration.z * a.acceleration.z) / 9.81;

  // 3. Low-pass filter (EMA) — hapus noise frekuensi tinggi
  filteredAcc = EMA_ALPHA * accMag + (1.0 - EMA_ALPHA) * filteredAcc;

  // 4. Track min/max dalam window untuk dynamic threshold
  if (filteredAcc > windowMax) windowMax = filteredAcc;
  if (filteredAcc < windowMin) windowMin = filteredAcc;
  windowCount++;

  // Track peak saat di atas threshold (untuk amplitude check)
  if (filteredAcc > dynamicThreshold && filteredAcc > lastPeak) {
    lastPeak = filteredAcc;
  }

  // 5. Update dynamic threshold setiap WINDOW_SIZE samples (1 detik)
  if (windowCount >= WINDOW_SIZE) {
    float range = windowMax - windowMin;
    lastRange = range;
    if (range > 0.10) {  // Minimal 0.10g variasi = gerakan nyata
      dynamicThreshold = (windowMax + windowMin) / 2.0;
    }
    // Reset window
    windowMax = -999.0;
    windowMin =  999.0;
    windowCount = 0;
  }

  // 6. Negative zero-crossing detection
  //    Step terdeteksi saat sinyal turun melewati threshold (above → below)
  bool currentlyAbove = (filteredAcc > dynamicThreshold);

  if (aboveThreshold && !currentlyAbove) {
    // Crossing detected — cek amplitude: peak harus minimal 30% dari range sinyal
    // Ini mencegah osilasi kecil (noise/settling) dihitung sebagai step
    float peakAmplitude = lastPeak - dynamicThreshold;
    float minAmplitude  = (lastRange > 0.10) ? lastRange * 0.3 : 0.03;
    lastPeak = 0.0;

    if (peakAmplitude < minAmplitude) {
      aboveThreshold = currentlyAbove;
      return;
    }

    unsigned long timeSinceLastStep = now - lastStepTime;

    if (timeSinceLastStep >= STEP_MIN_INTERVAL &&
        timeSinceLastStep <= STEP_MAX_INTERVAL) {
      // Interval valid — apakah pola jalan sudah terkonfirmasi?
      if (walkingConfirmed) {
        stepCount++;
      } else {
        pendingSteps++;
        if (pendingSteps >= STEPS_TO_CONFIRM) {
          // Pola jalan terkonfirmasi! Tambahkan semua pending
          stepCount += pendingSteps;
          walkingConfirmed = true;
          pendingSteps = 0;
        }
      }
      lastStepTime = now;
    } else if (timeSinceLastStep > STEP_MAX_INTERVAL) {
      // Terlalu lama sejak langkah terakhir → reset konfirmasi
      walkingConfirmed = false;
      pendingSteps = 1;
      lastStepTime = now;
    }
    // Jika < STEP_MIN_INTERVAL → abaikan (debounce)
  }

  aboveThreshold = currentlyAbove;
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
  lv_label_set_text(objects.heart_text_1, buf);

  if (validSpO2 && spo2Value > 0 && spo2Value <= 100)
    snprintf(buf, sizeof(buf), "%d", (int)spo2Value);
  else
    snprintf(buf, sizeof(buf), "--");
  lv_label_set_text(objects.spo2_text_1, buf);

  if (suhuTubuh > 20.0 && suhuTubuh < 45.0)
    snprintf(buf, sizeof(buf), "%.1f", suhuTubuh);
  else
    snprintf(buf, sizeof(buf), "--");
  lv_label_set_text(objects.suhu_tubuh_text_1, buf);

  snprintf(buf, sizeof(buf), "%d", (int)stepCount);
  lv_label_set_text(objects.steps_text_1, buf);

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
// HANDLE BLE BUTTON BLINKING (label obj9 di dalam button)
// ============================================================
void handleBLEStatus() {
  unsigned long now = millis();

  // Belum diklik -> tidak ada blinking
  if (!bleButtonPressed) return;

  if (!bleConnected) {
    // Blink hijau <-> putih setiap 0.5 detik pada label BLE button (obj9)
    if (now - lastBlinkTime >= BLINK_INTERVAL) {
      lastBlinkTime = now;
      blinkState = !blinkState;
      lv_obj_set_style_text_color(objects.obj9,
        blinkState ? lv_color_hex(0xffffff) : lv_color_hex(0x55c637),
        LV_PART_MAIN | LV_STATE_DEFAULT);
    }
  } else {
    // Connected -> label putih solid (tidak berkedip)
    if (!prevBleConnected) {
      lv_obj_set_style_text_color(objects.obj9, lv_color_hex(0xffffff),
                                  LV_PART_MAIN | LV_STATE_DEFAULT);
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

    // NTP selesai, disconnect WiFi tapi tetap STA mode untuk ESP-NOW
    WiFi.disconnect();
    Serial.println("WiFi disconnected (NTP synced, STA mode kept for ESP-NOW)");
  } else {
    Serial.println(" FAILED - using default time");
    WiFi.disconnect();
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
  lv_disp_draw_buf_init(&draw_buf, buf1, NULL, SCREEN_WIDTH * 10);

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

  // Sync waktu via NTP (WiFi disconnect setelah sync, STA mode tetap untuk ESP-NOW)
  initTimeNTP();

  // Init ESP-NOW receiver (terima data dari ESP32-C3 Sensor Node)
  initESPNow();

  // Hapus flag clickable dari label di dalam button (agar klik tembus ke button)
  lv_obj_clear_flag(objects.obj9, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_CHECKABLE);

  // ============================================================
  // SINGLE PAGE: Semua panel di dalam 1 TileView pada screen MAIN.
  // Bisa di-swipe kapan saja (tanpa harus BLE connect).
  // Tile order: [0]Home  [1]BPM/SpO2  [2]Suhu  [3]Steps
  // ============================================================

  // Ambil tileview dari MAIN screen (parent dari semua fake tiles)
  lv_obj_t *tileview = lv_obj_get_parent(objects.screen_main);
  lv_obj_add_flag(tileview, LV_OBJ_FLAG_SCROLLABLE);

  // Hapus padding & border dari tileview agar full-screen
  lv_obj_set_style_pad_all(tileview, 0, LV_PART_MAIN);
  lv_obj_set_style_border_width(tileview, 0, LV_PART_MAIN);

  // Buat 4 real tiles dengan lv_tileview_add_tile
  lv_obj_t *real_home  = lv_tileview_add_tile(tileview, 0, 0, LV_DIR_RIGHT);
  lv_obj_t *real_tile1 = lv_tileview_add_tile(tileview, 1, 0, LV_DIR_LEFT | LV_DIR_RIGHT);
  lv_obj_t *real_tile2 = lv_tileview_add_tile(tileview, 2, 0, LV_DIR_LEFT | LV_DIR_RIGHT);
  lv_obj_t *real_tile3 = lv_tileview_add_tile(tileview, 3, 0, LV_DIR_LEFT);

  // Pindahkan semua child dari fake tile ke real tile
  while (lv_obj_get_child_cnt(objects.screen_main) > 0)
    lv_obj_set_parent(lv_obj_get_child(objects.screen_main, 0), real_home);
  while (lv_obj_get_child_cnt(objects.tile_01_1) > 0)
    lv_obj_set_parent(lv_obj_get_child(objects.tile_01_1, 0), real_tile1);
  while (lv_obj_get_child_cnt(objects.tile_02_1) > 0)
    lv_obj_set_parent(lv_obj_get_child(objects.tile_02_1, 0), real_tile2);
  while (lv_obj_get_child_cnt(objects.tile_03_1) > 0)
    lv_obj_set_parent(lv_obj_get_child(objects.tile_03_1, 0), real_tile3);

  // Hapus fake tiles
  lv_obj_del(objects.screen_main);
  lv_obj_del(objects.tile_01_1);
  lv_obj_del(objects.tile_02_1);
  lv_obj_del(objects.tile_03_1);

  // Update pointer agar code tetap bekerja
  objects.screen_main = real_home;
  objects.tile_01_1   = real_tile1;
  objects.tile_02_1   = real_tile2;
  objects.tile_03_1   = real_tile3;

  // Hapus padding, border, dan background dari semua tile agar rapi (full screen)
  lv_obj_t *all_tiles[] = {real_home, real_tile1, real_tile2, real_tile3};
  for (int i = 0; i < 4; i++) {
    lv_obj_set_style_pad_all(all_tiles[i], 0, 0);
    lv_obj_set_style_border_width(all_tiles[i], 0, 0);
    lv_obj_set_style_bg_opa(all_tiles[i], LV_OPA_TRANSP, 0);

    // Fix background image: EEZ Studio menaruh di (-15,-15) untuk kompensasi padding,
    // tapi tile sekarang pad=0, jadi background perlu di-center ulang.
    lv_obj_t *bg_img = lv_obj_get_child(all_tiles[i], 0);
    if (bg_img) {
      lv_obj_align(bg_img, LV_ALIGN_CENTER, 0, 0);
    }
  }

  // --- Tile Home: center horizontal semua item ---
  lv_obj_align(objects.hour_text,    LV_ALIGN_TOP_MID, 0, 52);
  lv_obj_align(objects.day_text,     LV_ALIGN_TOP_MID, 0, 101);
  lv_obj_align(objects.date_text,    LV_ALIGN_TOP_MID, 0, 127);
  lv_obj_align(objects.connnect_ble, LV_ALIGN_TOP_MID, 0, 205);

  // --- Tile 01 (BPM & SpO2): center horizontal semua item ---
  lv_obj_align(objects.obj8,           LV_ALIGN_TOP_MID, 0, 15);   // heart icon
  lv_obj_align(objects.heart_text_1,   LV_ALIGN_TOP_MID, 0, 65);   // BPM value
  lv_obj_align(objects.obj7,           LV_ALIGN_TOP_MID, 0, 114);  // "BPM" label
  lv_obj_t *line_div = lv_obj_get_child(objects.tile_01_1, 1);     // line divider (unnamed)
  lv_obj_align(line_div,               LV_ALIGN_TOP_MID, 0, 145);
  lv_obj_align(objects.obj6,           LV_ALIGN_TOP_MID, 0, 164);  // SpO2 icon
  lv_obj_align(objects.spo2_text_1,    LV_ALIGN_TOP_MID, 0, 215);  // SpO2 value
  lv_obj_align(objects.obj5,           LV_ALIGN_TOP_MID, 0, 264);  // "%" label

  // --- Tile 02 (Suhu Tubuh): center horizontal semua item ---
  lv_obj_align(objects.obj3,              LV_ALIGN_TOP_MID, 0, 21);   // "Suhu Tubuh" label
  lv_obj_t *thermo_img = lv_obj_get_child(objects.tile_02_1, 3);      // thermometer icon (unnamed)
  lv_obj_align(thermo_img,                LV_ALIGN_TOP_MID, 0, 82);
  lv_obj_align(objects.suhu_tubuh_text_1, LV_ALIGN_TOP_MID, 0, 168);  // suhu value
  lv_obj_align(objects.obj4,              LV_ALIGN_TOP_MID, 0, 220);  // "°C" label

  // --- Tile 03 (Step Counter): center horizontal semua item ---
  lv_obj_align(objects.obj1,         LV_ALIGN_TOP_MID, 0, 19);   // "Step Counter" label
  lv_obj_align(objects.obj0,         LV_ALIGN_TOP_MID, 0, 68);   // footprints icon
  lv_obj_align(objects.steps_text_1, LV_ALIGN_TOP_MID, 0, 153);  // steps value
  lv_obj_align(objects.obj2,         LV_ALIGN_TOP_MID, 0, 210);  // "Steps" label

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

  // Proses data ESP-NOW dari Sensor Node (HR, SpO2, Suhu)
  processESPNowData();

  // Pedometer: harus dipanggil setiap loop (internal timer 50Hz)
  readPedometer();

  // UI update dan BLE kirim data setiap 1 detik
  unsigned long now = millis();
  if (now - lastSensorRead >= SENSOR_INTERVAL) {
    lastSensorRead = now;
    updateUI();
    sendBLEData();
  }

  updateClock();
  ui_tick();

  delay(5);
}
