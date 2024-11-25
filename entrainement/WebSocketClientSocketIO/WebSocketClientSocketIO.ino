/*
 * WebSocketClientSocketIO.ino
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
#include <Hash.h>

#include <Adafruit_MotorShield.h>

#define USE_SERIAL Serial

ESP8266WiFiMulti WiFiMulti;
SocketIOclient socketIO;

Adafruit_MotorShield AFMS = Adafruit_MotorShield();

Adafruit_DCMotor *moteurGauche = AFMS.getMotor(1);
Adafruit_DCMotor *moteurDroite = AFMS.getMotor(2);

int ETAT_LED = 1;
int LAST_ETAT_LED = 0;

char* ADRESSE_SERVEUR = "192.168.43.26";
int PORT_SERVEUR = 8001;

char* NOM_RESEAU = "AndroidAP6E68";
char* MDP_RESEAU = "yyny1513";

/*
    C'est ici que l'on gère ce qu'il se passe lorsqu'un évènement est reçu
*/
void socketIOEvent(socketIOmessageType_t type, uint8_t *payload, size_t length) {
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
      payload_str = String((char *)payload);
      deserializeJson(doc, payload_str);

      nom_event = String(doc[0]);

      if (nom_event == "bouton") {
        String val_event = String(doc[1]);

        if (val_event == "0") {
          ETAT_LED = 0;
        } else {
          ETAT_LED = 1;
        }
      }

      if (nom_event == "okcurseur") {
        uint8_t val_event = (uint8_t)String(doc[1]).toInt();

        USE_SERIAL.print("TEST 1\n");

        USE_SERIAL.printf("[IOc] get event: %d\n", val_event);

        if (val_event > 50) {
          USE_SERIAL.printf("val_event > 50\n");

          moteurGauche->run(FORWARD);
          moteurDroite->run(FORWARD);

          USE_SERIAL.print("FORWARD\n");

          moteurGauche->setSpeed(val_event);
          moteurDroite->setSpeed(val_event);

          USE_SERIAL.print("SET SPEED\n");
        } else if (val_event < 50) {
          USE_SERIAL.printf("val_event < 50\n");

          moteurGauche->run(BACKWARD);
          moteurDroite->run(BACKWARD);

          USE_SERIAL.print("BACKWARD\n");

          moteurGauche->setSpeed(val_event);
          moteurDroite->setSpeed(val_event);
        } else {  // 0 en gros
          USE_SERIAL.printf("TEST 0\n");
          moteurGauche->setSpeed(0);
          moteurDroite->setSpeed(0);
          moteurGauche->run(RELEASE);
          moteurDroite->run(RELEASE);
        }
        USE_SERIAL.printf("TEST FIN\n");
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

  // Le réseau auquel on se connecte et son mot de passe
  WiFiMulti.addAP(NOM_RESEAU, MDP_RESEAU);

  //WiFi.disconnect();
  while (WiFiMulti.run() != WL_CONNECTED) {
    delay(100);
  }

  String ip = WiFi.localIP().toString();
  USE_SERIAL.printf("[SETUP] WiFi Connected %s\n", ip.c_str());

  // server address, port and URL
  socketIO.begin(ADRESSE_SERVEUR, PORT_SERVEUR, "/socket.io/?EIO=4");

  // event handler
  socketIO.onEvent(socketIOEvent);
}

// ############################################################################
// #                                LOOP                                      #
// ############################################################################

unsigned long messageTimestamp = 0;

void loop() {
  socketIO.loop();

  // Le changement de LED se fait ici
  if (ETAT_LED == 1 && LAST_ETAT_LED == 0) {
    digitalWrite(LED_BUILTIN, LOW);
  } else if (ETAT_LED == 0 && LAST_ETAT_LED == 1) {
    digitalWrite(LED_BUILTIN, HIGH);
  }
  LAST_ETAT_LED = ETAT_LED;

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

    // Send event
    socketIO.sendEVENT(output);

    // Print JSON for debugging
    USE_SERIAL.println(output);
  }
}
