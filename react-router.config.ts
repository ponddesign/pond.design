import { existsSync, readdirSync, readFileSync } from 'node:fs';
import type { Config } from '@react-router/dev/config';

// Every year, album and photo page under /photos, from the album files in
// app/data/albums (see scripts/albums/build-album.mjs).
const photoPaths = () => {
  const dir = 'app/data/albums';
  if (!existsSync(dir)) return [];
  const albums = readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => JSON.parse(readFileSync(`${dir}/${file}`, 'utf8')))
    .filter((album) => album.visibility === 'public');
  const years = new Set<string>();
  const paths: string[] = [];
  for (const album of albums) {
    const year = album.startDate.slice(0, 4);
    const base = `/photos/${year}/${album.slug}`;
    years.add(year);
    paths.push(
      base,
      ...album.photos.map(
        (photo: { id: string }) => `${base}/photo/${photo.id}`,
      ),
    );
  }
  return ['/photos', ...[...years].map((year) => `/photos/${year}`), ...paths];
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
    ...photoPaths(),
    '/robots.txt',
    '/sitemap.xml',
    '/site.webmanifest',
    // /.well-known/webfinger stays server-rendered: it must answer with
    // `application/jrd+json`, which a static file without an extension can't.
  ],
} satisfies Config;
