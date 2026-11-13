import type { Config } from '@react-router/dev/config';
import { vercelPreset } from '@vercel/react-router/vite';

export default {
  appDirectory: 'app',
  // Server rendering stays on so future routes (auth callbacks, user
  // settings, …) can run on Vercel Functions. Routes that never change are
  // pre-rendered at build time and served from the CDN instead.
  ssr: true,
  prerender: [
    '/',
    '/resume',
    '/robots.txt',
    '/sitemap.xml',
    '/site.webmanifest',
    // /.well-known/webfinger stays server-rendered: it must answer with
    // `application/jrd+json`, which a static file without an extension can't.
  ],
  presets: [vercelPreset()],
  // Opt in to React Router v8 behavior now, so the v8 upgrade is a version
  // bump once @vercel/react-router supports it.
  future: {
    v8_middleware: true,
    v8_splitRouteModules: true,
    // Off: with the Vercel preset's per-function server bundles this flag
    // makes the build fail moving server assets into build/client
    // (React Router 7.18.5, @vercel/react-router 1.3.7). Re-test when
    // upgrading either package.
    v8_viteEnvironmentApi: false,
    v8_passThroughRequests: true,
    v8_trailingSlashAwareDataRequests: true,
  },
} satisfies Config;
