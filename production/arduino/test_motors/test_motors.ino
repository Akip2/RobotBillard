#include <Adafruit_MotorShield.h>


Adafruit_MotorShield AFMS = Adafruit_MotorShield();
Adafruit_DCMotor *leftMotor = AFMS.getMotor(1);
Adafruit_DCMotor *rightMotor = AFMS.getMotor(2);

int delayTime = 1000;
int speed = 100;

void setup() {
  Serial.begin(9600);
  Serial.println("Adafruit Motorshield v2 - DC Motor test!");

  if (!AFMS.begin()) {
    // if (!AFMS.begin(1000)) {  // OR with a different frequency, say 1KHz
    Serial.println("Could not find Motor Shield. Check wiring.");
    while (1)
      ;
  }
  Serial.println("Motor Shield found.");

  // Set the speed to start, from 0 (off) to 255 (max speed)
  //leftMotor->setSpeed(150);
  //leftMotor->run(FORWARD);
  // turn on motor
  //leftMotor->run(RELEASE);
}

void loop() {
  // Left wheel
  Serial.println("LEFT forward");
  leftMotor->run(FORWARD);
  leftMotor->setSpeed(speed);
  delay(delayTime);

  Serial.println("LEFT backward");
  leftMotor->run(BACKWARD);
  leftMotor->setSpeed(speed);
  delay(delayTime);

  Serial.println("LEFT RELEASE");
  leftMotor->run(RELEASE);
  delay(delayTime);

  // Right wheel
  Serial.println("RIGHT forward");
  rightMotor->run(FORWARD);
  rightMotor->setSpeed(speed);
  delay(delayTime);

  Serial.println("RIGHT backward");
  rightMotor->run(BACKWARD);
  rightMotor->setSpeed(speed);
  delay(delayTime);

  Serial.println("RIGHT RELEASE");
  rightMotor->run(RELEASE);
  delay(delayTime);
}