uniform sampler2D dayMap;
uniform sampler2D nightMap;
uniform sampler2D specMap;
uniform sampler2D cloudMap;
uniform vec3 sunDirection;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vec3 normal = normalize(vNormal);
    float sunDot = dot(normal, sunDirection);

    // Day/night transition with smooth terminator
    float dayFactor = smoothstep(-0.1, 0.2, sunDot);

    vec4 dayColor = texture2D(dayMap, vUv);
    vec4 nightColor = texture2D(nightMap, vUv);
    vec4 clouds = texture2D(cloudMap, vUv);

    // Mix day and night
    vec3 surface = mix(nightColor.rgb * 1.5, dayColor.rgb, dayFactor);

    // Add clouds on day side
    surface = mix(surface, clouds.rgb, clouds.r * dayFactor * 0.6);

    // Specular highlight on oceans (where specMap is bright)
    float spec = texture2D(specMap, vUv).r;
    vec3 viewDir = normalize(-vPosition);
    vec3 reflectDir = reflect(-sunDirection, normal);
    float specular = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    surface += vec3(0.4, 0.5, 0.6) * specular * spec * dayFactor;

    gl_FragColor = vec4(surface, 1.0);
}
