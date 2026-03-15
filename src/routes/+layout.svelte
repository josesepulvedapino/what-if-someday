<script lang="ts">
	import { inject } from '@vercel/analytics';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	inject();
	injectSpeedInsights();

	let { children } = $props();
</script>

{@render children()}
