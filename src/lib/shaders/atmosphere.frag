uniform vec3 glowColor;
uniform float intensity;
uniform vec3 sunDirection;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(-vPosition);

    // Fresnel effect - stronger at edges
    float fresnel = 1.0 - dot(viewDir, normal);
    fresnel = pow(fresnel, 3.0) * intensity;

    // Slightly brighter on sun-facing side
    float sunFacing = dot(normal, sunDirection) * 0.3 + 0.7;

    gl_FragColor = vec4(glowColor * fresnel * sunFacing, fresnel * 0.6);
}
