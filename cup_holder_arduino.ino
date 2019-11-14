/* Calibration sketch for HX711 */
 
#include "HX711.h"  // Library needed to communicate with HX711 https://github.com/bogde/HX711
#include <ArduinoJson.h>
 
#define DOUT  4  // Arduino pin 6 connect to HX711 DOUT
#define CLK  5  //  Arduino pin 5 connect to HX711 CLK
 
HX711 scale;  // Init of library
DynamicJsonDocument doc(1024);

void setup() {
  Serial.begin(9600);
  scale.begin(DOUT, CLK);
  scale.set_scale();  // Start scale
  scale.tare();       // Reset scale to zero
}

void loop() {
  float current_weight=scale.get_units(5);  // get average of 5 scale readings
  float scale_factor=(current_weight*0.00233 +1);  // divide the result by a known weight
  Serial.println(scale_factor);  // Print the scale factor to use
}
