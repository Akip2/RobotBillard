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

// === MODIFY ACCORDING TO THE NETWORK ========================================
char* SERVER_ADDRESS = "192.168.137.1";
int SERVER_PORT = 8001;
char* URL = "/socket.io/?EIO=4";

char* NETWORK_NAME = "TP-LINK_7A134E";
char* NETWORK_PASSWORD = "C27A134E";

// 957: Tranis
// 857: Ninho
// 457: SCH (ses roues sont à l'envers)
// 157: Zola
int ARUCO_ID = 457;

// ============================================================================

ESP8266WiFiMulti WiFiMulti;
SocketIOclient socketIO;

Adafruit_MotorShield AFMS = Adafruit_MotorShield();

// Motors
Adafruit_DCMotor* leftMotor = AFMS.getMotor(2);
Adafruit_DCMotor* rightMotor = AFMS.getMotor(1);

// === Robot variables =======================================================================
bool isConnected = false;
bool hasSentIdentity = false;

long lastTimestamp = -1;
long delayTime = -1;

int leftMotorDirection = 0;
int rightMotorDirection = 0;
int leftMotorSpeed = 0;
int rightMotorSpeed = 0;
int motorDuration = 0;

bool changeMotors = false;

int timeLastOrder = 0;

/*
  Handles what happens when an event is received
*/
void socketIOEvent(socketIOmessageType_t type, uint8_t* payload, size_t length) {
  JsonDocument doc;
  String payload_str;
  String name_event;

  switch (type) {
    case sIOtype_DISCONNECT:
      USE_SERIAL.printf("[IOc] Disconnected!\n");
      isConnected = false;
      hasSentIdentity = false;
      break;
    case sIOtype_CONNECT:
      USE_SERIAL.printf("[IOc] Connected to url: %s\n", payload);

      isConnected = true;
      // join default namespace (no auto join in Socket.IO V3)
      socketIO.send(sIOtype_CONNECT, "/");
      break;
    case sIOtype_EVENT:
      USE_SERIAL.printf("[IOc] get event: %s\n", payload);

      // Get the event
      payload_str = String((char*)payload);
      deserializeJson(doc, payload_str);

      name_event = String(doc[0]);

      if (name_event == "motor") {

        int left = doc[1]["left"];
        int right = doc[1]["right"];
        int duration = doc[1]["duration"];
        int time = doc[1]["time"];

        USE_SERIAL.printf("%d\n", left);
        USE_SERIAL.printf("%d\n", right);
        USE_SERIAL.printf("%d\n", duration);
        USE_SERIAL.printf("%d\n", time);

        // Deduce the time between 2 events
        if (lastTimestamp == -1) {
          lastTimestamp = time;
        }
        delayTime = time - lastTimestamp;

        USE_SERIAL.printf("%d\n", delayTime);

        lastTimestamp = time;

        // Change motor variables
        leftMotorSpeed = abs(left);
        rightMotorSpeed = abs(right);

        if (left > 0) {
          leftMotorDirection = FORWARD;
        } else if (left < 0) {
          leftMotorDirection = BACKWARD;
        } else {  // when == 0
          leftMotorDirection = RELEASE;
          leftMotorSpeed = 0;
        }

        if (right > 0) {
          rightMotorDirection = FORWARD;
        } else if (right < 0) {
          rightMotorDirection = BACKWARD;
        } else {  // when == 0
          rightMotorDirection = RELEASE;
          rightMotorSpeed = 0;
        }

        motorDuration = duration;
        changeMotors = true;
        timeLastOrder = millis();
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

  WiFiMulti.addAP(NETWORK_NAME, NETWORK_PASSWORD);

  while (WiFiMulti.run() != WL_CONNECTED) {
    delay(100);
  }

  String ip = WiFi.localIP().toString();
  USE_SERIAL.printf("[SETUP] WiFi Connected %s\n", ip.c_str());

  socketIO.begin(SERVER_ADDRESS, SERVER_PORT, URL);
  socketIO.onEvent(socketIOEvent);

  // Motors
  if (!AFMS.begin()) {  // create with the default frequency 1.6KHz
    // if (!AFMS.begin(1000)) {  // OR with a different frequency, say 1KHz
    Serial.println("Could not find Motor Shield. Check wiring.");
    while (1)
      ;
  }
  Serial.println("Motor Shield found.");
}

// ############################################################################
// #                                LOOP                                      #
// ############################################################################

int i = 0, j = 0;

void loop() {
  socketIO.loop();

  uint64_t now = millis();

  if ((now - timeLastOrder) < motorDuration) {
    leftMotor->run(leftMotorDirection);
    rightMotor->run(rightMotorDirection);
    //leftMotor->setSpeed(leftMotorSpeed);
    //rightMotor->setSpeed(rightMotorSpeed);

    // Smoothes the movement
    while ((i < leftMotorSpeed) || (j < rightMotorSpeed)) {
      if ((now - timeLastOrder) < motorDuration) {
        leftMotor->setSpeed(i);
        rightMotor->setSpeed(j);
        delay(2);
      } else {
        break;
      }

      if (i < leftMotorSpeed) {
        i++;
      }
      if (j < rightMotorSpeed) {
        j++;
      }
    }
  } else {
    i = leftMotorSpeed, j = rightMotorSpeed;

    // Smoothes the end of a movement
    if (!((now - timeLastOrder) < motorDuration)) {
      while ((i > 0) || (j > 0)) {
        if (!((now - timeLastOrder) < motorDuration)) {
          leftMotor->setSpeed(i);
          rightMotor->setSpeed(j);
          delay(2);
        } else {
          break;
        }

        if (i > 0) {
          i--;
        }
        if (j > 0) {
          j--;
        }
      }
    }

    leftMotor->run(RELEASE);
    rightMotor->run(RELEASE);
  }

  if (!hasSentIdentity && isConnected) {
    // Send a socket to the server to identify itself
    JsonDocument doc;
    JsonArray array = doc.to<JsonArray>();

    // Event name
    array.add("identification");

    // Event content
    JsonObject param = array.createNestedObject();
    param["type"] = "robot";
    param["id"] = ARUCO_ID;

    // JSON to String (serializion)
    String output;
    serializeJson(doc, output);
    socketIO.sendEVENT(output);
    USE_SERIAL.println(output);

    hasSentIdentity = true;
  }
}
