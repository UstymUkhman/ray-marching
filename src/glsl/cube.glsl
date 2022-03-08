void TranslateCube (inout vec3 position) {
  position.y -= 0.5;
}

void RotateCube (inout vec3 position) {
  PointRotation(position.yz, RAD * 0.5);
  PointRotation(position.xz, time);
}

vec3 TransformCube (in vec3 position) {
  TranslateCube(position);
  RotateCube(position);
  return position;
}
