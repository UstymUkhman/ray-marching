const float SPEED = 100.0;
const float MIN   = float(0xFF);
const float HALF  = float(0xFF << 1);
const float MAX   = float(0xFF * 3);

void getSphereColor (out vec3 color, in float time, in bool circular) {
  float divisor = circular ? MAX : HALF;
  float timeMod = mod(time * SPEED, divisor);

  if (circular) {
    float red   = MAX - timeMod - HALF;
    float green = clamp(timeMod, 0.0, HALF);
    float blue  = clamp(timeMod, MIN, MAX);

    red = max(
      max(red, 0.0),
      -min(red + MIN, 0.0)
    );

    red   = red / MIN * 0.5;
    green = green / MIN * 0.5;
    blue  = (blue - MIN) / MIN * 0.5;

    red   = floor(sin(PI * red)   * MIN);
    green = floor(sin(PI * green) * MIN);
    blue  = floor(sin(PI * blue)  * MIN);

    color = vec3(red, green, blue);
  }

  else {
    int delta = int(sin(PI * timeMod / HALF) * HALF);
    int blue  = max(delta - 0xFF, 0);
    int red   = min(delta, 0xFF);

    color = vec3(
      0xFF - red,
      red - blue,
      blue
    );
  }

  color = normalize(color);
}
