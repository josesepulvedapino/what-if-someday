import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [glsl(), tailwindcss(), sveltekit()],
	ssr: {
		noExternal: ['three', 'postprocessing', 'troika-three-text']
	}
});
