#include "render.glsl";

// [Anti-Aliasing] (RGSS)
vec2 UV (in vec2 offset) {
  // Get UV with rotated grid offset:
  vec2 uv = gl_FragCoord.xy + offset;
  // Normalize coords to be at the center of the screen:
  return (uv * 2.0 - resolution.xy) / resolution.y;
}

vec3 RenderAAx1 (out vec3 color) {
  return Render(color, UV(vec2(0)));
}

vec3 RenderAAx2 (out vec3 color) {
  int coordMod = int(gl_FragCoord.x + gl_FragCoord.y) & 1;
  float inverseCoordMod = 1.0 - float(coordMod);

  vec2 inverseRotation = vec2(0.33 * inverseCoordMod, 0.0);
  vec2 rotation = vec2(0.33 * float(coordMod), 0.66);

  color = Render(color, UV(inverseRotation)) +
          Render(color, UV(rotation));

  return color / 2.0;
}

vec3 RenderAAx3 (out vec3 color) {
  int coordMod = int(gl_FragCoord.x + gl_FragCoord.y) & 1;
  float inverseCoordMod = 1.0 - float(coordMod);

  vec2 inverseRotation = vec2(0.66 * inverseCoordMod, 0.0);
  vec2 rotation = vec2(0.66 * float(coordMod), 0.66);
  vec2 noRotation = vec2(0.33, 0.33);

  color = Render(color, UV(inverseRotation)) +
          Render(color, UV(rotation))        +
          Render(color, UV(noRotation));

  return color / 3.0;
}

vec3 RenderAAx4 (out vec3 color) {
  // Sampling grid rotation:
  vec4 rotation = vec4(0.125, -0.125, 0.375, -0.375);

  color = Render(color, UV(rotation.xz)) +
          Render(color, UV(rotation.yw)) +
          Render(color, UV(rotation.wx)) +
          Render(color, UV(rotation.zy));

  return color / 4.0;
}
