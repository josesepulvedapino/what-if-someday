<script lang="ts">
	import { T } from '@threlte/core';
	import { cam } from '$lib/stores/camera.svelte';
	import { sim } from '$lib/stores/simulation.svelte';
	import { getTrailPoints } from '$lib/simulation/trails.svelte';
	import { metersToWorld, AU } from '$lib/simulation/constants';
	import * as THREE from 'three';

	// Static orbit circle colors
	const orbitColors: Record<string, number> = {
		mercury: 0x6b6363, venus: 0x8a7d60, earth: 0x3a6090, mars: 0x7a3818,
		jupiter: 0x7a5a28, saturn: 0x8a7848, uranus: 0x3a7078, neptune: 0x2a3878
	};

	// Dynamic trail colors (brighter)
	const trailColors: Record<string, number> = {
		sun: 0xfdb813, mercury: 0xb5a7a7, venus: 0xe8cda0, earth: 0x4a90d9,
		mars: 0xc1440e, jupiter: 0xc88b3a, saturn: 0xe4d191, uranus: 0x73c2d0, neptune: 0x3f54ba
	};

	function buildOrbitRing(distanceAU: number, segments = 256): THREE.BufferGeometry {
		const radius = metersToWorld(distanceAU * AU);
		const points: number[] = [];
		for (let i = 0; i <= segments; i++) {
			const angle = (i / segments) * Math.PI * 2;
			points.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
		}
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points), 3));
		return geo;
	}

	const staticOrbits = [
		{ id: 'mercury', au: 0.387 }, { id: 'venus', au: 0.723 },
		{ id: 'earth', au: 1.0 }, { id: 'mars', au: 1.524 },
		{ id: 'jupiter', au: 5.203 }, { id: 'saturn', au: 9.537 },
		{ id: 'uranus', au: 19.19 }, { id: 'neptune', au: 30.07 }
	].map(o => ({
		id: o.id,
		geometry: buildOrbitRing(o.au),
		color: orbitColors[o.id] || 0x444444
	}));

	let hasBH = $derived(!!sim.blackHole);

	// Dynamic trail geometries (rebuilt from trail data)
	const geoCache = new Map<string, THREE.BufferGeometry>();

	let dynamicTrails = $derived.by(() => {
		sim.trailVersion; // trigger reactivity
		if (!hasBH) return [];

		const result: { id: string; geometry: THREE.BufferGeometry; color: number }[] = [];
		for (const [id, trail] of sim.trails) {
			if (trail.count < 3) continue;
			const points = getTrailPoints(trail);

			const old = geoCache.get(id);
			if (old) old.dispose();

			const geo = new THREE.BufferGeometry();
			geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points), 3));
			geoCache.set(id, geo);

			result.push({ id, geometry: geo, color: trailColors[id] || 0x888888 });
		}
		return result;
	});
</script>

<!-- Static circular orbits: only when no BH and showOrbits enabled -->
{#if cam.showOrbits && !hasBH}
	{#each staticOrbits as orbit (orbit.id)}
		<T.Line geometry={orbit.geometry}>
			<T.LineBasicMaterial color={orbit.color} transparent opacity={0.18} depthWrite={false} />
		</T.Line>
	{/each}
{/if}

<!-- Dynamic real trails: show when BH is active -->
{#if hasBH}
	{#each dynamicTrails as trail (trail.id)}
		<T.Line geometry={trail.geometry}>
			<T.LineBasicMaterial
				color={trail.color}
				transparent
				opacity={0.3}
				depthWrite={false}
			/>
		</T.Line>
	{/each}
{/if}
