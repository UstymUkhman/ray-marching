#include "map.glsl";

vec3 SurfaceNormal (in vec3 position, in int complexity) {
  vec3 normal = vec3(0.0);

  if (complexity == 1) {
    // Approximation hack to get vector normal by subtracting
    // a small number from a given position on object's surface:
    vec2 epsilon = vec2(RAY.epsilon, 0.0);

    normal = vec3(
      MapScene(position).x - vec3(
        MapScene(position - epsilon.xyy).x,
        MapScene(position - epsilon.yxy).x,
        MapScene(position - epsilon.yyx).x
      )
    );
  }

  else if (complexity == 2) {
    // https://iquilezles.org/www/articles/normalsSDF/normalsSDF.htm
    vec2 epsilon = vec2(1.0, -1.0) * 0.5773 * 0.0005;

    normal = vec3(
      epsilon.xyy * MapScene(position + epsilon.xyy).x +
      epsilon.yyx * MapScene(position + epsilon.yyx).x +
      epsilon.yxy * MapScene(position + epsilon.yxy).x +
      epsilon.xxx * MapScene(position + epsilon.xxx).x
    );
  }

  else {
    // A way to prevent the compiler from inlining "MapScene" 4 times:
    for (int i = 0; i < 4; i++) {
      vec3 epsilon = (
        vec3(
          (((i + 3) >> 1) & 1),
          ((i >> 1) & 1),
          (i & 1)
        ) * 2.0 - 1.0
      ) * 0.5773;

      normal += epsilon * MapScene(position + epsilon * 0.0005).x;
    }
  }

  return normalize(normal);
}
