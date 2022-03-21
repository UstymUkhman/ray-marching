#version 300 es

#ifndef GL_FRAGMENT_PRECISION_HIGH
  precision mediump float;
#else
  precision highp float;
#endif

// Screen resolution:
uniform vec2 resolution;

#include "constants.glsl";
#include "aliasing.glsl";
#include "vignette.glsl";

// Output color:
out vec4 fragColor;

void main (void) {
  vec3 color = vec3(0.0);
  vec2 uv = gl_FragCoord.xy / resolution;

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
  Vignette(color, uv, resolution);
  fragColor = vec4(color, 1.0);
}
