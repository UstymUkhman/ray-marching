#include "normal.glsl";
#include "raycast.glsl";
#include "occlussion.glsl";

// RayMarching loop with "Soft Shadows" factor:
float SoftShadow (in vec3 position, in vec3 direction, in float minLightDistance) {
  float result = 1.0;
  float lightDistance = LIGHT.distance;

  for (int i = 0; i < RAY.steps; i++) {
    vec3 ray = position + lightDistance * direction;

    // Cast ray to the light source:
    float distance = MapScene(ray).x;
    float scaledDistance = lightDistance * LIGHT.size;

    // Light amount is proportional to the ratio of the
    // current distance to the scene and the distance from
    // ray position multiplied by the size of the light source:
    result = min(result, distance / scaledDistance);
    lightDistance += distance;

    // Light is too far from the camera:
    bool far = lightDistance > LIGHT.max;

    // Light has hit the surface of an object:
    bool close = distance < minLightDistance;

    if (close || far) break;
  }

  return clamp(result, 0.0, 1.0);
}

// [Lambertian Shading Model]
// REFLECTED_LIGHT = dot(LIGHT_DIRECTION, SURFACE_NORMAL):
vec3 Lighting (in vec3 position, in vec3 direction, in vec3 color, in vec3 normal) {
  bool earth = normal != vec3(0.0);

  // Get normal map texture color for earth and default "SurfaceNormal" value otherwise:
  vec3 surfaceNormal = earth ? normal : SurfaceNormal(position, 1);
  vec3 lightDirection = normalize(LIGHT.position - position);

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
  float lightDistance = length(LIGHT.position - position);

  // Fresnel Effect:
  float fresnelAmount = dot(direction, surfaceNormal) + 1.0;
  vec3 fresnel = pow(fresnelAmount, 3.0) * color * FRESNEL;

  // Calculate reflected light from objects:
  reflected = dot(surfaceNormal, -lightDirection);
  reflection = color * REFLECTION * clamp(reflected, 0.0, 1.0);

  // Ambient color:
  vec3 ambient = color * AMBIENT;
  vec3 ambientFresnel = ambient + fresnel + reflection;

  vec3 origin = position + surfaceNormal * 0.02;
  vec3 lightPosition = normalize(LIGHT.position);

  #ifdef AMBIENT_OCCLUSSION
    float occlussion = ambientOcclussion(position, surfaceNormal);

    // Ambient Occlussion debug mode:
    // return 0.9 * vec3(1.0) * occlussion;
    ambientFresnel *= occlussion;
    specular *= occlussion;
  #endif

  vec3 specularDiffuse = specular + diffuse;

  #ifdef SOFT_SHADOWS
    float minDistance = earth ? LIGHT.distance : LIGHT.min;
    specularDiffuse *= SoftShadow(origin, lightPosition, minDistance);
  #else
    float objectDistance = Raycast(origin, lightPosition).x;

    // Distance to object is smaller than distance
    // to the light source, this point is in shadow:
    if (objectDistance < lightDistance) {
      return ambientFresnel;
    }
  #endif

  // Light components sum:
  return ambientFresnel + specularDiffuse;
}
