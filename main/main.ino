#include <esp_now.h>
#include <WiFi.h>
#include "ESPAsyncWebServer.h"
#include <Arduino_JSON.h>

// Sostituisci con le tue credenziali di rete (STATION)
const char* ssid = "AndroidAP3416";
const char* password = "f28a2e0de21e";

// Struttura per ricevere dati, deve essere ugaule nel mittente
typedef struct struct_message {
  int t1;
  int t2;
  int t3;
  int t4;
  bool p;
} struct_message;

struct_message incomingReadings;

JSONVar board;

AsyncWebServer server(80);
AsyncEventSource events("/events");

// Funzione chiamata quando i dati vengono ricevuti
void OnDataRecv(const uint8_t * mac_addr, const uint8_t *incomingData, int len) {
  // Copia il mac address in una stringa
  char macStr[18];
  Serial.print("Packet received from: ");
  snprintf(macStr, sizeof(macStr), "%02x:%02x:%02x:%02x:%02x:%02x",
           mac_addr[0], mac_addr[1], mac_addr[2], mac_addr[3], mac_addr[4], mac_addr[5]);
  Serial.println(macStr);
  memcpy(&incomingReadings, incomingData, sizeof(incomingReadings));
 
  board["t1"] = incomingReadings.t1;
  board["t2"] = incomingReadings.t2;
  board["t3"] = incomingReadings.t3;
  board["t4"] = incomingReadings.t4;
  board["p"] = incomingReadings.p;
  String jsonString = JSON.stringify(board);
  events.send(jsonString.c_str(), NULL, millis());
}

//Stringa da inviare per il codice HTML
const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE HTML><html>
<head>
  <title>DASHBOARD</title>
  <script>
  fetch('https://raw.githubusercontent.com/beatrice-sorio/SitoRobot/main/sitorobot.js',{ cache: "no-cache" }).then(response => response.text().then(resp=>{
    let script = document.createElement("script");
    script.innerHTML = resp;
    document.head.appendChild(script);
  }));
  </script>
</head>
<body>
</body>
</html>)rawliteral";

void setup() {
  Serial.begin(115200);
  Serial.println(WiFi.macAddress());

  // Imposta il dispositivo come WiFi Station e come Soft Access Point 
  WiFi.mode(WIFI_AP_STA);
 
  // Imposta il dispositivo come WiFi Station
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Setting as a Wi-Fi Station..");
  }
  Serial.print("Station IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Wi-Fi Channel: ");
  Serial.println(WiFi.channel());

  // Inizializzazione ESP-NOW
  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }
 
  // Once ESPNow is successfully Init, we will register for recv CB to
  // get recv packer info
  esp_now_register_recv_cb(OnDataRecv);

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/html", index_html);
  });
   
  events.onConnect([](AsyncEventSourceClient *client){
    if(client->lastId()){
      Serial.printf("Client reconnected! Last message ID that it got is: %u\n", client->lastId());
    }
    // send event with message "hello!", id current millis
    // and set reconnect delay to 1 second
    client->send("hello!", NULL, millis(), 10000);
  });
  server.addHandler(&events);
  server.begin();
}
 
void loop() {}
