// https://iquilezles.org/www/articles/distfunctions/distfunctions.htm

import VERTEX_SHADER from '@/glsl/main.vert';
import FRAGMENT_SHADER from '@/glsl/main.frag';

export default class RayMarching
{
  private readonly gl: WebGL2RenderingContext;
  private resolution: WebGLUniformLocation | null = null;

  public constructor (scene: HTMLCanvasElement) {
    this.gl = this.createContext(scene);
    const program = this.createProgram();

    if (program) {
      this.createScene(program);
      requestAnimationFrame(this.render.bind(this));
      window.addEventListener('resize', this.resize.bind(this));
    }
  }

  private createContext (scene: HTMLCanvasElement): WebGL2RenderingContext {
    return scene.getContext('webgl2', {
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true,
      preserveDrawingBuffer: false,
      premultipliedAlpha: true,
      desynchronized: true,
      xrCompatible: false,
      antialias: true,
      stencil: true,
      alpha: false,
      depth: true
    }) as WebGL2RenderingContext;
  }

  private createProgram (): RayMarchingProgram | void {
    const program = this.gl.createProgram() as RayMarchingProgram;
    const vertex = this.loadShader(VERTEX_SHADER, this.gl.VERTEX_SHADER);
    const fragment = this.loadShader(FRAGMENT_SHADER, this.gl.FRAGMENT_SHADER);

    if (vertex && fragment) {
      this.gl.attachShader(program, vertex);
      this.gl.attachShader(program, fragment);
      this.gl.linkProgram(program);
    }

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      return console.error(this.gl.getProgramInfoLog(program));
    }

    return program;
  }

  private createScene (program: RayMarchingProgram): void {
    const BUFFER = this.gl.createBuffer();

    const COORDS = new Float32Array([
      -1.0,  1.0,
       1.0,  1.0,
       1.0, -1.0,

      -1.0,  1.0,
       1.0, -1.0,
      -1.0, -1.0
    ]);

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clearDepth(1.0);

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, BUFFER);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, COORDS, this.gl.STATIC_DRAW);

    program.position = this.gl.getAttribLocation(program, 'position');
    this.resolution = this.gl.getUniformLocation(program, 'resolution');

    this.gl.enableVertexAttribArray(program.position);
    this.gl.vertexAttribPointer(program.position, 2.0, this.gl.FLOAT, false, 0.0, 0.0);

    this.gl.useProgram(program);
    this.resize();
  }

  private loadShader (source: string, type: ShaderType): WebGLShader | void {
    const shader = this.gl.createShader(type) as WebGLShader;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(this.gl.getShaderInfoLog(shader));
      return this.gl.deleteShader(shader);
    }

    return shader;
  }

  private render (): void {
    this.gl.drawArrays(this.gl.TRIANGLES, 0.0, 6.0);
    requestAnimationFrame(this.render.bind(this));
  }

  private resize (): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.gl.viewport(0.0, 0.0, width, height);
    this.gl.uniform2fv(this.resolution, [width, height]);

    this.gl.canvas.height = height;
    this.gl.canvas.width = width;
  }
}
