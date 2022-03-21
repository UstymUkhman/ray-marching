highp float Random (const in vec2 uv) {
  return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
}

highp vec3 Blend (const in vec3 base, const in vec3 blend) {
  return mix(
    1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
    2.0 * base * blend, step(base, vec3(0.5))
  );
}

void Vignette (inout vec3 color, const in vec2 uv, const in vec2 resolution) {
  vec2 position = uv;

  position   -= 0.5;
  position.x *= resolution.x / resolution.y;

  color = mix(
    vec3(0.0), color, smoothstep(
      -0.5, 0.75, 1.0 - length(position)
    )
  );

  color = mix(
    color, Blend(color, vec3(
      Random(uv * 0.1), Random(uv * 2.5), Random(uv)
    )), 0.05
  );
}
