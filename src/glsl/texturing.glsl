// Debug Texture:
uniform sampler2D debug;

// [Triplanar Texture Mapping]
vec3 triplanarMapping (in vec3 position) {
  // UV vector for texture color:
  vec3 uv = position * CUBE.scale;

  // Get absolute normal vector for each position:
  vec3 normal = abs(SurfaceNormal(position, 1));

  // Multiply texture color value by the
  // normal vector corresponding to each face:
  return (
    texture(debug, uv.yz * 0.5 + 0.5) * normal.x +
    texture(debug, uv.xz * 0.5 + 0.5) * normal.y +
    texture(debug, uv.xy * 0.5 + 0.5) * normal.z
  ).rgb;
}
