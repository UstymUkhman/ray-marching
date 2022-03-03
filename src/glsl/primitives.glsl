// [PRIMITIVE DISTANCE FUNCTIONS]
// https://iquilezles.org/www/articles/distfunctions/distfunctions.htm

float Box (in vec3 position, in vec3 bound) {
	vec3 distance = abs(position) - bound;

	return length(max(distance, vec3(0.0))) +
         // "maxVec3" is from "utils.glsl":
         maxVec3(min(distance, vec3(0.0)));
}

float Sphere (in vec3 position, in float radius) {
	return length(position) - radius;
}

float Plane (in vec3 position, in vec3 normal, in float distanceFromOrigin) {
	return dot(position, normal) + distanceFromOrigin;
}
