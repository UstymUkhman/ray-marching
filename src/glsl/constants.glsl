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

const float FOV          = 2.5;                     // Field of View
const float GAMMA        = 1.0 / 2.2;               // Gamma Correction
const vec3  LOOK_AT      = vec3(0.0);               // Camera orientation

const ID  IDs            = ID(1, 2);                // Object IDs
const Ray RAY            = Ray(256, 500.0, 0.001);  // Raycast configs

const float AMBIENT      = 0.05;                    // Ambient factor
const vec3  SPECULAR     = vec3(0.5);               // Specular color
const vec3  BACKGROUND   = vec3(0.5, 0.8, 0.9);     // Skybox color
const vec3  LIGHT        = vec3(20.0, 40.0, -30.0); // Light color

const vec3  FOG_COLOR    = vec3(0.5);               // Fog color
const float FOG_DENSITY  = 0.0005;                  // Fog density

// Object colors:
const vec3 COLORS[2] = vec3[2]
(
  vec3(0.0),                    // Plane
  vec3(0.54, 0.02745, 0.02745)  // Sphere
);
