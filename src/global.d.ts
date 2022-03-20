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

type TextureIndex = Partial<
  'TEXTURE0'  |
  'TEXTURE1'  |
  'TEXTURE2'  |
  'TEXTURE3'  |
  'TEXTURE4'  |
  'TEXTURE5'  |
  'TEXTURE6'  |
  'TEXTURE7'  |
  'TEXTURE8'  |
  'TEXTURE9'  |
  'TEXTURE10' |
  'TEXTURE11' |
  'TEXTURE12' |
  'TEXTURE13' |
  'TEXTURE14' |
  'TEXTURE15' |
  'TEXTURE16' |
  'TEXTURE17' |
  'TEXTURE18' |
  'TEXTURE19' |
  'TEXTURE20' |
  'TEXTURE21' |
  'TEXTURE22' |
  'TEXTURE23' |
  'TEXTURE24' |
  'TEXTURE25' |
  'TEXTURE26' |
  'TEXTURE27' |
  'TEXTURE28' |
  'TEXTURE29' |
  'TEXTURE30' |
  'TEXTURE31'
>;
