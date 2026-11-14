import { thumbHashToAverageRGBA, thumbHashToDataURL } from 'thumbhash';
import type { Photo } from './types';

/**
 * Where published photo sizes live. Locally they're served from
 * public/albums-media; production will point this at the R2 host
 * (e.g. https://photos.pond.design).
 */
export const MEDIA_BASE = (
  import.meta.env.VITE_ALBUMS_MEDIA_BASE ?? '/albums-media'
).replace(/\/$/, '');

export const photoSrc = (slug: string, photo: Photo, width: number) =>
  `${MEDIA_BASE}/${slug}/${photo.base}-${width}.avif`;

export const photoSrcSet = (slug: string, photo: Photo) =>
  photo.widths.map((w) => `${photoSrc(slug, photo, w)} ${w}w`).join(', ');

/** Smallest published width that is at least `min` px (or the largest). */
export const widthAtLeast = (photo: Photo, min: number) =>
  photo.widths.find((w) => w >= min) ?? photo.widths.at(-1) ?? photo.width;

export const largestSrc = (slug: string, photo: Photo) =>
  photoSrc(slug, photo, photo.widths.at(-1) ?? photo.width);

const decode = (hash: string) =>
  Uint8Array.from(atob(hash), (c) => c.charCodeAt(0));

/** The photo's average color: a few bytes, so it's safe to server-render. */
export function averageColor(photo: Photo) {
  const { r, g, b } = thumbHashToAverageRGBA(decode(photo.thumbHash));
  const c = (v: number) => Math.round(v * 255);
  return `rgb(${c(r)} ${c(g)} ${c(b)})`;
}

const placeholders = new Map<string, string>();

/**
 * Blurred placeholder as a data URL (a small PNG, ~1–2 KB), cached per photo.
 * Only used in the browser: embedding one per photo in the HTML would add
 * ~100 KB to an album page.
 */
export function placeholder(photo: Photo) {
  let url = placeholders.get(photo.thumbHash);
  if (!url) {
    url = thumbHashToDataURL(decode(photo.thumbHash));
    placeholders.set(photo.thumbHash, url);
  }
  return url;
}
