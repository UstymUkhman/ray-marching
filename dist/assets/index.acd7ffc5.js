const l=function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerpolicy&&(n.referrerPolicy=r.referrerpolicy),r.crossorigin==="use-credentials"?n.credentials="include":r.crossorigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(r){if(r.ep)return;r.ep=!0;const n=t(r);fetch(r.href,n)}};l();var a=`#version 300 es

precision mediump float;

in vec2 position;

void main (void) {
  gl_Position = vec4(position, 1.0, 1.0);
}`,h=`#version 300 es

#ifndef GL_FRAGMENT_PRECISION_HIGH
  precision mediump float;
#else
  precision highp float;
#endif

uniform vec2 resolution;

out vec4 fragColor;

void render (inout vec3 color, inout vec2 uv) {
  color.rg += uv;
}

void main (void) {
  vec3 color = vec3(1.0);

  vec2 uv = (
    gl_FragCoord.xy * 2.0 - resolution.xy
  ) / resolution.y;

  render(color, uv);

  fragColor = vec4(color, 1.0);
}`;class c{constructor(e){this.resolution=null,this.gl=this.createContext(e);const t=this.createProgram();t&&(this.createScene(t),requestAnimationFrame(this.render.bind(this)),window.addEventListener("resize",this.resize.bind(this)))}createContext(e){return e.getContext("webgl2",{powerPreference:"high-performance",failIfMajorPerformanceCaveat:!0,preserveDrawingBuffer:!1,premultipliedAlpha:!0,desynchronized:!0,xrCompatible:!1,antialias:!0,stencil:!0,alpha:!1,depth:!0})}createProgram(){const e=this.gl.createProgram(),t=this.loadShader(a,this.gl.VERTEX_SHADER),i=this.loadShader(h,this.gl.FRAGMENT_SHADER);return t&&i&&(this.gl.attachShader(e,t),this.gl.attachShader(e,i),this.gl.linkProgram(e)),this.gl.getProgramParameter(e,this.gl.LINK_STATUS)?e:console.error(this.gl.getProgramInfoLog(e))}createScene(e){const t=this.gl.createBuffer(),i=new Float32Array([-1,1,1,1,1,-1,-1,1,1,-1,-1,-1]);this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT),this.gl.clearColor(0,0,0,1),this.gl.clearDepth(1),this.gl.enable(this.gl.DEPTH_TEST),this.gl.depthFunc(this.gl.LEQUAL),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,t),this.gl.bufferData(this.gl.ARRAY_BUFFER,i,this.gl.STATIC_DRAW),e.position=this.gl.getAttribLocation(e,"position"),this.resolution=this.gl.getUniformLocation(e,"resolution"),this.gl.enableVertexAttribArray(e.position),this.gl.vertexAttribPointer(e.position,2,this.gl.FLOAT,!1,0,0),this.gl.useProgram(e),this.resize()}loadShader(e,t){const i=this.gl.createShader(t);return this.gl.shaderSource(i,e),this.gl.compileShader(i),this.gl.getShaderParameter(i,this.gl.COMPILE_STATUS)?i:(console.error(this.gl.getShaderInfoLog(i)),this.gl.deleteShader(i))}render(){this.gl.drawArrays(this.gl.TRIANGLES,0,6),requestAnimationFrame(this.render.bind(this))}resize(){const e=window.innerWidth,t=window.innerHeight;this.gl.viewport(0,0,e,t),this.gl.uniform2fv(this.resolution,[e,t]),this.gl.canvas.height=t,this.gl.canvas.width=e}}new c(document.getElementById("scene"));
