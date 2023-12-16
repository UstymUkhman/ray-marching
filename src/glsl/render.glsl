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

  #ifdef EARTH_CLOUDS
    uniform sampler2D earthClouds;
  #endif

  #ifdef EARTH_LIGHT
    uniform sampler2D earthLight;
  #endif

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
vec3 Render (in vec3 color, in vec2 uv) {
  float lightIntensity = 0.0;
  vec3 rayOrigin = MouseMove();
  vec3 backgroundColor = vec3(0.0);

  mat3 camera = Camera(rayOrigin, LOOK_AT);
  vec3 rayDirection = camera * normalize(vec3(uv, FOV));

  // Get raymarching distance result:
  vec2 object = Raycast(rayOrigin, rayDirection, false);

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

      if (objectID == 3) {
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

            objectColor = earthTexture.rgb;

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
    vec3 light = Lighting(position, rayDirection, objectColor, normalColor);
    lightIntensity = light.r + light.g + light.b;
    color += light;

    #ifdef EARTH_LIGHT
      if (objectID == 1) {
        // Calculate light factor in dark zones:
        float lightAmmount = lightIntensity / 3.0;
        float lightFactor = 1.0 - lightAmmount;
        lightFactor -= lightAmmount / 2.0;

        if (lightFactor > 0.95) {
          vec4 lightTexture = UsePlainTexture(
            earthLight, TransformSphere(position)
          );

          // Update earth color with light texture only in dark zones:
          color = color + vec3(lightFactor) * lightTexture.rgb;
        }
      }
    #endif

    // Set fog based on object & background colors:
    UseFog(color, backgroundColor, object.x);
  }

  else {
    // Sky background color:
    color += backgroundColor - max(0.9 * rayDirection.y, 0.0);
  }

  #if defined(EARTH_TEXTURE) && defined(EARTH_CLOUDS)
    // Get raymarching clouds distance result:
    float cloudsDistance = Raycast(rayOrigin, rayDirection, true).x;

    if (cloudsDistance < RAY.distance) {
      // Define ray's current position based on its
      // origin, direction and hitted object's position:
      vec3 position = rayOrigin + cloudsDistance * rayDirection;

      // Update clouds position and rotation:
      vec3 cloudsPosition = TransformClouds(position);

      vec4 cloudsTexture = UsePlainTexture(
        earthClouds, cloudsPosition
      );

      // Calculate clouds texture alpha value:
      float alpha = min(
        cloudsTexture.g * lightIntensity * SPHERE.cloudsOpacity,
        1.0
      );

      // Calculate clouds color based on its alpha and earth color:
      float colorFactor = 1.0 + (SPHERE.radius - SPHERE.cloudsRadius);
      vec3 cloudsColor = mix(color, cloudsTexture.rgb, alpha) * colorFactor;

      // Add more clouds on poles to hide texture mapping imperfections:
      // cloudsColor = mix(
      //   cloudsColor, vec3(SPHERE.cloudsOpacity),
      //   smoothstep(0.9, 1.0, cloudsTexture.a * 0.7125)
      // );

      color = cloudsColor;
    }
  #endif

  return color;
}
