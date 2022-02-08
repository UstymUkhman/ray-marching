// Macros:
#define PI          3.14159265358979323846
#define RAD         PI * 0.5
#define TAU         PI * 2.0

#define PHI         sqrt(5.0) * 0.5 + 0.5
#define saturate(x) clamp(x, 0.0, 1.0)

// Configs:
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

// Scene & Camera:
const float FOV          = 2.5;                     // Field of View
const float GAMMA        = 1.0 / 2.2;               // Gamma Correction
const vec3  LOOK_AT      = vec3(0.0);               // Camera orientation
const vec3  POSITION     = vec3(0.0, -5.0, -15.0);  // Ray origin initial position

const ID  IDs            = ID(1, 2);                // Object IDs
const Ray RAY            = Ray(256, 500.0, 0.001);  // Raycast configs

// Lighting:
const float AMBIENT      = 0.05;                    // Ambient factor
const float FRESNEL      = 0.25;                    // Fresnel factor

// Colors:
const vec3  SPECULAR     = vec3(0.5);               // Specular color
const vec3  BACKGROUND   = vec3(0.5, 0.8, 0.9);     // Skybox color
const vec3  LIGHT        = vec3(20.0, 40.0, -30.0); // Light color

// Fog:
const vec3  FOG_COLOR    = vec3(0.5);               // Fog color
const float FOG_DENSITY  = 0.00025;                 // Fog density
