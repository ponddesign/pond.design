import type { AlbumRef, Photo } from './types';

// URL structure (#120):
//   /photos                               all albums, by year
//   /photos/:year                         one year's albums
//   /photos/:year/:album                  an album
//   /photos/:year/:album/photo/:photo     one photo
// Years are always four digits, so words at the /photos level (e.g. a future
// /photos/places) can never clash with them.

export const PHOTOS = '/photos';

export const yearPath = (year: string) => `${PHOTOS}/${year}`;

export const albumPath = (album: AlbumRef) =>
  `${PHOTOS}/${album.year}/${album.slug}`;

export const photoPath = (album: AlbumRef, photo: Pick<Photo, 'id'>) =>
  `${albumPath(album)}/photo/${photo.id}`;

export const isYear = (value: string | undefined): value is string =>
  /^\d{4}$/.test(value ?? '');
