#include <Arduino.h>
#include <ArduinoJson.h>
#include <WebSocketsClient.h>
#include "env.h"

// --- KONFIGURASI PERANGKAT ---
const char* DEVICE_ID = "ESP32-01";

const int PIN_BUILDIN_LED = 2; 
const int PIN_TDS_BEFORE = 39; 
const int PIN_TURBIDITY_BEFORE = 36; 
const int PIN_PH_BEFORE = 33;

const int PIN_TDS_AFTER = 35; 
const int PIN_TURBIDITY_AFTER = 34; 
const int PIN_PH_AFTER = 32; 

// --- KONFIGURASI RELAY ---
const int PIN_RELAY_1 = 5;  // IN1: Pompa Filtrasi Utama (D5)
const int PIN_RELAY_2 = 15; // IN2: Cadangan (D15)
const int PIN_IR = 13;

bool LED_STATE = false;
unsigned long LAST_LED_BLINK_TIME = 0;

// --- KONFIGURASI JARINGAN ---
const bool IS_SSL = true;
WebSocketsClient WSClient; 
unsigned long lastSendTime = 0; 
const unsigned long SEND_INTERVAL_MS = 3000; 

const char* WS_HOST_LOCAL = "192.168.137.1"; 
const uint16_t WS_PORT_LOCAL = 3000; 
const char* WS_HOST_SSL = "water-filtration-monitoring.onrender.com"; 
const uint16_t WS_PORT_SSL = 443; 

// --- KALIBRASI SENSOR ---
const float PH_SLOPE = 1.0;
const float PH_OFFSET_BEFORE = 4.40; 
const float PH_OFFSET_AFTER = 5.63;  

// --- BATAS AMAN KUALITAS AIR (THRESHOLD) ---
const float THRESHOLD_PH_MIN = 6.5;
const float THRESHOLD_PH_MAX = 8.5;
const float THRESHOLD_TDS_MAX = 500.0; // ppm

// Batas kekeruhan di-set ke 1800 NTU (Titik tengah antara 1200 dan 2300)
const float THRESHOLD_TURBIDITY_NTU = 1800.0; 

// ==========================================
// FUNGSI KONEKSI
// ==========================================
void updateWiFiLED(){
  if(WiFi.status() == WL_CONNECTED){
    digitalWrite(PIN_BUILDIN_LED, HIGH);
  } else {
    unsigned long now = millis(); 
    if (now - LAST_LED_BLINK_TIME >= 300){
      LAST_LED_BLINK_TIME = now;
      LED_STATE = !LED_STATE;
      digitalWrite(PIN_BUILDIN_LED, LED_STATE ? HIGH : LOW);
    }
  }
}

void connectWiFi(){
  WiFi.mode(WIFI_STA); 
  WiFi.disconnect(true); 
  delay(1000); 

  Serial.println("Connecting to " + String(WIFI_SSID));
  WiFi.begin(WIFI_SSID, WPA2_AUTH_PEAP, WIFI_IDENTITY, WIFI_USERNAME, WIFI_PASSWORD);
  
  unsigned long startTime = millis();
  while(WiFi.status() != WL_CONNECTED){
    updateWiFiLED();
    delay(500);
    Serial.print(".");
    if (millis() - startTime > 30000){
      Serial.println("\nWiFi connection timeout, restarting...");
      ESP.restart();
    }
  } 
  Serial.println("\nWifi connected, SSID : " + WiFi.SSID());
  Serial.println("IP : " + WiFi.localIP().toString());
}

String buildWSPath(){
  String path = "/ws?role=esp32&device_id=";
  path += DEVICE_ID; 
  path += "&token=";
  path += device_token;
  return path;
}

void WSEvent (WStype_t type, uint8_t* payload , size_t length){
  switch (type) {
    case WStype_CONNECTED: Serial.println("WS Connected"); break;
    case WStype_DISCONNECTED : Serial.println("WS Disconnected"); break;
    case WStype_ERROR : Serial.println("WS Error"); break;
    default: break;
  }
} 

// ==========================================
// FUNGSI PEMBACAAN DAN FILTERING
// ==========================================
float ADCAvg(int pin){
  // --- TRIK DUMMY READ ---
  // Membaca pin sekali dan membuang hasilnya 
  // untuk membersihkan sisa tegangan (crosstalk) di kapasitor ADC ESP32
  analogRead(pin); 
  delay(10); 

  int buffer_adc[10]; 
  for(int i = 0; i < 10; i++){
    buffer_adc[i] = analogRead(pin);
    delay(10); // Memberi waktu agar ADC benar-benar stabil
  }
  for(int i = 0; i < 9; i++){
    for(int j = i+1; j < 10; j++){
      if(buffer_adc[i] > buffer_adc[j]){
        int temp = buffer_adc[i];
        buffer_adc[i] = buffer_adc[j];
        buffer_adc[j] = temp;
      }
    }
  }
  long total_adc = 0; 
  for(int i = 2; i < 8; i++){
    total_adc += buffer_adc[i];
  }
  return (float) total_adc / 6.0;
}

float getTurbidityADC(int pin) {
  long total_adc = 0;
  for (int i = 0; i < 100; i++) {
    total_adc += analogRead(pin);
    delay(2);
  }
  return (float)(total_adc / 100.0);
}

// ==========================================
// FUNGSI KONVERSI MATEMATIKA SENSOR
// ==========================================
float pHValue(float voltage, float offset){
  return (PH_SLOPE * voltage) + offset;
}

float turbidityValueNTU(float voltage){
  float V_CLEAR = 2.0; 
  float V_DIRTY = 0.7; 

  if (voltage > V_CLEAR) voltage = V_CLEAR;
  if (voltage < V_DIRTY) voltage = V_DIRTY;

  float mapped_voltage = ((voltage - V_DIRTY) * (4.2 - 2.5) / (V_CLEAR - V_DIRTY)) + 2.5;

  float ntu = (-1120.4 * mapped_voltage * mapped_voltage) + (5742.3 * mapped_voltage) - 4352.9;
  
  ntu = ntu - 0.904; 
  if (ntu < 0) return 0.0;
  return ntu;
}

float tdsValueRaw(float voltage) {
  return (133.42 * voltage * voltage * voltage - 255.86 * voltage * voltage + 857.39 * voltage) * 0.5;
}

float getTdsCalibratedBefore(float rawTds) {
  return (1.215 * rawTds) - 1.4557;
}

float getTdsCalibratedAfter(float rawTds) {
  return (1.009 * rawTds) - 1.4557;
}

// ==========================================
// FUNGSI OTOMASI RELAY BERBASIS pH, TDS, & NTU
// ==========================================
void checkWaterQuality(float ph, float tds, float turbidity_ntu) {
  bool isSafe_pH = (ph >= THRESHOLD_PH_MIN && ph <= THRESHOLD_PH_MAX);
  bool isSafe_TDS = (tds <= THRESHOLD_TDS_MAX);
  bool isSafe_Turbidity = (turbidity_ntu <= THRESHOLD_TURBIDITY_NTU);

  if (!isSafe_pH || !isSafe_TDS || !isSafe_Turbidity) {
    digitalWrite(PIN_RELAY_1, LOW); // Pompa Menyala
    Serial.print("Status: AIR TIDAK AMAN! (");
    if (!isSafe_Turbidity) Serial.print("Kekeruhan Tinggi ");
    if (!isSafe_pH) Serial.print("pH Abnormal ");
    if (!isSafe_TDS) Serial.print("TDS Tinggi ");
    Serial.println(") -> Pompa MENYALA.");
  } else {
    digitalWrite(PIN_RELAY_1, HIGH); // Pompa Mati
    Serial.println("Status: AIR AMAN (Jernih & Normal). Pompa MATI.");
  }
}

// ==========================================
// SETUP & LOOP UTAMA
// ==========================================
void setup() {
  Serial.begin(115200);
  pinMode(PIN_BUILDIN_LED, OUTPUT);
  pinMode(PIN_RELAY_1, OUTPUT);
  pinMode(PIN_RELAY_2, OUTPUT);
  pinMode(PIN_IR, INPUT);
  
  digitalWrite(PIN_RELAY_1, HIGH);
  digitalWrite(PIN_RELAY_2, HIGH);
  
  connectWiFi();

  String WS_PATH = buildWSPath();
  if(IS_SSL){
    WSClient.beginSSL(WS_HOST_SSL, WS_PORT_SSL, WS_PATH.c_str());
  } else {
    WSClient.begin(WS_HOST_LOCAL, WS_PORT_LOCAL, WS_PATH.c_str());
  }
  WSClient.onEvent(WSEvent); 
  WSClient.setReconnectInterval(500); 
}

void loop() {
  WSClient.loop(); 
  updateWiFiLED();
  unsigned long now = millis(); 
  
  if(now - lastSendTime >= SEND_INTERVAL_MS){
    lastSendTime = now;
    
    // 1. PEMBACAAN BEFORE
    float adc_ph_before = ADCAvg(PIN_PH_BEFORE); 
    float adc_tds_before = ADCAvg(PIN_TDS_BEFORE); 
    float adc_turbidity_before = getTurbidityADC(PIN_TURBIDITY_BEFORE); 

    float v_ph_before = (adc_ph_before / 4095.0) * 3.3; 
    float v_tds_before = (adc_tds_before / 4095.0) * 3.3; 
    
    // 2. PEMBACAAN AFTER
    float adc_ph_after = ADCAvg(PIN_PH_AFTER); 
    float adc_tds_after = ADCAvg(PIN_TDS_AFTER); 
    float adc_turbidity_after = getTurbidityADC(PIN_TURBIDITY_AFTER); 

    float v_ph_after = (adc_ph_after / 4095.0) * 3.3; 
    float v_tds_after = (adc_tds_after / 4095.0) * 3.3; 
    float v_turbidity_after = ((adc_turbidity_after / 4095.0) * 3.3) * 1.47; 
    
    // 3. PENYUSUNAN JSON 
    JsonDocument doc;

    JsonObject before = doc["before"].to<JsonObject>();
    before["ph"] = pHValue(v_ph_before, PH_OFFSET_BEFORE); 
    before["turbidity"] = adc_turbidity_before; 
    
    float raw_tds_before = tdsValueRaw(v_tds_before);
    float final_tds_before = getTdsCalibratedBefore(raw_tds_before);
    if (final_tds_before < 0) final_tds_before = 0; 
    before["tds"] = final_tds_before;

    JsonObject after = doc["after"].to<JsonObject>();
    float final_ph_after = pHValue(v_ph_after, PH_OFFSET_AFTER);
    
    float final_turbidity_ntu_after = turbidityValueNTU(v_turbidity_after); 
    
    after["ph"] = final_ph_after; 
    after["turbidity"] = final_turbidity_ntu_after; 
    
    float raw_tds_after = tdsValueRaw(v_tds_after);
    float final_tds_after = getTdsCalibratedAfter(raw_tds_after);
    if (final_tds_after < 0) final_tds_after = 0; 
    after["tds"] = final_tds_after; 

    // 4. JALANKAN LOGIKA RELAY GABUNGAN
    checkWaterQuality(final_ph_after, final_tds_after, final_turbidity_ntu_after);

    // 5. DEBUGGING VOLTASE VIA SERIAL MONITOR
    Serial.print("Voltase Turbidity Saat Ini: ");
    Serial.println(v_turbidity_after);

    // 6. KIRIM DATA WEBSOCKET
    String output; 
    serializeJson(doc, output); 

    if (WSClient.isConnected()){
      WSClient.sendTXT(output); 
    }
  }
}