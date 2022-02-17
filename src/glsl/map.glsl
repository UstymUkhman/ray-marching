// Delta time:
uniform float time;

#include "primitives.glsl";

float sphereDisplacement (in vec3 position) {
  float timeSin = sin(time);

  // From "mouse.glsl":
  rotatePosition(position.yz, timeSin);

  return sin(position.x + time * 2.0) *
         sin(position.y + timeSin   ) *
         sin(position.z + time * 4.0) / 2.5;
}

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

  // Create a sphere at the center of the screen:
  float sphereDistance = Sphere(ray, 3.0 + sphereDisplacement(ray));

  // Distance to sphere with its ID:
  vec2 sphere = vec2(sphereDistance, IDs.sphere);

  return mergeObjects(plane, sphere);
}
