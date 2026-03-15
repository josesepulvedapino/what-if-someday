import { createInitialBodies, createBlackHole, type CelestialBody } from '../simulation/bodies';
import { computeAccelerations, stepVerlet } from '../simulation/physics';
import { createTrails, recordTrails, type Trail } from '../simulation/trails.svelte';
import { TIME_STEP, SOLAR_MASS, AU, SCALE } from '../simulation/constants';

class SimulationState {
	bodies = $state<CelestialBody[]>(createInitialBodies());
	time = $state(0);
	speed = $state(1);
	paused = $state(false);
	trails = $state<Map<string, Trail>>(createTrails());
	trailVersion = $state(0);
	placingBlackHole = $state(false);
	bhMassMultiplier = $state(4);

	private frameCount = 0;

	tick(deltaMs: number) {
		if (this.paused) return;

		const dt = TIME_STEP * this.speed;
		const steps = Math.min(Math.ceil((deltaMs / 1000) * Math.min(this.speed, 100)), 8);

		for (let i = 0; i < steps; i++) {
			stepVerlet(this.bodies, dt);
			this.time += dt;
		}

		this.frameCount++;
		if (this.frameCount % 2 === 0) {
			recordTrails(this.trails, this.bodies, !!this.blackHole);
			this.trailVersion++;
		}
	}

	/** Place BH at world coordinates (from click on XZ plane) */
	placeBlackHoleAt(worldX: number, worldZ: number) {
		const filtered = this.bodies.filter(b => b.type !== 'blackhole');

		// Convert world coords back to meters
		const x = worldX / SCALE;
		const z = worldZ / SCALE;

		// Inward velocity toward origin
		const dist = Math.sqrt(x * x + z * z);
		// Slow approach for gradual interaction
		const approachSpeed = 2000;
		const vx = -(x / dist) * approachSpeed;
		const vz = -(z / dist) * approachSpeed;

		const bh = createBlackHole(this.bhMassMultiplier * SOLAR_MASS, x, 0, z, vx, 0, vz);
		this.bodies = [...filtered, bh];
		computeAccelerations(this.bodies);
		this.placingBlackHole = false;
	}

	removeBlackHole() {
		this.bodies = this.bodies.filter(b => b.type !== 'blackhole');
	}

	get blackHole(): CelestialBody | undefined {
		return this.bodies.find(b => b.type === 'blackhole');
	}

	reset() {
		this.bodies = createInitialBodies();
		this.time = 0;
		this.trails = createTrails();
		this.trailVersion = 0;
		this.frameCount = 0;
		this.placingBlackHole = false;
		computeAccelerations(this.bodies);
	}
}

export const sim = new SimulationState();
