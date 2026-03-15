<script lang="ts">
	import { browser } from '$app/environment';

	let visible = $state(true);
	let fadeOut = $state(false);

	function dismiss() {
		fadeOut = true;
		setTimeout(() => { visible = false; }, 600);
	}
</script>

{#if visible}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center"
		class:fade-out={fadeOut}
	>
		<!-- Backdrop -->
		<div class="absolute inset-0 bg-void-950/95"></div>

		<!-- Content -->
		<div class="relative z-10 flex flex-col items-center max-w-md px-8">
			<!-- Orbital decoration -->
			<div class="orbit-ring"></div>

			<!-- Title -->
			<h1 class="title-text">
				What if<br/>someday<span class="question">?</span>
			</h1>

			<!-- Divider -->
			<div class="divider"></div>

			<!-- Description -->
			<p class="desc">
				An interactive solar system simulation built on orbital mechanics.
				Follow planets along their paths and explore what would happen
				if a black hole wandered into our neighborhood.
			</p>

			<!-- Begin -->
			<button onclick={dismiss} class="begin-btn">
				<span>Begin</span>
			</button>

			<!-- Credit -->
			<div class="credit">
				<span>Created by</span>
				<a href="https://github.com/josesepulvedapino" target="_blank" rel="noopener noreferrer">
					Jose Sepulveda Pino
				</a>
			</div>
		</div>
	</div>
{/if}

<style>
	.fade-out {
		animation: fadeAway 0.6s ease-out forwards;
	}

	@keyframes fadeAway {
		to { opacity: 0; pointer-events: none; }
	}

	.orbit-ring {
		width: 120px;
		height: 120px;
		border: 1px solid rgba(99, 102, 241, 0.12);
		border-radius: 50%;
		margin-bottom: 32px;
		position: relative;
		animation: spin 20s linear infinite;
	}
	.orbit-ring::before {
		content: '';
		position: absolute;
		top: -3px;
		left: 50%;
		width: 5px;
		height: 5px;
		background: rgba(129, 140, 248, 0.7);
		border-radius: 50%;
		transform: translateX(-50%);
	}
	.orbit-ring::after {
		content: '';
		position: absolute;
		inset: 20px;
		border: 1px solid rgba(99, 102, 241, 0.06);
		border-radius: 50%;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.title-text {
		font-family: 'JetBrains Mono', monospace;
		font-size: 28px;
		font-weight: 300;
		letter-spacing: 0.08em;
		line-height: 1.3;
		text-align: center;
		color: rgba(255, 255, 255, 0.85);
		text-transform: lowercase;
		animation: fadeUp 0.8s ease-out both;
	}
	.question {
		color: rgba(129, 140, 248, 0.8);
	}

	.divider {
		width: 32px;
		height: 1px;
		background: rgba(255, 255, 255, 0.08);
		margin: 24px 0;
		animation: fadeUp 0.8s ease-out 0.15s both;
	}

	.desc {
		font-family: 'Inter', sans-serif;
		font-size: 13px;
		line-height: 1.7;
		color: rgba(255, 255, 255, 0.3);
		text-align: center;
		max-width: 340px;
		animation: fadeUp 0.8s ease-out 0.3s both;
	}

	.begin-btn {
		margin-top: 32px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 12px;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: rgba(129, 140, 248, 0.9);
		background: rgba(99, 102, 241, 0.08);
		border: 1px solid rgba(99, 102, 241, 0.2);
		padding: 10px 36px;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s ease;
		animation: fadeUp 0.8s ease-out 0.45s both;
	}
	.begin-btn:hover {
		background: rgba(99, 102, 241, 0.15);
		border-color: rgba(99, 102, 241, 0.4);
		color: rgba(129, 140, 248, 1);
	}

	.credit {
		margin-top: 40px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 10px;
		color: rgba(255, 255, 255, 0.15);
		letter-spacing: 0.06em;
		display: flex;
		gap: 5px;
		animation: fadeUp 0.8s ease-out 0.6s both;
	}
	.credit a {
		color: rgba(255, 255, 255, 0.3);
		text-decoration: none;
		transition: color 0.15s;
	}
	.credit a:hover {
		color: rgba(129, 140, 248, 0.7);
	}

	@keyframes fadeUp {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
