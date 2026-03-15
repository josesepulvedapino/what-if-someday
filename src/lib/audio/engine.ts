// Audio engine scaffold — implementations to be added later

let audioCtx: AudioContext | null = null;

export function initAudio(): void {
	if (typeof window === 'undefined') return;
	audioCtx = new AudioContext();
}

export function resumeAudio(): void {
	audioCtx?.resume();
}

export function playAmbient(): void {
	// TODO: ambient space drone
}

export function playBlackHoleHum(): void {
	// TODO: low-frequency BH proximity sound
}

export function stopAll(): void {
	// TODO: fade out all active sounds
}
