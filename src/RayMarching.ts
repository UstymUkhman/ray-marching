import VERTEX_SHADER from '@/glsl/main.vert';
import FRAGMENT_SHADER from '@/glsl/main.frag';

const clamp = (value: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(value, max));

const VERTICAL_OFFSET = 5.0;
const SENSITIVITY     = 7.5;

export default class RayMarching
{
  private pressed = false;
  private touchOffset = 0.0;
  private touchPosition = 0.0;

  private mousePosition = [0.0, 0.0];
  private readonly gl: WebGL2RenderingContext;
  private readonly debugTexture = '/img/debug.png';

  private time: WebGLUniformLocation | null = null;
  private mouse: WebGLUniformLocation | null = null;
  private resolution: WebGLUniformLocation | null = null;

  private offsetBottom = window.innerHeight / VERTICAL_OFFSET;
  private offsetTop = -(window.innerHeight - this.offsetBottom);
  private touchSensitivity = window.innerWidth / SENSITIVITY | 0;

  private readonly onTouchStart = this.touchStart.bind(this);
  private readonly onTouchMove = this.touchMove.bind(this);
  private readonly onTouchEnd = this.touchEnd.bind(this);

  private readonly onMouseDown = this.mouseDown.bind(this);
  private readonly onMouseMove = this.mouseMove.bind(this);
  private readonly onMouseUp = this.mouseUp.bind(this);

  private readonly onResize = this.resize.bind(this);

  public constructor (scene: HTMLCanvasElement) {
    this.gl = this.createContext(scene);
    const program = this.createProgram();

    if (program) {
      this.createScene(program);
      this.addEventListeners();

      requestAnimationFrame(this.render.bind(this));
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

    this.time = this.gl.getUniformLocation(program, 'time');
    this.mouse = this.gl.getUniformLocation(program, 'mouse');
    this.resolution = this.gl.getUniformLocation(program, 'resolution');

    program.position = this.gl.getAttribLocation(program, 'position');

    this.gl.enableVertexAttribArray(program.position);
    this.gl.vertexAttribPointer(program.position, 2.0, this.gl.FLOAT, false, 0.0, 0.0);

    this.gl.useProgram(program);
    this.useDebugTexture(program);

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

  private useDebugTexture (program: RayMarchingProgram): void {
    const debug = this.gl.getUniformLocation(program, 'debug');
    const texture = this.loadTexture(this.debugTexture);

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.uniform1i(debug, 0.0);
  }

  private loadTexture (url: string): WebGLTexture | null {
    const image = new Image();
    const texture = this.gl.createTexture();

    image.onload = () => {
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0.0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        image
      );

      this.gl.generateMipmap(this.gl.TEXTURE_2D);
    };

    image.src = url;
    return texture;
  }

  private render (delta: number): void {
    this.gl.uniform1f(this.time, delta * 0.0002);
    this.gl.drawArrays(this.gl.TRIANGLES, 0.0, 6.0);

    requestAnimationFrame(this.render.bind(this));
  }

  private addEventListeners (): void {
    document.addEventListener('touchstart', this.onTouchStart, false);
    document.addEventListener('touchmove', this.onTouchMove, false);
    document.addEventListener('touchend', this.onTouchEnd, false);

    document.addEventListener('mousedown', this.onMouseDown, false);
    document.addEventListener('mousemove', this.onMouseMove, false);
    document.addEventListener('mouseup', this.onMouseUp, false);

    window.addEventListener('resize', this.onResize, false);
  }

  private touchStart (event: TouchEvent): void {
    const { clientX } = event.touches[0];
    this.touchPosition = clientX;
    this.pressed = true;
  }

  private touchMove (event: TouchEvent): void {
    if (!this.pressed) return;

    const { clientX } = event.changedTouches[0];
    let x = this.touchPosition - clientX;

    x  = this.touchOffset += x;
    x /= this.touchSensitivity;

    this.gl.uniform2fv(this.mouse, [x, 0.0]);
  }

  private touchEnd (): void {
    this.pressed = false;
  }

  private mouseDown (): void {
    document.documentElement.requestPointerLock();
    this.pressed = true;
  }

  private mouseMove (event: MouseEvent): void {
    if (!this.pressed) return;

    const x = this.mousePosition[0] -= event.movementX;
    let y = this.mousePosition[1] += event.movementY;

    y = clamp(y, this.offsetTop, this.offsetBottom);
    this.gl.uniform2fv(this.mouse, [x, y]);
  }

  private mouseUp (): void {
    document.exitPointerLock();
    this.pressed = false;
  }

  private resize (): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.offsetBottom = height / VERTICAL_OFFSET;
    this.offsetTop = -(height - this.offsetBottom);
    this.touchSensitivity = width / SENSITIVITY | 0;

    this.gl.viewport(0.0, 0.0, width, height);
    this.gl.uniform2fv(this.resolution, [width, height]);

    this.gl.canvas.height = height;
    this.gl.canvas.width = width;
  }
}
