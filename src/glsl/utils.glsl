// [From HG_SDF: https://mercury.sexy/hg_sdf/]
// A GLSL library for building signed distance functions.

void pointRotation (inout vec2 point, in float angle) {
	point = cos(angle) * point + sin(angle) * vec2(point.y, -point.x);
}

void pointRotation45 (inout vec2 point) {
	point = (point + vec2(point.y, -point.x)) * sqrt(0.5);
}

float maxVec3 (in vec3 vector) {
	return max(max(vector.x, vector.y), vector.z);
}

// Tweak normal values for spherical meshes:
vec3 SphericalNormal (in vec3 normal) {
  normal  = abs(normal);
  normal  = pow(normal, vec3(5.0));
  normal /= normal.x + normal.y + normal.z;

  return normal;
}
