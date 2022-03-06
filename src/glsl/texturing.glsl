// Debug Texture:
uniform sampler2D debug;
// uniform sampler2D green;
// uniform sampler2D black;
// uniform sampler2D white;
// uniform sampler2D bump;

// [Triplanar Texture Mapping]
vec3 triplanarMapping (in vec3 position, in vec3 normal) {
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
    texture(debug, uv.yz * 0.5 + 0.5) * normal.x +
    texture(debug, uv.xz * 0.5 + 0.5) * normal.y +
    texture(debug, uv.xy * 0.5 + 0.5) * normal.z
  ).rgb;
}
