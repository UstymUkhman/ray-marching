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

// Field of View:
const float FOV = 1.0;

// Objects IDs:
struct ID
{
  int plane;
  int sphere;
};

const ID IDs = ID(1, 2);

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
  // Infinite objects repetition:
  // ray = mod(ray, 3.0) - 3.0 * 0.5;

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
vec2 rayMarch (in vec3 origin, in vec3 direction) {
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
  vec2 epsilon = vec2(RAY.epsilon, 0.0);

  vec3 normal = vec3(
    mapScene(position).x - vec3(
      mapScene(position - epsilon.xyy).x,
      mapScene(position - epsilon.yxy).x,
      mapScene(position - epsilon.yyx).x
    )
  );

  return normalize(normal);
}

// Lambertian Shading Model
// REFLECTED_LIGHT = dot(LIGHT_DIRECTION, SURFACE_NORMAL):
vec3 getLight (in vec3 position, in vec3 direction, in vec3 color) {
  vec3 lightDirection = normalize(LIGHT - position);
  vec3 surfaceNormal = getSurfaceNormal(position);

  float reflected = dot(lightDirection, surfaceNormal);
  return color * clamp(reflected, 0.0, 1.0);
}

// Initialize ray origin and direction for
// each pixel and render elements on scene:
void render (inout vec3 color, in vec2 uv) {
  vec3 rayOrigin = vec3(0.0, 0.0, -3.0);
  vec3 rayDirection = normalize(vec3(uv, FOV));

  // Get raymarching distance result:
  vec2 object = rayMarch(rayOrigin, rayDirection);

  // Object hit, ray distance is
  // closer than max ray distance:
  if (object.x < RAY.distance) {
    // Define ray's current position based on its
    // origin, direction and hitted object's position:
    vec3 position = rayOrigin + object.x * rayDirection;

    // Define object color and lighting when hitted:
    color += getLight(position, rayDirection, vec3(1.0));
  }
}

void main (void) {
  vec3 color = vec3(0.0);

  // Normalize coords to be at the center of the screen:
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;

  render(color, uv);

  fragColor = vec4(color, 1.0);
}
