import { useOutletContext } from 'react-router';
import type { Album } from './types';

/** What the album page shares with the photo viewer nested inside it. */
export type AlbumOutlet = {
  album: Album;
  help: boolean;
  setHelp: (open: boolean) => void;
};

export const useAlbumOutlet = () => useOutletContext<AlbumOutlet>();
