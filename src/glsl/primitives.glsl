// [PRIMITIVE DISTANCE FUNCTIONS]
// https://iquilezles.org/www/articles/distfunctions/distfunctions.htm

float Sphere (in vec3 position, in float radius) {
	return length(position) - radius;
}

float Plane (in vec3 position, in vec3 normal, in float distanceFromOrigin) {
	return dot(position, normal) + distanceFromOrigin;
}
