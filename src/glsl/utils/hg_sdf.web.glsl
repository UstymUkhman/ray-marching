/*************************************************************************************************
 *                                                                                               *
 * HG_SDF glsl library compatible with GLSL ES 3.00 standards for WebGL 2:                       *
 * https://www.khronos.org/registry/webgl/specs/latest/2.0/                                      *
 *                                                                                               *
 * Build on top of HG_SDF glsl library for building signed distance                              *
 * functions by Mercury Demogroup: http://mercury.sexy/hg_sdf/                                   *
 *                                                                                               *
 * Original source code can be found here:                                                       *
 * http://mercury.sexy/hg_sdf/                                                                   *
 *                                                                                               *
 * MIT License:                                                                                  *
 * https://github.com/UstymUkhman/ray-marching/blob/main/src/glsl/utils/hg_sdf.glsl#L16-L32      *
 *                                                                                               *
 * Copyright (c) 2011-2021 Mercury Demogroup:                                                    *
 * https://github.com/UstymUkhman/ray-marching/blob/main/src/glsl/utils/hg_sdf.glsl#L34-L52      *
 *                                                                                               *
 *************************************************************************************************/

////////////////////////////////////////////////////////////////
//
//             PRIMITIVE DISTANCE FUNCTIONS
//
////////////////////////////////////////////////////////////////
//
// Conventions:
//
// Everything that is a distance function is called fSomething.
// The first argument is always a point in 2 or 3-space called <p>.
// Unless otherwise noted, (if the object has an intrinsic "up"
// side or direction) the y axis is "up" and the object is
// centered at the origin.
//
////////////////////////////////////////////////////////////////

float fSphere(vec3 p, float r) {
	return length(p) - r;
}

// Plane with normal n (n is normalized) at some distance from the origin
float fPlane(vec3 p, vec3 n, float distanceFromOrigin) {
	return dot(p, n) + distanceFromOrigin;
}
