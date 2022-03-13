#ifdef EARTH_TEXTURE
  uniform sampler2D earthBump;

#else
  uniform sampler2D bump;
#endif

// [Bump Mapping]
// Get texture color value for small distance
// from objects by using triplanar mapping method:
float BumpMapping (in vec3 position, in float distance) {
  float scale = 1.0;
  float amount = 0.0;
  float factor = 0.1;

  #ifdef DEBUGGING_CUBE
    scale = CUBE.scale;
    factor = CUBE.bump;

  #else
    scale = SPHERE.scale;
    factor = SPHERE.bump;
  #endif

  if (distance < 0.1) {
    // Use green channel from texture
    // to get bump value in this point:
    #ifdef EARTH_TEXTURE
      return -factor * UsePlainTexture(
        earthBump, position
      ).g * scale;

    #else
      return factor * TriplanarMapping(
        bump,
        position * scale,
        normalize(position + factor)
      ).g;
    #endif
  }

  return 0.0;
}
