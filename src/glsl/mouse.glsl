// Mouse position:
uniform vec2 mouse;

// Rotate on one axis by "amount":
void rotatePosition (inout vec2 position, float amount) {
  position = position * cos(amount) +
    vec2(position.y, -position.x) * sin(amount);
}

// Update ray origin on mouse move:
vec3 mouseMove (in vec3 origin) {
  // Normalize mouse coordinates:
  vec2 coords = mouse / resolution;

  // Rotate ray origin position around its axes:
  rotatePosition(origin.yz, coords.y * RAD - 0.5);
  rotatePosition(origin.xz, coords.x * TAU);

  return origin;
}
