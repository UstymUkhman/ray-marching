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
