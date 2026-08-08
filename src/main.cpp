#include <Arduino.h>
#include <ArduinoJson.h>
#include <WebSocketsClient.h>

const int pin_pH = 32; 
const int pin_Turbidity = 34; 

float kalibrasi_pH = 21.34; 

WebSocketsClient WSClient; 
unsigned long lastSendTime = 0; 
const unsigned long SEND_INTERVAL_MS = 3000; 

const char* ssid = "LOQ123";
const char* password = "kimichan123";

const char* WS_HOST = "192.168.137.1"; 
const uint16_t WS_PORT = 3000; 
const char* WS_PATH = "/ws"; 

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

  WSClient.begin(WS_HOST, WS_PORT, WS_PATH);
  WSClient.onEvent(WSEvent); 
  WSClient.setReconnectInterval(500); 
}

void loop() {
  WSClient.loop(); 

  unsigned long now = millis(); 
  if(now - lastSendTime >= SEND_INTERVAL_MS){
    lastSendTime = now;
    
    float adc_pH = ADCAvg(pin_pH); 
    float V_pH = adc_pH*(3.3 / 4095.0); 
    float val_pH = -5.7 * V_pH + kalibrasi_pH;


    float adc_turbidity = ADCAvg(pin_Turbidity); 
    float V_turbidityRaw = adc_turbidity * (3.3 / 4095.0);
    float V_turbidity = V_turbidityRaw * 1.5; 

    int tdsRaw = random(201, 301); 
    
    StaticJsonDocument<200> doc;
    doc["ph"] = val_pH; 
    doc["turbidity"] = V_turbidity; 
    doc["tds"] = tdsRaw; 

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
