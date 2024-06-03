/*
  Rui Santos
  Complete project details at https://RandomNerdTutorials.com/esp-now-esp32-arduino-ide/
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files.
  
  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
*/

#include <esp_now.h>
#include <WiFi.h>

// REPLACE WITH YOUR RECEIVER MAC Address
uint8_t broadcastAddress[] = {0x08, 0xB6, 0x1F, 0xB9, 0x4F, 0x9C};

// Structure example to send data
// Must match the receiver structure
typedef struct struct_message {
  int t1;
  int t2;
  int t3;
  int t4;
  boolean p;
} struct_message;

// Create a struct_message called myData
struct_message myData;

esp_now_peer_info_t peerInfo;

// callback when data is sent
void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  Serial.print("\r\nLast Packet Send Status:\t");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
}
 
void setup() {
  // Init Serial Monitor
  Serial.begin(115200);
 
  // Set device as a Wi-Fi Station
  WiFi.mode(WIFI_STA);

  // Init ESP-NOW
  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }

  // Once ESPNow is successfully Init, we will register for Send CB to
  // get the status of Trasnmitted packet
  esp_now_register_send_cb(OnDataSent);
  
  // Register peer
  memcpy(peerInfo.peer_addr, broadcastAddress, 6);
  peerInfo.channel = 0;  
  peerInfo.encrypt = false;

  myData.t1 = 0;
  myData.t2 = 0;
  myData.t3 = 0;
  myData.t4 = 0;
  myData.p = 0;
  
  // Add peer        
  if (esp_now_add_peer(&peerInfo) != ESP_OK){
    Serial.println("Failed to add peer");
    return;
  }
}
 
void loop() {
  // Set values to send
  if(analogRead(32)!=myData.t1||analogRead(33)!=myData.t2||analogRead(34)!=myData.t3||analogRead(35)!=myData.t4){   //quando il pin 34 cambia invia nuovi dati
    myData.t1 = 0;   //dato trimmer
    myData.t2 = 0;
    myData.t3 = 0;
    myData.t4 = 0;
    for(int i = 0;i<50;i++){
      myData.t1+=analogRead(32);
      myData.t2+=analogRead(33);
      myData.t3+=analogRead(34);
      myData.t4+=analogRead(35);
    }
    myData.p = 0;
    myData.t1 = map(myData.t1/50,0,4095,0,21000);
    myData.t2 = map(myData.t2/50,0,4095,0,21000);
    myData.t3 = map(myData.t3/50,0,4095,0,21000);
    myData.t4 = map(myData.t4/50,0,4095,0,21000);
  
    // Send message via ESP-NOW
    esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));
   
    if (result == ESP_OK) {
      Serial.println("Sent with success");
    }
    else {
      Serial.println("Error sending the data");
    }
  }
  delay(250); //ogni quanto invia i dati
}
