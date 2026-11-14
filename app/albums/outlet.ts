import { useOutletContext } from 'react-router';
import type { Album, Photo } from './types';

/** What the album page shares with the photo viewer nested inside it. */
export type AlbumOutlet = {
  album: Album;
  /**
   * Every photo in the album. Undefined briefly when a photo URL was opened
   * directly, while the full album loads.
   */
  photos: Photo[] | undefined;
  help: boolean;
  setHelp: (open: boolean) => void;
};

export const useAlbumOutlet = () => useOutletContext<AlbumOutlet>();
