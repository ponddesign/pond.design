import { thumbHashToAverageRGBA, thumbHashToDataURL } from 'thumbhash';
import type { AlbumRef, Photo } from './types';

/**
 * Where published photo sizes live. Locally they're served from
 * public/photos-media; production will point this at the R2 host
 * (e.g. https://photos.pond.design).
 */
export const MEDIA_BASE = (
  import.meta.env.VITE_PHOTOS_MEDIA_BASE ?? '/photos-media'
).replace(/\/$/, '');

/** Published files live at <base>/<year>/<album>/<photo>-<width>.avif. */
export const photoSrc = (album: AlbumRef, photo: Photo, width: number) =>
  `${MEDIA_BASE}/${album.year}/${album.slug}/${photo.base}-${width}.avif`;

export const photoSrcSet = (album: AlbumRef, photo: Photo) =>
  photo.widths.map((w) => `${photoSrc(album, photo, w)} ${w}w`).join(', ');

/** 1200 px JPEG for link previews (social sites don't all read AVIF). */
export const shareImageSrc = (album: AlbumRef, photo: Photo) =>
  `${MEDIA_BASE}/${album.year}/${album.slug}/${photo.base}-share.jpg`;

/** Link previews need absolute URLs. */
export const absoluteUrl = (src: string) =>
  new URL(src, 'https://pond.design').href;

/** Smallest published width that is at least `min` px (or the largest). */
export const widthAtLeast = (photo: Photo, min: number) =>
  photo.widths.find((w) => w >= min) ?? photo.widths.at(-1) ?? photo.width;

export const largestSrc = (album: AlbumRef, photo: Photo) =>
  photoSrc(album, photo, photo.widths.at(-1) ?? photo.width);

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
