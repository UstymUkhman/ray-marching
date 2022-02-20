#include "mouse.glsl";
#include "color.glsl";
#include "camera.glsl";
#include "checker.glsl";
#include "shading.glsl";

// Initialize ray origin and direction for
// each pixel and render elements on scene:
vec3 render (in vec3 color, in vec2 uv) {
  vec3 rayOrigin = mouseMove(POSITION);
  mat3 camera = Camera(rayOrigin, LOOK_AT);
  vec3 rayDirection = camera * normalize(vec3(uv, FOV));

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
      vec2 px = ((gl_FragCoord.xy + vec2(1.0, 0.0)) * 2.0 - resolution.xy) / resolution.y;
      vec2 py = ((gl_FragCoord.xy + vec2(0.0, 1.0)) * 2.0 - resolution.xy) / resolution.y;

      vec3 rayDirectionX = camera * normalize(vec3(px, FOV));
      vec3 rayDirectionY = camera * normalize(vec3(py, FOV));

      vec3 dpdx = (rayDirection / rayDirection.y - rayDirectionX / rayDirectionX.y) * rayOrigin.y;
      vec3 dpdy = (rayDirection / rayDirection.y - rayDirectionY / rayDirectionY.y) * rayOrigin.y;

      objectColor = GroundPattern(position.xz, dpdx.xz, dpdy.xz, false);
    }

    else sphereColor(objectColor, time, true);

    // Define object color and lighting when hitted:
    color += Lighting(position, rayDirection, objectColor);

    // Exponential squared fog:
    float fogDepth = object.x * object.x;
    float fogFactor = 1.0 - exp(-FOG_DENSITY * fogDepth);
    color = mix(color, BACKGROUND, fogFactor);
  }

  else {
    // Sky background color:
    color += BACKGROUND - max(0.9 * rayDirection.y, 0.0);
  }

  return color;
}