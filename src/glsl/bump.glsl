uniform sampler2D bump;

// [Bump Mapping]
// Get texture color value for small distance
// from objects by using triplanar mapping method:
float BumpMapping (in vec3 position, in float distance, in float factor) {
  float amount = 0.0;

  if (distance < 0.1) {
    // Use green channel from texture
    // to get bump value in this point:
    amount += factor * TriplanarMapping(
      bump,
      position,
      normalize(position + factor)
    ).g;
  }

  return amount;
}
