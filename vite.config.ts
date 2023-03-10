import { crx } from '@crxjs/vite-plugin';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import manifest from './manifest.json';
import WindiCSS from 'vite-plugin-windicss';

const srcDir = resolve(__dirname, 'src');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), crx({ manifest }), WindiCSS()],
  resolve: {
    alias: {
      src: srcDir,
    },
  },
});
