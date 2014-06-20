#ifdef GL_ES
precision highp float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform sampler2D backbuffer;

void main() 
{
    // coordinate system with origin in the center and y-axis goes up
    // y-range is [-1.0, 1.0] and x-range is based on aspect ratio.
    vec2 p = (-resolution.xy + 2.0 * gl_FragCoord.xy) / resolution.y;
    vec2 m = (mouse * 2.0 - 1.0) * vec2(resolution.x / resolution.y, 1.0);

    gl_FragColor = vec4(p, 0.0, 1.0);
}