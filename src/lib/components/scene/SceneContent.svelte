<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import SolarSystem from './SolarSystem.svelte';
	import Starfield from './Starfield.svelte';
	import PostProcessing from './PostProcessing.svelte';
	import { sim } from '$lib/stores/simulation.svelte';
	import { cam } from '$lib/stores/camera.svelte';
	import { metersToWorld, VISUAL_RADIUS_MULT } from '$lib/simulation/constants';
	import { computeAccelerations } from '$lib/simulation/physics';
	import { transitionToBody } from '$lib/camera/transitions';
	import * as THREE from 'three';

	const { camera } = useThrelte();

	let controlsRef = $state<any>(null);

	computeAccelerations(sim.bodies);

	// Configure OrbitControls after ref is available
	$effect(() => {
		if (controlsRef) {
			controlsRef.mouseButtons = {
				LEFT: THREE.MOUSE.ROTATE,
				MIDDLE: THREE.MOUSE.DOLLY,
				RIGHT: THREE.MOUSE.PAN
			};
			controlsRef.enablePan = true;
			controlsRef.panSpeed = 0.8;
			controlsRef.update();
		}
	});

	// Expose camera and controls for BH placement (accessed from page)
	// Store refs globally so the page-level overlay can access them
	$effect(() => {
		if (camera.current && controlsRef) {
			(window as any).__wis_camera = camera.current;
			(window as any).__wis_controls = controlsRef;
		}
	});

	// Physics tick + camera tracking
	useTask((delta) => {
		sim.tick(delta * 1000);

		if (controlsRef && !cam.transitioning && !cam.freeCamera) {
			const body = sim.bodies.find(b => b.id === cam.target);
			if (body) {
				const wx = metersToWorld(body.x);
				const wy = metersToWorld(body.y);
				const wz = metersToWorld(body.z);

				const dx = wx - controlsRef.target.x;
				const dy = wy - controlsRef.target.y;
				const dz = wz - controlsRef.target.z;

				controlsRef.target.x = wx;
				controlsRef.target.y = wy;
				controlsRef.target.z = wz;

				const cam3 = camera.current;
				if (cam3) {
					cam3.position.x += dx;
					cam3.position.y += dy;
					cam3.position.z += dz;
				}

				controlsRef.update();
			}
		}
	});

	// Camera transitions
	let lastTarget = 'earth';
	$effect(() => {
		const target = cam.target;
		if (target !== lastTarget && controlsRef) {
			lastTarget = target;
			cam.freeCamera = false;
			const body = sim.bodies.find(b => b.id === target);
			if (body) {
				const cam3 = camera.current;
				if (cam3 && cam3 instanceof THREE.PerspectiveCamera) {
					transitionToBody(cam3, controlsRef, body);
				}
			}
		}
	});

	const earth = sim.bodies.find(b => b.id === 'earth')!;
	const earthX = metersToWorld(earth.x);
	const earthRadius = metersToWorld(earth.radius) * VISUAL_RADIUS_MULT;
	const viewDist = Math.max(earthRadius * 5, 2);
</script>

<T.PerspectiveCamera
	makeDefault
	position.x={earthX + viewDist * 0.7}
	position.y={viewDist * 0.5}
	position.z={viewDist * 0.7}
	fov={cam.fov}
	near={0.0001}
	far={6000}
>
	<OrbitControls
		enableDamping
		dampingFactor={0.08}
		minDistance={0.01}
		maxDistance={1000}
		target={[earthX, 0, 0]}
		bind:ref={controlsRef}
		enablePan={true}
		rotateSpeed={0.6}
		zoomSpeed={1.2}
	/>
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.03} color="#4466aa" />

<Starfield />
<SolarSystem />
<PostProcessing />
