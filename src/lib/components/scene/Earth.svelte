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
	const sunDirUniform = { value: sunDir };

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

	// Load textures separately to avoid object-mode issues
	const dayTex = useTexture('/textures/earth_day.jpg');
	const nightTex = useTexture('/textures/earth_night.jpg');

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

	const earthFrag = `
		uniform sampler2D dayMap;
		uniform sampler2D nightMap;
		uniform vec3 sunDirection;
		varying vec2 vUv;
		varying vec3 vNormal;
		varying vec3 vPosition;
		void main() {
			vec3 normal = normalize(vNormal);
			float sunDot = dot(normal, sunDirection);
			float dayFactor = smoothstep(-0.15, 0.25, sunDot);
			vec4 dayColor = texture2D(dayMap, vUv);
			vec4 nightColor = texture2D(nightMap, vUv);
			vec3 surface = mix(nightColor.rgb * 2.0, dayColor.rgb, dayFactor);
			vec3 viewDir = normalize(-vPosition);
			vec3 reflectDir = reflect(-sunDirection, normal);
			float specular = pow(max(dot(viewDir, reflectDir), 0.0), 48.0);
			surface += vec3(0.4, 0.5, 0.7) * specular * dayFactor * 0.3;
			gl_FragColor = vec4(surface, 1.0);
		}
	`;
</script>

<T.Group position.x={wx} position.y={wy} position.z={wz}>
	{#await Promise.all([dayTex, nightTex]) then [day, night]}
		<T.Mesh>
			<T.SphereGeometry args={[visualRadius, 64, 64]} />
			<T.ShaderMaterial
				vertexShader={earthVert}
				fragmentShader={earthFrag}
				uniforms={{
					dayMap: { value: day },
					nightMap: { value: night },
					sunDirection: sunDirUniform
				}}
			/>
		</T.Mesh>

		<!-- Atmosphere -->
		<T.Mesh>
			<T.SphereGeometry args={[visualRadius * 1.04, 64, 64]} />
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
	{:catch}
		<!-- Fallback with just day texture -->
		{#await dayTex then day}
			<T.Mesh>
				<T.SphereGeometry args={[visualRadius, 48, 48]} />
				<T.MeshStandardMaterial map={day} roughness={0.8} />
			</T.Mesh>
		{:catch}
			<T.Mesh>
				<T.SphereGeometry args={[visualRadius, 32, 32]} />
				<T.MeshStandardMaterial color="#4A90D9" roughness={0.7} />
			</T.Mesh>
		{/await}
	{/await}
</T.Group>
