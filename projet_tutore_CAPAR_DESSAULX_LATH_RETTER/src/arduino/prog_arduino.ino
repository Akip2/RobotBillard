#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ArduinoJson.h>
#include <WebSocketsClient_Generic.h>
#include <SocketIOclient_Generic.h>
#include <Hash.h>
#include <Adafruit_MotorShield.h>

#define DISTANCE_MAX                1000000 //j'ai fixé une valeur max pour la latence pour le tout début du jeu
#define LATENCE_MAX                 300 //la latence max a accepté 

#if !defined(ESP8266)
  #error This code is intended to run only on the ESP8266 boards ! Please check your Tools->Board setting.
#endif


ESP8266WiFiMulti WiFiMulti;
SocketIOclient socketIO;

// Select the IP address according to your local network
IPAddress serverIP(172, 20, 10, 2);       //l'adress IP du serveur (mon ordi)
uint16_t  serverPort = 8001;    //8080;    //3000;
int16_t vitesse_moteur_droit;
int16_t vitesse_moteur_gauche;


long date_connexion;          //c'est la date envoyé par le serveur, c'est les milisecondes écoulés entre le 1er janvier 2024 et la date a laquelle le serveur envoie le message
long temps_passe;             // c'est le temps entre le reveil du robot et le moment où il reçoit la date de la part du serveur
long date_mouvement = 0;     // ça c'est la date du mouvement envoyé par le serveur
long date_arduino = 0;       //là c'est le temps interne à l'arduino
float distance = DISTANCE_MAX; //là c'est la distance entre le temps de l'arduino et le temps envoyé par le serveur pour un mouvement
long temps_mouvement = 0;      //le temps du mouvement (une seconde par exemple)
float temps_reel_mouvement;     //c'est le temps du mouvement - la latence
long test = 0;                // ça c'est mon petit test perso
long temps_limite_mouvement;  //la date limite du mouvement

String type_mouvement;        //ça c'est pour savoir si c'est un mouvement qui doit être constant ou bien que l'on doit ralentir en fonction du temps

Adafruit_MotorShield AFMS = Adafruit_MotorShield();
Adafruit_DCMotor *mon_moteur_droit = AFMS.getMotor(1);
Adafruit_DCMotor *mon_moteur_gauche = AFMS.getMotor(2);

void socketIOEvent(const socketIOmessageType_t& type, uint8_t * payload, const size_t& length)
{
  DynamicJsonDocument doc(1024);
  String str;
  const char* json;
  const char* val;

  switch (type)
  {
    case sIOtype_DISCONNECT:
      Serial.println("[IOc] Disconnected");
      break;

    case sIOtype_CONNECT:
      Serial.print("[IOc] Connected to url: ");
      Serial.println((char*) payload);

      // join default namespace (no auto join in Socket.IO V3)
      socketIO.send(sIOtype_CONNECT, "/");

      break;

    case sIOtype_EVENT:
      Serial.print("[IOc] Get event: ");
      Serial.println((char*) payload);
      
      str = String((char*) payload);
      Serial.println(str);
     
      deserializeJson(doc, str);


      Serial.println(String(doc[0]));
      Serial.println(String(doc[1]));

      if (String(doc[0])=="temps"){
        Serial.println("La date de connexion : ");
        Serial.println(String(doc[1]));
        date_connexion = String(doc[1]).toInt();
        temps_passe = millis();
      }
            
      if (String(doc[0])=="mouvement"){
      
      char   *sPtr [5];
      int N = separate (String(doc[1]), sPtr, 5);

      vitesse_moteur_gauche = String(sPtr[0]).toInt();
      vitesse_moteur_droit = String(sPtr[1]).toInt();
      temps_mouvement = String(sPtr[2]).toInt();
      type_mouvement = String(sPtr[4]);

      long val4 = 0;
      for (int i = 0; sPtr[3][i] != '\0'; i++) {
        if (isdigit(sPtr[3][i])) {
          val4 = val4 * 10 + (sPtr[3][i] - '0');
        }
      }
      date_mouvement = val4;

        date_arduino = date_connexion + (millis() - temps_passe);

        distance = abs(date_arduino - date_mouvement);

        float coef = distance/LATENCE_MAX;

        if(distance>LATENCE_MAX) temps_limite_mouvement = 0;
        else {
          temps_limite_mouvement = date_arduino + (temps_mouvement * (1-coef));
          temps_reel_mouvement = (temps_mouvement * (1-coef));
        }
  
      }    
  
      break;

    case sIOtype_ACK:
      Serial.print("[IOc] Get ack: ");
      Serial.println(length);

      hexdump(payload, length);
      break;

    case sIOtype_ERROR:
      Serial.print("[IOc] Get error: ");
      Serial.println(length);

      hexdump(payload, length);
      break;

    case sIOtype_BINARY_EVENT:
      Serial.print("[IOc] Get binary: ");
      Serial.println(length);

      hexdump(payload, length);
      break;

    case sIOtype_BINARY_ACK:
      Serial.print("[IOc] Get binary ack: ");
      Serial.println(length);

      hexdump(payload, length);
      break;

    case sIOtype_PING:
      Serial.println("[IOc] Get PING");

      break;

    case sIOtype_PONG:
      Serial.println("[IOc] Get PONG");

      break;

    default:
      break;
  }
}

void setup()
{

  // Serial.begin(921600);
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);

  while (!Serial);

  if (!AFMS.begin()) {         // create with the default frequency 1.6KHz
  // if (!AFMS.begin(1000)) {  // OR with a different frequency, say 1KHz
    Serial.println("Could not find Motor Shield. Check wiring.");
    while (1);
  }
  Serial.println("Motor Shield found.");

  Serial.print("\nStart ESP8266_WebSocketClientSocketIO on ");
  Serial.println(ARDUINO_BOARD);
  Serial.println(WEBSOCKETS_GENERIC_VERSION);

  //Serial.setDebugOutput(true);

  // disable AP
  if (WiFi.getMode() & WIFI_AP)
  {
    WiFi.softAPdisconnect(true);
  }

  WiFiMulti.addAP("Scylla", "c'estsila");       //c'est le nom et le mot de passe de ma WIFI

  //WiFi.disconnect();
  while (WiFiMulti.run() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(100);
  }

  Serial.println();

  // Client address
  Serial.print("WebSockets Client started @ IP address: ");
  Serial.println(WiFi.localIP());

  // server address, port and URL
  Serial.print("Connecting to WebSockets Server @ IP address: ");
  Serial.print(serverIP);
  Serial.print(", port: ");
  Serial.println(serverPort);

  // setReconnectInterval to 10s, new from v2.5.1 to avoid flooding server. Default is 0.5s
  socketIO.setReconnectInterval(10000);

  socketIO.setExtraHeaders("Authorization: 1234567890");

  // server address, port and URL
  // void begin(IPAddress host, uint16_t port, String url = "/socket.io/?EIO=4", String protocol = "arduino");
  // To use default EIO=4 fron v2.5.1
  socketIO.begin(serverIP, serverPort);

  // event handler
  socketIO.onEvent(socketIOEvent);
}

unsigned long messageTimestamp = 0;

void loop()
{
  socketIO.loop();

  uint8_t vitesse_moteur_droit2;

  uint8_t vitesse_moteur_gauche2;

  date_arduino = date_connexion + (millis() - temps_passe);

  //coef temps mouvement : 

  float coef_temps = (temps_limite_mouvement - date_arduino) / temps_reel_mouvement;

  if(date_arduino<temps_limite_mouvement){


    test = 0;
    //Serial.println("EN MOUVEMENT");

    Serial.print("type mouvement ");
    Serial.println(type_mouvement);


    long droit = 0;
    long gauche = 0;

  if(type_mouvement=="slow"){
    if (vitesse_moteur_droit>0){
      droit = vitesse_moteur_droit*coef_temps+40*(1-coef_temps);
    }
    else {
      droit = vitesse_moteur_droit*coef_temps-40*(1-coef_temps);
    }
  }else{
    droit = vitesse_moteur_droit;
  }

  if(type_mouvement=="slow"){
    if(vitesse_moteur_gauche>0){
      gauche = vitesse_moteur_gauche*coef_temps+40*(1-coef_temps);
    }
    else {
      gauche = vitesse_moteur_gauche*coef_temps-40*(1-coef_temps);
    }
  }else{
    gauche = vitesse_moteur_gauche;
  }

    Serial.print("vitesse droit : ");
    Serial.println(droit);

  if(vitesse_moteur_droit>40){
    vitesse_moteur_droit2 = droit;
    //Serial.println(vitesse_moteur_droit2);
    mon_moteur_droit->run(FORWARD);
    mon_moteur_droit->setSpeed(vitesse_moteur_droit2);
  }
  else if(vitesse_moteur_droit<-40){
    vitesse_moteur_droit2 = -droit;
    //Serial.println(vitesse_moteur_droit2);
    mon_moteur_droit->run(BACKWARD);
    mon_moteur_droit->setSpeed(vitesse_moteur_droit2);
  }
  else{
    mon_moteur_droit->run(RELEASE);
  }


  if(vitesse_moteur_gauche>40){
    vitesse_moteur_gauche2 = gauche;
    //Serial.println(vitesse_moteur_gauche2);
    mon_moteur_gauche->run(FORWARD);
    mon_moteur_gauche->setSpeed(vitesse_moteur_gauche2);
  }
  else if(vitesse_moteur_gauche<-40){
    vitesse_moteur_gauche2 = -gauche;
    //Serial.println(vitesse_moteur_gauche2);
    mon_moteur_gauche->run(BACKWARD);
    mon_moteur_gauche->setSpeed(vitesse_moteur_gauche2);
  }
  else{
    mon_moteur_gauche->run(RELEASE);
  }
  }
  else {

      if(test==0){
        Serial.println("PAS EN MOUVEMENT");
        test=1;
      }
    mon_moteur_gauche->run(RELEASE);
    mon_moteur_droit->run(RELEASE);
  }



  uint64_t now = millis();

  if (now - messageTimestamp > 30000)
  {
    messageTimestamp = now;

    // creat JSON message for Socket.IO (event)
    DynamicJsonDocument doc(1024);
    JsonArray array = doc.to<JsonArray>();

    // add evnet name
    // Hint: socket.on('event_name', ....
    array.add("event_name");

    // add payload (parameters) for the event
    JsonObject param1 = array.createNestedObject();
    param1["now"]     = (uint32_t) now;

    // JSON to String (serializion)
    String output;
    serializeJson(doc, output);

    // Send event
    socketIO.sendEVENT(output);

    // Print JSON for debugging
    Serial.println(output);
  }
}



//la fonction pour séparer le string reçu avec les vitesses des deux moteurs, la date du message et le temps du mouvement
int separate (String str, char **p, int size ){
    int  n;
    char s [100];

    strcpy (s, str.c_str ());

    *p++ = strtok (s, " ");
    for (n = 1; NULL != (*p++ = strtok (NULL, " ")); n++)
        if (size == n)
            break;

    return n;
}
