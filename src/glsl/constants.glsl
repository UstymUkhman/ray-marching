struct ID
{
  int plane;
  int sphere;
};

struct Ray
{
  int steps;      // Max ray steps
  float distance; // Max ray distance
  float epsilon;  // Precision to surface
};

const float FL          = 2.5;                      // Focal Length
const float FOV         = 1.0;                      // Field of View
const float GAMMA       = 1.0 / 2.2;                // Gamma Correction

const ID  IDs           = ID(1, 2);                 // Object IDs
const Ray RAY           = Ray(256, 500.0, 0.001);   // Raycast configs

const vec3 LIGHT        = vec3(20.0, 40.0, -30.0);  // Light color
const vec3 BACKGROUND   = vec3(0.5, 0.8, 0.9);      // Skybox color

const vec3  FOG_COLOR   = vec3(0.5);                // Fog color
const float FOG_DENSITY = 0.0005;                   // Fog density

// Object colors:
const vec3 COLORS[2] = vec3[2]
(
  vec3(0.0, 0.5, 0.5), // Plane
  vec3(0.9, 0.9, 0.0)  // Sphere
);
