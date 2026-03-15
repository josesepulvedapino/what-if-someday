<script lang="ts">
	import { sim } from '$lib/stores/simulation.svelte';
	import { cam } from '$lib/stores/camera.svelte';

	let bodies = $derived(sim.bodies.filter(b => b.type === 'star' || b.type === 'planet'));

	function selectBody(id: string) {
		if (cam.transitioning) return;
		cam.target = id;
	}
</script>

<div class="panel pointer-events-auto" style="padding: 8px; min-width: 96px;">
	<div class="panel-label" style="padding-left: 6px; padding-right: 6px;">Nav</div>

	<div style="display: flex; flex-direction: column;">
		{#each bodies as body (body.id)}
			<button
				onclick={() => selectBody(body.id)}
				class="group rounded text-left transition-all duration-150
					{cam.target === body.id
						? 'bg-white/[0.06]'
						: 'hover:bg-white/[0.03]'}"
				disabled={cam.transitioning}
				style="padding: 4px 6px;"
			>
				<span
					class="font-mono text-[11px] tracking-wide transition-colors duration-150
						{cam.target === body.id
							? 'text-white/80'
							: 'text-white/30 group-hover:text-white/50'}"
				>
					{body.name}
				</span>
			</button>
		{/each}
	</div>

	{#if sim.blackHole}
		<div style="height: 1px; background: rgba(255,255,255,0.04); margin: 4px 6px;"></div>
		<button
			onclick={() => selectBody('blackhole')}
			class="group rounded text-left w-full transition-all duration-150
				{cam.target === 'blackhole'
					? 'bg-danger-400/[0.08]'
					: 'hover:bg-white/[0.03]'}"
			disabled={cam.transitioning}
			style="padding: 4px 6px;"
		>
			<span
				class="font-mono text-[11px] tracking-wide transition-colors duration-150
					{cam.target === 'blackhole'
						? 'text-danger-400/80'
						: 'text-danger-400/30 group-hover:text-danger-400/50'}"
			>
				Black Hole
			</span>
		</button>
	{/if}
</div>
