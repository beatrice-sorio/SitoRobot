#include <esp_now.h>
#include <esp_wifi.h>
#include <WiFi.h>

// MAC Address dell'esp ricevitore
uint8_t broadcastAddress[] = {0x08, 0xB6, 0x1F, 0xB9, 0x4F, 0x9C};

constexpr char WIFI_SSID[] = "YOUR_WIFI_SSID";

// Struttura per inviare dati, deve essere ugaule nel ricevitore
typedef struct struct_message {
  int t1;
  int t2;
  int t3;
  int t4;
  bool p;
} struct_message;

// Crea una struttura per il messaggio chiamata myData
struct_message myData;

esp_now_peer_info_t peerInfo;

// Funzione richiamata quando i dati vengono inviati
void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  Serial.print("\r\nLast Packet Send Status:\t");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
}

int32_t getWiFiChannel(const char *ssid) {
  if (int32_t n = WiFi.scanNetworks()) {
      for (uint8_t i=0; i<n; i++) {
          if (!strcmp(ssid, WiFi.SSID(i).c_str())) {
              return WiFi.channel(i);
          }
      }
  }
  return 0;
}

void setup() {
  Serial.begin(115200);
 
  // Set device come Wi-Fi Station
  WiFi.mode(WIFI_STA);

  // Inizializzazione ESP-NOW
  esp_wifi_set_promiscuous(true);
  esp_wifi_set_channel(getWiFiChannel(WIFI_SSID), WIFI_SECOND_CHAN_NONE);
  esp_wifi_set_promiscuous(false);

  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }

  //Una volta inizializzato ESP-NOW, registriamo l'evento Send CB alla funzione OnDataSent 
  //per avere lo stato del pacchetto trasmesso 
  esp_now_register_send_cb(OnDataSent);
  
  // Registra il peer
  memcpy(peerInfo.peer_addr, broadcastAddress, 6);
  peerInfo.channel = 0;  
  peerInfo.encrypt = false;

  myData.t1 = 0;
  myData.t2 = 0;
  myData.t3 = 0;
  myData.t4 = 0;
  myData.p = 0;
  
  // Aggiungi peer        
  if (esp_now_add_peer(&peerInfo) != ESP_OK){
    Serial.println("Failed to add peer");
    return;
  }
}
 
void loop() {
  // Set valori da inviare
  if(analogRead(32)!=myData.t1||analogRead(33)!=myData.t2||analogRead(34)!=myData.t3||analogRead(35)!=myData.t4){   //quando i pin cambiano inviano nuovi dati
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
    myData.p = digitalRead(12);
    myData.t1 = map(myData.t1/50,0,4095,0,21000);
    myData.t2 = map(myData.t2/50,0,4095,0,21000);
    myData.t3 = map(myData.t3/50,0,4095,0,21000);
    myData.t4 = map(myData.t4/50,0,4095,0,21000);
  
    // Invio messaggio tramite ESP-NOW
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
