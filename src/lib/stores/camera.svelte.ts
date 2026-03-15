class CameraState {
	target = $state<string>('earth');
	transitioning = $state(false);
	fov = $state(50);
	freeCamera = $state(false);
	showOrbits = $state(true);
}

export const cam = new CameraState();
