#include <Arduino.h>
#include <ArduinoJson.h>
#include <WebSocketsClient.h>
#include "env.h"

const char* DEVICE_ID = "ESP32-09";

// define pin 
const int PIN_TDS_BEFORE = 39; 
const int PIN_TURBIDITY_BEFORE = 36; 
const int PIN_PH_BEFORE = 33;

const int PIN_TDS_AFTER = 35; 
const int PIN_TURBIDITY_AFTER = 34; 
const int PIN_PH_AFTER = 32; 

const int PIN_RELAY_1 = 15; 
const int PIN_RELAY_2 = 5; 
const int PIN_IR = 13;

const bool IS_SSL = true;
WebSocketsClient WSClient; 
unsigned long lastSendTime = 0; 
const unsigned long SEND_INTERVAL_MS = 3000; 

const char* WS_HOST_LOCAL = "192.168.137.1"; 
const uint16_t WS_PORT_LOCAL = 3000; 

const char* WS_HOST_SSL = "water-filtration-monitoring.onrender.com"; 
const uint16_t WS_PORT_SSL = 443; 

const float PH_SLOPE = 1;
const float PH_OFFSET = 5.3;

const float TURBIDITY_SLOPE = 100;
const float TURBIDITY_OFFSET = 0;

void connectWiFi(){
  WiFi.mode(WIFI_STA); 
  WiFi.disconnect(true); 
  delay(1000); 

  Serial.println("Connecting to " + String(WIFI_SSID));
  WiFi.begin(WIFI_SSID, WPA2_AUTH_PEAP, WIFI_IDENTITY, WIFI_USERNAME, WIFI_PASSWORD);
  
  unsigned long startTime = millis();
  
  while(WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
    
    if (millis() - startTime > 30000){
      Serial.println("");
      Serial.println("WiFi connection timeout");
      Serial.println("Restarting ESP32");
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


void WSEvent (WStype_t  type, uint8_t* payload , size_t length){
  switch (type) {
  case WStype_CONNECTED:
    Serial.print("WS Connected to Server");
    break;
  case WStype_DISCONNECTED : 
    Serial.print("WS Disconnected"); 
    break;
  case WStype_ERROR :
    Serial.print("WS Error"); 
    break;
  default:
    break;
  }
} 

float ADCAvg(int pin){
  int buffer_adc[10]; 
  for(int i = 0; i < 10; i++){
    buffer_adc[i] = analogRead(pin);
    delay(10);
  }

  for(int i = 0; i <9; i++){
    for(int j = i+1; j < 10; j++){
      if(buffer_adc[i] > buffer_adc[j]){
        int temp = buffer_adc[i];
        buffer_adc[i] = buffer_adc[j];
        buffer_adc[j] = temp;
      };
    };
  }
  long total_adc = 0; 
  for(int i = 2; i <8; i++){
    total_adc +=buffer_adc[i];
  }
  return (float) total_adc /6.0;
}

float tdsValue (float voltage) {
  const float tdsVal = (133.42 * voltage*voltage*voltage - 255.86 * voltage*voltage + 857.39 * voltage) * 0.5;
  return tdsVal;
};

float pHValue(float voltage){
  const float pHVal = (PH_SLOPE * voltage) +  PH_OFFSET;
  return pHVal;
}

float turbidityValue(float voltage){
  const float turbidityVal = (TURBIDITY_SLOPE * voltage) +  TURBIDITY_OFFSET;
  return turbidityVal;
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_RELAY_1, OUTPUT);
  pinMode(PIN_RELAY_2, OUTPUT);
  pinMode(PIN_IR, INPUT);

  // Turn off relay
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

  unsigned long now = millis(); 
  if(now - lastSendTime >= SEND_INTERVAL_MS){
    lastSendTime = now;
    
    // before filtering
    float adc_ph_before = ADCAvg(PIN_PH_BEFORE); 
    float adc_tds_before = ADCAvg(PIN_TDS_BEFORE); 
    float adc_turbidity_before = ADCAvg(PIN_TURBIDITY_BEFORE);

    float v_ph_before = (adc_ph_before/ 4095.0) * 3.3; 
    float v_tds_before = (adc_tds_before/ 4095.0) * 3.3; 
    float v_turbidity_before = ((adc_turbidity_before/ 4095.0) * 3.3) *1.47; 

    // after filtering
    float adc_ph_after = ADCAvg(PIN_PH_AFTER); 
    float adc_tds_after = ADCAvg(PIN_TDS_AFTER); 
    float adc_turbidity_after = ADCAvg(PIN_TURBIDITY_AFTER);

    float v_ph_after = (adc_ph_after/ 4095.0) * 3.3; 
    float v_tds_after = (adc_tds_after/ 4095.0) * 3.3; 
    float v_turbidity_after = ((adc_turbidity_after/ 4095.0) * 3.3) *1.47; 
    
    JsonDocument doc;

    JsonObject before = doc["before"].to<JsonObject>();
    before["ph"] = pHValue(v_ph_before); 
    before["turbidity"] = turbidityValue(v_turbidity_before); 
    before["tds"] = tdsValue(v_tds_before);

    JsonObject after = doc["after"].to<JsonObject>();
    after["ph"] = pHValue(v_ph_after); 
    after["turbidity"] = turbidityValue(v_turbidity_after); 
    after["tds"] = tdsValue(v_tds_after); 

    String output; 
    serializeJson(doc, output); 

    if (WSClient.isConnected()){
      WSClient.sendTXT(output); 
      Serial.print("Send : " + output); 
    } else {
      Serial.println("WS hasnt connected to server yet, data cannot send");
    }
  }
}
