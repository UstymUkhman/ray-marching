import EARTH_CLOUDS from '/img/textures/earth/clouds.jpg';
import EARTH_NORMAL from '/img/textures/earth/normal.jpg';
import EARTH_COLOR from '/img/textures/earth/color.jpg';
import EARTH_LIGHT from '/img/textures/earth/light.jpg';
import EARTH_BUMP from '/img/textures/earth/bump.jpg';

import DEBUG from '/img/textures/debug.png';
import GREEN from '/img/textures/green.png';
import BLACK from '/img/textures/black.png';
import WHITE from '/img/textures/white.png';
import BUMP from '/img/textures/bump.png';

import VERTEX_SHADER from '@/glsl/main.vert';
import FRAGMENT_SHADER from '@/glsl/main.frag';

const lerp = (v0: number, v1: number, t: number): number =>
  v0 + t * (v1 - v0);

const clamp = (value: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(value, max));

const VERTICAL_OFFSET =  5.0;
const SENSITIVITY     =  7.5;
const MIN_ZOOM        = 10.0;
const MAX_ZOOM        = 20.0;

export default class RayMarching
{
  private pressed = false;
  private startZoom = 0.0;
  private targetZoom = 15.0;
  private touchOffset = 0.0;
  private currentZoom = 15.0;

  private touchPosition = [0.0, 0.0];
  private mousePosition = [0.0, 0.0];

  private readonly gl: WebGL2RenderingContext;
  private readonly program: RayMarchingProgram | void;

  private readonly textures = {
    earthClouds: EARTH_CLOUDS,
    earthNormal: EARTH_NORMAL,
    earthColor: EARTH_COLOR,
    earthLight: EARTH_LIGHT,
    earthBump: EARTH_BUMP,

    debug: DEBUG,
    green: GREEN,
    black: BLACK,
    white: WHITE,
    bump: BUMP
  };

  private time: WebGLUniformLocation | null = null;
  private zoom: WebGLUniformLocation | null = null;
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
  private readonly onWheel = this.wheel.bind(this);

  public constructor (scene: HTMLCanvasElement) {
    this.gl = this.createContext(scene);
    this.program = this.createProgram();

    if (this.program) {
      this.createScene();
      this.addEventListeners();
      requestAnimationFrame(this.render.bind(this));
    }
  }

  private createContext (scene: HTMLCanvasElement): WebGL2RenderingContext {
    return scene.getContext('webgl2', {
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true,
      preserveDrawingBuffer: false,
      premultipliedAlpha: false,
      desynchronized: true,
      xrCompatible: false,
      antialias: true,
      stencil: false,
      depth: false,
      alpha: true
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

  private createScene (): void {
    const program = this.program as RayMarchingProgram;
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
    this.zoom = this.gl.getUniformLocation(program, 'zoom');
    this.mouse = this.gl.getUniformLocation(program, 'mouse');
    this.resolution = this.gl.getUniformLocation(program, 'resolution');

    program.position = this.gl.getAttribLocation(program, 'position');

    this.gl.enableVertexAttribArray(program.position);
    this.gl.vertexAttribPointer(program.position, 2.0, this.gl.FLOAT, false, 0.0, 0.0);

    this.gl.useProgram(program);
    this.loadTextures(program);
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

  private loadTextures (program: RayMarchingProgram, index = -1): void {
    const names = Object.keys(this.textures);
    const textures = Object.values(this.textures).map(
      texture => this.loadTexture(texture)
    );

    Promise.all(textures).then(
      textures => textures.forEach(texture => {
        const activeTexture = this.gl[`TEXTURE${++index}` as TextureIndex];
        const location = this.gl.getUniformLocation(program, names[index]);

        this.gl.uniform1i(location, index);
        this.gl.activeTexture(activeTexture);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
      })
    );
  }

  private loadTexture (url: string): Promise<WebGLTexture | null> {
    return new Promise((resolve, reject) => {
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

        resolve(texture);
      };

      image.onerror = error => reject(error);
      image.src = url;
    });
  }

  private render (delta: number): void {
    const elapsed = Date.now() - this.startZoom;
    const time = Math.min(elapsed * 0.002, 1.0);
    const zoom = lerp(this.currentZoom, this.targetZoom, time);

    this.gl.uniform1f(this.zoom, -zoom);
    this.gl.uniform1f(this.time, delta * 1e-4);
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
    window.addEventListener('wheel', this.onWheel, false);
  }

  private touchStart (event: TouchEvent): void {
    const { clientX, clientY } = event.touches[0];
    this.touchPosition = [clientX, clientY];
    this.pressed = true;
  }

  private touchMove (event: TouchEvent): void {
    if (!this.pressed) return;

    const { clientX, clientY } = event.changedTouches[0];
    const y = this.touchPosition[1] - clientY;
    let x = this.touchPosition[0] - clientX;

    x  = this.touchOffset += x;
    x /= this.touchSensitivity;

    this.targetZoom = this.zoomValue + -Math.sign(y) / SENSITIVITY;
    this.targetZoom = clamp(this.targetZoom, MIN_ZOOM, MAX_ZOOM);

    this.gl.uniform1f(this.zoom, -this.targetZoom);
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

  private wheel ({ deltaY }: WheelEvent): void {
    this.startZoom = Date.now();
    this.currentZoom = this.zoomValue;

    deltaY = Math.sign(-deltaY) * SENSITIVITY;
    this.targetZoom = this.currentZoom + deltaY;
    this.targetZoom = clamp(this.targetZoom, MIN_ZOOM, MAX_ZOOM);
  }

  private get zoomValue (): number {
    const program = this.program ?? this.gl.getParameter(this.gl.CURRENT_PROGRAM) as RayMarchingProgram;
    const zoomLocation = this.gl.getUniformLocation(program, 'zoom') as WebGLUniformLocation;
    return -this.gl.getUniform(program, zoomLocation);
  }
}
