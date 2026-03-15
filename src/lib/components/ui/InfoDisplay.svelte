<script lang="ts">
	import { sim } from '$lib/stores/simulation.svelte';
	import { cam } from '$lib/stores/camera.svelte';
	import { AU } from '$lib/simulation/constants';

	const START_DATE = new Date(2026, 2, 15);
	const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
		'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

	function formatDate(seconds: number): string {
		const d = new Date(START_DATE.getTime() + seconds * 1000);
		return `${d.getDate().toString().padStart(2, '0')} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
	}

	function formatElapsed(seconds: number): string {
		const days = Math.floor(seconds / 86400);
		const years = Math.floor(days / 365.25);
		const rem = Math.floor(days % 365.25);
		if (years > 0) return `+${years}Y ${rem}D`;
		if (days > 0) return `+${days}D`;
		return `+${Math.floor(seconds / 3600)}H`;
	}

	function fmtNum(n: number): string {
		return n.toLocaleString('en-US');
	}

	let currentDate = $derived(formatDate(sim.time));
	let elapsed = $derived(formatElapsed(sim.time));
	let trackedBody = $derived(sim.bodies.find(b => b.id === cam.target));

	let liveDistAU = $derived.by(() => {
		if (!trackedBody || trackedBody.type === 'star') return null;
		const d = Math.sqrt(trackedBody.x ** 2 + trackedBody.y ** 2 + trackedBody.z ** 2);
		return (d / AU).toFixed(3);
	});

	let liveVelocity = $derived.by(() => {
		if (!trackedBody || trackedBody.type === 'star') return null;
		const v = Math.sqrt(trackedBody.vx ** 2 + trackedBody.vy ** 2 + trackedBody.vz ** 2);
		return (v / 1000).toFixed(1);
	});
</script>

<div class="panel pointer-events-auto" style="padding: 10px 12px; min-width: 190px;">
	<div class="font-mono text-[13px] text-white/80 tabular-nums tracking-wide">{currentDate}</div>
	<div class="font-mono text-[10px] text-white/20 tabular-nums" style="margin-top: 2px;">{elapsed}</div>

	{#if trackedBody}
		<div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.04);">
			<div style="margin-bottom: 6px;">
				<span class="font-mono text-[11px] text-white/70 tracking-wide uppercase">{trackedBody.name}</span>
			</div>

			{#if trackedBody.description}
				<p style="font-size: 10px; color: rgba(255,255,255,0.2); margin-bottom: 8px; line-height: 1.5;">{trackedBody.description}</p>
			{/if}

			<div style="display: flex; flex-direction: column; gap: 2px;">
				{#if trackedBody.diameterKm}
					<div class="data-row">
						<span class="label">Diameter</span>
						<span class="value">{fmtNum(trackedBody.diameterKm)} km</span>
					</div>
				{/if}
				{#if trackedBody.distanceAU}
					<div class="data-row">
						<span class="label">Semi-major</span>
						<span class="value">{trackedBody.distanceAU} AU</span>
					</div>
				{/if}
				{#if liveDistAU}
					<div class="data-row">
						<span class="label">Distance</span>
						<span class="value live">{liveDistAU} AU</span>
					</div>
				{/if}
				{#if liveVelocity}
					<div class="data-row">
						<span class="label">Velocity</span>
						<span class="value live">{liveVelocity} km/s</span>
					</div>
				{/if}
				{#if trackedBody.orbitalPeriodYears}
					<div class="data-row">
						<span class="label">Period</span>
						<span class="value">
							{trackedBody.orbitalPeriodYears < 1
								? (trackedBody.orbitalPeriodYears * 365.25).toFixed(0) + ' d'
								: trackedBody.orbitalPeriodYears.toFixed(2) + ' yr'}
						</span>
					</div>
				{/if}
				{#if trackedBody.moons !== undefined && trackedBody.type === 'planet'}
					<div class="data-row">
						<span class="label">Satellites</span>
						<span class="value">{trackedBody.moons}</span>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
