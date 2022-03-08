void TranslateSphere (inout vec3 position) {
  position.y -= 0.25;
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
  float timeSin = sin(time);

  // From "mouse.glsl":
  RotatePosition(position.yz, timeSin);

  return sin(position.x + time * 2.0) *
         sin(position.y + timeSin   ) *
         sin(position.z + time * 4.0) *
  SPHERE.distortion;
}
