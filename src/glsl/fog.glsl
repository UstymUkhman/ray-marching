#include "color.glsl";

// Exponential squared fog:
void UseFog (out vec3 color, in vec3 background, in float distance) {
  float fogDepth = distance * distance;
  float fogFactor = 1.0 - exp(-FOG.density * fogDepth);
  color = mix(color, background, fogFactor);
}
