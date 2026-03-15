<script lang="ts">
	import TimeControls from './TimeControls.svelte';
	import PlanetSelector from './PlanetSelector.svelte';
	import InfoDisplay from './InfoDisplay.svelte';
	import BlackHolePanel from './BlackHolePanel.svelte';
	import ConfigPanel from './ConfigPanel.svelte';
</script>

<div class="fixed inset-0 pointer-events-none z-10">
	<!-- Top left: mission data -->
	<div class="absolute top-3 left-3">
		<InfoDisplay />
	</div>

	<!-- Bottom left: navigation -->
	<div class="absolute left-3 bottom-4">
		<PlanetSelector />
	</div>

	<!-- Bottom center: timeline -->
	<div class="absolute bottom-4 left-1/2 -translate-x-1/2">
		<TimeControls />
	</div>

	<!-- Right center: singularity -->
	<div class="absolute right-3 top-1/2 -translate-y-1/2">
		<BlackHolePanel />
	</div>

	<!-- Top right: config -->
	<div class="absolute top-3 right-3">
		<ConfigPanel />
	</div>

	<!-- Title -->
	<div class="absolute top-3.5 left-1/2 -translate-x-1/2">
		<span class="font-mono text-[10px] tracking-[0.25em] text-white/15 uppercase">What If Someday</span>
	</div>
</div>
