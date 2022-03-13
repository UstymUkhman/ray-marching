// Delta time:
uniform float time;

// Pedestal texture:
uniform sampler2D black;

#include "fog.glsl";
#include "utils.glsl";
#include "mouse.glsl";
#include "camera.glsl";

#ifdef DEBUGGING_CUBE
  #include "cube.glsl";
  uniform sampler2D debug;

#else
  #include "sphere.glsl";

  #ifdef EARTH_TEXTURE
    uniform sampler2D earthNormal;
    uniform sampler2D earthColor;

  #else
    uniform sampler2D green;
  #endif
#endif

#include "checker.glsl";
#include "texture.glsl";
#include "shading.glsl";

// Initialize ray origin and direction for
// each pixel and render elements on scene:
vec3 render (in vec3 color, in vec2 uv) {
  vec3 rayOrigin = MouseMove();
  vec3 backgroundColor = vec3(0.0);

  mat3 camera = Camera(rayOrigin, LOOK_AT);
  vec3 rayDirection = camera * normalize(vec3(uv, FOV));

  // Get raymarching distance result:
  vec2 object = raycast(rayOrigin, rayDirection);

  #ifdef DYNAMIC_FOG
    // Set dynamic fog & background colors:
    UpdateColor(backgroundColor, time, true);
    backgroundColor = mix(FOG.color, backgroundColor, 0.25);

  #else
    backgroundColor = FOG.color;
  #endif

  // Object hit, ray distance is
  // closer than max ray distance:
  if (object.x < RAY.distance) {
    vec3 normalColor = vec3(0.0);
    vec3 objectColor = vec3(0.0);

    int objectID = int(object.y) - 1;

    // Define ray's current position based on its
    // origin, direction and hitted object's position:
    vec3 position = rayOrigin + object.x * rayDirection;

    // Ground Plane:
    if (objectID == 0) {
      vec2 px = ((gl_FragCoord.xy + vec2(1.0, 0.0)) * 2.0 - resolution.xy) / resolution.y;
      vec2 py = ((gl_FragCoord.xy + vec2(0.0, 1.0)) * 2.0 - resolution.xy) / resolution.y;

      vec3 rayDirectionX = camera * normalize(vec3(px, FOV));
      vec3 rayDirectionY = camera * normalize(vec3(py, FOV));

      vec3 dpdx = (rayDirection / rayDirection.y - rayDirectionX / rayDirectionX.y) * rayOrigin.y;
      vec3 dpdy = (rayDirection / rayDirection.y - rayDirectionY / rayDirectionY.y) * rayOrigin.y;

      objectColor = GroundPattern(position.xz, dpdx.xz, dpdy.xz, false);
    }

    else {
      // Get normal vector for each position:
      vec3 normal = SurfaceNormal(position, 1);

      if (objectID == 2) {
        objectColor = TriplanarMapping(black, position, normal);
      }

      else {
        #ifdef DEBUGGING_CUBE
          // Update normal vector rotation:
          RotateCube(normal);

          objectColor = TriplanarMapping(
            debug,
            TransformCube(position),
            normal
          );

        #else
          #ifdef EARTH_TEXTURE
            normalColor = UsePlainTexture(
              earthNormal, TransformSphere(position)
            ).rgb;

            normalColor  = normalize(normalColor * 2.0 - 1.0);
            normalColor *= normalize(LIGHT.position);

            vec4 earthTexture = UsePlainTexture(
              earthColor, TransformSphere(position)
            );

            objectColor = mix(
              vec3(1.0), earthTexture.rgb,
              smoothstep(1.0, 0.99, abs(earthTexture.a * 0.72))
            );

          #else
            // Update normal vector rotation:
            RotateSphere(normal);

            objectColor = TriplanarMapping(
              green,
              TransformSphere(position),
              normal
            );
          #endif
        #endif
      }
    }

    // Define object color and lighting when hitted:
    color += Lighting(position, rayDirection, objectColor, normalColor);

    // Set fog based on object & background colors:
    UseFog(color, backgroundColor, object.x);
  }

  else {
    // Sky background color:
    color += backgroundColor - max(0.9 * rayDirection.y, 0.0);
  }

  return color;
}
