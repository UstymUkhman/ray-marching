// RayMarching loop:
vec2 raycast (in vec3 position, in vec3 direction) {
  vec2 distance, object;

  for (int i = 0; i < RAY.steps; i++) {
    vec3 ray = position + object.x * direction;

    distance = MapScene(ray);

    object.x += distance.x;
    object.y  = distance.y;

    // Ray is too far from the camera:
    bool far = object.x > RAY.distance;

    // Ray has hit the surface of an object:
    bool close = abs(distance.x) < RAY.epsilon;

    if (close || far) break;
  }

  return object;
}
