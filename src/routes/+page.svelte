<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import HUD from '$lib/components/ui/HUD.svelte';
	import PlanetLabels from '$lib/components/ui/PlanetLabels.svelte';
	import WelcomeModal from '$lib/components/ui/WelcomeModal.svelte';
	import { sim } from '$lib/stores/simulation.svelte';
	import { cam } from '$lib/stores/camera.svelte';
	import * as THREE from 'three';

	const raycaster = new THREE.Raycaster();
	const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
	const mouse = new THREE.Vector2();
	const intersection = new THREE.Vector3();

	function handlePlacementClick(e: MouseEvent) {
		if (!sim.placingBlackHole) return;

		const cam3 = (window as any).__wis_camera as THREE.PerspectiveCamera | undefined;
		if (!cam3) return;

		mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

		raycaster.setFromCamera(mouse, cam3);
		const hit = raycaster.ray.intersectPlane(groundPlane, intersection);
		if (hit) {
			sim.placeBlackHoleAt(intersection.x, intersection.z);
			setTimeout(() => { cam.target = 'blackhole'; }, 200);
		}
	}
</script>

<svelte:head>
	<title>What If Someday? — Solar System Simulation</title>
	<meta name="description" content="An interactive 3D solar system simulation with orbital mechanics. Track planets, observe trajectories, and explore what happens when a black hole enters our solar system." />
	<meta name="keywords" content="solar system, simulation, black hole, orbital mechanics, 3D, planets, astronomy, space" />
	<meta name="author" content="Jose Sepulveda Pino" />
	<link rel="canonical" href="https://what-if-someday.vercel.app" />

	<!-- Open Graph -->
	<meta property="og:title" content="What If Someday? — Solar System Simulation" />
	<meta property="og:description" content="An interactive 3D solar system simulation. Track planets and explore what happens when a black hole enters our neighborhood." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://what-if-someday.vercel.app" />
	<meta property="og:image" content="https://what-if-someday.vercel.app/og-image.svg" />
	<meta property="og:site_name" content="What If Someday?" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="What If Someday?" />
	<meta name="twitter:description" content="Interactive solar system simulation with black hole scenarios" />
	<meta name="twitter:image" content="https://what-if-someday.vercel.app/og-image.svg" />

	<meta name="theme-color" content="#050507" />

	<!-- Author links -->
	<meta property="article:author" content="https://www.linkedin.com/in/josesepulvedapino/" />
	<link rel="author" href="https://github.com/josesepulvedapino" />

	<!-- Structured data -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "WebApplication",
		"name": "What If Someday?",
		"description": "An interactive 3D solar system simulation with orbital mechanics and black hole scenarios",
		"url": "https://what-if-someday.vercel.app",
		"applicationCategory": "Simulation",
		"author": {
			"@type": "Person",
			"name": "Jose Sepulveda Pino",
			"url": "https://github.com/josesepulvedapino",
			"sameAs": [
				"https://www.linkedin.com/in/josesepulvedapino/",
				"https://github.com/josesepulvedapino"
			]
		}
	})}</script>`}
</svelte:head>

<div class="w-screen h-screen bg-void-950 overflow-hidden relative">
	{#if browser}
		{#await import('$lib/components/scene/Scene.svelte') then { default: Scene }}
			<Scene />
		{/await}
	{/if}

	{#if sim.placingBlackHole}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="fixed inset-0 cursor-crosshair" style="z-index: 5;" onclick={handlePlacementClick}></div>
	{/if}

	{#if browser}
		<PlanetLabels />
	{/if}

	<HUD />
	<WelcomeModal />
</div>
