// [Camera]
// Get forward vector from camera's position and orientation:
mat3 Camera (in vec3 rayOrigin, in vec3 lookAt) {
  vec3 forward = normalize(vec3(lookAt - rayOrigin));
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
  vec3 up = cross(forward, right);

  return mat3(right, up, forward);
}
