// Macros:
#define DYNAMIC_FOG
#define BUMP_MAPPING
#define SOFT_SHADOWS

#define EARTH_CLOUDS
#define EARTH_TEXTURE
// #define DEBUGGING_CUBE

#define ANTI_ALIASING 4
#define AMBIENT_OCCLUSSION

#define PI          3.14159265358979323846
#define RAD         PI * 0.5
#define TAU         PI * 2.0

#define PHI         sqrt(5.0) * 0.5 + 0.5
#define saturate(x) clamp(x, 0.0, 1.0)

// Configs:
const struct ID {
  int box;
  int plane;
  int sphere;
  int clouds;
  int pedestal;
};

const struct Fog {
  vec3  color;
  float density;
};

const struct Ray {
  int   steps;
  float distance;
  float epsilon;
};

const struct Light {
  vec3  position;
  float distance;
  float size;
  float min;
  float max;
};

const struct Base {
  float radius;
  float topSize;
  float topOffset;
  float bottomSize;
  float bottomOffset;
};

#ifdef DEBUGGING_CUBE
  const struct Cube {
    float size;
    float scale;
    float bump;
  };

#else
  const struct Globe {
    float cloudsOpacity;
    float cloudsRadius;
    float distortion;
    float radius;
    float scale;
    float bump;
  };
#endif

// Scene & Camera:
const float FOV          = 2.5;             // Field of View
const float GAMMA        = 1.0 / 2.2;       // Gamma Correction
const vec3  LOOK_AT      = vec3(0.0);       // Camera orientation
const vec2  POSITION     = vec2(0.0, -5.0); // Ray origin initial position

// Lighting:
const float AMBIENT      = 0.05;      // Ambient factor
const float FRESNEL      = 0.25;      // Fresnel factor
const float REFLECTION   = 0.05;      // Reflection amout
const vec3  SPECULAR     = vec3(0.5); // Specular color

// Ambient Occlussion:
const int   AO_STEPS     = 8;    // Occlussion steps to perform
const float AO_FACTOR    = 0.85; // Occlussion factor at each step
const float AO_INTENSITY = 0.75; // Average occlusion intensity

const Base BASE = Base(
  0.25, // Radius
  3.0,  // Top Size
  6.5,  // Top Offset
  5.0,  // Bottom Size
  9.5   // Bottom Offset
);

#ifdef DEBUGGING_CUBE
  const Cube CUBE = Cube(
    2.5,       // Size
    1.0 / 2.5, // Scale
    0.15       // Bump Factor
  );

#else
  const Globe SPHERE = Globe(
    0.5,       // Clouds Opacity
    2.95,      // Clouds Radius
    0.0,       // Distortion
    3.0,       // Radius
    3.0 / RAD, // Scale

    // Bump Factor:
    #ifdef EARTH_TEXTURE
      0.15
    #else
      0.12
    #endif
  );
#endif

#ifdef EARTH_TEXTURE
  const Light LIGHT = Light(
    vec3(60.0, 20.0, -45.0), // Position
    0.05,                    // Initial distance
    0.09,                    // Size
    0.0001,                  // Min light distance
    60.0                     // Max light distance
  );

#else
  const Light LIGHT = Light(
    vec3(20.0, 40.0, -30.0), // Position
    0.01,                    // Initial distance
    0.03,                    // Size
    0.0001,                  // Min light distance
    60.0                     // Max light distance
  );
#endif

const Fog FOG = Fog(
  vec3(0.5, 0.8, 0.9), // Color
  0.00025              // Density
);

const Ray RAY = Ray(
  256,   // Max ray steps
  500.0, // Max ray distance
  0.001  // Precision to surface
);

const ID IDs = ID(
  0, // Box
  1, // Plane
  2, // Sphere
  3, // Clouds
  4  // Pedestal
);
