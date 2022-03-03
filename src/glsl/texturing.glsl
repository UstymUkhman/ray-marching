// Debug Texture:
uniform sampler2D debug;

// [Triplanar Texture Mapping]
vec3 triplanarMapping (in vec3 position, in vec3 normal) {
  // UV vector for texture color:
  vec3 uv = position * CUBE.scale;

  normal  = abs(normal);
  // normal  = pow(normal, vec3(5.0));
  // normal /= normal.x + normal.y + normal.z;

  // Multiply texture color value by the
  // normal vector corresponding to each face:
  return (
    texture(debug, uv.yz * 0.5 + 0.5) * normal.x +
    texture(debug, uv.xz * 0.5 + 0.5) * normal.y +
    texture(debug, uv.xy * 0.5 + 0.5) * normal.z
  ).rgb;
}
