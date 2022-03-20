const p=function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const i of t)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&o(r)}).observe(document,{childList:!0,subtree:!0});function e(t){const i={};return t.integrity&&(i.integrity=t.integrity),t.referrerpolicy&&(i.referrerPolicy=t.referrerpolicy),t.crossorigin==="use-credentials"?i.credentials="include":t.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(t){if(t.ep)return;t.ep=!0;const i=e(t);fetch(t.href,i)}};p();var h=`#version 300 es

#ifndef GL_FRAGMENT_PRECISION_HIGH
  precision mediump float;
#else
  precision highp float;
#endif

uniform vec2 resolution;

#define DYNAMIC_FOG
#define BUMP_MAPPING
#define SOFT_SHADOWS

#define EARTH_CLOUDS
#define EARTH_TEXTURE

#define ANTI_ALIASING 4
#define AMBIENT_OCCLUSSION

#define PI          3.14159265358979323846
#define RAD         PI * 0.5
#define TAU         PI * 2.0

#define PHI         sqrt(5.0) * 0.5 + 0.5
#define saturate(x) clamp(x, 0.0, 1.0)

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

const float FOV          = 2.5;             
const float GAMMA        = 1.0 / 2.2;       
const vec3  LOOK_AT      = vec3(0.0);       
const vec2  POSITION     = vec2(0.0, -5.0); 

const float AMBIENT      = 0.05;      
const float FRESNEL      = 0.25;      
const float REFLECTION   = 0.05;      
const vec3  SPECULAR     = vec3(0.5); 

const int   AO_STEPS     = 8;    
const float AO_FACTOR    = 0.85; 
const float AO_INTENSITY = 0.75; 

const Base BASE = Base(
  0.25, 
  3.0,  
  6.5,  
  5.0,  
  9.5   
);

#ifdef DEBUGGING_CUBE
  const Cube CUBE = Cube(
    2.5,       
    1.0 / 2.5, 
    0.15       
  );

#else
  const Globe SPHERE = Globe(
    0.5,       
    2.95,      
    0.0,       
    3.0,       
    3.0 / RAD, 

    
    #ifdef EARTH_TEXTURE
      0.15
    #else
      0.12
    #endif
  );
#endif

#ifdef EARTH_TEXTURE
  const Light LIGHT = Light(
    vec3(60.0, 20.0, -45.0), 
    0.05,                    
    0.09,                    
    0.0001,                  
    60.0                     
  );

#else
  const Light LIGHT = Light(
    vec3(20.0, 40.0, -30.0), 
    0.01,                    
    0.03,                    
    0.0001,                  
    60.0                     
  );
#endif

const Fog FOG = Fog(
  vec3(0.5, 0.8, 0.9), 
  0.00025              
);

const Ray RAY = Ray(
  256,   
  500.0, 
  0.001  
);

const ID IDs = ID(
  0, 
  1, 
  2, 
  3, 
  4  
);
uniform float time;

uniform sampler2D black;

const float SPEED = 100.0;
const float MIN   = float(0xFF);
const float MAX   = float(0xFF * 3);
const float HALF  = float(0xFF << 1);

void UpdateColor (out vec3 color, in float time, in bool circular) {
  float divisor = circular ? MAX : HALF;
  float timeMod = mod(time * SPEED, divisor);

  if (circular) {
    float red   = MAX - timeMod - HALF;
    float green = clamp(timeMod, 0.0, HALF);
    float blue  = clamp(timeMod, MIN, MAX);

    red = max(
      max(red, 0.0),
      -min(red + MIN, 0.0)
    );

    red   = red / MIN * 0.5;
    green = green / MIN * 0.5;
    blue  = (blue - MIN) / MIN * 0.5;

    red   = floor(sin(PI * red)   * MIN);
    green = floor(sin(PI * green) * MIN);
    blue  = floor(sin(PI * blue)  * MIN);

    color = vec3(red, green, blue);
  }

  else {
    int delta = int(sin(PI * timeMod / HALF) * HALF);
    int blue  = max(delta - 0xFF, 0);
    int red   = min(delta, 0xFF);

    color = vec3(
      0xFF - red,
      red - blue,
      blue
    );
  }

  color = normalize(color);
}

void UseFog (out vec3 color, in vec3 background, in float distance) {
  float fogDepth = distance * distance;
  float fogFactor = 1.0 - exp(-FOG.density * fogDepth);
  color = mix(color, background, fogFactor);
}
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

vec2 MergeObjects (in vec2 object1, in vec2 object2) {
  return object1.x < object2.x ? object1 : object2;
}

vec2 MergeByDistance (in vec2 object1, in vec2 object2, in float distance) {
  return object1.x < object2.x ? vec2(distance, object1.y) : vec2(distance, object2.y);
}

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
uniform float zoom;
uniform vec2  mouse;

void RotatePosition (inout vec2 position, float amount) {
  position = position * cos(amount) +
    vec2(position.y, -position.x) * sin(amount);
}

vec3 MouseMove () {
  
  vec2 coords = mouse / resolution;
  vec3 origin = vec3(POSITION, zoom);

  
  RotatePosition(origin.yz, coords.y * RAD - 0.5);
  RotatePosition(origin.xz, coords.x * TAU);

  return origin;
}
mat3 Camera (in vec3 rayOrigin, in vec3 lookAt) {
  vec3 forward = normalize(vec3(lookAt - rayOrigin));
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
  vec3 up = cross(forward, right);

  return mat3(right, up, forward);
}

#ifdef DEBUGGING_CUBE
  void TranslateCube (inout vec3 position) {
  position.y -= 1.2;
}

void RotateCube (inout vec3 position) {
  PointRotation(position.xz, time);
  PointRotation(position.yz, time * 2.0);
  PointRotation(position.xy, time * 4.0);
}

vec3 TransformCube (in vec3 position) {
  TranslateCube(position);
  RotateCube(position);
  return position;
}
  uniform sampler2D debug;

#else
  vec4 UsePlainTexture (in sampler2D image, in vec3 position) {
  
  vec3 coords = position * SPHERE.scale;

  
  float x = atan(-coords.x, coords.z) / RAD;

  
  float y = -coords.y * 0.95 / SPHERE.radius;

  
  vec2 uv = vec2(x, y) + 0.5;

  
  
  return vec4(texture(image, uv).rgb, coords.y);
}

void TranslateSphere (inout vec3 position) {
  float delta = sin(time * 4.0) + 1.0;
  position.y -= delta * 0.25 + 0.5;
}

void RotateSphere (inout vec3 position) {
  PointRotation(position.xy, -0.409);
  PointRotation(position.xz, time);
}

vec3 TransformSphere (in vec3 position) {
  TranslateSphere(position);
  RotateSphere(position);
  return position;
}

vec3 TransformClouds (in vec3 position) {
  vec3 clouds = TransformSphere(position);
  PointRotation(clouds.xz, -time * 0.2);
  return clouds;
}

vec3 SphericalNormal (in vec3 normal) {
  normal  = abs(normal);
  normal  = pow(normal, vec3(5.0));
  normal /= normal.x + normal.y + normal.z;

  return normal;
}

float Distortion (in vec3 position) {
  float timeSin = sin(time * 2.0);

  
  RotatePosition(position.yz, timeSin);

  return sin(position.x + time * 4.0) *
         sin(position.y + timeSin   ) *
         sin(position.z + time * 8.0) *
  SPHERE.distortion;
}

  #ifdef EARTH_TEXTURE
    #ifdef EARTH_CLOUDS
      uniform sampler2D earthClouds;
    #endif

    uniform sampler2D earthNormal;
    uniform sampler2D earthColor;

  #else
    uniform sampler2D green;
  #endif
#endif

vec3 GroundPattern (in vec2 position, in vec2 dpdx, in vec2 dpdy, in bool simple) {
  if (simple) {
    return vec3(0.3 + 0.2 * mod(
      floor(position.x) +
      floor(position.y),
      2.0
    ));
  }

  else {
    
    vec2 w = abs(dpdx) + abs(dpdy) + 0.001;

    
    vec2 i = (
      abs(fract((position - 0.5 * w) * 0.5) - 0.5) -
      abs(fract((position + 0.5 * w) * 0.5) - 0.5)
    ) * 2.0 / w;

    
    float xor = 0.5 - i.x * i.y * 0.5;
    return xor * vec3(0.25) + 0.25;
  }
}
vec3 TriplanarMapping (in sampler2D image, in vec3 position, in vec3 normal) {
  #ifdef DEBUGGING_CUBE
    
    vec3 uv = position * CUBE.scale;
    normal = abs(normal);

  #else
    
    vec3 uv = position * SPHERE.scale;

    
    normal = SphericalNormal(normal);
  #endif

  
  
  return (
    texture(image, uv.yz * 0.5 + 0.5) * normal.x +
    texture(image, uv.xz * 0.5 + 0.5) * normal.y +
    texture(image, uv.xy * 0.5 + 0.5) * normal.z
  ).rgb;
}
float Box (in vec3 position, in vec3 bound) {
	vec3 distance = abs(position) - bound;

	return length(max(distance, vec3(0.0))) +
         
         MaxVec3(min(distance, vec3(0.0)));
}

float RoundBox (in vec3 position, in vec3 bound, in float radius) {
	vec3 distance = abs(position) - bound;

  return length(max(distance, 0.0)) +
         
         min(MaxVec3(distance), 0.0) - radius;
}

float Sphere (in vec3 position, in float radius) {
	return length(position) - radius;
}

float Plane (in vec3 position, in vec3 normal, in float distanceFromOrigin) {
	return dot(position, normal) + distanceFromOrigin;
}
vec2 Pedestal (in vec3 position) {
  
  float planeDistance = Plane(position, vec3(0.0, 1.0, 0.0), 5.0);

  
  vec2 plane = vec2(planeDistance, IDs.plane);

  
  vec3 basePosition = vec3(position);
  basePosition.y += BASE.bottomOffset;

  float baseDistance = RoundBox(
    basePosition, vec3(BASE.bottomSize), BASE.radius
  );

  
  vec2 base = vec2(baseDistance, IDs.pedestal);

  
  vec3 pedestalPosition = vec3(position);
  pedestalPosition.y += BASE.topOffset;

  float pedestalDistance = RoundBox(
    pedestalPosition, vec3(BASE.topSize), BASE.radius
  );

  
  vec2 pedestal = vec2(pedestalDistance, IDs.pedestal);
  pedestal = MergeObjectsStairs(base, pedestal, 2.0, 3.0);

  
  
  return MergeObjectsSoft(plane, pedestal, 0.5);
}
#ifdef EARTH_TEXTURE
  uniform sampler2D earthBump;

#else
  uniform sampler2D bump;
#endif

float BumpMapping (in vec3 position, in float distance) {
  float scale = 1.0;
  float amount = 0.0;
  float factor = 0.1;

  #ifdef DEBUGGING_CUBE
    scale = CUBE.scale;
    factor = CUBE.bump;

  #else
    scale = SPHERE.scale;
    factor = SPHERE.bump;
  #endif

  if (distance < 0.1) {
    
    
    #ifdef EARTH_TEXTURE
      return -factor * UsePlainTexture(
        earthBump, position
      ).g * scale;

    #else
      return factor * TriplanarMapping(
        bump,
        position * scale,
        normalize(position + factor)
      ).g;
    #endif
  }

  return 0.0;
}

vec2 MapScene (in vec3 ray) {
  
  vec2 scene = Pedestal(ray);

  #ifdef DEBUGGING_CUBE
    
    vec3 position = TransformCube(vec3(ray));

    
    float boxDistance = Box(position, vec3(CUBE.size));

    #ifdef BUMP_MAPPING
      
      boxDistance += BumpMapping(position, boxDistance);
      boxDistance += CUBE.bump;
    #endif

    
    vec2 box = vec2(boxDistance, IDs.box);

    return MergeObjects(scene, box);

  #else
    
    vec3 position = TransformSphere(vec3(ray));

    
    float radius = SPHERE.radius + Distortion(position);

    
    float sphereDistance = Sphere(position, radius);

    #ifdef BUMP_MAPPING
      
      sphereDistance += BumpMapping(position, sphereDistance);
      sphereDistance += SPHERE.bump;
    #endif

    
    vec2 sphere = vec2(sphereDistance, IDs.sphere);

    return MergeObjects(scene, sphere);
  #endif
}

vec2 MapClouds (in vec3 ray) {
  
  vec3 position = TransformSphere(vec3(ray));

  
  float radius = SPHERE.cloudsRadius;

  
  float cloudsDistance = Sphere(position, radius);

  
  return vec2(cloudsDistance, IDs.clouds);
}

vec3 SurfaceNormal (in vec3 position, in int complexity) {
  vec3 normal = vec3(0.0);

  if (complexity == 1) {
    
    
    vec2 epsilon = vec2(RAY.epsilon, 0.0);

    normal = vec3(
      MapScene(position).x - vec3(
        MapScene(position - epsilon.xyy).x,
        MapScene(position - epsilon.yxy).x,
        MapScene(position - epsilon.yyx).x
      )
    );
  }

  else if (complexity == 2) {
    
    vec2 epsilon = vec2(1.0, -1.0) * 0.5773 * 0.0005;

    normal = vec3(
      epsilon.xyy * MapScene(position + epsilon.xyy).x +
      epsilon.yyx * MapScene(position + epsilon.yyx).x +
      epsilon.yxy * MapScene(position + epsilon.yxy).x +
      epsilon.xxx * MapScene(position + epsilon.xxx).x
    );
  }

  else {
    
    for (int i = 0; i < 4; i++) {
      vec3 epsilon = (
        vec3(
          (((i + 3) >> 1) & 1),
          ((i >> 1) & 1),
          (i & 1)
        ) * 2.0 - 1.0
      ) * 0.5773;

      normal += epsilon * MapScene(position + epsilon * 0.0005).x;
    }
  }

  return normalize(normal);
}
vec2 Raycast (in vec3 position, in vec3 direction, in bool clouds) {
  vec2 distance, object;

  for (int i = 0; i < RAY.steps; i++) {
    vec3 ray = position + object.x * direction;

    #ifdef EARTH_CLOUDS
      distance = clouds ? MapClouds(ray) : MapScene(ray);
    #else
      distance = MapScene(ray);
    #endif

    object.x += distance.x;
    object.y  = distance.y;

    
    bool far = object.x > RAY.distance;

    
    bool close = abs(distance.x) < RAY.epsilon;

    if (close || far) break;
  }

  return object;
}
float ambientOcclussion (in vec3 position, in vec3 normal) {
  float weight = 1.0;
  float amount = 0.0;

  for (int s = 0; s < AO_STEPS; s++) {
    
    float length = 0.01 + 0.02 * pow(float(s), 2.0);

    
    
    float distance = MapScene(position + normal * length).x;

    
    
    amount += (length - distance) * weight;

    
    
    weight *= AO_FACTOR;
  }

  
  return 1.0 - clamp(AO_INTENSITY * amount, 0.0, 1.0);
}

float SoftShadow (in vec3 position, in vec3 direction, in float minLightDistance) {
  float result = 1.0;
  float lightDistance = LIGHT.distance;

  for (int i = 0; i < RAY.steps; i++) {
    vec3 ray = position + lightDistance * direction;

    
    float distance = MapScene(ray).x;
    float scaledDistance = lightDistance * LIGHT.size;

    
    
    
    result = min(result, distance / scaledDistance);
    lightDistance += distance;

    
    bool far = lightDistance > LIGHT.max;

    
    bool close = distance < minLightDistance;

    if (close || far) break;
  }

  return clamp(result, 0.0, 1.0);
}

vec3 Lighting (in vec3 position, in vec3 direction, in vec3 color, in vec3 normal) {
  bool earth = normal != vec3(0.0);

  
  vec3 surfaceNormal = earth ? normal : SurfaceNormal(position, 1);
  vec3 lightDirection = normalize(LIGHT.position - position);

  
  vec3 inverseDirection = -direction;
  
  vec3 reflection = reflect(-lightDirection, surfaceNormal);

  
  float reflected = dot(reflection, inverseDirection);
  float reflectionBase = clamp(reflected, 0.0, 1.0);
  vec3 specular = SPECULAR * pow(reflectionBase, 10.0);

  reflected = dot(lightDirection, surfaceNormal);
  vec3 diffuse = color * clamp(reflected, 0.0, 1.0);

  
  
  
  float lightDistance = length(LIGHT.position - position);

  
  float fresnelAmount = dot(direction, surfaceNormal) + 1.0;
  vec3 fresnel = pow(fresnelAmount, 3.0) * color * FRESNEL;

  
  reflected = dot(surfaceNormal, -lightDirection);
  reflection = color * REFLECTION * clamp(reflected, 0.0, 1.0);

  
  vec3 ambient = color * AMBIENT;
  vec3 ambientFresnel = ambient + fresnel + reflection;

  vec3 origin = position + surfaceNormal * 0.02;
  vec3 lightPosition = normalize(LIGHT.position);

  #ifdef AMBIENT_OCCLUSSION
    float occlussion = ambientOcclussion(position, surfaceNormal);

    
    
    ambientFresnel *= occlussion;
    specular *= occlussion;
  #endif

  vec3 specularDiffuse = specular + diffuse;

  #ifdef SOFT_SHADOWS
    float minDistance = earth ? LIGHT.distance : LIGHT.min;
    specularDiffuse *= SoftShadow(origin, lightPosition, minDistance);
  #else
    float objectDistance = Raycast(origin, lightPosition).x;

    
    
    if (objectDistance < lightDistance) {
      return ambientFresnel;
    }
  #endif

  
  return ambientFresnel + specularDiffuse;
}

vec3 Render (in vec3 color, in vec2 uv) {
  vec3 rayOrigin = MouseMove();
  vec3 backgroundColor = vec3(0.0);

  mat3 camera = Camera(rayOrigin, LOOK_AT);
  vec3 rayDirection = camera * normalize(vec3(uv, FOV));

  
  vec2 object = Raycast(rayOrigin, rayDirection, false);

  #ifdef DYNAMIC_FOG
    
    UpdateColor(backgroundColor, time, true);
    backgroundColor = mix(FOG.color, backgroundColor, 0.25);

  #else
    backgroundColor = FOG.color;
  #endif

  
  
  if (object.x < RAY.distance) {
    vec3 normalColor = vec3(0.0);
    vec3 objectColor = vec3(0.0);

    int objectID = int(object.y) - 1;

    
    
    vec3 position = rayOrigin + object.x * rayDirection;

    
    if (objectID == 0) {
      vec2 px = ((gl_FragCoord.xy + vec2(1.0, 0.0)) * 2.0 - resolution.xy) / resolution.y;
      vec2 py = ((gl_FragCoord.xy + vec2(0.0, 1.0)) * 2.0 - resolution.xy) / resolution.y;

      vec3 rayDirectionX = camera * normalize(vec3(px, FOV));
      vec3 rayDirectionY = camera * normalize(vec3(py, FOV));

      vec3 dpdx = (rayDirection / rayDirection.y - rayDirectionX / rayDirectionX.y) * rayOrigin.y;
      vec3 dpdy = (rayDirection / rayDirection.y - rayDirectionY / rayDirectionY.y) * rayOrigin.y;

      objectColor = GroundPattern(position.xz, dpdx.xz, dpdy.xz, false);
    }

    else {
      
      vec3 normal = SurfaceNormal(position, 1);

      if (objectID == 3) {
        objectColor = TriplanarMapping(black, position, normal);
      }

      else {
        #ifdef DEBUGGING_CUBE
          
          RotateCube(normal);

          objectColor = TriplanarMapping(
            debug,
            TransformCube(position),
            normal
          );

        #else
          #ifdef EARTH_TEXTURE
            normalColor = UsePlainTexture(
              earthNormal, TransformSphere(position)
            ).rgb;

            normalColor  = normalize(normalColor * 2.0 - 1.0);
            normalColor *= normalize(LIGHT.position);

            vec4 earthTexture = UsePlainTexture(
              earthColor, TransformSphere(position)
            );

            objectColor = earthTexture.rgb;

          #else
            
            RotateSphere(normal);

            objectColor = TriplanarMapping(
              green,
              TransformSphere(position),
              normal
            );
          #endif
        #endif
      }
    }

    
    color += Lighting(position, rayDirection, objectColor, normalColor);

    
    UseFog(color, backgroundColor, object.x);
  }

  else {
    
    color += backgroundColor - max(0.9 * rayDirection.y, 0.0);
  }

  #if defined(EARTH_TEXTURE) && defined(EARTH_CLOUDS)
    
    float cloudsDistance = Raycast(rayOrigin, rayDirection, true).x;

    if (cloudsDistance < RAY.distance) {
      
      
      vec3 position = rayOrigin + cloudsDistance * rayDirection;

      
      vec3 cloudsPosition = TransformClouds(position);

      vec4 cloudsTexture = UsePlainTexture(
        earthClouds, cloudsPosition
      );

      vec3 cloudsColor = cloudsTexture.rgb;

      
      float alpha = cloudsColor.r + cloudsColor.g + cloudsColor.b;
      alpha = alpha / 3.0 /* * length(light) */ * SPHERE.cloudsOpacity;

      
      float colorFactor = 1.0 + (SPHERE.radius - SPHERE.cloudsRadius);
      cloudsColor = mix(color, cloudsColor, alpha) * colorFactor;

      
      cloudsColor = mix(
        cloudsColor, vec3(SPHERE.cloudsOpacity),
        smoothstep(0.875, 1.0, abs(cloudsTexture.a * 0.72))
      );

      return cloudsColor;
    }
  #endif

  return color;
}

vec2 UV (in vec2 offset) {
  
  vec2 uv = gl_FragCoord.xy + offset;
  
  return (uv * 2.0 - resolution.xy) / resolution.y;
}

vec3 RenderAAx1 (out vec3 color) {
  return Render(color, UV(vec2(0)));
}

vec3 RenderAAx2 (out vec3 color) {
  int coordMod = int(gl_FragCoord.x + gl_FragCoord.y) & 1;
  float inverseCoordMod = 1.0 - float(coordMod);

  vec2 inverseRotation = vec2(0.33 * inverseCoordMod, 0.0);
  vec2 rotation = vec2(0.33 * float(coordMod), 0.66);

  color = Render(color, UV(inverseRotation)) +
          Render(color, UV(rotation));

  return color / 2.0;
}

vec3 RenderAAx3 (out vec3 color) {
  int coordMod = int(gl_FragCoord.x + gl_FragCoord.y) & 1;
  float inverseCoordMod = 1.0 - float(coordMod);

  vec2 inverseRotation = vec2(0.66 * inverseCoordMod, 0.0);
  vec2 rotation = vec2(0.66 * float(coordMod), 0.66);
  vec2 noRotation = vec2(0.33, 0.33);

  color = Render(color, UV(inverseRotation)) +
          Render(color, UV(rotation))        +
          Render(color, UV(noRotation));

  return color / 3.0;
}

vec3 RenderAAx4 (out vec3 color) {
  
  vec4 rotation = vec4(0.125, -0.125, 0.375, -0.375);

  color = Render(color, UV(rotation.xz)) +
          Render(color, UV(rotation.yw)) +
          Render(color, UV(rotation.wx)) +
          Render(color, UV(rotation.zy));

  return color / 4.0;
}

out vec4 fragColor;

void main (void) {
  vec3 color = vec3(0.0);

  #ifndef ANTI_ALIASING
    color = RenderAAx1(color);

  #elif ANTI_ALIASING == 4
    color = RenderAAx4(color);

  #elif ANTI_ALIASING == 3
    color = RenderAAx3(color);

  #elif ANTI_ALIASING == 2
    color = RenderAAx2(color);

  #else
    color = RenderAAx1(color);
  #endif

  color = pow(color, vec3(GAMMA));
  fragColor = vec4(color, 1.0);
}`,v=`#version 300 es

precision mediump float;

in vec2 position;

void main (void) {
  gl_Position = vec4(position, 1.0, 1.0);
}`,g="./img/textures/earth/clouds.jpg",b="./img/textures/earth/normal.jpg",x="./img/textures/earth/color.jpg",E="./img/textures/earth/bump.jpg",R="./img/textures/debug.png",T="./img/textures/green.png",y="./img/textures/black.png",A="./img/textures/white.png",S="./img/textures/bump.png";const D=(s,n,e)=>s+e*(n-s),c=(s,n=0,e=1)=>Math.max(n,Math.min(s,e)),l=5,a=7.5,d=10,u=20;class M{constructor(n){this.pressed=!1,this.startZoom=0,this.targetZoom=15,this.touchOffset=0,this.currentZoom=15,this.touchPosition=[0,0],this.mousePosition=[0,0],this.textures={earthClouds:g,earthNormal:b,earthColor:x,earthBump:E,debug:R,green:T,black:y,white:A,bump:S},this.time=null,this.zoom=null,this.mouse=null,this.resolution=null,this.offsetBottom=window.innerHeight/l,this.offsetTop=-(window.innerHeight-this.offsetBottom),this.touchSensitivity=window.innerWidth/a|0,this.onTouchStart=this.touchStart.bind(this),this.onTouchMove=this.touchMove.bind(this),this.onTouchEnd=this.touchEnd.bind(this),this.onMouseDown=this.mouseDown.bind(this),this.onMouseMove=this.mouseMove.bind(this),this.onMouseUp=this.mouseUp.bind(this),this.onResize=this.resize.bind(this),this.onWheel=this.wheel.bind(this),this.gl=this.createContext(n),this.program=this.createProgram(),this.program&&(this.createScene(),this.addEventListeners(),requestAnimationFrame(this.render.bind(this)))}createContext(n){return n.getContext("webgl2",{powerPreference:"high-performance",failIfMajorPerformanceCaveat:!0,preserveDrawingBuffer:!1,premultipliedAlpha:!0,desynchronized:!0,xrCompatible:!1,antialias:!0,stencil:!0,alpha:!1,depth:!0})}createProgram(){const n=this.gl.createProgram(),e=this.loadShader(v,this.gl.VERTEX_SHADER),o=this.loadShader(h,this.gl.FRAGMENT_SHADER);return e&&o&&(this.gl.attachShader(n,e),this.gl.attachShader(n,o),this.gl.linkProgram(n)),this.gl.getProgramParameter(n,this.gl.LINK_STATUS)?n:console.error(this.gl.getProgramInfoLog(n))}createScene(){const n=this.program,e=this.gl.createBuffer(),o=new Float32Array([-1,1,1,1,1,-1,-1,1,1,-1,-1,-1]);this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT),this.gl.clearColor(0,0,0,1),this.gl.clearDepth(1),this.gl.enable(this.gl.DEPTH_TEST),this.gl.depthFunc(this.gl.LEQUAL),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,e),this.gl.bufferData(this.gl.ARRAY_BUFFER,o,this.gl.STATIC_DRAW),this.time=this.gl.getUniformLocation(n,"time"),this.zoom=this.gl.getUniformLocation(n,"zoom"),this.mouse=this.gl.getUniformLocation(n,"mouse"),this.resolution=this.gl.getUniformLocation(n,"resolution"),n.position=this.gl.getAttribLocation(n,"position"),this.gl.enableVertexAttribArray(n.position),this.gl.vertexAttribPointer(n.position,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(n),this.loadTextures(n),this.resize()}loadShader(n,e){const o=this.gl.createShader(e);return this.gl.shaderSource(o,n),this.gl.compileShader(o),this.gl.getShaderParameter(o,this.gl.COMPILE_STATUS)?o:(console.error(this.gl.getShaderInfoLog(o)),this.gl.deleteShader(o))}loadTextures(n,e=-1){const o=Object.keys(this.textures),t=Object.values(this.textures).map(i=>this.loadTexture(i));Promise.all(t).then(i=>i.forEach(r=>{const f=this.gl[`TEXTURE${++e}`],m=this.gl.getUniformLocation(n,o[e]);this.gl.uniform1i(m,e),this.gl.activeTexture(f),this.gl.bindTexture(this.gl.TEXTURE_2D,r)}))}loadTexture(n){return new Promise((e,o)=>{const t=new Image,i=this.gl.createTexture();t.onload=()=>{this.gl.bindTexture(this.gl.TEXTURE_2D,i),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,t),this.gl.generateMipmap(this.gl.TEXTURE_2D),e(i)},t.onerror=r=>o(r),t.src=n})}render(n){const e=Date.now()-this.startZoom,o=Math.min(e*.002,1),t=D(this.currentZoom,this.targetZoom,o);this.gl.uniform1f(this.zoom,-t),this.gl.uniform1f(this.time,n*1e-4),this.gl.drawArrays(this.gl.TRIANGLES,0,6),requestAnimationFrame(this.render.bind(this))}addEventListeners(){document.addEventListener("touchstart",this.onTouchStart,!1),document.addEventListener("touchmove",this.onTouchMove,!1),document.addEventListener("touchend",this.onTouchEnd,!1),document.addEventListener("mousedown",this.onMouseDown,!1),document.addEventListener("mousemove",this.onMouseMove,!1),document.addEventListener("mouseup",this.onMouseUp,!1),window.addEventListener("resize",this.onResize,!1),window.addEventListener("wheel",this.onWheel,!1)}touchStart(n){const{clientX:e,clientY:o}=n.touches[0];this.touchPosition=[e,o],this.pressed=!0}touchMove(n){if(!this.pressed)return;const{clientX:e,clientY:o}=n.changedTouches[0],t=this.touchPosition[1]-o;let i=this.touchPosition[0]-e;i=this.touchOffset+=i,i/=this.touchSensitivity,this.targetZoom=this.zoomValue+-Math.sign(t)/a,this.targetZoom=c(this.targetZoom,d,u),this.gl.uniform1f(this.zoom,-this.targetZoom),this.gl.uniform2fv(this.mouse,[i,0])}touchEnd(){this.pressed=!1}mouseDown(){document.documentElement.requestPointerLock(),this.pressed=!0}mouseMove(n){if(!this.pressed)return;const e=this.mousePosition[0]-=n.movementX;let o=this.mousePosition[1]+=n.movementY;o=c(o,this.offsetTop,this.offsetBottom),this.gl.uniform2fv(this.mouse,[e,o])}mouseUp(){document.exitPointerLock(),this.pressed=!1}resize(){const n=window.innerWidth,e=window.innerHeight;this.offsetBottom=e/l,this.offsetTop=-(e-this.offsetBottom),this.touchSensitivity=n/a|0,this.gl.viewport(0,0,n,e),this.gl.uniform2fv(this.resolution,[n,e]),this.gl.canvas.height=e,this.gl.canvas.width=n}wheel({deltaY:n}){this.startZoom=Date.now(),this.currentZoom=this.zoomValue,n=Math.sign(-n)*a,this.targetZoom=this.currentZoom+n,this.targetZoom=c(this.targetZoom,d,u)}get zoomValue(){var o;const n=(o=this.program)!=null?o:this.gl.getParameter(this.gl.CURRENT_PROGRAM),e=this.gl.getUniformLocation(n,"zoom");return-this.gl.getUniform(n,e)}}new M(document.getElementById("scene"));
