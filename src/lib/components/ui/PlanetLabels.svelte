<script lang="ts">
	import { sim } from '$lib/stores/simulation.svelte';
	import { cam } from '$lib/stores/camera.svelte';
	import { metersToWorld } from '$lib/simulation/constants';
	import * as THREE from 'three';
	import { browser } from '$app/environment';

	interface LabelData {
		id: string;
		name: string;
		x: number;
		y: number;
	}

	let labels = $state<LabelData[]>([]);
	let hoveredId = $state<string | null>(null);
	let mouseX = 0;
	let mouseY = 0;

	const vec = new THREE.Vector3();

	function update() {
		if (!browser) return;
		const cam3 = (window as any).__wis_camera as THREE.PerspectiveCamera | undefined;
		if (!cam3) return;

		// Force matrix update
		cam3.updateMatrixWorld();

		const w = window.innerWidth;
		const h = window.innerHeight;
		const result: LabelData[] = [];

		for (const body of sim.bodies) {
			if (body.type === 'blackhole') continue;

			vec.set(metersToWorld(body.x), metersToWorld(body.y), metersToWorld(body.z));
			vec.project(cam3);

			if (vec.z > 1) continue;

			const sx = (vec.x * 0.5 + 0.5) * w;
			const sy = (-vec.y * 0.5 + 0.5) * h;

			if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) continue;

			result.push({ id: body.id, name: body.name, x: sx, y: sy });
		}

		labels = result;

		// Hover check with fresh positions
		let closest: string | null = null;
		let closestDist = 60;
		for (const label of result) {
			const dx = label.x - mouseX;
			const dy = label.y - mouseY;
			const d = Math.sqrt(dx * dx + dy * dy);
			if (d < closestDist) {
				closestDist = d;
				closest = label.id;
			}
		}
		hoveredId = closest;
	}

	$effect(() => {
		if (!browser) return;
		let running = true;
		function loop() {
			if (!running) return;
			update();
			requestAnimationFrame(loop);
		}
		requestAnimationFrame(loop);
		return () => { running = false; };
	});

	function onMove(e: MouseEvent) {
		mouseX = e.clientX;
		mouseY = e.clientY;
	}

	function onClick() {
		if (hoveredId && !sim.placingBlackHole) {
			cam.target = hoveredId;
		}
	}

	let showPointer = $derived(!!hoveredId && !sim.placingBlackHole);
</script>

<svelte:window onmousemove={onMove} onclick={onClick} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="fixed inset-0" style="z-index: 8; pointer-events: {showPointer ? 'auto' : 'none'}; cursor: {showPointer ? 'pointer' : 'default'};">
	{#each labels as label (label.id)}
		{@const isHovered = hoveredId === label.id}
		{@const isTracked = cam.target === label.id}
		{#if isHovered || isTracked}
			<div
				class="planet-label"
				class:tracked={isTracked}
				class:hovered={isHovered && !isTracked}
				style="left: {label.x}px; top: {label.y}px;"
			>
				{label.name}
			</div>
		{/if}
	{/each}
</div>

<style>
	.planet-label {
		position: absolute;
		transform: translate(12px, -50%);
		font-family: 'JetBrains Mono', monospace;
		font-size: 10px;
		letter-spacing: 0.08em;
		white-space: nowrap;
		padding: 3px 8px;
		border-radius: 3px;
	}

	.tracked {
		background: rgba(99, 102, 241, 0.12);
		border: 1px solid rgba(99, 102, 241, 0.25);
		color: rgba(129, 140, 248, 0.9);
	}

	.hovered {
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.7);
	}
</style>
