<script lang="ts">
	import { useThrelte, useTask } from '@threlte/core';
	import { onMount, onDestroy } from 'svelte';
	import {
		EffectComposer,
		EffectPass,
		RenderPass,
		BloomEffect,
		VignetteEffect,
		KernelSize
	} from 'postprocessing';

	const { renderer, scene, camera } = useThrelte();

	let composer: EffectComposer | null = null;
	let renderPass: RenderPass | null = null;
	let effectPass: EffectPass | null = null;
	let ready = false;

	onMount(() => {
		const r = renderer;
		const c = camera.current;
		if (!r || !c) return;

		r.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		composer = new EffectComposer(r, {
			multisampling: Math.min(4, r.capabilities.maxSamples)
		});

		renderPass = new RenderPass(scene, c);
		composer.addPass(renderPass);

		const bloomEffect = new BloomEffect({
			intensity: 1.2,
			luminanceThreshold: 0.5,
			luminanceSmoothing: 0.3,
			kernelSize: KernelSize.LARGE,
			mipmapBlur: true
		});

		const vignetteEffect = new VignetteEffect({
			offset: 0.3,
			darkness: 0.5
		});

		effectPass = new EffectPass(c, bloomEffect, vignetteEffect);
		composer.addPass(effectPass);

		composer.setSize(r.domElement.clientWidth, r.domElement.clientHeight);
		ready = true;

		const handleResize = () => {
			if (composer && r) {
				r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
				composer.setSize(r.domElement.clientWidth, r.domElement.clientHeight);
			}
		};
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	onDestroy(() => {
		composer?.dispose();
		ready = false;
	});

	useTask(
		(delta) => {
			const c = camera.current;
			if (!c) return;

			// Always sync camera to passes
			if (ready && composer && renderPass && effectPass) {
				renderPass.mainCamera = c;
				effectPass.mainCamera = c;
				composer.render(delta);
			} else if (renderer) {
				// Fallback: plain render if composer isn't ready
				renderer.render(scene, c);
			}
		},
		{ autoInvalidate: false }
	);
</script>
