attribute vec3 aPosition;
attribute vec2 aTexCoord;
attribute vec3 aNormal;

varying vec2 vTexCoord;
varying vec3 vNormal;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform float uTime;

void main() {
    // Add subtle vertex displacement for surface movement
    float displacement = sin(uTime * 0.001 + aPosition.x * 10.0) * 0.02;
    vec3 pos = aPosition;
    pos += aNormal * displacement;
    
    // Pass varyings to fragment shader
    vTexCoord = aTexCoord;
    vNormal = normalize(aNormal);
    
    // Calculate final position
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(pos, 1.0);
} 