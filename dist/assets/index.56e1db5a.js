const a=function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))i(t);new MutationObserver(t=>{for(const n of t)if(n.type==="childList")for(const s of n.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function r(t){const n={};return t.integrity&&(n.integrity=t.integrity),t.referrerpolicy&&(n.referrerPolicy=t.referrerpolicy),t.crossorigin==="use-credentials"?n.credentials="include":t.crossorigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(t){if(t.ep)return;t.ep=!0;const n=r(t);fetch(t.href,n)}};a();var l=`#version 300 es

precision mediump float;

in vec2 position;

void main (void) {
  gl_Position = vec4(position, 1.0, 1.0);
}`,h=`#version 300 es

#extension GL_OES_standard_derivatives : enable

#ifndef GL_FRAGMENT_PRECISION_HIGH
  precision mediump float;
#else
  precision highp float;
#endif

out vec4 fragColor;

void main (void) {
  fragColor = vec4(0.73);
}`;class c{constructor(e){this.onRender=this.render.bind(this),this.onResize=this.resize.bind(this),this.gl=this.createContext(e),window.addEventListener("resize",this.onResize);const r=this.createProgram();r&&this.createScene(r)}createContext(e){return e.getContext("webgl2",{powerPreference:"high-performance",failIfMajorPerformanceCaveat:!0,preserveDrawingBuffer:!1,premultipliedAlpha:!0,desynchronized:!1,xrCompatible:!1,antialias:!0,stencil:!0,alpha:!1,depth:!0})}createProgram(){const e=this.gl.createProgram(),r=this.loadShader(l,this.gl.VERTEX_SHADER),i=this.loadShader(h,this.gl.FRAGMENT_SHADER);return r&&i&&(this.gl.attachShader(e,r),this.gl.attachShader(e,i),this.gl.linkProgram(e)),this.gl.getProgramParameter(e,this.gl.LINK_STATUS)?e:console.error(this.gl.getProgramInfoLog(e))}createScene(e){const r=this.gl.createBuffer(),i=new Float32Array([-1,1,1,1,1,-1,-1,1,1,-1,-1,-1]);this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT),this.gl.clearColor(0,0,0,1),this.gl.clearDepth(1),this.gl.enable(this.gl.DEPTH_TEST),this.gl.depthFunc(this.gl.LEQUAL),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,r),this.gl.bufferData(this.gl.ARRAY_BUFFER,i,this.gl.STATIC_DRAW),e.position=this.gl.getAttribLocation(e,"position"),this.gl.enableVertexAttribArray(e.position),this.gl.vertexAttribPointer(e.position,2,this.gl.FLOAT,!1,0,0),this.resize(),this.gl.useProgram(e),requestAnimationFrame(this.onRender)}loadShader(e,r){const i=this.gl.createShader(r);return this.gl.shaderSource(i,e),this.gl.compileShader(i),this.gl.getShaderParameter(i,this.gl.COMPILE_STATUS)?i:(console.error(this.gl.getShaderInfoLog(i)),this.gl.deleteShader(i))}render(){this.gl.drawArrays(this.gl.TRIANGLES,0,6),requestAnimationFrame(this.onRender)}resize(){const e=window.innerWidth,r=window.innerHeight;this.gl.viewport(0,0,e,r),this.gl.canvas.height=r,this.gl.canvas.width=e}}new c(document.getElementById("scene"));
