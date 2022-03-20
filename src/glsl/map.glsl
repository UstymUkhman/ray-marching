#include "primitives.glsl";
#include "pedestal.glsl";
#include "bump.glsl";

// Map ray to scene:
vec2 MapScene (in vec3 ray) {
  // Map result:
  vec2 scene = Pedestal(ray);

  #ifdef DEBUGGING_CUBE
    // Translate & rotate cube coordinates:
    vec3 position = TransformCube(vec3(ray));

    // Create a box at the center of the screen:
    float boxDistance = Box(position, vec3(CUBE.size));

    #ifdef BUMP_MAPPING
      // Apply bump factor to box distance value:
      boxDistance += BumpMapping(position, boxDistance);
      boxDistance += CUBE.bump;
    #endif

    // Distance to box with its ID:
    vec2 box = vec2(boxDistance, IDs.box);

    return MergeObjects(scene, box);

  #else
    // Translate & rotate sphere coordinates:
    vec3 position = TransformSphere(vec3(ray));

    // Get sphere's current radius distortion:
    float radius = SPHERE.radius + Distortion(position);

    // Create a sphere at the center of the screen:
    float sphereDistance = Sphere(position, radius);

    #ifdef BUMP_MAPPING
      // Apply bump factor to sphere distance value:
      sphereDistance += BumpMapping(position, sphereDistance);
      sphereDistance += SPHERE.bump;
    #endif

    // Distance to sphere with its ID:
    vec2 sphere = vec2(sphereDistance, IDs.sphere);

    return MergeObjects(scene, sphere);
  #endif
}

// Map ray to clouds:
vec2 MapClouds (in vec3 ray) {
  // Translate & rotate clouds coordinates:
  vec3 position = TransformSphere(vec3(ray));

  // Get clouds's current radius:
  float radius = SPHERE.cloudsRadius;

  // Create a sphere around the earth globe:
  float cloudsDistance = Sphere(position, radius);

  // Distance to clouds with its ID:
  return vec2(cloudsDistance, IDs.clouds);
}
