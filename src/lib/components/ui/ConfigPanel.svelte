<script lang="ts">
	import { cam } from '$lib/stores/camera.svelte';

	let open = $state(false);
</script>

<div class="pointer-events-auto" style="position: relative;">
	<button
		onclick={() => open = !open}
		class="btn"
		style="width: 28px; height: 28px; padding: 0; display: flex; align-items: center; justify-content: center;"
		aria-label="Settings"
	>
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
			<path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"/>
			<circle cx="12" cy="12" r="3"/>
		</svg>
	</button>

	{#if open}
		<div class="panel" style="padding: 10px 12px; margin-top: 6px; min-width: 150px; position: absolute; right: 0; top: 100%;">
			<div class="panel-label">Settings</div>

			<div style="display: flex; flex-direction: column; gap: 8px;">
				<!-- Free camera -->
				<button
					onclick={() => cam.freeCamera = !cam.freeCamera}
					style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: none; border: none; padding: 0;"
				>
					<span class="font-mono text-[10px] {cam.freeCamera ? 'text-white/60' : 'text-white/30'}">Free camera</span>
					<span
						class="toggle-track"
						style="background: {cam.freeCamera ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)'};"
					>
						<span
							class="toggle-thumb"
							style="transform: translateX({cam.freeCamera ? '14px' : '0'}); background: {cam.freeCamera ? 'rgba(129,140,248,0.9)' : 'rgba(255,255,255,0.35)'};"
						></span>
					</span>
				</button>

				<!-- Show orbits -->
				<button
					onclick={() => cam.showOrbits = !cam.showOrbits}
					style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: none; border: none; padding: 0;"
				>
					<span class="font-mono text-[10px] {cam.showOrbits ? 'text-white/60' : 'text-white/30'}">Orbit lines</span>
					<span
						class="toggle-track"
						style="background: {cam.showOrbits ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)'};"
					>
						<span
							class="toggle-thumb"
							style="transform: translateX({cam.showOrbits ? '14px' : '0'}); background: {cam.showOrbits ? 'rgba(129,140,248,0.9)' : 'rgba(255,255,255,0.35)'};"
						></span>
					</span>
				</button>

				<div style="margin-top: 4px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.03);">
					<p class="font-mono text-[9px] text-white/15" style="line-height: 1.6;">
						L-click: rotate<br/>
						R-click: pan<br/>
						Scroll: zoom
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.toggle-track {
		display: block;
		width: 28px;
		height: 14px;
		border-radius: 7px;
		position: relative;
		transition: background 0.2s;
		flex-shrink: 0;
	}
	.toggle-thumb {
		display: block;
		position: absolute;
		top: 2px;
		left: 2px;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		transition: transform 0.2s, background 0.2s;
	}
</style>
