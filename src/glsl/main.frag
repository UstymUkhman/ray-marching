#version 300 es

#ifndef GL_FRAGMENT_PRECISION_HIGH
  precision mediump float;
#else
  precision highp float;
#endif

// Screen resolution:
uniform vec2 resolution;

// Output color:
out vec4 fragColor;

// Field of View:
const float FOV = 1.0;

// Objects IDs:
struct ID
{
  int sphere;
};

const ID IDs = ID(1);

// Ray configs:
struct Ray
{
  int steps;      // Max ray steps
  float distance; // Max ray distance
  float epsilon;  // Precision to surface
};

const Ray RAY = Ray(256, 500.0, 0.001);


// Map ray to scene:
vec2 mapScene (in vec3 ray) {
  // Infinite object repetition:
  ray = mod(ray, 3.0) - 3.0 * 0.5;

  // Create a sphere at the center of the screen:
  float distance = length(ray) - 1.0;

  // Distance to sphere with its ID:
  vec2 sphere = vec2(distance, IDs.sphere);

  return sphere;
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
    color += 3.0 / object.x;
  }
}

void main (void) {
  vec3 color = vec3(0.0);

  // Normalize coords to be at the center of the screen:
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;

  render(color, uv);

  fragColor = vec4(color, 1.0);
}
