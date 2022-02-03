#version 300 es

#ifndef GL_FRAGMENT_PRECISION_HIGH
  precision mediump float;
#else
  precision highp float;
#endif

#include "checkerfiltering.glsl";
#include "constants.glsl";
#include "normal.glsl";

// Screen resolution:
uniform vec2 resolution;

// Output color:
out vec4 fragColor;

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

  // Ambient color:
  vec3 ambient = color * AMBIENT;

  float objectDistance = raycast(
    position + surfaceNormal * 0.02,
    normalize(LIGHT)
  ).x;

  // Distance to object is smaller than distance
  // to the light source, this point is in shadow:
  if (objectDistance < lightDistance) {
    return ambient;
  }

  // Light components sum:
  return ambient + diffuse + specular;
}

vec3 getColorByID (in int id) {
  return COLORS[id];
}

// Initialize ray origin and direction for
// each pixel and render elements on scene:
void render (inout vec3 color, in vec2 uv) {
  vec3 rayOrigin = vec3(0.0, 0.0, -3.0);
  vec3 rayDirection = normalize(vec3(uv, FOV));

  // Get raymarching distance result:
  vec2 object = raycast(rayOrigin, rayDirection);

  // Object hit, ray distance is
  // closer than max ray distance:
  if (object.x < RAY.distance) {
    vec3 objectColor = vec3(0.0);
    int objectID = int(object.y) - 1;

    // Define ray's current position based on its
    // origin, direction and hitted object's position:
    vec3 position = rayOrigin + object.x * rayDirection;

    if (objectID == 0) {
      // vec2 px = ((gl_FragCoord.xy + vec2(1.0, 0.0)) * 2.0 - resolution.xy) / resolution.y;
      // vec2 py = ((gl_FragCoord.xy + vec2(0.0, 1.0)) * 2.0 - resolution.xy) / resolution.y;

      // vec3 rayDirectionX = camera * normalize(vec3(px, FL));
      // vec3 rayDirectionY = camera * normalize(vec3(py, FL));

      vec3 dpdx = (rayDirection / rayDirection.y /* - rayDirectionX / rayDirectionX.y */) * rayOrigin.y;
      vec3 dpdy = (rayDirection / rayDirection.y /* - rayDirectionY / rayDirectionY.y */) * rayOrigin.y;

      objectColor = getGroundPattern(position.xz, dpdx.xz, dpdy.xz, true);
    }

    else {
      objectColor = getColorByID(objectID);
    }

    // Define object color and lighting when hitted:
    color += getLight(position, rayDirection, objectColor);

    // Exponential squared fog:
    float fogDepth = object.x * object.x;
    float fogFactor = 1.0 - exp(-FOG_DENSITY * fogDepth);
    color = mix(color, BACKGROUND, fogFactor);
  }

  else {
    // Sky background color:
    color += BACKGROUND - max(0.9 * rayDirection.y, 0.0);
  }
}

void main (void) {
  vec3 color = vec3(0.0);

  // Normalize coords to be at the center of the screen:
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;

  render(color, uv);

  color = pow(color, vec3(GAMMA));

  fragColor = vec4(color, 1.0);
}
