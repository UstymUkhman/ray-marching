#version 300 es

#extension GL_OES_standard_derivatives : enable

#ifndef GL_FRAGMENT_PRECISION_HIGH
  precision mediump float;
#else
  precision highp float;
#endif

out vec4 fragColor;

void main (void) {
  fragColor = vec4(0.73);
}
