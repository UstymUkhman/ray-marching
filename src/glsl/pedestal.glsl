vec2 Pedestal (in vec3 position) {
  // Create bottom plane (ground):
  float planeDistance = Plane(position, vec3(0.0, 1.0, 0.0), 5.0);

  // Distance to plane with its ID:
  vec2 plane = vec2(planeDistance, IDs.plane);

  // Create pedestal on the ground:
  vec3 basePosition = vec3(position);
  basePosition.y += BASE.bottomOffset;

  float baseDistance = RoundBox(
    basePosition, vec3(BASE.bottomSize), BASE.radius
  );

  // Distance to pedestal base with its ID:
  vec2 base = vec2(baseDistance, IDs.pedestal);

  // Create pedestal upper stair:
  vec3 pedestalPosition = vec3(position);
  pedestalPosition.y += BASE.topOffset;

  float pedestalDistance = RoundBox(
    pedestalPosition, vec3(BASE.topSize), BASE.radius
  );

  // Create pedestal stairs from its base:
  vec2 pedestal = vec2(pedestalDistance, IDs.pedestal);
  pedestal = MergeObjectsStairs(base, pedestal, 2.0, 3.0);

  // Merge ground and pedestal by
  // using a "Soft" distance function:
  return MergeObjectsSoft(plane, pedestal, 0.5);
}
