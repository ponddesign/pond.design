import path from 'node:path';
import { cloudflare } from '@cloudflare/vite-plugin';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';
import svgr from 'vite-plugin-svgr';
import { headersFile } from './workers/headers.ts';

/** Writes Cloudflare's `_headers` file into the static assets. */
const cloudflareHeaders = (): Plugin => ({
  name: 'pond:cloudflare-headers',
  applyToEnvironment: (environment) => environment.name === 'client',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: '_headers',
      source: headersFile(),
    });
  },
});

export default defineConfig({
  plugins: [
    // Runs the server build in the Workers runtime, in dev too.
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    cloudflareHeaders(),
    tailwindcss(),
    // `import Logo from '~/icons/logo.svg?react'` returns a React component.
    svgr({
      svgrOptions: {
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: { overrides: { removeViewBox: false } },
            },
          ],
        },
      },
    }),
    reactRouter(),
  ],
  resolve: {
    alias: {
      '~': path.resolve(import.meta.dirname, 'app'),
    },
  },
});
