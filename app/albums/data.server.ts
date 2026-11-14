import type { Album, AlbumFile, AlbumSummary } from './types';

// Bundled at build time; only server code imports this module.
const files = import.meta.glob<AlbumFile>('../data/albums/*.json', {
  eager: true,
  import: 'default',
});

/** Public albums, newest first. */
export const albums: Album[] = Object.values(files)
  .filter((album) => album.visibility === 'public')
  .map((album) => ({ ...album, year: album.startDate?.slice(0, 4) ?? '0000' }))
  .sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''));

// An album's URL is /photos/:year/:slug, so the pair must be unique.
const seen = new Set<string>();
for (const album of albums) {
  const key = `${album.year}/${album.slug}`;
  if (seen.has(key))
    throw new Error(`Two albums share the URL /photos/${key}; rename one.`);
  seen.add(key);
}

export const getAlbum = (year: string, slug: string) =>
  albums.find((album) => album.year === year && album.slug === slug);

export const albumsInYear = (year: string) =>
  albums.filter((album) => album.year === year);

const PREVIEW_COUNT = 6;

export function summarize(album: Album): AlbumSummary {
  const cover =
    album.photos.find((photo) => photo.id === album.cover) ?? album.photos[0];
  if (!cover) throw new Error(`Album "${album.slug}" has no photos`);
  const others = album.photos.filter((photo) => photo !== cover);
  const step = others.length / (PREVIEW_COUNT - 1);
  const spread = Array.from(
    { length: Math.min(PREVIEW_COUNT - 1, others.length) },
    (_, i) => others[Math.floor(i * step + step / 2)],
  ).filter((photo) => photo !== undefined);
  return {
    slug: album.slug,
    year: album.year,
    title: album.title,
    startDate: album.startDate,
    endDate: album.endDate,
    count: album.photos.length,
    cover,
    previews: [cover, ...spread],
  };
}

export const summaries = (list: Album[] = albums) => list.map(summarize);
