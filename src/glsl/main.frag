#version 300 es

#ifndef GL_FRAGMENT_PRECISION_HIGH
  precision mediump float;
#else
  precision highp float;
#endif

#include "utils/hg_sdf.web.glsl";

// Screen resolution:
uniform vec2 resolution;

// Output color:
out vec4 fragColor;

// Focal Length:
const float FL = 2.5;

// Field of View:
const float FOV = 1.0;

// Gamma Correction:
const float GAMMA = 1.0 / 2.2;

// Object IDs:
struct ID
{
  int plane;
  int sphere;
};

const ID IDs = ID(1, 2);

// Object colors:
const vec3 COLORS[2] = vec3[2]
(
  vec3(0.0, 0.5, 0.5), // Plane
  vec3(0.9, 0.9, 0.0)  // Sphere
);

// Ray configs:
struct Ray
{
  int steps;      // Max ray steps
  float distance; // Max ray distance
  float epsilon;  // Precision to surface
};

const Ray RAY = Ray(256, 500.0, 0.001);

const vec3 LIGHT = vec3(20.0, 40.0, -30.0);

vec2 mergeObjects (in vec2 object1, in vec2 object2) {
  // Return closest object from the camera:
  return object1.x < object2.x ? object1 : object2;
}

// Map ray to scene:
vec2 mapScene (in vec3 ray) {
  // Create bottom plane (ground):
  float planeDistance = fPlane(ray, vec3(0.0, 1.0, 0.0), 1.0);

  // Distance to plane with its ID:
  vec2 plane = vec2(planeDistance, IDs.plane);

  // Create a sphere at the center of the screen:
  float sphereDistance = fSphere(ray, 1.0);

  // Distance to sphere with its ID:
  vec2 sphere = vec2(sphereDistance, IDs.sphere);

  return mergeObjects(plane, sphere);
}

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

vec3 getSurfaceNormal (in vec3 position) {
  // Approximation hack to get vector normal by subtracting
  // a small number from a given position on object's surface:
  /* vec2 epsilon = vec2(RAY.epsilon, 0.0);

  vec3 normal = vec3(
    mapScene(position).x - vec3(
      mapScene(position - epsilon.xyy).x,
      mapScene(position - epsilon.yxy).x,
      mapScene(position - epsilon.yyx).x
    )
  );

  return normalize(normal); */

  // https://iquilezles.org/www/articles/normalsSDF/normalsSDF.htm
  /* vec2 epsilon = vec2(1.0, -1.0) * 0.5773 * 0.0005;

  return normalize(
    epsilon.xyy * mapScene(position + epsilon.xyy).x +
    epsilon.yyx * mapScene(position + epsilon.yyx).x +
    epsilon.yxy * mapScene(position + epsilon.yxy).x +
    epsilon.xxx * mapScene(position + epsilon.xxx).x
  ); */

  // A way to prevent the compiler from inlining "mapScene" 4 times:
  vec3 normal = vec3(0.0);

  for (int i = 0; i < 4; i++) {
    vec3 epsilon = (
      vec3(
        (((i + 3) >> 1) & 1),
        ((i >> 1) & 1),
        (i & 1)
      ) * 2.0 - 1.0
    ) * 0.5773;

    normal += epsilon * mapScene(position + epsilon * 0.0005).x;
  }

  return normalize(normal);
}

// Lambertian Shading Model
// REFLECTED_LIGHT = dot(LIGHT_DIRECTION, SURFACE_NORMAL):
vec3 getLight (in vec3 position, in vec3 direction, in vec3 color) {
  vec3 lightDirection = normalize(LIGHT - position);
  vec3 surfaceNormal = getSurfaceNormal(position);

  float reflected = dot(lightDirection, surfaceNormal);
  vec3 diffuse = color * clamp(reflected, 0.0, 1.0);

  // Get shadows by comparing distance from current
  // position to the closest object with distance
  // (from current position) to the light source:
  float lightDistance = length(LIGHT - position);

  float objectDistance = raycast(
    position + surfaceNormal * 0.02,
    normalize(LIGHT)
  ).x;

  // Distance to object is smaller than distance
  // to the light source, this point is in shadow:
  if (objectDistance < lightDistance) {
    return vec3(0.0);
  }

  return diffuse;
}

vec3 getGroundPattern (in vec2 position, in vec2 dpdx, in vec2 dpdy) {
  // // https://iquilezles.org/www/articles/checkerfiltering/checkerfiltering.htm
  // position *= 3.0;
  // dpdx *= 3.0;
  // dpdy *= 3.0;

  // // Kernel Filter:
  // vec2 w = abs(dpdx) + abs(dpdy) + 0.001;

  // // Analytical integral (box filter):
  // vec2 i = (
  //   abs(fract((position - 0.5 * w) * 0.5) - 0.5) -
  //   abs(fract((position + 0.5 * w) * 0.5) - 0.5)
  // ) * 2.0 / w;

  // // XOR pattern:
  // float xor = 0.5 - i.x * i.y * 0.5;

  // return xor * vec3(0.05) + 0.15;

  return vec3(0.3 + 0.2 * mod(
    floor(position.x) +
    floor(position.y),
    2.0
  ));
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

      objectColor = getGroundPattern(position.xz, dpdx.xz, dpdy.xz);
    }

    else {
      objectColor = getColorByID(objectID);
    }

    // Define object color and lighting when hitted:
    color += getLight(position, rayDirection, objectColor);
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
