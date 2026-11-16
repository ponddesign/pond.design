import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cloudflare } from '@cloudflare/vite-plugin';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';
import svgr from 'vite-plugin-svgr';
import { RESUME_PDF_PATH } from './app/resume/format.ts';
import { renderResumePdf } from './app/resume/pdf.ts';
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

/** Renders the resumé PDF from the same data as the /resume page. */
const buildResumePdf = async () =>
  renderResumePdf(
    JSON.parse(
      await readFile(
        path.resolve(import.meta.dirname, 'app/data/resume.json'),
        'utf8',
      ),
    ),
  );

/**
 * Adds the resumé PDF to the static assets at RESUME_PDF_PATH. The dev server
 * renders it on each request, so edits to resume.json show up on reload.
 */
const resumePdf = (): Plugin => ({
  name: 'pond:resume-pdf',
  configureServer(server) {
    server.middlewares.use(RESUME_PDF_PATH, (_req, res, next) => {
      buildResumePdf().then((pdf) => {
        res.setHeader('Content-Type', 'application/pdf');
        res.end(pdf);
      }, next);
    });
  },
  async generateBundle() {
    if (this.environment.name !== 'client') return;
    this.emitFile({
      type: 'asset',
      fileName: RESUME_PDF_PATH.slice(1),
      source: await buildResumePdf(),
    });
  },
});

export default defineConfig({
  // The build's timestamp, taken here in Node. Code running in the Workers
  // runtime can't use `new Date()` outside a request (the clock reads
  // 1970-01-01 there), and pages are pre-rendered in that runtime.
  define: {
    'import.meta.env.BUILD_TIME': JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    // Runs the server build in the Workers runtime, in dev too.
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    cloudflareHeaders(),
    resumePdf(),
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
