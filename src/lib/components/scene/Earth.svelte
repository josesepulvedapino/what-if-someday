<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { useTexture } from '@threlte/extras';
	import { metersToWorld, VISUAL_RADIUS_MULT } from '$lib/simulation/constants';
	import type { CelestialBody } from '$lib/simulation/bodies';
	import { sim } from '$lib/stores/simulation.svelte';
	import * as THREE from 'three';

	interface Props {
		body: CelestialBody;
	}

	let { body }: Props = $props();

	let visualRadius = $derived(metersToWorld(body.radius) * VISUAL_RADIUS_MULT);
	let wx = $derived(metersToWorld(body.x));
	let wy = $derived(metersToWorld(body.y));
	let wz = $derived(metersToWorld(body.z));

	const sunDir = new THREE.Vector3(-1, 0, 0);

	useTask(() => {
		const sun = sim.bodies.find(b => b.id === 'sun');
		if (sun) {
			sunDir.set(
				metersToWorld(sun.x) - wx,
				metersToWorld(sun.y) - wy,
				metersToWorld(sun.z) - wz
			).normalize();
		} else {
			sunDir.set(-wx, -wy, -wz).normalize();
		}
	});

	const dayTex = useTexture('/textures/earth_day.jpg');
	const nightTex = useTexture('/textures/earth_night.jpg');

	// Track loaded textures
	let dayMap = $state<THREE.Texture | null>(null);
	let nightMap = $state<THREE.Texture | null>(null);

	// Load independently — don't wait for both
	dayTex.then(t => { dayMap = t; }).catch(() => {});
	nightTex.then(t => { nightMap = t; }).catch(() => {});

	const earthVert = `
		varying vec2 vUv;
		varying vec3 vNormal;
		varying vec3 vPosition;
		void main() {
			vUv = uv;
			vNormal = normalize(normalMatrix * normal);
			vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`;

	// Shader that works with or without night texture
	const earthFrag = `
		uniform sampler2D dayMap;
		uniform sampler2D nightMap;
		uniform vec3 sunDirection;
		uniform float hasNight;
		varying vec2 vUv;
		varying vec3 vNormal;
		varying vec3 vPosition;
		void main() {
			vec3 normal = normalize(vNormal);
			float sunDot = dot(normal, sunDirection);
			float dayFactor = smoothstep(-0.15, 0.25, sunDot);
			vec3 dayColor = texture2D(dayMap, vUv).rgb;
			vec3 surface;
			if (hasNight > 0.5) {
				vec3 nightColor = texture2D(nightMap, vUv).rgb;
				surface = mix(nightColor * 2.0, dayColor, dayFactor);
			} else {
				surface = dayColor * (dayFactor * 0.85 + 0.15);
			}
			vec3 viewDir = normalize(-vPosition);
			vec3 reflectDir = reflect(-sunDirection, normal);
			float specular = pow(max(dot(viewDir, reflectDir), 0.0), 48.0);
			surface += vec3(0.4, 0.5, 0.7) * specular * dayFactor * 0.3;
			gl_FragColor = vec4(surface, 1.0);
		}
	`;

	let uniforms = $derived({
		dayMap: { value: dayMap },
		nightMap: { value: nightMap || dayMap },
		sunDirection: { value: sunDir },
		hasNight: { value: nightMap ? 1.0 : 0.0 }
	});
</script>

<T.Group position.x={wx} position.y={wy} position.z={wz}>
	{#if dayMap}
		<T.Mesh>
			<T.SphereGeometry args={[visualRadius, 64, 64]} />
			<T.ShaderMaterial
				vertexShader={earthVert}
				fragmentShader={earthFrag}
				uniforms={uniforms}
			/>
		</T.Mesh>

		<T.Mesh>
			<T.SphereGeometry args={[visualRadius * 1.04, 48, 48]} />
			<T.ShaderMaterial
				vertexShader={`
					varying vec3 vNormal;
					varying vec3 vPosition;
					void main() {
						vNormal = normalize(normalMatrix * normal);
						vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
						gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
					}
				`}
				fragmentShader={`
					varying vec3 vNormal;
					varying vec3 vPosition;
					void main() {
						vec3 viewDir = normalize(-vPosition);
						float fresnel = 1.0 - dot(viewDir, normalize(vNormal));
						fresnel = pow(fresnel, 3.0) * 1.5;
						gl_FragColor = vec4(vec3(0.3, 0.6, 1.0) * fresnel * 0.7, fresnel * 0.6);
					}
				`}
				transparent
				side={THREE.FrontSide}
				blending={THREE.AdditiveBlending}
				depthWrite={false}
			/>
		</T.Mesh>
	{:else}
		<T.Mesh>
			<T.SphereGeometry args={[visualRadius, 32, 32]} />
			<T.MeshStandardMaterial color="#4A90D9" roughness={0.7} />
		</T.Mesh>
	{/if}
</T.Group>
