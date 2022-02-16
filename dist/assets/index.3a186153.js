const l=function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const i of t)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function e(t){const i={};return t.integrity&&(i.integrity=t.integrity),t.referrerpolicy&&(i.referrerPolicy=t.referrerpolicy),t.crossorigin==="use-credentials"?i.credentials="include":t.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(t){if(t.ep)return;t.ep=!0;const i=e(t);fetch(t.href,i)}};l();var d=`#version 300 es

precision mediump float;

in vec2 position;

void main (void) {
  gl_Position = vec4(position, 1.0, 1.0);
}`,f=`#version 300 es

#ifndef GL_FRAGMENT_PRECISION_HIGH
  precision mediump float;
#else
  precision highp float;
#endif

uniform vec2 resolution;

#define ANTI_ALIASING 4
#define USE_SOFT_SHADOWS

#define PI          3.14159265358979323846
#define RAD         PI * 0.5
#define TAU         PI * 2.0

#define PHI         sqrt(5.0) * 0.5 + 0.5
#define saturate(x) clamp(x, 0.0, 1.0)

struct ID
{
  int plane;
  int sphere;
};

struct Ray
{
  int   steps;
  float distance;
  float epsilon;
};

struct Light
{
  vec3  position;
  float distance;
  float size;
  float min;
  float max;
};

const float FOV         = 2.5;                    
const float GAMMA       = 1.0 / 2.2;              
const vec3  LOOK_AT     = vec3(0.0);              
const vec3  POSITION    = vec3(0.0, -5.0, -15.0); 

const float AMBIENT     = 0.05;                   
const float FRESNEL     = 0.25;                   

const vec3  SPECULAR    = vec3(0.5);              
const vec3  BACKGROUND  = vec3(0.5, 0.8, 0.9);    

const vec3  FOG_COLOR   = vec3(0.5);              
const float FOG_DENSITY = 0.00025;                

const Light LIGHT = Light(
  vec3(20.0, 40.0, -30.0), 
  0.01,                    
  0.03,                    
  0.0001,                  
  60.0                     
);

const Ray RAY = Ray(
  256,   
  500.0, 
  0.001  
);

const ID IDs = ID(
  1, 
  2  
);
uniform vec2 mouse;

void rotatePosition (inout vec2 position, float amount) {
  position = position * cos(amount) +
    vec2(position.y, -position.x) * sin(amount);
}

vec3 mouseMove (in vec3 origin) {
  
  vec2 coords = mouse / resolution;

  
  rotatePosition(origin.yz, coords.y * RAD - 0.5);
  rotatePosition(origin.xz, coords.x * TAU);

  return origin;
}
const float SPEED = 100.0;
const float MIN   = float(0xFF);
const float MAX   = float(0xFF * 3);
const float HALF  = float(0xFF << 1);

void sphereColor (out vec3 color, in float time, in bool circular) {
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
mat3 getCamera (in vec3 rayOrigin, in vec3 lookAt) {
  vec3 forward = normalize(vec3(lookAt - rayOrigin));
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
  vec3 up = cross(forward, right);

  return mat3(right, up, forward);
}
vec3 getGroundPattern (in vec2 position, in vec2 dpdx, in vec2 dpdy, in bool simple) {
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
uniform float time;

float Sphere (in vec3 position, in float radius) {
	return length(position) - radius;
}

float Plane (in vec3 position, in vec3 normal, in float distanceFromOrigin) {
	return dot(position, normal) + distanceFromOrigin;
}

float sphereDisplacement (in vec3 position) {
  float timeSin = sin(time);

  
  rotatePosition(position.yz, timeSin);

  return sin(position.x + time * 2.0) *
         sin(position.y + timeSin   ) *
         sin(position.z + time * 4.0);
}

vec2 mergeObjects (in vec2 object1, in vec2 object2) {
  
  return object1.x < object2.x ? object1 : object2;
}

vec2 mapScene (in vec3 ray) {
  
  float planeDistance = Plane(ray, vec3(0.0, 1.0, 0.0), 4.0);

  
  vec2 plane = vec2(planeDistance, IDs.plane);

  
  float sphereDistance = Sphere(ray, 3.0 + sphereDisplacement(ray));

  
  vec2 sphere = vec2(sphereDistance, IDs.sphere);

  return mergeObjects(plane, sphere);
}

vec3 getSurfaceNormal (in vec3 position, in int complexity) {
  vec3 normal = vec3(0.0);

  if (complexity == 1) {
    
    
    vec2 epsilon = vec2(RAY.epsilon, 0.0);

    normal = vec3(
      mapScene(position).x - vec3(
        mapScene(position - epsilon.xyy).x,
        mapScene(position - epsilon.yxy).x,
        mapScene(position - epsilon.yyx).x
      )
    );
  }

  else if (complexity == 2) {
    
    vec2 epsilon = vec2(1.0, -1.0) * 0.5773 * 0.0005;

    normal = vec3(
      epsilon.xyy * mapScene(position + epsilon.xyy).x +
      epsilon.yyx * mapScene(position + epsilon.yyx).x +
      epsilon.yxy * mapScene(position + epsilon.yxy).x +
      epsilon.xxx * mapScene(position + epsilon.xxx).x
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

      normal += epsilon * mapScene(position + epsilon * 0.0005).x;
    }
  }

  return normalize(normal);
}
vec2 raycast (in vec3 position, in vec3 direction) {
  vec2 distance, object;

  for (int i = 0; i < RAY.steps; i++) {
    vec3 ray = position + object.x * direction;

    distance = mapScene(ray);

    object.x += distance.x;
    object.y  = distance.y;

    
    bool far = object.x > RAY.distance;

    
    bool close = abs(distance.x) < RAY.epsilon;

    if (close || far) break;
  }

  return object;
}

float softShadow (in vec3 position, in vec3 direction) {
  float result = 1.0;
  float lightDistance = LIGHT.distance;

  for (int i = 0; i < RAY.steps; i++) {
    vec3 ray = position + lightDistance * direction;

    
    float distance = mapScene(ray).x;
    float scaledDistance = lightDistance * LIGHT.size;

    
    
    
    result = min(result, distance / scaledDistance);
    lightDistance += distance;

    
    bool far = lightDistance > LIGHT.max;

    
    bool close = distance < LIGHT.min;

    if (close || far) break;
  }

  return clamp(result, 0.0, 1.0);
}

vec3 getLight (in vec3 position, in vec3 direction, in vec3 color) {
  vec3 lightDirection = normalize(LIGHT.position - position);
  vec3 surfaceNormal = getSurfaceNormal(position, 1);

  
  vec3 inverseDirection = -direction;
  
  vec3 reflection = reflect(-lightDirection, surfaceNormal);

  
  float reflected = dot(reflection, inverseDirection);
  float reflectionBase = clamp(reflected, 0.0, 1.0);
  vec3 specular = SPECULAR * pow(reflectionBase, 10.0);

  reflected = dot(lightDirection, surfaceNormal);
  vec3 diffuse = color * clamp(reflected, 0.0, 1.0);
  vec3 specularDiffuse = specular + diffuse;

  
  
  
  float lightDistance = length(LIGHT.position - position);

  
  float fresnelAmount = dot(direction, surfaceNormal) + 1.0;
  vec3 fresnel = pow(fresnelAmount, 3.0) * color * FRESNEL;

  
  vec3 ambient = color * AMBIENT;

  vec3 origin = position + surfaceNormal * 0.02;
  vec3 lightPosition = normalize(LIGHT.position);

  #ifdef USE_SOFT_SHADOWS
    specularDiffuse *= softShadow(origin, lightPosition);
  #else
    float objectDistance = raycast(origin, lightPosition).x;

    
    
    if (objectDistance < lightDistance) {
      return ambient + fresnel;
    }
  #endif

  
  return ambient + fresnel + specularDiffuse;
}

vec3 render (in vec3 color, in vec2 uv) {
  vec3 rayOrigin = mouseMove(POSITION);
  mat3 camera = getCamera(rayOrigin, LOOK_AT);
  vec3 rayDirection = camera * normalize(vec3(uv, FOV));

  
  vec2 object = raycast(rayOrigin, rayDirection);

  
  
  if (object.x < RAY.distance) {
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

      objectColor = getGroundPattern(position.xz, dpdx.xz, dpdy.xz, false);
    }

    else sphereColor(objectColor, time, true);

    
    color += getLight(position, rayDirection, objectColor);

    
    float fogDepth = object.x * object.x;
    float fogFactor = 1.0 - exp(-FOG_DENSITY * fogDepth);
    color = mix(color, BACKGROUND, fogFactor);
  }

  else {
    
    color += BACKGROUND - max(0.9 * rayDirection.y, 0.0);
  }

  return color;
}

vec2 getUV (in vec2 offset) {
  
  vec2 uv = gl_FragCoord.xy + offset;
  
  return (uv * 2.0 - resolution.xy) / resolution.y;
}

vec3 renderAAx1 (out vec3 color) {
  return render(color, getUV(vec2(0)));
}

vec3 renderAAx2 (out vec3 color) {
  int coordMod = int(gl_FragCoord.x + gl_FragCoord.y) & 1;
  float inverseCoordMod = 1.0 - float(coordMod);

  vec2 inverseRotation = vec2(0.33 * inverseCoordMod, 0.0);
  vec2 rotation = vec2(0.33 * float(coordMod), 0.66);

  color = render(color, getUV(inverseRotation)) +
          render(color, getUV(rotation));

  return color / 2.0;
}

vec3 renderAAx3 (out vec3 color) {
  int coordMod = int(gl_FragCoord.x + gl_FragCoord.y) & 1;
  float inverseCoordMod = 1.0 - float(coordMod);

  vec2 inverseRotation = vec2(0.66 * inverseCoordMod, 0.0);
  vec2 rotation = vec2(0.66 * float(coordMod), 0.66);
  vec2 noRotation = vec2(0.33, 0.33);

  color = render(color, getUV(inverseRotation)) +
          render(color, getUV(rotation))        +
          render(color, getUV(noRotation));

  return color / 3.0;
}

vec3 renderAAx4 (out vec3 color) {
  
  vec4 rotation = vec4(0.125, -0.125, 0.375, -0.375);

  color = render(color, getUV(rotation.xz)) +
          render(color, getUV(rotation.yw)) +
          render(color, getUV(rotation.wx)) +
          render(color, getUV(rotation.zy));

  return color / 4.0;
}

out vec4 fragColor;

void main (void) {
  vec3 color = vec3(0.0);

  #ifndef ANTI_ALIASING
    color = renderAAx1(color);

  #elif ANTI_ALIASING == 4
    color = renderAAx4(color);

  #elif ANTI_ALIASING == 3
    color = renderAAx3(color);

  #elif ANTI_ALIASING == 2
    color = renderAAx2(color);

  #else
    color = renderAAx1(color);
  #endif

  color = pow(color, vec3(GAMMA));
  fragColor = vec4(color, 1.0);
}`;const h=(r,n=0,e=1)=>Math.max(n,Math.min(r,e)),c=5,a=7.5;class u{constructor(n){this.pressed=!1,this.touchOffset=0,this.touchPosition=0,this.mousePosition=[0,0],this.time=null,this.mouse=null,this.resolution=null,this.offsetBottom=window.innerHeight/c,this.offsetTop=-(window.innerHeight-this.offsetBottom),this.touchSensitivity=window.innerWidth/a|0,this.onTouchStart=this.touchStart.bind(this),this.onTouchMove=this.touchMove.bind(this),this.onTouchEnd=this.touchEnd.bind(this),this.onMouseDown=this.mouseDown.bind(this),this.onMouseMove=this.mouseMove.bind(this),this.onMouseUp=this.mouseUp.bind(this),this.onResize=this.resize.bind(this),this.gl=this.createContext(n);const e=this.createProgram();e&&(this.createScene(e),this.addEventListeners(),requestAnimationFrame(this.render.bind(this)))}createContext(n){return n.getContext("webgl2",{powerPreference:"high-performance",failIfMajorPerformanceCaveat:!0,preserveDrawingBuffer:!1,premultipliedAlpha:!0,desynchronized:!0,xrCompatible:!1,antialias:!0,stencil:!0,alpha:!1,depth:!0})}createProgram(){const n=this.gl.createProgram(),e=this.loadShader(d,this.gl.VERTEX_SHADER),o=this.loadShader(f,this.gl.FRAGMENT_SHADER);return e&&o&&(this.gl.attachShader(n,e),this.gl.attachShader(n,o),this.gl.linkProgram(n)),this.gl.getProgramParameter(n,this.gl.LINK_STATUS)?n:console.error(this.gl.getProgramInfoLog(n))}createScene(n){const e=this.gl.createBuffer(),o=new Float32Array([-1,1,1,1,1,-1,-1,1,1,-1,-1,-1]);this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT),this.gl.clearColor(0,0,0,1),this.gl.clearDepth(1),this.gl.enable(this.gl.DEPTH_TEST),this.gl.depthFunc(this.gl.LEQUAL),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,e),this.gl.bufferData(this.gl.ARRAY_BUFFER,o,this.gl.STATIC_DRAW),this.time=this.gl.getUniformLocation(n,"time"),this.mouse=this.gl.getUniformLocation(n,"mouse"),this.resolution=this.gl.getUniformLocation(n,"resolution"),n.position=this.gl.getAttribLocation(n,"position"),this.gl.enableVertexAttribArray(n.position),this.gl.vertexAttribPointer(n.position,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(n),this.resize()}loadShader(n,e){const o=this.gl.createShader(e);return this.gl.shaderSource(o,n),this.gl.compileShader(o),this.gl.getShaderParameter(o,this.gl.COMPILE_STATUS)?o:(console.error(this.gl.getShaderInfoLog(o)),this.gl.deleteShader(o))}render(n){this.gl.uniform1f(this.time,n*2e-4),this.gl.drawArrays(this.gl.TRIANGLES,0,6),requestAnimationFrame(this.render.bind(this))}addEventListeners(){document.addEventListener("touchstart",this.onTouchStart,!1),document.addEventListener("touchmove",this.onTouchMove,!1),document.addEventListener("touchend",this.onTouchEnd,!1),document.addEventListener("mousedown",this.onMouseDown,!1),document.addEventListener("mousemove",this.onMouseMove,!1),document.addEventListener("mouseup",this.onMouseUp,!1),window.addEventListener("resize",this.onResize,!1)}touchStart(n){const{clientX:e}=n.touches[0];this.touchPosition=e,this.pressed=!0}touchMove(n){if(!this.pressed)return;const{clientX:e}=n.changedTouches[0];let o=this.touchPosition-e;o=this.touchOffset+=o,o/=this.touchSensitivity,this.gl.uniform2fv(this.mouse,[o,0])}touchEnd(){this.pressed=!1}mouseDown(){document.documentElement.requestPointerLock(),this.pressed=!0}mouseMove(n){if(!this.pressed)return;const e=this.mousePosition[0]-=n.movementX;let o=this.mousePosition[1]+=n.movementY;o=h(o,this.offsetTop,this.offsetBottom),this.gl.uniform2fv(this.mouse,[e,o])}mouseUp(){document.exitPointerLock(),this.pressed=!1}resize(){const n=window.innerWidth,e=window.innerHeight;this.offsetBottom=e/c,this.offsetTop=-(e-this.offsetBottom),this.touchSensitivity=n/a|0,this.gl.viewport(0,0,n,e),this.gl.uniform2fv(this.resolution,[n,e]),this.gl.canvas.height=e,this.gl.canvas.width=n}}new u(document.getElementById("scene"));
