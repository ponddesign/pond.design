import type { Album, AlbumSummary } from './types';

// Bundled at build time; only server code imports this module.
const files = import.meta.glob<Album>('../data/albums/*.json', {
  eager: true,
  import: 'default',
});

/** Public albums, newest first. */
export const albums: Album[] = Object.values(files)
  .filter((album) => album.visibility === 'public')
  .sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''));

export const getAlbum = (slug: string) =>
  albums.find((album) => album.slug === slug);

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
    title: album.title,
    startDate: album.startDate,
    endDate: album.endDate,
    count: album.photos.length,
    cover,
    previews: [cover, ...spread],
  };
}

export const summaries = () => albums.map(summarize);
