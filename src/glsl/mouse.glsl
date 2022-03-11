// Mouse position:
uniform float zoom;
uniform vec2  mouse;

// Rotate on one axis by "amount":
void RotatePosition (inout vec2 position, float amount) {
  position = position * cos(amount) +
    vec2(position.y, -position.x) * sin(amount);
}

// Update ray origin on mouse move:
vec3 MouseMove () {
  // Normalize mouse coordinates:
  vec2 coords = mouse / resolution;
  vec3 origin = vec3(POSITION, zoom);

  // Rotate ray origin position around its axes:
  RotatePosition(origin.yz, coords.y * RAD - 0.5);
  RotatePosition(origin.xz, coords.x * TAU);

  return origin;
}
