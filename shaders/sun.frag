precision mediump float;

varying vec2 vTexCoord;
varying vec3 vNormal;

uniform float uTime;

void main() {
    // Create base sun color
    vec3 sunColor = vec3(1.0, 0.6, 0.1);
    
    // Add time-based noise for surface turbulence
    float noise = fract(sin(dot(vTexCoord, vec2(12.9898, 78.233))) * 43758.5453);
    float turbulence = sin(uTime * 0.001 + noise * 6.28) * 0.5 + 0.5;
    
    // Create corona effect
    float corona = pow(1.0 - length(vNormal.xy), 2.0);
    
    // Combine effects
    vec3 finalColor = mix(sunColor, vec3(1.0, 0.8, 0.3), turbulence * 0.3);
    finalColor += vec3(1.0, 0.6, 0.1) * corona * 0.5;
    
    // Add glow at edges
    float glow = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
    finalColor += vec3(1.0, 0.4, 0.0) * glow;
    
    gl_FragColor = vec4(finalColor, 1.0);
} 