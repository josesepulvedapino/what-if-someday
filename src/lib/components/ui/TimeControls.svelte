<script lang="ts">
	import { sim } from '$lib/stores/simulation.svelte';

	const speeds = [
		{ label: '1x', value: 1 },
		{ label: '2x', value: 2 },
		{ label: '5x', value: 5 },
		{ label: '10x', value: 10 }
	];
</script>

<div class="panel flex items-center gap-2 pointer-events-auto" style="padding: 8px 10px;">
	<button
		onclick={() => sim.paused = !sim.paused}
		class="btn flex items-center justify-center"
		style="width: 28px; height: 28px; padding: 0;"
		aria-label={sim.paused ? 'Play' : 'Pause'}
	>
		{#if sim.paused}
			<svg width="10" height="12" viewBox="0 0 10 12" fill="none">
				<path d="M1 1L9 6L1 11V1Z" fill="currentColor"/>
			</svg>
		{:else}
			<svg width="10" height="12" viewBox="0 0 10 12" fill="none">
				<rect x="1" y="1" width="2.5" height="10" fill="currentColor"/>
				<rect x="6.5" y="1" width="2.5" height="10" fill="currentColor"/>
			</svg>
		{/if}
	</button>

	<div style="width: 1px; height: 18px; background: rgba(255,255,255,0.06);"></div>

	{#each speeds as s (s.value)}
		<button
			onclick={() => sim.speed = s.value}
			class="btn {sim.speed === s.value ? 'active' : ''}"
			style="padding: 4px 8px; font-size: 10px;"
		>
			{s.label}
		</button>
	{/each}

	{#if sim.paused}
		<div style="width: 1px; height: 18px; background: rgba(255,255,255,0.06);"></div>
		<span class="font-mono text-[9px] text-solar-400/70 tracking-widest uppercase">Paused</span>
	{/if}
</div>
