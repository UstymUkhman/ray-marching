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

// Output color:
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
}
