// RayMarching loop:
vec2 raycast (in vec3 origin, in vec3 direction) {
  vec2 distance, object;

  for (int i = 0; i < RAY.steps; i++) {
    vec3 ray = origin + object.x * direction;

    distance = mapScene(ray);

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

// [Lambertian Shading Model]
// REFLECTED_LIGHT = dot(LIGHT_DIRECTION, SURFACE_NORMAL):
vec3 getLight (in vec3 position, in vec3 direction, in vec3 color) {
  vec3 lightDirection = normalize(LIGHT - position);
  vec3 surfaceNormal = getSurfaceNormal(position, 1);

  // [Phong Shading Model]
  vec3 inverseDirection = -direction;
  // Light reflection vector on surface:
  vec3 reflection = reflect(-lightDirection, surfaceNormal);

  // Apply scalar exponent to get mirrored component:
  float reflected = dot(reflection, inverseDirection);
  float reflectionBase = clamp(reflected, 0.0, 1.0);
  vec3 specular = SPECULAR * pow(reflectionBase, 10.0);

  reflected = dot(lightDirection, surfaceNormal);
  vec3 diffuse = color * clamp(reflected, 0.0, 1.0);

  // Get shadows by comparing distance from current
  // position to the closest object with distance
  // (from current position) to the light source:
  float lightDistance = length(LIGHT - position);

  // Fresnel Effect:
  float fresnelAmount = dot(direction, surfaceNormal) + 1.0;
  vec3 fresnel = pow(fresnelAmount, 3.0) * color * FRESNEL;

  // Ambient color:
  vec3 ambient = color * AMBIENT;

  float objectDistance = raycast(
    position + surfaceNormal * 0.02,
    normalize(LIGHT)
  ).x;

  // Distance to object is smaller than distance
  // to the light source, this point is in shadow:
  if (objectDistance < lightDistance) {
    return ambient + fresnel;
  }

  // Light components sum:
  return ambient + fresnel + diffuse + specular;
}
