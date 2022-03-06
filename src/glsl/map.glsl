// Delta time:
uniform float time;

#include "bump.glsl";

#ifdef DEBUGGING_CUBE
  #include "cube.glsl";

#else
  #include "sphere.glsl";
#endif

#include "primitives.glsl";

vec2 mergeObjects (in vec2 object1, in vec2 object2) {
  // Return closest object from the camera:
  return object1.x < object2.x ? object1 : object2;
}

// Map ray to scene:
vec2 mapScene (in vec3 ray) {
  // Create bottom plane (ground):
  float planeDistance = Plane(ray, vec3(0.0, 1.0, 0.0), 4.0);

  // Distance to plane with its ID:
  vec2 plane = vec2(planeDistance, IDs.plane);

  #ifdef DEBUGGING_CUBE
    // Translate & rotate cube coordinates:
    vec3 position = transformCube(vec3(ray));

    // Create a box at the center of the screen:
    float boxDistance = Box(position, vec3(CUBE.size));

    // Apply bump factor to box distance value:
    // boxDistance += BumpMapping(position, boxDistance, CUBE.bump);
    // boxDistance += CUBE.bump;

    // Distance to box with its ID:
    vec2 box = vec2(boxDistance, IDs.box);

    return mergeObjects(plane, box);

  #else
    // Translate & rotate sphere coordinates:
    vec3 position = transformSphere(vec3(ray));

    // Get sphere's current radius distortion:
    float radius = SPHERE.radius + Distortion(position);

    // Create a sphere at the center of the screen:
    float sphereDistance = Sphere(position, radius);

    // Apply bump factor to sphere distance value:
    sphereDistance += BumpMapping(position, sphereDistance, SPHERE.bump);
    sphereDistance += SPHERE.bump;

    // Distance to sphere with its ID:
    vec2 sphere = vec2(sphereDistance, IDs.sphere);

    return mergeObjects(plane, sphere);
  #endif
}
