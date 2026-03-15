<script lang="ts">
	import { T } from '@threlte/core';
	import { useTexture } from '@threlte/extras';
	import * as THREE from 'three';
	import { metersToWorld, VISUAL_RADIUS_MULT } from '$lib/simulation/constants';
	import type { CelestialBody } from '$lib/simulation/bodies';

	interface Props {
		body: CelestialBody;
	}

	let { body }: Props = $props();

	let visualRadius = $derived(metersToWorld(body.radius) * VISUAL_RADIUS_MULT);
	let wx = $derived(metersToWorld(body.x));
	let wy = $derived(metersToWorld(body.y));
	let wz = $derived(metersToWorld(body.z));

	const SATURN_TILT = 26.73 * Math.PI / 180;
	const URANUS_TILT = 97.77 * Math.PI / 180;

	const textureMap: Record<string, string> = {
		mercury: '/textures/mercury.jpg',
		venus: '/textures/venus_atmosphere.jpg',
		mars: '/textures/mars.jpg',
		jupiter: '/textures/jupiter.jpg',
		saturn: '/textures/saturn.jpg',
		uranus: '/textures/uranus.jpg',
		neptune: '/textures/neptune.jpg'
	};

	const texture = textureMap[body.id] ? useTexture(textureMap[body.id]) : null;
</script>

<T.Group position.x={wx} position.y={wy} position.z={wz}>
	{#if texture}
		{#await texture then map}
			<T.Mesh>
				<T.SphereGeometry args={[visualRadius, 48, 48]} />
				<T.MeshStandardMaterial
					map={map}
					roughness={0.8}
					metalness={0.0}
				/>
			</T.Mesh>
		{:catch}
			<T.Mesh>
				<T.SphereGeometry args={[visualRadius, 32, 32]} />
				<T.MeshStandardMaterial color={body.color} roughness={0.7} />
			</T.Mesh>
		{/await}
	{:else}
		<T.Mesh>
			<T.SphereGeometry args={[visualRadius, 32, 32]} />
			<T.MeshStandardMaterial color={body.color} roughness={0.7} />
		</T.Mesh>
	{/if}

	{#if body.hasAtmosphere}
		<T.Mesh>
			<T.SphereGeometry args={[visualRadius * 1.04, 32, 32]} />
			<T.MeshBasicMaterial
				color={body.color}
				transparent
				opacity={0.06}
				side={THREE.FrontSide}
				blending={THREE.AdditiveBlending}
				depthWrite={false}
			/>
		</T.Mesh>
	{/if}

	{#if body.ringColor && body.id === 'saturn'}
		<!-- Saturn: prominent rings, tilted -->
		<T.Mesh rotation.x={SATURN_TILT}>
			<T.RingGeometry args={[visualRadius * 1.4, visualRadius * 2.3, 128]} />
			<T.MeshBasicMaterial
				color={body.ringColor}
				transparent
				opacity={0.4}
				side={THREE.DoubleSide}
				depthWrite={false}
			/>
		</T.Mesh>
	{/if}

	{#if body.ringColor && body.id === 'uranus'}
		<!-- Uranus: very thin, faint rings, tilted on its side -->
		<T.Mesh rotation.x={URANUS_TILT}>
			<T.RingGeometry args={[visualRadius * 1.6, visualRadius * 1.7, 128]} />
			<T.MeshBasicMaterial
				color={body.ringColor}
				transparent
				opacity={0.15}
				side={THREE.DoubleSide}
				depthWrite={false}
			/>
		</T.Mesh>
	{/if}
</T.Group>
