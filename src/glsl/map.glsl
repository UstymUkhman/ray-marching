// Delta time:
uniform float time;

#include "bump.glsl";

#ifdef DEBUGGING_CUBE
  #include "cube.glsl";

#else
  #include "sphere.glsl";
#endif

#include "primitives.glsl";

// Map ray to scene:
vec2 mapScene (in vec3 ray) {
  // Map result:
  vec2 scene = vec2(0.0);

  // Create bottom plane (ground):
  float planeDistance = Plane(ray, vec3(0.0, 1.0, 0.0), 5.0);

  // Distance to plane with its ID:
  vec2 plane = vec2(planeDistance, IDs.plane);

  // Create pedestal on the ground:
  vec3 pedestalPosition = vec3(ray);
  pedestalPosition.y += PEDESTAL.offset;

  float pedestalDistance = RoundBox(
    pedestalPosition, vec3(PEDESTAL.size), 0.25
  );

  // Distance to pedestal with its ID:
  vec2 pedestal = vec2(pedestalDistance, IDs.pedestal);

  // Merge ground and pedestal by
  // using a "Soft" distance function:
  scene = MergeObjectsSoft(plane, pedestal, 0.5);

  #ifdef DEBUGGING_CUBE
    // Translate & rotate cube coordinates:
    vec3 position = TransformCube(vec3(ray));

    // Create a box at the center of the screen:
    float boxDistance = Box(position, vec3(CUBE.size));

    // Apply bump factor to box distance value:
    boxDistance += BumpMapping(position, boxDistance);
    boxDistance += CUBE.bump;

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

    // Apply bump factor to sphere distance value:
    sphereDistance += BumpMapping(position, sphereDistance);
    sphereDistance += SPHERE.bump;

    // Distance to sphere with its ID:
    vec2 sphere = vec2(sphereDistance, IDs.sphere);

    return MergeObjects(scene, sphere);
  #endif
}
