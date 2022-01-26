#version 300 es

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
}
