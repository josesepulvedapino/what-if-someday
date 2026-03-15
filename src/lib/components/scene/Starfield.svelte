<script lang="ts">
	import { T } from '@threlte/core';
	import * as THREE from 'three';

	// Very large radius so you never leave the starfield
	// Neptune is at ~450 world units, ejected planets go to ~2000
	// Stars at 2500+ means they're always around you
	const layers = [
		{ count: 18000, radius: 2800, minSize: 0.6, maxSize: 1.3 },
		{ count: 6000, radius: 2500, minSize: 1.0, maxSize: 2.5 },
		{ count: 1000, radius: 2200, minSize: 2.0, maxSize: 4.0 }
	];

	function starColor(rand: number): [number, number, number] {
		if (rand > 0.95) return [0.6, 0.7, 1.0];
		if (rand > 0.88) return [0.8, 0.85, 1.0];
		if (rand > 0.75) return [1.0, 1.0, 0.95];
		if (rand > 0.55) return [1.0, 0.95, 0.8];
		if (rand > 0.35) return [1.0, 0.8, 0.5];
		return [1.0, 0.6, 0.4];
	}

	function buildLayer(config: typeof layers[0]) {
		const positions = new Float32Array(config.count * 3);
		const colors = new Float32Array(config.count * 3);
		const sizes = new Float32Array(config.count);

		for (let i = 0; i < config.count; i++) {
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.acos(2 * Math.random() - 1);
			const r = config.radius * (0.85 + Math.random() * 0.15);

			positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
			positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
			positions[i * 3 + 2] = r * Math.cos(phi);

			const [cr, cg, cb] = starColor(Math.random());
			const brightness = 0.7 + Math.random() * 0.3;
			colors[i * 3] = cr * brightness;
			colors[i * 3 + 1] = cg * brightness;
			colors[i * 3 + 2] = cb * brightness;

			sizes[i] = config.minSize + Math.random() * (config.maxSize - config.minSize);
		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
		geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

		return geometry;
	}

	const starVertexShader = `
		attribute float size;
		varying vec3 vColor;
		void main() {
			vColor = color;
			gl_PointSize = size;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`;

	const starFragmentShader = `
		varying vec3 vColor;
		void main() {
			vec2 center = gl_PointCoord - vec2(0.5);
			float dist = length(center);
			float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
			float glow = exp(-dist * dist * 8.0);
			alpha = mix(alpha, glow, 0.4);
			if (alpha < 0.01) discard;
			gl_FragColor = vec4(vColor * (1.0 + glow * 0.5), alpha);
		}
	`;

	const builtLayers = layers.map(buildLayer);
</script>

{#each builtLayers as geometry, i (i)}
	<T.Points {geometry}>
		<T.ShaderMaterial
			vertexShader={starVertexShader}
			fragmentShader={starFragmentShader}
			transparent
			depthWrite={false}
			blending={THREE.AdditiveBlending}
			vertexColors={true}
		/>
	</T.Points>
{/each}
