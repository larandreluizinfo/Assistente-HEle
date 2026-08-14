#include <Keyboard.h>

const int PINO_TRIG = 12;
const int PINO_ECHO = 11;
const float DISTANCIA_ATIVACAO_CM = 100.0;
const unsigned long INTERVALO_MEDIDA_MS = 200;
const unsigned long INTERVALO_DEBOUNCE_MS = 5000;

bool visitantePresente = false;
unsigned long ultimaAtivacao = 0;

void setup() {
  pinMode(PINO_TRIG, OUTPUT);
  pinMode(PINO_ECHO, INPUT);
  Keyboard.begin();
}

void loop() {
  digitalWrite(PINO_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PINO_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PINO_TRIG, LOW);

  long duracao = pulseIn(PINO_ECHO, HIGH);
  float distancia = duracao * 0.034 / 2;

  bool presente = (distancia > 0 && distancia < DISTANCIA_ATIVACAO_CM);

  if (presente && !visitantePresente && (millis() - ultimaAtivacao > INTERVALO_DEBOUNCE_MS)) {
    ultimaAtivacao = millis();
    Keyboard.press(KEY_F9);
    Keyboard.release(KEY_F9);
  }

  visitantePresente = presente;
  delay(INTERVALO_MEDIDA_MS);
}