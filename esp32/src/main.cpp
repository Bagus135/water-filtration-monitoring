#include <Arduino.h>
#include <ArduinoJson.h>
#include <WebSocketsClient.h>
#include <env.h>

const int pin_pH = 32; 
const int pin_Turbidity = 34; 

float kalibrasi_pH = 21.34;  

WebSocketsClient WSClient; 
unsigned long lastSendTime = 0; 
const unsigned long SEND_INTERVAL_MS = 3000; 

const bool WS_USE_SSL = true;
const char* WS_HOST_LOCAL = "'192.168.137.1"; 
const char* WS_HOST_SSL = "water-filtration-monitoring.onrender.com"; 
const char* DEVICE_ID = "station-01";
const uint16_t WS_PORT_SSL = 443;
const uint16_t WS_PORT_LOCAL = 3000;

String buildWsPath() {
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


void setup() {
  Serial.begin(115200); 
  WiFi.begin(ssid, password); 
  Serial.print("Connected to WIFI"); 
  while (WiFi.status() != WL_CONNECTED){
    delay(500); 
    Serial.print(".");
  };
  Serial.println("\nWifi connected, IP : " + WiFi.localIP().toString()); 

  randomSeed(esp_random()); 
  String WS_PATH = buildWsPath();
  if(WS_USE_SSL){
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
    float adc_pH_before = ADCAvg(pin_pH); 
    float V_pH_before= adc_pH_before*(3.3 / 4095.0); 
    float val_pH_before = -5.7 * V_pH_before + kalibrasi_pH;


    float adc_turbidity_before = ADCAvg(pin_Turbidity); 
    float V_turbidityRaw_before = adc_turbidity_before * (3.3 / 4095.0);
    float V_turbidity_before = V_turbidityRaw_before * 1.5; 

    int tdsRawbefore = random(201, 301); 

    // after monitoring
    int val_pH_after = random(301, 401); 
    int  V_turbidity_after = random(401, 501); 
    int tdsRawAfter = random(501, 601); 
    
    StaticJsonDocument<400> doc;

    JsonObject before = doc["before"].to<JsonObject>();
    before["ph"] = val_pH_before; 
    before["turbidity"] = V_turbidity_before; 
    before["tds"] = tdsRawbefore;

    JsonObject after = doc["after"].to<JsonObject>();
    after["ph"] = val_pH_after; 
    after["turbidity"] = V_turbidity_after; 
    after["tds"] = tdsRawAfter; 

    String output; 
    serializeJson(doc, output); 

    if (WSClient.isConnected()){
      WSClient.sendTXT(output); 
      Serial.print("Send : " + output); 
    } else {
      Serial.println("WS hasnt connected to server yet, cannot send data");
    }
  }
}
