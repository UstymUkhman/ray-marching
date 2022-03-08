// [PRIMITIVE DISTANCE FUNCTIONS]
// https://iquilezles.org/www/articles/distfunctions/distfunctions.htm

float Box (in vec3 position, in vec3 bound) {
	vec3 distance = abs(position) - bound;

	return length(max(distance, vec3(0.0))) +
         // "MaxVec3" is from "utils.glsl":
         MaxVec3(min(distance, vec3(0.0)));
}

float RoundBox (in vec3 position, in vec3 bound, in float radius) {
	vec3 distance = abs(position) - bound;

  return length(max(distance, 0.0)) +
         // "MinVec3" is from "utils.glsl":
         min(MinVec3(distance), 0.0) - radius;
}

float Sphere (in vec3 position, in float radius) {
	return length(position) - radius;
}

float Plane (in vec3 position, in vec3 normal, in float distanceFromOrigin) {
	return dot(position, normal) + distanceFromOrigin;
}
