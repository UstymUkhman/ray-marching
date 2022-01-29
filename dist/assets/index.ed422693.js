const a=function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))r(t);new MutationObserver(t=>{for(const i of t)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(t){const i={};return t.integrity&&(i.integrity=t.integrity),t.referrerpolicy&&(i.referrerPolicy=t.referrerpolicy),t.crossorigin==="use-credentials"?i.credentials="include":t.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(t){if(t.ep)return;t.ep=!0;const i=n(t);fetch(t.href,i)}};a();var c=`#version 300 es

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

uniform vec2 resolution;

out vec4 fragColor;

const float FOV = 1.0;

struct ID
{
  int sphere;
};

const ID IDs = ID(1);

struct Ray
{
  int steps;      
  float distance; 
  float epsilon;  
};

const Ray RAY = Ray(256, 500.0, 0.001);

vec2 mapScene (in vec3 ray) {
  
  ray = mod(ray, 3.0) - 3.0 * 0.5;

  
  float distance = length(ray) - 1.0;

  
  vec2 sphere = vec2(distance, IDs.sphere);

  return sphere;
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

void render (inout vec3 color, in vec2 uv) {
  vec3 rayOrigin = vec3(0.0, 0.0, -3.0);
  vec3 rayDirection = normalize(vec3(uv, FOV));

  
  vec2 object = rayMarch(rayOrigin, rayDirection);

  
  
  if (object.x < RAY.distance) {
    color += 3.0 / object.x;
  }
}

void main (void) {
  vec3 color = vec3(0.0);

  
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;

  render(color, uv);

  fragColor = vec4(color, 1.0);
}`;class h{constructor(e){this.resolution=null,this.gl=this.createContext(e);const n=this.createProgram();n&&(this.createScene(n),requestAnimationFrame(this.render.bind(this)),window.addEventListener("resize",this.resize.bind(this)))}createContext(e){return e.getContext("webgl2",{powerPreference:"high-performance",failIfMajorPerformanceCaveat:!0,preserveDrawingBuffer:!1,premultipliedAlpha:!0,desynchronized:!0,xrCompatible:!1,antialias:!0,stencil:!0,alpha:!1,depth:!0})}createProgram(){const e=this.gl.createProgram(),n=this.loadShader(c,this.gl.VERTEX_SHADER),r=this.loadShader(l,this.gl.FRAGMENT_SHADER);return n&&r&&(this.gl.attachShader(e,n),this.gl.attachShader(e,r),this.gl.linkProgram(e)),this.gl.getProgramParameter(e,this.gl.LINK_STATUS)?e:console.error(this.gl.getProgramInfoLog(e))}createScene(e){const n=this.gl.createBuffer(),r=new Float32Array([-1,1,1,1,1,-1,-1,1,1,-1,-1,-1]);this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT),this.gl.clearColor(0,0,0,1),this.gl.clearDepth(1),this.gl.enable(this.gl.DEPTH_TEST),this.gl.depthFunc(this.gl.LEQUAL),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,n),this.gl.bufferData(this.gl.ARRAY_BUFFER,r,this.gl.STATIC_DRAW),e.position=this.gl.getAttribLocation(e,"position"),this.resolution=this.gl.getUniformLocation(e,"resolution"),this.gl.enableVertexAttribArray(e.position),this.gl.vertexAttribPointer(e.position,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(e),this.resize()}loadShader(e,n){const r=this.gl.createShader(n);return this.gl.shaderSource(r,e),this.gl.compileShader(r),this.gl.getShaderParameter(r,this.gl.COMPILE_STATUS)?r:(console.error(this.gl.getShaderInfoLog(r)),this.gl.deleteShader(r))}render(){this.gl.drawArrays(this.gl.TRIANGLES,0,6),requestAnimationFrame(this.render.bind(this))}resize(){const e=window.innerWidth,n=window.innerHeight;this.gl.viewport(0,0,e,n),this.gl.uniform2fv(this.resolution,[e,n]),this.gl.canvas.height=n,this.gl.canvas.width=e}}new h(document.getElementById("scene"));
