// RayMarching loop:
vec2 Raycast (in vec3 position, in vec3 direction, in bool clouds) {
  vec2 distance, object;

  for (int i = 0; i < RAY.steps; i++) {
    vec3 ray = position + object.x * direction;

    #ifdef EARTH_CLOUDS
      distance = clouds ? MapClouds(ray) : MapScene(ray);
    #else
      distance = MapScene(ray);
    #endif

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
