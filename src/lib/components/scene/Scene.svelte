<script lang="ts">
	import { Canvas } from '@threlte/core';
	import SceneContent from './SceneContent.svelte';
	import * as THREE from 'three';
</script>

<div class="w-full h-full">
	<Canvas
		autoRender={false}
		rendererParameters={{
			antialias: true,
			powerPreference: 'high-performance',
			logarithmicDepthBuffer: true,
			toneMapping: THREE.ACESFilmicToneMapping,
			toneMappingExposure: 1.0
		}}
	>
		<SceneContent />
	</Canvas>
</div>

<style>
	div {
		position: absolute;
		inset: 0;
	}
	div :global(canvas) {
		width: 100% !important;
		height: 100% !important;
	}
</style>
