import { crx } from '@crxjs/vite-plugin';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import manifest from './manifest.json';
import WindiCSS from 'vite-plugin-windicss';

const srcDir = resolve(__dirname, 'src');

// https://vitejs.dev/config/
export default defineConfig((env) => {
  return {
    plugins: [
      svelte(),
      crx({
        manifest: {
          ...manifest,
          name: `${manifest.name} ${env.mode === 'development' ? ' | [DEV]' : ''}`,
        },
      }),
      WindiCSS(),
    ],
    resolve: {
      alias: {
        src: srcDir,
      },
    },
  };
});
