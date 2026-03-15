uniform sampler2D tScene;
uniform vec2 resolution;
uniform vec3 bhPosition;      // world space
uniform float bhMass;          // in solar masses
uniform float bhRadius;        // Schwarzschild radius in world units
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 cameraPosition;
uniform float time;

varying vec2 vUv;

#define PI 3.14159265359
#define MAX_STEPS 64
#define ACCRETION_INNER 2.5
#define ACCRETION_OUTER 6.0

// Pseudo-random
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
    vec2 uv = vUv;
    vec4 sceneColor = texture2D(tScene, uv);

    // If no black hole, pass through
    if (bhMass <= 0.0) {
        gl_FragColor = sceneColor;
        return;
    }

    // Ray from camera through pixel (NDC → world)
    vec2 ndc = uv * 2.0 - 1.0;
    float aspect = resolution.x / resolution.y;
    ndc.x *= aspect;

    // Simplified ray direction (assumes standard camera)
    vec3 rayDir = normalize(vec3(ndc, -1.5));

    // Transform ray to world space
    mat3 camBasis = mat3(
        viewMatrix[0].xyz,
        viewMatrix[1].xyz,
        viewMatrix[2].xyz
    );
    rayDir = camBasis * rayDir;

    vec3 rayPos = cameraPosition;
    vec3 toBH = bhPosition - rayPos;
    float distToBH = length(toBH);

    // Gravitational parameter (scale for visual effect)
    float GM = bhRadius * 4.0;

    // Ray march with gravitational lensing
    vec3 pos = rayPos;
    vec3 dir = rayDir;
    float stepSize = distToBH * 0.02;
    bool hitDisk = false;
    bool hitHorizon = false;
    vec3 diskColor = vec3(0.0);

    for (int i = 0; i < MAX_STEPS; i++) {
        vec3 toCenter = bhPosition - pos;
        float r = length(toCenter);

        // Event horizon check
        if (r < bhRadius) {
            hitHorizon = true;
            break;
        }

        // Gravitational deflection (inverse square)
        vec3 gravDir = normalize(toCenter);
        float bendStrength = GM / (r * r);
        dir = normalize(dir + gravDir * bendStrength * stepSize);

        // Adaptive step size
        stepSize = max(r * 0.05, bhRadius * 0.5);
        pos += dir * stepSize;

        // Accretion disk check (thin disk in XZ plane)
        float diskR = r / bhRadius;
        if (abs(pos.y - bhPosition.y) < bhRadius * 0.1 &&
            diskR > ACCRETION_INNER && diskR < ACCRETION_OUTER) {
            hitDisk = true;

            // Temperature gradient: hotter near center
            float t = 1.0 - (diskR - ACCRETION_INNER) / (ACCRETION_OUTER - ACCRETION_INNER);
            t = pow(t, 1.5);

            // Rotating pattern
            float angle = atan(pos.z - bhPosition.z, pos.x - bhPosition.x);
            float pattern = sin(angle * 8.0 + time * 2.0) * 0.3 + 0.7;
            pattern *= sin(angle * 3.0 - time * 1.5) * 0.2 + 0.8;

            // Color: white-hot center → orange → red edge
            vec3 hotColor = mix(
                vec3(1.0, 0.3, 0.05),   // outer: red-orange
                vec3(1.0, 0.95, 0.8),    // inner: white-hot
                t
            );

            diskColor = hotColor * pattern * (t * 2.0 + 0.5);
            break;
        }

        // Ray escaped too far
        if (r > distToBH * 3.0) break;
    }

    vec3 finalColor;

    if (hitHorizon) {
        // Pure black at event horizon
        finalColor = vec3(0.0);
    } else if (hitDisk) {
        finalColor = diskColor;
    } else {
        // Lensed background: sample scene texture at bent ray's screen position
        // Project final ray direction back to screen space
        vec4 projected = projectionMatrix * viewMatrix * vec4(pos, 1.0);
        vec2 lensedUV = (projected.xy / projected.w) * 0.5 + 0.5;
        lensedUV = clamp(lensedUV, 0.0, 1.0);

        finalColor = texture2D(tScene, lensedUV).rgb;
    }

    // Photon ring glow at edge of event horizon
    vec4 bhScreen = projectionMatrix * viewMatrix * vec4(bhPosition, 1.0);
    vec2 bhUV = (bhScreen.xy / bhScreen.w) * 0.5 + 0.5;
    float screenDist = length((uv - bhUV) * vec2(aspect, 1.0));
    float ringRadius = bhRadius * 2.0 / max(distToBH, 0.01);
    float ring = exp(-pow((screenDist - ringRadius) / (ringRadius * 0.15), 2.0));
    finalColor += vec3(1.0, 0.8, 0.5) * ring * 0.5;

    gl_FragColor = vec4(finalColor, 1.0);
}
