vec4 UsePlainTexture (in sampler2D image, in vec3 position) {
  // Calculate coords for texture UVs:
  vec3 coords = position * SPHERE.scale;

  // Get the angle in radians around the sphere:
  float x = atan(-coords.x, coords.z) / RAD;

  // Map vertical coords from sphere to plane:
  float y = -coords.y * 0.95 / SPHERE.radius;

  // UV vector for plane texture:
  vec2 uv = vec2(x, y) + 0.5;

  // Return texture color and vertical coord
  // as alpha (which is used in color texture):
  return vec4(texture(image, uv).rgb, coords.y);
}

void TranslateSphere (inout vec3 position) {
  float delta = sin(time * 4.0) + 1.0;
  position.y -= delta * 0.25 + 0.5;
}

void RotateSphere (inout vec3 position) {
  PointRotation(position.xy, -0.409);
  PointRotation(position.xz, time);
}

vec3 TransformSphere (in vec3 position) {
  TranslateSphere(position);
  RotateSphere(position);
  return position;
}

vec3 TransformClouds (in vec3 position) {
  vec3 clouds = TransformSphere(position);
  PointRotation(clouds.xz, time * 0.5);
  return clouds;
}

// Tweak normal values for spherical meshes:
vec3 SphericalNormal (in vec3 normal) {
  normal  = abs(normal);
  normal  = pow(normal, vec3(5.0));
  normal /= normal.x + normal.y + normal.z;

  return normal;
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
