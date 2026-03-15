<script lang="ts">
	import { sim } from '$lib/stores/simulation.svelte';
	import { SOLAR_MASS, AU } from '$lib/simulation/constants';

	function startPlacing() {
		sim.placingBlackHole = true;
	}

	function cancelPlacing() {
		sim.placingBlackHole = false;
	}

	let massDisplay = $derived(
		sim.blackHole ? (sim.blackHole.mass / SOLAR_MASS).toFixed(0) : null
	);

	let bhDistAU = $derived(
		sim.blackHole
			? (Math.sqrt(sim.blackHole.x ** 2 + sim.blackHole.y ** 2 + sim.blackHole.z ** 2) / AU).toFixed(2)
			: null
	);

	let bhVelocity = $derived(
		sim.blackHole
			? (Math.sqrt(sim.blackHole.vx ** 2 + sim.blackHole.vy ** 2 + sim.blackHole.vz ** 2) / 1000).toFixed(1)
			: null
	);

	// Count how many planets are still bound (within 50 AU of Sun)
	let boundPlanets = $derived(
		sim.bodies.filter(b => {
			if (b.type !== 'planet') return false;
			const d = Math.sqrt(b.x ** 2 + b.y ** 2 + b.z ** 2);
			return d < 50 * AU;
		}).length
	);

	let ejectedCount = $derived(8 - boundPlanets);
</script>

<div class="panel pointer-events-auto" style="padding: 10px 12px; min-width: 170px;">
	<div class="panel-label">Singularity</div>

	{#if sim.placingBlackHole}
		<div style="display: flex; flex-direction: column; gap: 8px;">
			<div style="display: flex; align-items: center; gap: 6px; padding: 6px 8px; border-radius: 4px; background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.12);">
				<span class="bh-pulse"></span>
				<span class="font-mono text-[10px] text-danger-400/80 tracking-wide">Click anywhere to place</span>
			</div>

			<div style="display: flex; flex-direction: column; gap: 4px;">
				<div style="display: flex; justify-content: space-between; align-items: baseline;">
					<span style="font-size: 10px; color: rgba(255,255,255,0.25);">Mass</span>
					<span class="font-mono text-[11px] text-accent-400/70">{sim.bhMassMultiplier} M</span>
				</div>
				<input type="range" min="1" max="100" step="1" bind:value={sim.bhMassMultiplier} class="w-full" />
			</div>

			<button onclick={cancelPlacing} class="btn w-full text-center">Cancel</button>
		</div>
	{:else if sim.blackHole}
		<div style="display: flex; flex-direction: column; gap: 2px;">
			<div class="data-row">
				<span class="label">Mass</span>
				<span class="value" style="color: rgba(248,113,113,0.8);">{massDisplay} M</span>
			</div>
			<div class="data-row">
				<span class="label">Distance</span>
				<span class="value" style="color: rgba(248,113,113,0.6);">{bhDistAU} AU</span>
			</div>
			<div class="data-row">
				<span class="label">Velocity</span>
				<span class="value" style="color: rgba(248,113,113,0.6);">{bhVelocity} km/s</span>
			</div>
			{#if ejectedCount > 0}
				<div class="data-row" style="margin-top: 4px;">
					<span class="label">Ejected</span>
					<span class="font-mono text-[11px]" style="color: rgba(251,191,36,0.8);">{ejectedCount} planets</span>
				</div>
			{/if}

			<div style="display: flex; gap: 6px; margin-top: 6px;">
				<button onclick={() => { sim.removeBlackHole(); startPlacing(); }} class="btn danger flex-1 text-center">Relocate</button>
				<button onclick={() => sim.removeBlackHole()} class="btn flex-1 text-center">Remove</button>
			</div>
		</div>
	{:else}
		<button onclick={startPlacing} class="btn danger w-full text-center">Deploy</button>
		<p class="font-mono text-[9px] text-white/15 text-center tracking-wide" style="margin-top: 6px;">Click anywhere on the scene</p>
	{/if}

	<div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.03);">
		<button onclick={() => sim.reset()} class="btn w-full text-center" style="font-size: 10px; color: rgba(255,255,255,0.25);">Reset</button>
	</div>
</div>

<style>
	.bh-pulse {
		display: block;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: rgba(248, 113, 113, 0.8);
		animation: pulse 1.5s ease-in-out infinite;
		flex-shrink: 0;
	}
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.3; }
	}
</style>
