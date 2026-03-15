import { gsap } from 'gsap';
import * as THREE from 'three';
import type { CelestialBody } from '../simulation/bodies';
import { metersToWorld, VISUAL_RADIUS_MULT } from '../simulation/constants';
import { cam } from '../stores/camera.svelte';
import { sim } from '../stores/simulation.svelte';

const SUN_VISUAL_RADIUS = 1.2;

export function transitionToBody(
	camera: THREE.PerspectiveCamera,
	controls: { target: THREE.Vector3; enabled: boolean; update: () => void },
	body: CelestialBody,
	duration = 1.5
) {
	if (cam.transitioning) return;
	cam.transitioning = true;
	cam.target = body.id;

	let offset: number;
	if (body.type === 'star') {
		offset = SUN_VISUAL_RADIUS * 4;
	} else if (body.type === 'blackhole') {
		offset = Math.pow(body.mass / 1.989e31, 0.33) * 1.5 * 6;
	} else {
		const visualRadius = metersToWorld(body.radius) * VISUAL_RADIUS_MULT;
		offset = Math.max(visualRadius * 5, 0.5);
	}

	controls.enabled = false;

	const progress = { t: 0 };
	const startPos = camera.position.clone();
	const startTarget = controls.target.clone();

	gsap.killTweensOf(progress);

	gsap.to(progress, {
		t: 1,
		duration,
		ease: 'power3.inOut',
		onUpdate: () => {
			// Get body's CURRENT position (it moves during transition)
			const liveBody = sim.bodies.find(b => b.id === body.id);
			if (!liveBody) return;

			const targetPos = new THREE.Vector3(
				metersToWorld(liveBody.x),
				metersToWorld(liveBody.y),
				metersToWorld(liveBody.z)
			);

			const cameraTarget = new THREE.Vector3(
				targetPos.x + offset * 0.7,
				targetPos.y + offset * 0.4,
				targetPos.z + offset * 0.7
			);

			// Interpolate from start to current live position
			camera.position.lerpVectors(startPos, cameraTarget, progress.t);
			controls.target.lerpVectors(startTarget, targetPos, progress.t);
			controls.update();
		},
		onComplete: () => {
			controls.enabled = true;
			cam.transitioning = false;
		}
	});
}
