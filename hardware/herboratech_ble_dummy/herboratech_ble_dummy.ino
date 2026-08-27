/**
 * HerboraTech ESP32 BLE Firmware — SIMULATOR
 *
 * Firmware ini TIDAK membaca sensor fisik. Dipakai untuk menguji seluruh alur
 * BLE → ble-manager.js → VitalsManager → Firestore → UI tanpa perlu perangkat
 * MAX30102 / MLX90614 / MPU6050 terpasang.
 *
 * Untuk perangkat asli, gunakan: hardware/HerboraTech/HerboraTech.ino
 *
 * Sensor Simulation dengan Formula Fisiologis:
 * - MAX30102: HR + SpO2 + RR intervals dengan HRV variation
 * - MLX90614: Non-contact temperature dengan circadian variation
 * - IMU: Step detection + movement variance untuk sleep detection
 *
 * Output: JSON via BLE GATT, 1x per detik
 *
 * PENTING: SERVICE_UUID dan CHARACTERISTIC_UUID di bawah HARUS sama persis
 * dengan yang ada di www/shared/ble-manager.js (SERVICE_UUID & CHAR_UUID).
 * Kalau beda, getPrimaryService() di sisi browser akan gagal dan perangkat
 * tidak akan pernah terhubung.
 *
 * Library Dependencies:
 * - BLEDevice, BLEServer, BLEUtils, BLE2902 (built-in ESP32 core)
 * Tidak ada library eksternal — JSON dirakit manual dengan snprintf.
 */

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// ──── CONFIG ────
// Harus cocok dengan www/shared/ble-manager.js
#define SERVICE_UUID        "12345678-1234-1234-1234-123456789abc"
#define CHARACTERISTIC_UUID "abcd1234-ab12-cd34-ef56-123456789abc"
#define DEVICE_NAME         "HerboraTech Watch"   // namePrefix di app: "HerboraTech"
#define BLE_LED             2

#define RR_BUFFER_SIZE      60

// ──── SENSOR DATA ────
// Didefinisikan sebelum dipakai di loop(), karena Arduino menyisipkan
// auto-prototype generateSensorData() di awal file.
struct SensorData {
  float hr;
  float spo2;
  float temp;
  float rr_rate;
  float hrv;
  float sdnn;
  float rmssd;
  float pnn50;
  float battery;
  float stress;
  float movement;
};

// ──── GLOBALS ────
BLECharacteristic *pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;
unsigned long lastNotifyTime = 0;
float lastMagnitude = 1.0;          // float — magnitude bernilai ~1.0, bukan integer
int stepCount = 0;
float rrBuffer[RR_BUFFER_SIZE];
int bufferIndex = 0;

// ──── BLE CALLBACKS ────
// Harus dideklarasikan sebelum setup(), karena kelas tidak ikut auto-prototype.
class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *pServer) override {
    deviceConnected = true;
  }
  void onDisconnect(BLEServer *pServer) override {
    deviceConnected = false;
  }
};

// ──── SENSOR SIMULATION ────
SensorData generateSensorData() {
  SensorData data;
  unsigned long uptime_ms = millis();

  // HR + RR
  float hr_base = 72.0;
  float hr_variation = 8.0 * sin(uptime_ms / 4000.0);
  float baseRR = 60000.0 / (hr_base + hr_variation);
  long rrVariance = 40;
  float rr = baseRR + random(-rrVariance, rrVariance + 1);
  rrBuffer[bufferIndex] = rr;
  bufferIndex = (bufferIndex + 1) % RR_BUFFER_SIZE;
  data.hr = round(60000.0 / rr);

  // SpO2
  float R = 0.43 + (random(-3, 4) / 100.0);
  data.spo2 = round((110.0 - (25.0 * R)) * 10) / 10.0;

  // RR rate
  data.rr_rate = 14 + sin(uptime_ms / 8000.0) * 2 + random(-1, 2);

  // Temp
  float baseTemp = 36.5;
  float circadian = 0.3 * sin(((uptime_ms / 3600000.0) - 6) * PI / 12.0);
  float noise = (random(-5, 6) / 100.0);
  data.temp = round((baseTemp + circadian + noise) * 10) / 10.0;

  // Steps + Movement
  float stepIntensity = 0.4;
  float ax = sin(uptime_ms / 300.0) * stepIntensity;
  float ay = cos(uptime_ms / 300.0) * 0.3;
  float az = 1.0 + sin(uptime_ms / 300.0) * stepIntensity * 0.5;
  float magnitude = sqrt(ax * ax + ay * ay + az * az);

  if (magnitude > 1.1 && lastMagnitude <= 1.1) {
    stepCount++;
  }
  lastMagnitude = magnitude;
  data.movement = round(fabs(magnitude - 1.0) * 100) / 100.0;

  // HRV SDNN
  float mean_rr = 0;
  for (int i = 0; i < RR_BUFFER_SIZE; i++) mean_rr += rrBuffer[i];
  mean_rr /= (float)RR_BUFFER_SIZE;
  float sum_sq_dev = 0;
  for (int i = 0; i < RR_BUFFER_SIZE; i++) {
    float diff = rrBuffer[i] - mean_rr;
    sum_sq_dev += diff * diff;
  }
  data.sdnn = round(sqrt(sum_sq_dev / (float)RR_BUFFER_SIZE));

  // RMSSD
  float sumSqDiff = 0;
  for (int i = 1; i < RR_BUFFER_SIZE; i++) {
    float diff = rrBuffer[i] - rrBuffer[i - 1];
    sumSqDiff += diff * diff;
  }
  data.rmssd = round(sqrt(sumSqDiff / (float)(RR_BUFFER_SIZE - 1)));

  // pNN50
  int nn50 = 0;
  for (int i = 1; i < RR_BUFFER_SIZE; i++) {
    if (fabs(rrBuffer[i] - rrBuffer[i - 1]) > 50) nn50++;
  }
  data.pnn50 = round((float)nn50 / (float)(RR_BUFFER_SIZE - 1) * 100);
  data.hrv = data.rmssd;

  // Stress
  float stress = 100.0 - (data.rmssd - 20.0) * 1.2;
  data.stress = constrain(stress, 5.0f, 95.0f);

  // Battery
  float drain = (uptime_ms / 3600000.0) * 0.5;
  float battery = 87.0 - drain;
  data.battery = battery < 5.0 ? 5.0 : battery;

  return data;
}

// ──── SETUP ────
void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(BLE_LED, OUTPUT);
  digitalWrite(BLE_LED, LOW);

  randomSeed(esp_random());

  Serial.println("\n\n================================");
  Serial.println("HerboraTech ESP32 BLE Firmware");
  Serial.println("MODE: SIMULATOR (tanpa sensor fisik)");
  Serial.println("================================");

  float baseRR = 60000.0 / 72.0;
  for (int i = 0; i < RR_BUFFER_SIZE; i++) {
    rrBuffer[i] = baseRR;
  }

  BLEDevice::init(DEVICE_NAME);

  // Payload JSON ±150 byte. MTU default BLE hanya 23 (notify max 20 byte),
  // jadi tanpa ini payload akan terpotong dan JSON.parse di browser gagal.
  BLEDevice::setMTU(256);

  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);
  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_READ
  );
  pCharacteristic->addDescriptor(new BLE2902());
  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  BLEDevice::startAdvertising();

  Serial.print("Device name : ");
  Serial.println(DEVICE_NAME);
  Serial.print("Service UUID: ");
  Serial.println(SERVICE_UUID);
  Serial.println("BLE Initialized - Waiting for connection...");
}

// ──── LOOP ────
void loop() {
  if (!deviceConnected && oldDeviceConnected) {
    delay(500);
    BLEDevice::startAdvertising();
    Serial.println("Start advertising");
    oldDeviceConnected = deviceConnected;
    digitalWrite(BLE_LED, LOW);
  }

  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
    Serial.println("Device connected!");
    digitalWrite(BLE_LED, HIGH);
  }

  if (millis() - lastNotifyTime >= 1000) {
    lastNotifyTime = millis();
    SensorData data = generateSensorData();

    char json[256];
    snprintf(json, sizeof(json),
             "{\"hr\":%d,\"spo2\":%.1f,\"temp\":%.1f,\"rr\":%.0f,"
             "\"hrv\":%.0f,\"sdnn\":%.0f,\"rmssd\":%.0f,\"pnn50\":%.0f,"
             "\"steps\":%d,\"battery\":%.0f,\"stress\":%.0f,\"movement\":%.2f}",
             (int)data.hr, data.spo2, data.temp, data.rr_rate,
             data.hrv, data.sdnn, data.rmssd, data.pnn50,
             stepCount, data.battery, data.stress, data.movement);

    if (deviceConnected) {
      pCharacteristic->setValue((uint8_t *)json, strlen(json));
      pCharacteristic->notify();
      Serial.print("TX ");
      Serial.println(json);
    }
  }

  if (!deviceConnected) {
    digitalWrite(BLE_LED, (millis() / 500) % 2);
  }
  delay(10);
}
