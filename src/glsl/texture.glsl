#include "utils.glsl";

// [Triplanar Texture Mapping]
vec3 TriplanarMapping (in sampler2D image, in vec3 position, in vec3 normal) {
  #ifdef DEBUGGING_CUBE
    // UV vector for texture color:
    vec3 uv = position * CUBE.scale;
    normal = abs(normal);

  #else
    // UV vector for texture color:
    vec3 uv = position * SPHERE.scale;

    // Update sphere normal vector:
    normal = SphericalNormal(normal);
  #endif

  // Multiply texture color value by the
  // normal vector corresponding to each face:
  return (
    texture(image, uv.yz * 0.5 + 0.5) * normal.x +
    texture(image, uv.xz * 0.5 + 0.5) * normal.y +
    texture(image, uv.xy * 0.5 + 0.5) * normal.z
  ).rgb;
}
