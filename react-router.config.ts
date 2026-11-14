import type { Config } from '@react-router/dev/config';

export default {
  appDirectory: 'app',
  // Server rendering stays on so future routes (auth callbacks, user
  // settings, …) can run in the Cloudflare Worker. Routes that never change
  // are pre-rendered at build time and served as static assets, without
  // running the Worker.
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
} satisfies Config;
