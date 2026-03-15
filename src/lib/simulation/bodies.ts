import { AU, SOLAR_MASS, EARTH_MASS, G } from './constants';

export interface CelestialBody {
	id: string;
	name: string;
	mass: number;
	radius: number;
	color: string;
	x: number;
	y: number;
	z: number;
	vx: number;
	vy: number;
	vz: number;
	ax: number;
	ay: number;
	az: number;
	type: 'star' | 'planet' | 'moon' | 'blackhole';
	textureKey?: string;
	ringColor?: string;
	hasAtmosphere?: boolean;
	distanceAU?: number;
	orbitalPeriodYears?: number;
	diameterKm?: number;
	moons?: number;
	description?: string;
}

function circularVelocity(distanceAU: number): number {
	const r = distanceAU * AU;
	return Math.sqrt(G * SOLAR_MASS / r);
}

export function createInitialBodies(): CelestialBody[] {
	// Moon is NOT included here — it's computed analytically in SolarSystem.svelte
	return [
		{
			id: 'sun', name: 'Sun', mass: SOLAR_MASS, radius: 6.957e8, color: '#FDB813',
			x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, ax: 0, ay: 0, az: 0,
			type: 'star', diameterKm: 1_392_700, description: 'G-type main-sequence star'
		},
		{
			id: 'mercury', name: 'Mercury', mass: 3.301e23, radius: 2.4397e6, color: '#B5A7A7',
			x: 0.387 * AU, y: 0, z: 0, vx: 0, vy: 0, vz: circularVelocity(0.387), ax: 0, ay: 0, az: 0,
			type: 'planet', distanceAU: 0.387, orbitalPeriodYears: 0.241, diameterKm: 4_879, moons: 0,
			description: 'Smallest planet, closest to the Sun'
		},
		{
			id: 'venus', name: 'Venus', mass: 4.867e24, radius: 6.0518e6, color: '#E8CDA0',
			x: 0.723 * AU, y: 0, z: 0, vx: 0, vy: 0, vz: circularVelocity(0.723), ax: 0, ay: 0, az: 0,
			type: 'planet', hasAtmosphere: true, distanceAU: 0.723, orbitalPeriodYears: 0.615, diameterKm: 12_104, moons: 0,
			description: 'Hottest planet, thick CO2 atmosphere'
		},
		{
			id: 'earth', name: 'Earth', mass: EARTH_MASS, radius: 6.371e6, color: '#4A90D9',
			x: AU, y: 0, z: 0, vx: 0, vy: 0, vz: circularVelocity(1.0), ax: 0, ay: 0, az: 0,
			type: 'planet', textureKey: 'earth', hasAtmosphere: true, distanceAU: 1.0, orbitalPeriodYears: 1.0, diameterKm: 12_742, moons: 1,
			description: 'Our home, the blue marble'
		},
		{
			id: 'mars', name: 'Mars', mass: 6.417e23, radius: 3.3895e6, color: '#C1440E',
			x: 1.524 * AU, y: 0, z: 0, vx: 0, vy: 0, vz: circularVelocity(1.524), ax: 0, ay: 0, az: 0,
			type: 'planet', distanceAU: 1.524, orbitalPeriodYears: 1.881, diameterKm: 6_779, moons: 2,
			description: 'The red planet, with Olympus Mons'
		},
		{
			id: 'jupiter', name: 'Jupiter', mass: 1.898e27, radius: 6.9911e7, color: '#C88B3A',
			x: 5.203 * AU, y: 0, z: 0, vx: 0, vy: 0, vz: circularVelocity(5.203), ax: 0, ay: 0, az: 0,
			type: 'planet', distanceAU: 5.203, orbitalPeriodYears: 11.86, diameterKm: 139_820, moons: 95,
			description: 'Largest planet, Great Red Spot'
		},
		{
			id: 'saturn', name: 'Saturn', mass: 5.683e26, radius: 5.8232e7, color: '#E4D191',
			x: 9.537 * AU, y: 0, z: 0, vx: 0, vy: 0, vz: circularVelocity(9.537), ax: 0, ay: 0, az: 0,
			type: 'planet', ringColor: '#C8B06D', distanceAU: 9.537, orbitalPeriodYears: 29.46, diameterKm: 116_460, moons: 146,
			description: 'Ring system, least dense planet'
		},
		{
			id: 'uranus', name: 'Uranus', mass: 8.681e25, radius: 2.5362e7, color: '#73C2D0',
			x: 19.19 * AU, y: 0, z: 0, vx: 0, vy: 0, vz: circularVelocity(19.19), ax: 0, ay: 0, az: 0,
			type: 'planet', ringColor: '#8BC4C8', distanceAU: 19.19, orbitalPeriodYears: 84.01, diameterKm: 50_724, moons: 28,
			description: 'Ice giant, rotates on its side'
		},
		{
			id: 'neptune', name: 'Neptune', mass: 1.024e26, radius: 2.4622e7, color: '#3F54BA',
			x: 30.07 * AU, y: 0, z: 0, vx: 0, vy: 0, vz: circularVelocity(30.07), ax: 0, ay: 0, az: 0,
			type: 'planet', distanceAU: 30.07, orbitalPeriodYears: 164.8, diameterKm: 49_244, moons: 16,
			description: 'Farthest planet, supersonic winds'
		}
	];
}

export function createBlackHole(mass: number, x: number, y: number, z: number, vx = 0, vy = 0, vz = 0): CelestialBody {
	const c = 299_792_458;
	const rs = (2 * G * mass) / (c * c);
	return {
		id: 'blackhole', name: 'Black Hole', mass, radius: rs, color: '#000000',
		x, y, z, vx, vy, vz, ax: 0, ay: 0, az: 0,
		type: 'blackhole', description: `${(mass / SOLAR_MASS).toFixed(0)} solar masses`
	};
}

// Moon data for analytical orbit
export const MOON_ORBITAL_RADIUS = 3.844e8; // meters
export const MOON_ORBITAL_PERIOD = 27.322 * 86400; // seconds (27.322 days)
export const MOON_RADIUS = 1.7371e6; // meters
