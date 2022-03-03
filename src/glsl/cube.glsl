void pointRotation (inout vec2 point, in float angle) {
	point = cos(angle) * point + sin(angle) * vec2(point.y, -point.x);
}

void pointRotation45 (inout vec2 point) {
	point = (point + vec2(point.y, -point.x)) * sqrt(0.5);
}

void translateCube (inout vec3 position) {
  position.y -= 0.5;
}

void rotateCube (inout vec3 position) {
  pointRotation(position.yz, RAD * 0.5);
  pointRotation(position.xz, time);
}

vec3 transformCube (in vec3 position) {
  translateCube(position);
  rotateCube(position);
  return position;
}
