void TranslateCube (inout vec3 position) {
  position.y -= 1.2;
}

void RotateCube (inout vec3 position) {
  PointRotation(position.xz, time);
  PointRotation(position.yz, time * 2.0);
  PointRotation(position.xy, time * 4.0);
}

vec3 TransformCube (in vec3 position) {
  TranslateCube(position);
  RotateCube(position);
  return position;
}
