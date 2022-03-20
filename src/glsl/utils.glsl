// [From HG_SDF: https://mercury.sexy/hg_sdf/]
// A GLSL library for building signed distance functions.

void PointRotation (inout vec2 point, in float angle) {
	point = cos(angle) * point + sin(angle) * vec2(point.y, -point.x);
}

void PointRotation45 (inout vec2 point) {
	point = (point + vec2(point.y, -point.x)) * sqrt(0.5);
}

float MinVec3 (in vec3 vector) {
	return min(vector.x, min(vector.y, vector.z));
}

float MaxVec3 (in vec3 vector) {
	return max(max(vector.x, vector.y), vector.z);
}

// Merge objects by returning the closest to the camera:
vec2 MergeObjects (in vec2 object1, in vec2 object2) {
  return object1.x < object2.x ? object1 : object2;
}

// Smooth objects blend based on the distance from each point:
vec2 MergeByDistance (in vec2 object1, in vec2 object2, in float distance) {
  return object1.x < object2.x ? vec2(distance, object1.y) : vec2(distance, object2.y);
}

// Merge objects by producing [steps - 1] steps of a staircase:
vec2 MergeObjectsStairs (in vec2 object1, in vec2 object2, in float radius, in float steps) {
	float size = radius / steps;
	float merge = object2.x - radius;

	float distance = min(
    min(object1.x, object2.x),
    0.5 * (merge + object1.x + abs((
      mod(merge - object1.x + size, 2.0 * size)
    ) - size))
  );

  return MergeByDistance(object1, object2, distance);
}

vec2 MergeObjectsRound (in vec2 object1, in vec2 object2, in float radius) {
	vec2 merge = max(vec2(radius - object1.x, radius - object2.x), vec2(0.0));
	float distance = max(radius, min(object1.x, object2.x)) - length(merge);
  return MergeByDistance(object1, object2, distance);
}

vec2 MergeObjectsSoft (in vec2 object1, in vec2 object2, in float radius) {
	float epsilon = max(radius - abs(object1.x - object2.x), 0.0);
	float distance = min(object1.x, object2.x) - epsilon * epsilon * 0.25 / radius;
  return MergeByDistance(object1, object2, distance);
}
