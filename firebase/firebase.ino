#include "FirebaseESP8266.h"
#include <ESP8266WiFi.h>
#include "HX711.h"  // Library needed to communicate with HX711 https://github.com/bogde/HX711
 
#define DOUT  2  // Arduino pin D4 connect to HX711 DOUT
#define CLK  0  //  Arduino pin D3 connect to HX711 CLK
#define LED 5

#define FIREBASE_HOST "cupholder-de568.firebaseio.com"
#define FIREBASE_AUTH "y7icYjoydV9Y83NzxYeSv17pqacDXt6If6zmwD26"
#define WIFI_SSID "卿如晤"
#define WIFI_PASSWORD "81550379"

FirebaseData firebaseData;
FirebaseData booleanData;
FirebaseJson json;
HX711 scale;  // Init of library


void setup()
{

  Serial.begin(115200);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  //WiFi.begin("Modera Guest");
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);

  //Set database read timeout to 1 minute (max 15 minutes)
  Firebase.setReadTimeout(firebaseData, 1000 * 60);
  //tiny, small, medium, large and unlimited.
  //Size and its write timeout e.g. tiny (1s), small (10s), medium (30s) and large (60s).
  Firebase.setwriteSizeLimit(firebaseData, "tiny");

  /*
  This option allows get and delete functions (PUT and DELETE HTTP requests) works for device connected behind the
  Firewall that allows only GET and POST requests.
  
  Firebase.enableClassicRequest(firebaseData, true);
  */

  scale.begin(DOUT, CLK);
  scale.set_scale();  // Start scale
  scale.tare();       // Reset scale to zero
  pinMode(LED, OUTPUT);
}


String data_path = "/data";
String light_path = "/light";

void loop()
{
  float current_weight=scale.get_units(2);
  float scale_factor=(current_weight*0.00233 +1);  // divide the result by a known weight

  Firebase.set(firebaseData, data_path, scale_factor);
  Firebase.getBool(booleanData, light_path);
  Serial.println(booleanData.boolData());

  if (booleanData.boolData()) {
    fadeOn(1000,5);
    fadeOff(1000,5);
  }
}

void fadeOn(unsigned int time,int increament){
  for (byte value = 0 ; value < 255; value+=increament){
    analogWrite(LED, value);
    delay(time/(255/5));
  }
}
void fadeOff(unsigned int time,int decreament){
  for (byte value = 255; value >0; value-=decreament){
    analogWrite(LED, value);
    delay(time/(255/5));
  }
}
