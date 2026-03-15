<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { sim } from '$lib/stores/simulation.svelte';
	import Planet from './Planet.svelte';
	import Earth from './Earth.svelte';
	import Sun from './Sun.svelte';
	import OrbitalTrails from './OrbitalTrails.svelte';
	import { MOON_ORBITAL_RADIUS, MOON_ORBITAL_PERIOD, MOON_RADIUS } from '$lib/simulation/bodies';
	import { cam } from '$lib/stores/camera.svelte';
	import { useTexture } from '@threlte/extras';
	import * as THREE from 'three';
	import { metersToWorld, VISUAL_RADIUS_MULT, AU } from '$lib/simulation/constants';

	let regularPlanets = $derived(
		sim.bodies.filter(b => b.type === 'planet' && b.id !== 'earth')
	);
	let earth = $derived(sim.bodies.find(b => b.id === 'earth'));
	let blackHole = $derived(sim.blackHole);

	let bhX = $derived(blackHole ? metersToWorld(blackHole.x) : 0);
	let bhY = $derived(blackHole ? metersToWorld(blackHole.y) : 0);
	let bhZ = $derived(blackHole ? metersToWorld(blackHole.z) : 0);
	let bhVisualRadius = $derived(blackHole ? Math.pow(blackHole.mass / 1.989e31, 0.33) * 1.5 : 0);

	// Live BH distance from Sun
	let bhDistAU = $derived(blackHole
		? Math.sqrt(blackHole.x ** 2 + blackHole.y ** 2 + blackHole.z ** 2) / AU
		: 0
	);

	let diskTime = $state(0);
	const diskTimeUniform = { value: 0 };
	useTask((delta) => {
		diskTime += delta;
		diskTimeUniform.value = diskTime;
	});

	// Moon
	const MOON_VISUAL_DIST = metersToWorld(MOON_ORBITAL_RADIUS) * 8;
	const moonVisualRadius = metersToWorld(MOON_RADIUS) * VISUAL_RADIUS_MULT * 0.8;

	let moonPos = $derived.by(() => {
		if (!earth) return null;
		const angle = (sim.time / MOON_ORBITAL_PERIOD) * Math.PI * 2;
		const ex = metersToWorld(earth.x);
		const ey = metersToWorld(earth.y);
		const ez = metersToWorld(earth.z);
		return {
			x: ex + Math.cos(angle) * MOON_VISUAL_DIST,
			y: ey,
			z: ez + Math.sin(angle) * MOON_VISUAL_DIST
		};
	});

	function buildMoonOrbit(): THREE.BufferGeometry {
		const segments = 96;
		const points: number[] = [];
		for (let i = 0; i <= segments; i++) {
			const a = (i / segments) * Math.PI * 2;
			points.push(Math.cos(a) * MOON_VISUAL_DIST, 0, Math.sin(a) * MOON_VISUAL_DIST);
		}
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points), 3));
		return geo;
	}
	const moonOrbitGeo = buildMoonOrbit();
	const moonTexture = useTexture('/textures/moon.jpg');

	// Accretion disk shader
	const diskVert = `
		varying vec2 vUv;
		varying vec3 vWorldPos;
		void main() {
			vUv = uv;
			vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`;

	const diskFrag = `
		varying vec2 vUv;
		uniform float time;

		float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
		float noise(vec2 p) {
			vec2 i = floor(p); vec2 f = fract(p);
			f = f*f*(3.0-2.0*f);
			return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
		}

		void main() {
			vec2 centered = vUv - 0.5;
			float r = length(centered) * 2.0;
			float angle = atan(centered.y, centered.x);

			// Radial temperature: hotter near center
			float temp = 1.0 - smoothstep(0.0, 0.8, r);
			temp = pow(temp, 2.0);

			// Doppler beaming: one side brighter (approaching)
			float doppler = 0.5 + 0.5 * sin(angle - time * 1.5);

			// Turbulent spiral structure
			float n1 = noise(vec2(angle * 3.0 + r * 8.0 - time * 2.0, r * 4.0));
			float n2 = noise(vec2(angle * 7.0 - r * 12.0 + time * 3.0, r * 6.0 + time));
			float turbulence = n1 * 0.5 + n2 * 0.3;

			// Color: white-hot inner -> orange -> deep red outer
			vec3 innerColor = vec3(1.0, 0.95, 0.85);
			vec3 midColor = vec3(1.0, 0.6, 0.15);
			vec3 outerColor = vec3(0.6, 0.1, 0.02);

			vec3 color = mix(outerColor, midColor, smoothstep(0.0, 0.5, temp));
			color = mix(color, innerColor, smoothstep(0.5, 0.9, temp));

			float brightness = temp * (0.6 + turbulence * 0.4) * (0.7 + doppler * 0.3);
			float alpha = brightness * smoothstep(0.0, 0.1, r) * smoothstep(1.0, 0.6, r);

			// HDR brightness for bloom
			color *= 1.5 + temp;

			gl_FragColor = vec4(color, alpha * 0.85);
		}
	`;
</script>

<Sun />

{#each regularPlanets as planet (planet.id)}
	<Planet body={planet} />
{/each}

{#if earth}
	<Earth body={earth} />

	{#if !blackHole && cam.showOrbits}
		{@const ewx = metersToWorld(earth.x)}
		{@const ewy = metersToWorld(earth.y)}
		{@const ewz = metersToWorld(earth.z)}
		<T.Line geometry={moonOrbitGeo} position.x={ewx} position.y={ewy} position.z={ewz}>
			<T.LineBasicMaterial color={0x555555} transparent opacity={0.12} depthWrite={false} />
		</T.Line>
	{/if}
{/if}

{#if moonPos}
	<T.Group position.x={moonPos.x} position.y={moonPos.y} position.z={moonPos.z}>
		{#await moonTexture then map}
			<T.Mesh>
				<T.SphereGeometry args={[moonVisualRadius, 32, 32]} />
				<T.MeshStandardMaterial map={map} roughness={0.9} metalness={0.0} />
			</T.Mesh>
		{:catch}
			<T.Mesh>
				<T.SphereGeometry args={[moonVisualRadius, 32, 32]} />
				<T.MeshStandardMaterial color="#C0B8A8" roughness={0.9} metalness={0.0} />
			</T.Mesh>
		{/await}
	</T.Group>
{/if}

{#if blackHole}
	<T.Group position.x={bhX} position.y={bhY} position.z={bhZ}>
		<!-- Event horizon -->
		<T.Mesh>
			<T.SphereGeometry args={[bhVisualRadius, 64, 64]} />
			<T.MeshBasicMaterial color="#000000" />
		</T.Mesh>

		<!-- Photon sphere: thin bright ring at 1.5x Schwarzschild -->
		<T.Mesh rotation.x={Math.PI * 0.52}>
			<T.RingGeometry args={[bhVisualRadius * 1.45, bhVisualRadius * 1.55, 128]} />
			<T.MeshBasicMaterial
				color="#FFE8C8"
				transparent
				opacity={0.8}
				side={THREE.DoubleSide}
				blending={THREE.AdditiveBlending}
				depthWrite={false}
			/>
		</T.Mesh>

		<!-- Secondary photon ring (perpendicular, like Interstellar) -->
		<T.Mesh rotation.z={Math.PI * 0.5} rotation.y={Math.PI * 0.1}>
			<T.RingGeometry args={[bhVisualRadius * 1.48, bhVisualRadius * 1.52, 128]} />
			<T.MeshBasicMaterial
				color="#FFD4A0"
				transparent
				opacity={0.4}
				side={THREE.DoubleSide}
				blending={THREE.AdditiveBlending}
				depthWrite={false}
			/>
		</T.Mesh>

		<!-- Accretion disk with turbulent shader -->
		<T.Mesh rotation.x={Math.PI * 0.48}>
			<T.RingGeometry args={[bhVisualRadius * 2.0, bhVisualRadius * 6, 128, 1]} />
			<T.ShaderMaterial
				vertexShader={diskVert}
				fragmentShader={diskFrag}
				uniforms={{ time: diskTimeUniform }}
				transparent
				side={THREE.DoubleSide}
				blending={THREE.AdditiveBlending}
				depthWrite={false}
			/>
		</T.Mesh>

		<!-- Inner hot glow ring -->
		<T.Mesh rotation.x={Math.PI * 0.48}>
			<T.RingGeometry args={[bhVisualRadius * 1.6, bhVisualRadius * 2.2, 128]} />
			<T.MeshBasicMaterial
				color="#FFB060"
				transparent
				opacity={0.25}
				side={THREE.DoubleSide}
				blending={THREE.AdditiveBlending}
				depthWrite={false}
			/>
		</T.Mesh>
	</T.Group>
{/if}

<OrbitalTrails />
