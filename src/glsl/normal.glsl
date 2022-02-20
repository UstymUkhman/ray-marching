#include "map.glsl";

vec3 SurfaceNormal (in vec3 position, in int complexity) {
  vec3 normal = vec3(0.0);

  if (complexity == 1) {
    // Approximation hack to get vector normal by subtracting
    // a small number from a given position on object's surface:
    vec2 epsilon = vec2(RAY.epsilon, 0.0);

    normal = vec3(
      mapScene(position).x - vec3(
        mapScene(position - epsilon.xyy).x,
        mapScene(position - epsilon.yxy).x,
        mapScene(position - epsilon.yyx).x
      )
    );
  }

  else if (complexity == 2) {
    // https://iquilezles.org/www/articles/normalsSDF/normalsSDF.htm
    vec2 epsilon = vec2(1.0, -1.0) * 0.5773 * 0.0005;

    normal = vec3(
      epsilon.xyy * mapScene(position + epsilon.xyy).x +
      epsilon.yyx * mapScene(position + epsilon.yyx).x +
      epsilon.yxy * mapScene(position + epsilon.yxy).x +
      epsilon.xxx * mapScene(position + epsilon.xxx).x
    );
  }

  else {
    // A way to prevent the compiler from inlining "mapScene" 4 times:
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
  }

  return normalize(normal);
}
