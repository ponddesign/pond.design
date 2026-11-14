import { existsSync, readdirSync, readFileSync } from 'node:fs';
import type { Config } from '@react-router/dev/config';

// Public albums in app/data/albums/*.json (see scripts/albums/build-album.mjs).
const albumPaths = () => {
  const dir = 'app/data/albums';
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => JSON.parse(readFileSync(`${dir}/${file}`, 'utf8')))
    .filter((album) => album.visibility === 'public')
    .map((album) => `/albums/${album.slug}`);
};

export default {
  appDirectory: 'app',
  // Server rendering stays on so future routes (auth callbacks, user
  // settings, …) can run in the Cloudflare Worker. Routes that never change
  // are pre-rendered at build time and served as static assets, without
  // running the Worker.
  ssr: true,
  prerender: () => [
    '/',
    '/resume',
    '/albums',
    ...albumPaths(),
    '/robots.txt',
    '/sitemap.xml',
    '/site.webmanifest',
    // /.well-known/webfinger stays server-rendered: it must answer with
    // `application/jrd+json`, which a static file without an extension can't.
  ],
} satisfies Config;
