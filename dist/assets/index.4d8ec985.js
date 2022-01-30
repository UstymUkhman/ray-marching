const c=function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))i(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function e(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerpolicy&&(r.referrerPolicy=t.referrerpolicy),t.crossorigin==="use-credentials"?r.credentials="include":t.crossorigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(t){if(t.ep)return;t.ep=!0;const r=e(t);fetch(t.href,r)}};c();var a=`#version 300 es

precision mediump float;

in vec2 position;

void main (void) {
  gl_Position = vec4(position, 1.0, 1.0);
}`,l=`#version 300 es

#ifndef GL_FRAGMENT_PRECISION_HIGH
  precision mediump float;
#else
  precision highp float;
#endif

/*************************************************************************************************
 *                                                                                               *
 * HG_SDF glsl library compatible with GLSL ES 3.00 standards for WebGL 2:                       *
 * https:
 *                                                                                               *
 * Build on top of HG_SDF glsl library for building signed distance                              *
 * functions by Mercury Demogroup: http:
 *                                                                                               *
 * Original source code can be found here:                                                       *
 * http:
 *                                                                                               *
 * MIT License:                                                                                  *
 * https:
 *                                                                                               *
 * Copyright (c) 2011-2021 Mercury Demogroup:                                                    *
 * https:
 *                                                                                               *
 *************************************************************************************************/

float fSphere(vec3 p, float r) {
	return length(p) - r;
}

float fPlane(vec3 p, vec3 n, float distanceFromOrigin) {
	return dot(p, n) + distanceFromOrigin;
}

uniform vec2 resolution;

out vec4 fragColor;

const float FOV = 1.0;

const float GAMMA = 1.0 / 2.2;

struct ID
{
  int plane;
  int sphere;
};

const ID IDs = ID(1, 2);

const vec3 COLORS[2] = vec3[2]
(
  vec3(0.0, 0.5, 0.5), 
  vec3(0.9, 0.9, 0.0)  
);

struct Ray
{
  int steps;      
  float distance; 
  float epsilon;  
};

const Ray RAY = Ray(256, 500.0, 0.001);

const vec3 LIGHT = vec3(20.0, 40.0, -30.0);

vec2 mergeObjects (in vec2 object1, in vec2 object2) {
  
  return object1.x < object2.x ? object1 : object2;
}

vec2 mapScene (in vec3 ray) {
  
  float planeDistance = fPlane(ray, vec3(0.0, 1.0, 0.0), 1.0);

  
  vec2 plane = vec2(planeDistance, IDs.plane);

  
  float sphereDistance = fSphere(ray, 1.0);

  
  vec2 sphere = vec2(sphereDistance, IDs.sphere);

  return mergeObjects(plane, sphere);
}

vec2 rayMarch (in vec3 origin, in vec3 direction) {
  vec2 distance, object;

  for (int i = 0; i < RAY.steps; i++) {
    vec3 ray = origin + object.x * direction;

    distance = mapScene(ray);

    object.x += distance.x;
    object.y  = distance.y;

    
    bool far = object.x > RAY.distance;

    
    bool close = abs(distance.x) < RAY.epsilon;

    if (close || far) break;
  }

  return object;
}

vec3 getSurfaceNormal (in vec3 position) {
  
  
  vec2 epsilon = vec2(RAY.epsilon, 0.0);

  vec3 normal = vec3(
    mapScene(position).x - vec3(
      mapScene(position - epsilon.xyy).x,
      mapScene(position - epsilon.yxy).x,
      mapScene(position - epsilon.yyx).x
    )
  );

  return normalize(normal);
}

vec3 getLight (in vec3 position, in vec3 direction, in vec3 color) {
  vec3 lightDirection = normalize(LIGHT - position);
  vec3 surfaceNormal = getSurfaceNormal(position);

  float reflected = dot(lightDirection, surfaceNormal);
  vec3 diffuse = color * clamp(reflected, 0.0, 1.0);

  
  
  
  float lightDistance = length(LIGHT - position);

  float objectDistance = rayMarch(
    position + surfaceNormal * 0.02,
    normalize(LIGHT)
  ).x;

  
  
  if (objectDistance < lightDistance) {
    return vec3(0.0);
  }

  return diffuse;
}

vec3 getColorByID (in float id, in vec3 position) {
  int ID = int(id) - 1;

  
  if (ID == 0) {
    return vec3(0.3 + 0.2 * mod(
      floor(position.x) +
      floor(position.z),
      2.0
    ));
  }

  return COLORS[ID];
}

void render (inout vec3 color, in vec2 uv) {
  vec3 rayOrigin = vec3(0.0, 0.0, -3.0);
  vec3 rayDirection = normalize(vec3(uv, FOV));

  
  vec2 object = rayMarch(rayOrigin, rayDirection);

  
  
  if (object.x < RAY.distance) {
    
    
    vec3 position = rayOrigin + object.x * rayDirection;

    vec3 objectColor = getColorByID(object.y, position);

    
    color += getLight(position, rayDirection, objectColor);
  }
}

void main (void) {
  vec3 color = vec3(0.0);

  
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;

  render(color, uv);

  color = pow(color, vec3(GAMMA));

  fragColor = vec4(color, 1.0);
}`;class h{constructor(n){this.resolution=null,this.gl=this.createContext(n);const e=this.createProgram();e&&(this.createScene(e),requestAnimationFrame(this.render.bind(this)),window.addEventListener("resize",this.resize.bind(this)))}createContext(n){return n.getContext("webgl2",{powerPreference:"high-performance",failIfMajorPerformanceCaveat:!0,preserveDrawingBuffer:!1,premultipliedAlpha:!0,desynchronized:!0,xrCompatible:!1,antialias:!0,stencil:!0,alpha:!1,depth:!0})}createProgram(){const n=this.gl.createProgram(),e=this.loadShader(a,this.gl.VERTEX_SHADER),i=this.loadShader(l,this.gl.FRAGMENT_SHADER);return e&&i&&(this.gl.attachShader(n,e),this.gl.attachShader(n,i),this.gl.linkProgram(n)),this.gl.getProgramParameter(n,this.gl.LINK_STATUS)?n:console.error(this.gl.getProgramInfoLog(n))}createScene(n){const e=this.gl.createBuffer(),i=new Float32Array([-1,1,1,1,1,-1,-1,1,1,-1,-1,-1]);this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT),this.gl.clearColor(0,0,0,1),this.gl.clearDepth(1),this.gl.enable(this.gl.DEPTH_TEST),this.gl.depthFunc(this.gl.LEQUAL),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,e),this.gl.bufferData(this.gl.ARRAY_BUFFER,i,this.gl.STATIC_DRAW),n.position=this.gl.getAttribLocation(n,"position"),this.resolution=this.gl.getUniformLocation(n,"resolution"),this.gl.enableVertexAttribArray(n.position),this.gl.vertexAttribPointer(n.position,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(n),this.resize()}loadShader(n,e){const i=this.gl.createShader(e);return this.gl.shaderSource(i,n),this.gl.compileShader(i),this.gl.getShaderParameter(i,this.gl.COMPILE_STATUS)?i:(console.error(this.gl.getShaderInfoLog(i)),this.gl.deleteShader(i))}render(){this.gl.drawArrays(this.gl.TRIANGLES,0,6),requestAnimationFrame(this.render.bind(this))}resize(){const n=window.innerWidth,e=window.innerHeight;this.gl.viewport(0,0,n,e),this.gl.uniform2fv(this.resolution,[n,e]),this.gl.canvas.height=e,this.gl.canvas.width=n}}new h(document.getElementById("scene"));
