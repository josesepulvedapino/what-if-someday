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

	const textures = useTexture({
		dayMap: '/textures/earth_day.jpg',
		nightMap: '/textures/earth_night.jpg'
	});

	const earthUniforms = {
		dayMap: { value: null as THREE.Texture | null },
		nightMap: { value: null as THREE.Texture | null },
		sunDirection: sunDirUniform
	};

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

	const atmosVert = `
		varying vec3 vNormal;
		varying vec3 vPosition;
		void main() {
			vNormal = normalize(normalMatrix * normal);
			vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`;

	const atmosFrag = `
		uniform vec3 glowColor;
		uniform float intensity;
		uniform vec3 sunDirection;
		varying vec3 vNormal;
		varying vec3 vPosition;
		void main() {
			vec3 normal = normalize(vNormal);
			vec3 viewDir = normalize(-vPosition);
			float fresnel = 1.0 - dot(viewDir, normal);
			fresnel = pow(fresnel, 3.0) * intensity;
			float sunFacing = dot(normal, sunDirection) * 0.3 + 0.7;
			gl_FragColor = vec4(glowColor * fresnel * sunFacing, fresnel * 0.6);
		}
	`;
</script>

<T.Group position.x={wx} position.y={wy} position.z={wz}>
	{#await textures then maps}
		{@const _ = (() => {
			earthUniforms.dayMap.value = maps.dayMap;
			earthUniforms.nightMap.value = maps.nightMap;
		})()}
		<T.Mesh>
			<T.SphereGeometry args={[visualRadius, 64, 64]} />
			<T.ShaderMaterial
				vertexShader={earthVert}
				fragmentShader={earthFrag}
				uniforms={earthUniforms}
			/>
		</T.Mesh>

		<T.Mesh>
			<T.SphereGeometry args={[visualRadius * 1.04, 64, 64]} />
			<T.ShaderMaterial
				vertexShader={atmosVert}
				fragmentShader={atmosFrag}
				uniforms={{
					glowColor: { value: new THREE.Vector3(0.3, 0.6, 1.0) },
					intensity: { value: 1.5 },
					sunDirection: sunDirUniform
				}}
				transparent={true}
				side={THREE.FrontSide}
				blending={THREE.AdditiveBlending}
				depthWrite={false}
			/>
		</T.Mesh>
	{:catch}
		<T.Mesh>
			<T.SphereGeometry args={[visualRadius, 32, 32]} />
			<T.MeshStandardMaterial color="#4A90D9" roughness={0.7} />
		</T.Mesh>
	{/await}
</T.Group>
