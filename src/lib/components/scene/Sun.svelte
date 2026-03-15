<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import * as THREE from 'three';
	import { sim } from '$lib/stores/simulation.svelte';
	import { metersToWorld } from '$lib/simulation/constants';

	const R = 1.2;

	// Sun position from N-body sim (moves when BH pulls it)
	let sun = $derived(sim.bodies.find(b => b.id === 'sun'));
	let sx = $derived(sun ? metersToWorld(sun.x) : 0);
	let sy = $derived(sun ? metersToWorld(sun.y) : 0);
	let sz = $derived(sun ? metersToWorld(sun.z) : 0);

	let time = $state(0);
	const timeUniform = { value: 0 };
	useTask((delta) => {
		time += delta;
		timeUniform.value = time;
	});

	const sunVert = `
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

	const sunFrag = `
		uniform float time;
		varying vec2 vUv;
		varying vec3 vNormal;
		varying vec3 vPosition;

		float hash(vec2 p) {
			return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
		}
		float noise(vec2 p) {
			vec2 i = floor(p);
			vec2 f = fract(p);
			f = f * f * (3.0 - 2.0 * f);
			return mix(
				mix(hash(i), hash(i + vec2(1,0)), f.x),
				mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
				f.y
			);
		}
		float fbm(vec2 p) {
			float v = 0.0; float a = 0.5;
			for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
			return v;
		}

		void main() {
			vec2 uv = vUv;
			float n = fbm(uv * 6.0 + time * 0.05);
			float n2 = fbm(uv * 12.0 - time * 0.08);

			vec3 hot = vec3(1.0, 0.98, 0.9);
			vec3 warm = vec3(1.0, 0.75, 0.3);
			vec3 cool = vec3(0.9, 0.4, 0.1);

			float t = n * 0.6 + n2 * 0.4;
			vec3 color = mix(cool, warm, smoothstep(0.3, 0.5, t));
			color = mix(color, hot, smoothstep(0.55, 0.75, t));

			vec3 viewDir = normalize(-vPosition);
			float limb = dot(viewDir, normalize(vNormal));
			limb = pow(max(limb, 0.0), 0.4);
			color *= limb;
			color *= 1.8;

			gl_FragColor = vec4(color, 1.0);
		}
	`;
</script>

<T.Group position.x={sx} position.y={sy} position.z={sz}>
	<T.Mesh>
		<T.SphereGeometry args={[R, 64, 64]} />
		<T.ShaderMaterial
			vertexShader={sunVert}
			fragmentShader={sunFrag}
			uniforms={{ time: timeUniform }}
		/>
	</T.Mesh>

	<T.PointLight color="#FFF5E0" intensity={4} distance={0} decay={0} />
</T.Group>
