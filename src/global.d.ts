declare module '*.vs' {
  const value: string;
  export default value;
}

declare module '*.fs' {
	const value: string;
	export default value;
}

declare module '*.vert' {
  const value: string;
  export default value;
}

declare module '*.frag' {
	const value: string;
	export default value;
}

declare module '*.glsl' {
	const value: string;
	export default value;
}

type ShaderType =
  WebGLRenderingContextBase['VERTEX_SHADER'] |
  WebGLRenderingContextBase['FRAGMENT_SHADER'];

interface RayMarchingProgram extends WebGLProgram
{
  position: number
}
