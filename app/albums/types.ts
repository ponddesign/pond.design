/** Album files in app/data/albums/*.json, written by scripts/albums/build-album.mjs. */

export type Exposure = {
  focalLength?: string;
  aperture?: string;
  shutter?: string;
  iso?: number;
};

export type Photo = {
  /** Stable id within the album; used in `?photo=` links. */
  id: string;
  /** File name stem of the published sizes: `<base>-<width>.avif`. */
  base: string;
  width: number;
  height: number;
  /** Published widths, smallest first. */
  widths: number[];
  /** From the photo's caption or title; empty when it has neither. */
  alt: string;
  /** Local capture time with its UTC offset, e.g. 2026-08-15T22:37:35-04:00. */
  takenAt?: string;
  /** Place name from Lightroom's location fields. Never coordinates. */
  location?: string;
  camera?: string;
  lens?: string;
  exposure?: Exposure;
  /** Base64 ThumbHash, shown while the photo loads. */
  thumbHash: string;
};

/** An album file as written by the build script. */
export type AlbumFile = {
  /** URL name, unique within its year (no year in it). */
  slug: string;
  title: string;
  description?: string;
  visibility: 'public';
  startDate?: string;
  endDate?: string;
  /** Id of the key photo. */
  cover: string;
  photos: Photo[];
};

/** An album as the site uses it: the year comes from its first day. */
export type Album = AlbumFile & { year: string };

/** Enough to build an album's URLs and media paths. */
export type AlbumRef = Pick<Album, 'year' | 'slug'>;

/** What lists of albums (index, drawer) need: no full photo list. */
export type AlbumSummary = {
  slug: string;
  year: string;
  title: string;
  startDate?: string;
  endDate?: string;
  count: number;
  cover: Photo;
  /** Key photo first, then a few spread through the album, for skimming. */
  previews: Photo[];
};
