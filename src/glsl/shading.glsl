#include "raycast.glsl";

// RayMarching loop with "Soft Shadows" factor:
float softShadow (in vec3 position, in vec3 direction) {
  float result = 1.0;
  float lightDistance = LIGHT.distance;

  for (int i = 0; i < RAY.steps; i++) {
    vec3 ray = position + lightDistance * direction;

    // Cast ray to the light source:
    float distance = mapScene(ray).x;
    float scaledDistance = lightDistance * LIGHT.size;

    // Light amount is proportional to the ratio of the
    // current distance to the scene and the distance from
    // ray position multiplied by the size of the light source:
    result = min(result, distance / scaledDistance);
    lightDistance += distance;

    // Light is too far from the camera:
    bool far = lightDistance > LIGHT.max;

    // Light has hit the surface of an object:
    bool close = distance < LIGHT.min;

    if (close || far) break;
  }

  return clamp(result, 0.0, 1.0);
}

// [Lambertian Shading Model]
// REFLECTED_LIGHT = dot(LIGHT_DIRECTION, SURFACE_NORMAL):
vec3 getLight (in vec3 position, in vec3 direction, in vec3 color) {
  vec3 lightDirection = normalize(LIGHT.position - position);
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
  vec3 specularDiffuse = specular + diffuse;

  // Get shadows by comparing distance from current
  // position to the closest object with distance
  // (from current position) to the light source:
  float lightDistance = length(LIGHT.position - position);

  // Fresnel Effect:
  float fresnelAmount = dot(direction, surfaceNormal) + 1.0;
  vec3 fresnel = pow(fresnelAmount, 3.0) * color * FRESNEL;

  // Ambient color:
  vec3 ambient = color * AMBIENT;

  vec3 origin = position + surfaceNormal * 0.02;
  vec3 lightPosition = normalize(LIGHT.position);

  #ifdef USE_SOFT_SHADOWS
    specularDiffuse *= softShadow(origin, lightPosition);
  #else
    float objectDistance = raycast(origin, lightPosition).x;

    // Distance to object is smaller than distance
    // to the light source, this point is in shadow:
    if (objectDistance < lightDistance) {
      return ambient + fresnel;
    }
  #endif

  // Light components sum:
  return ambient + fresnel + specularDiffuse;
}
