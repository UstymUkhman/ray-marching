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

interface RayMarchingProgram extends WebGLProgram
{
  position: number
}

type ShaderType =
  WebGLRenderingContextBase['VERTEX_SHADER'] |
  WebGLRenderingContextBase['FRAGMENT_SHADER'];

// "TextureIndex" type dynamic generation:
// Array.from({ length: 32 }, (_, index) => `TEXTURE${index}`).join(' | ');
type TextureIndex =
  'TEXTURE0' |
  'TEXTURE1' |
  'TEXTURE2' |
  'TEXTURE3' |
  'TEXTURE4';
