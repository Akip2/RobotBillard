/*
 *  based on WebSocketClientSocketIO.ino
 *
 *  Created on: 06.06.2016
 *
 */

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ArduinoJson.h>
#include <WebSocketsClient.h>
#include <SocketIOclient.h>
#include <Adafruit_MotorShield.h>
#include <Hash.h>

#define USE_SERIAL Serial

// === MODIFIER EN FONCTION DU RESEAU =========================================
char* ADRESSE_SERVEUR = "192.168.137.1";
int PORT_SERVEUR = 8001;
char* URL = "/socket.io/?EIO=4";

char* NOM_RESEAU = "TP-LINK_7A134E";
char* MDP_RESEAU = "C27A134E";
// ============================================================================

ESP8266WiFiMulti WiFiMulti;
SocketIOclient socketIO;

Adafruit_MotorShield AFMS = Adafruit_MotorShield();

// Moteurs
Adafruit_DCMotor* moteurGauche = AFMS.getMotor(1);
Adafruit_DCMotor* moteurDroit = AFMS.getMotor(2);

int sensMoteurGauche = 0;
int sensMoteurDroit = 0;
int vitesseMoteurGauche = 0;
int vitesseMoteurDroit = 0;
int dureeMoteurs = 0;

bool changeMotors = false;

/*
  C'est ici que l'on gère ce qu'il se passe lorsqu'un évènement est reçu
  En quelque sorte le contrôleur
*/
void socketIOEvent(socketIOmessageType_t type, uint8_t* payload, size_t length) {
  DynamicJsonDocument doc(1024);
  String payload_str;
  String nom_event;

  switch (type) {
    case sIOtype_DISCONNECT:
      USE_SERIAL.printf("[IOc] Disconnected!\n");
      break;
    case sIOtype_CONNECT:
      USE_SERIAL.printf("[IOc] Connected to url: %s\n", payload);

      // join default namespace (no auto join in Socket.IO V3)
      socketIO.send(sIOtype_CONNECT, "/");
      break;
    case sIOtype_EVENT:
      USE_SERIAL.printf("[IOc] get event: %s\n", payload);

      // On récupère l'évènement
      payload_str = String((char*)payload);
      deserializeJson(doc, payload_str);

      nom_event = String(doc[0]);

      if (nom_event == "motor") {
        int left = doc[1]["left"];
        int right = doc[1]["right"];
        int duration = doc[1]["duration"];
        int time = doc[1]["time"];

        USE_SERIAL.printf("%d\n", left);
        USE_SERIAL.printf("%d\n", right);
        USE_SERIAL.printf("%d\n", duration);
        USE_SERIAL.printf("%d\n", time);

        if (left > 0) {
          sensMoteurGauche = FORWARD;
          vitesseMoteurGauche = left;
        } else if (left < 0) {
          sensMoteurGauche = BACKWARD;
          vitesseMoteurGauche = abs(left);
        } else {  // 0 en gros
          sensMoteurGauche = RELEASE;
          vitesseMoteurGauche = 0;
        }

        if (right > 0) {
          sensMoteurDroit = FORWARD;
          vitesseMoteurDroit = right;
        } else if (right < 0) {
          sensMoteurDroit = BACKWARD;
          vitesseMoteurDroit = abs(right);
        } else {  // 0 en gros
          sensMoteurDroit = RELEASE;
          vitesseMoteurDroit = 0;
        }
        
        dureeMoteurs = duration;

        changeMotors = true;
      }
      break;
    case sIOtype_ACK:
      USE_SERIAL.printf("[IOc] get ack: %u\n", length);
      hexdump(payload, length);
      break;
    case sIOtype_ERROR:
      USE_SERIAL.printf("[IOc] get error: %u\n", length);
      hexdump(payload, length);
      break;
    case sIOtype_BINARY_EVENT:
      USE_SERIAL.printf("[IOc] get binary: %u\n", length);
      hexdump(payload, length);
      break;
    case sIOtype_BINARY_ACK:
      USE_SERIAL.printf("[IOc] get binary ack: %u\n", length);
      hexdump(payload, length);
      break;
  }
}

// ############################################################################
// #                                SETUP                                     #
// ############################################################################

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);

  USE_SERIAL.begin(115200);
  USE_SERIAL.setDebugOutput(true);

  for (uint8_t t = 4; t > 0; t--) {
    USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
    USE_SERIAL.flush();
    delay(1000);
  }

  // disable AP
  if (WiFi.getMode() & WIFI_AP) {
    WiFi.softAPdisconnect(true);
  }

  WiFiMulti.addAP(NOM_RESEAU, MDP_RESEAU);

  while (WiFiMulti.run() != WL_CONNECTED) {
    delay(100);
  }

  String ip = WiFi.localIP().toString();
  USE_SERIAL.printf("[SETUP] WiFi Connected %s\n", ip.c_str());

  socketIO.begin(ADRESSE_SERVEUR, PORT_SERVEUR, URL);
  socketIO.onEvent(socketIOEvent);

  // Moteurs
  if (!AFMS.begin()) {  // create with the default frequency 1.6KHz
    // if (!AFMS.begin(1000)) {  // OR with a different frequency, say 1KHz
    Serial.println("Could not find Motor Shield. Check wiring.");
    while (1)
      ;
  }
  Serial.println("Motor Shield found.");

  // Set the speed to start, from 0 (off) to 255 (max speed)
  moteurGauche->setSpeed(150);
  moteurGauche->run(FORWARD);
  // turn on motor
  moteurGauche->run(RELEASE);
}

// ############################################################################
// #                                LOOP                                      #
// ############################################################################

unsigned long messageTimestamp = 0;

void loop() {
  socketIO.loop();

  // Changement des moteurs ici
  if (changeMotors) {
    moteurGauche->run(sensMoteurGauche);
    moteurDroit->run(sensMoteurDroit);

    moteurGauche->setSpeed(vitesseMoteurGauche);
    moteurDroit->setSpeed(vitesseMoteurDroit);

    delay(dureeMoteurs);

    moteurGauche->run(RELEASE);
    moteurDroit->run(RELEASE);

    // moteurGauche->run(FORWARD);

    // int i;
    // for (i=0; i<255; i++) {
    //   moteurGauche->setSpeed(i);
    //   delay(dureeMoteurDroit);
    // }
    // for (i=255; i!=0; i--) {
    //   moteurGauche->setSpeed(i);
    //   delay(dureeMoteurDroit);
    // }

    // moteurGauche->run(RELEASE);
    // delay(dureeMoteurDroit);

    changeMotors = false;
  }

  uint64_t now = millis();

  if (now - messageTimestamp > 2000) {
    messageTimestamp = now;

    // create JSON message for Socket.IO (event)
    DynamicJsonDocument doc(1024);

    JsonArray array = doc.to<JsonArray>();

    // add event name
    // Hint: socket.on('event_name', ....
    array.add("event_name");

    // add payload (parameters) for the event
    JsonObject param1 = array.createNestedObject();
    param1["now"] = (uint32_t)now;

    // JSON to String (serializion)
    String output;
    serializeJson(doc, output);

    socketIO.sendEVENT(output);

    USE_SERIAL.println(output);
  }
}
