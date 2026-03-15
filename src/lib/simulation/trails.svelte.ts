import type { CelestialBody } from './bodies';
import { metersToWorld } from './constants';

const MAX_TRAIL_LENGTH = 600;

export interface Trail {
	points: Float32Array;
	head: number;
	count: number;
}

export function createTrails(): Map<string, Trail> {
	return new Map();
}

export function recordTrails(trails: Map<string, Trail>, bodies: CelestialBody[], hasBH: boolean): void {
	for (const body of bodies) {
		// Only record star trails when BH is active (Sun normally doesn't move)
		if (body.type === 'star' && !hasBH) continue;
		if (body.type === 'blackhole') continue;

		let trail = trails.get(body.id);
		if (!trail) {
			trail = {
				points: new Float32Array(MAX_TRAIL_LENGTH * 3),
				head: 0,
				count: 0
			};
			trails.set(body.id, trail);
		}

		const idx = trail.head * 3;
		trail.points[idx] = metersToWorld(body.x);
		trail.points[idx + 1] = metersToWorld(body.y);
		trail.points[idx + 2] = metersToWorld(body.z);

		trail.head = (trail.head + 1) % MAX_TRAIL_LENGTH;
		if (trail.count < MAX_TRAIL_LENGTH) trail.count++;
	}
}

export function getTrailPoints(trail: Trail): number[] {
	const result: number[] = [];
	const start = trail.count < MAX_TRAIL_LENGTH ? 0 : trail.head;

	for (let i = 0; i < trail.count; i++) {
		const idx = ((start + i) % MAX_TRAIL_LENGTH) * 3;
		result.push(trail.points[idx], trail.points[idx + 1], trail.points[idx + 2]);
	}

	return result;
}
