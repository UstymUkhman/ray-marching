void translateSphere (inout vec3 position) {
  position.y -= 0.25;
}

void rotateSphere (inout vec3 position) {
  pointRotation(position.xz, time);
}

vec3 transformSphere (in vec3 position) {
  translateSphere(position);
  rotateSphere(position);
  return position;
}

float Distortion (in vec3 position) {
  float timeSin = sin(time);

  // From "mouse.glsl":
  rotatePosition(position.yz, timeSin);

  return sin(position.x + time * 2.0) *
         sin(position.y + timeSin   ) *
         sin(position.z + time * 4.0) *
  SPHERE.distortion;
}
