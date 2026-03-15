// Gravitational constant (m³ kg⁻¹ s⁻²)
export const G = 6.6743e-11;

// Astronomical unit in meters
export const AU = 1.496e11;

// Solar mass in kg
export const SOLAR_MASS = 1.989e30;

// Earth mass in kg
export const EARTH_MASS = 5.972e24;

// Render scale: meters → Three.js world units
// 1 AU ≈ 15 world units
export const SCALE = 1e-10;

// Default time step: 1 hour in seconds
export const TIME_STEP = 3600;

// Convert SI meters to world units
export function metersToWorld(m: number): number {
	return m * SCALE;
}

// Convert AU to meters
export function auToMeters(au: number): number {
	return au * AU;
}

// Visual radius multiplier (planets are tiny at real scale)
export const VISUAL_RADIUS_MULT = 200;
