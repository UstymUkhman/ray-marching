// [Ambient Occlussion]
float ambientOcclussion (in vec3 position, in vec3 normal) {
  float weight = 1.0;
  float amount = 0.0;

  for (int s = 0; s < AO_STEPS; s++) {
    // Get length of the current point:
    float length = 0.01 + 0.02 * pow(float(s), 2.0);

    // Cast ray along the "normal" vector and get distance
    // between the current point and the closest surface:
    float distance = mapScene(position + normal * length).x;

    // Add occlusion amount to the
    // current point on the surface:
    amount += (length - distance) * weight;

    // Reduce occlussion weight
    // for the next point:
    weight *= AO_FACTOR;
  }

  // Occlusion result for the current point on the surface:
  return 1.0 - clamp(AO_INTENSITY * amount, 0.0, 1.0);
}
