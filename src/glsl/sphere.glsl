void TranslateSphere (inout vec3 position) {
  float delta = sin(time * 4.0) * 0.6 + 1.0;
  position.y -= delta * 0.5 + 0.2;
}

void RotateSphere (inout vec3 position) {
  PointRotation(position.xz, time);
}

vec3 TransformSphere (in vec3 position) {
  TranslateSphere(position);
  RotateSphere(position);
  return position;
}

float Distortion (in vec3 position) {
  float timeSin = sin(time * 2.0);

  // From "mouse.glsl":
  RotatePosition(position.yz, timeSin);

  return sin(position.x + time * 4.0) *
         sin(position.y + timeSin   ) *
         sin(position.z + time * 8.0) *
  SPHERE.distortion;
}
