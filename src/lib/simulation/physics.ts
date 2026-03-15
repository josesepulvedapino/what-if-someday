import { G } from './constants';
import type { CelestialBody } from './bodies';

const SOFTENING = 1e9; // Softening parameter to prevent singularities

/**
 * Compute gravitational accelerations for all bodies.
 * Writes directly into each body's ax, ay, az.
 */
export function computeAccelerations(bodies: CelestialBody[]): void {
	const n = bodies.length;

	// Reset accelerations
	for (let i = 0; i < n; i++) {
		bodies[i].ax = 0;
		bodies[i].ay = 0;
		bodies[i].az = 0;
	}

	// Pairwise gravitational forces
	for (let i = 0; i < n; i++) {
		for (let j = i + 1; j < n; j++) {
			const a = bodies[i];
			const b = bodies[j];

			const dx = b.x - a.x;
			const dy = b.y - a.y;
			const dz = b.z - a.z;

			const distSq = dx * dx + dy * dy + dz * dz + SOFTENING * SOFTENING;
			const dist = Math.sqrt(distSq);
			const force = G / (distSq * dist); // G / r³

			// a_i += (G * m_j / r³) * r_vec
			a.ax += force * b.mass * dx;
			a.ay += force * b.mass * dy;
			a.az += force * b.mass * dz;

			// a_j -= (G * m_i / r³) * r_vec  (Newton's 3rd law)
			b.ax -= force * a.mass * dx;
			b.ay -= force * a.mass * dy;
			b.az -= force * a.mass * dz;
		}
	}
}

/**
 * Velocity Verlet integration step.
 * More stable than Euler for orbital mechanics.
 */
export function stepVerlet(bodies: CelestialBody[], dt: number): void {
	const n = bodies.length;

	// Half-step velocity + full-step position
	for (let i = 0; i < n; i++) {
		const b = bodies[i];
		b.vx += 0.5 * b.ax * dt;
		b.vy += 0.5 * b.ay * dt;
		b.vz += 0.5 * b.az * dt;

		b.x += b.vx * dt;
		b.y += b.vy * dt;
		b.z += b.vz * dt;
	}

	// Recompute accelerations at new positions
	computeAccelerations(bodies);

	// Second half-step velocity
	for (let i = 0; i < n; i++) {
		const b = bodies[i];
		b.vx += 0.5 * b.ax * dt;
		b.vy += 0.5 * b.ay * dt;
		b.vz += 0.5 * b.az * dt;
	}
}
