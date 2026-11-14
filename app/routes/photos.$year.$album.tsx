import { useEffect, useRef, useState } from 'react';
import {
  data,
  Link,
  Outlet,
  useFetcher,
  useNavigate,
  useParams,
} from 'react-router';
import { albums, getAlbum, summaries } from '~/albums/data.server';
import { dateRange, photoCount } from '~/albums/format';
import {
  ALBUM_SHORTCUTS,
  isHelpKey,
  moveGridFocus,
  useKeys,
} from '~/albums/keyboard';
import { absoluteUrl, shareImageSrc } from '~/albums/media';
import type { AlbumOutlet } from '~/albums/outlet';
import { albumPath, photoPath, yearPath } from '~/albums/paths';
import type { Album } from '~/albums/types';
import AlbumDrawer from '~/components/albums/AlbumDrawer';
import { Icon } from '~/components/albums/icons';
import KeyboardHelp, {
  ShortcutsButton,
} from '~/components/albums/KeyboardHelp';
import PhotoGrid from '~/components/albums/PhotoGrid';
import Heading from '~/components/Heading';
import type { Route } from './+types/photos.$year.$album';

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) return [{ title: 'Album not found — Pond Design' }];
  const { album } = loaderData;
  const cover = album.photos.find((p) => p.id === album.cover);
  const description =
    album.description ?? `${album.title}: ${photoCount(album.photos.length)}.`;
  return [
    { title: `${album.title} — Photos — Pond Design` },
    { name: 'description', content: description },
    { property: 'og:title', content: album.title },
    { property: 'og:description', content: description },
    ...(cover
      ? [
          {
            property: 'og:image',
            content: absoluteUrl(shareImageSrc(album, cover)),
          },
        ]
      : []),
  ];
};

export const loader = ({ params }: Route.LoaderArgs) => {
  const album = getAlbum(params.year, params.album);
  if (!album) throw data(null, { status: 404 });
  // Opened straight at a photo URL: send only the album's header, so the
  // pre-rendered photo page stays a few KB. The page then loads the full
  // album (one cached file shared by every photo) in the background.
  // Opening photos from the grid never re-runs this loader.
  if (params.photo)
    return {
      partial: true as const,
      album: { ...album, photos: [] },
      albums: [],
      newer: undefined,
      older: undefined,
    };
  // Albums are newest first.
  const i = albums.indexOf(album);
  const ref = (a?: Album) =>
    a && { year: a.year, slug: a.slug, title: a.title };
  return {
    partial: false as const,
    album,
    albums: summaries(),
    newer: ref(albums[i - 1]),
    older: ref(albums[i + 1]),
  };
};

const GRID = '.pd-justified a';

export default function AlbumPage({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof loader>();
  const albumUrl = albumPath(loaderData.album);
  // biome-ignore lint/correctness/useExhaustiveDependencies: load once per album
  useEffect(() => {
    if (loaderData.partial && !fetcher.data && fetcher.state === 'idle')
      fetcher.load(albumUrl);
  }, [loaderData.partial, albumUrl]);
  const full = loaderData.partial ? fetcher.data : loaderData;
  const album = full?.album ?? loaderData.album;
  /** Undefined until the full album has loaded. */
  const photos = full ? album.photos : undefined;
  const { newer, older } = full ?? {};
  const { photo: openPhoto } = useParams();
  const navigate = useNavigate();
  const [help, setHelp] = useState(false);

  // Lightroom-style grid keys. The photo viewer has its own while it's open.
  useKeys((event) => {
    if (isHelpKey(event)) {
      setHelp(true);
      return true;
    }
    // While the album list is open, keys belong to it (except A and Esc).
    const drawerOpen = Boolean(document.querySelector(':popover-open'));
    if (drawerOpen && !['a', 'A', 'Escape'].includes(event.key)) return false;
    if (moveGridFocus(event.key, GRID)) return true;
    const links = [...document.querySelectorAll<HTMLElement>(GRID)];
    const focused = links.indexOf(document.activeElement as HTMLElement);
    switch (event.key) {
      case 'e':
      case 'E': {
        const photo = album.photos[Math.max(0, focused)];
        if (photo)
          navigate(photoPath(album, photo), {
            state: { fromGrid: true },
            preventScrollReset: true,
          });
        return true;
      }
      case '[':
        if (older) navigate(albumPath(older));
        return true;
      case ']':
        if (newer) navigate(albumPath(newer));
        return true;
      case 'a':
      case 'A':
        document.getElementById('album-drawer')?.togglePopover();
        return true;
      case 'Escape':
        // Let an open album list close first.
        if (drawerOpen) return false;
        navigate(yearPath(album.year));
        return true;
    }
    return false;
  }, !openPhoto && !help);

  // Back in the grid, focus the photo that was last open (as Lightroom does).
  const lastOpen = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (openPhoto) {
      lastOpen.current = openPhoto;
      return;
    }
    const id = lastOpen.current;
    if (!id) return;
    lastOpen.current = undefined;
    const i = album.photos.findIndex((p) => p.id === id);
    const link = document.querySelectorAll<HTMLElement>(GRID)[i];
    requestAnimationFrame(() => {
      link?.focus({ preventScroll: true });
      link?.scrollIntoView({ block: 'nearest' });
    });
  }, [openPhoto, album.photos]);

  return (
    <main className="min-h-screen bg-surface-subtle px-4 py-8 text-fg-strong sm:px-10 sm:py-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex items-center gap-4">
          <AlbumDrawer albums={full?.albums ?? []} current={albumUrl} />
          <Link
            to={yearPath(album.year)}
            className="text-fg-subtle text-sm hover:text-fg-accent"
          >
            Photos · {album.year}
          </Link>
          <ShortcutsButton onClick={() => setHelp(true)} className="ml-auto" />
        </div>

        <header className="mt-8 mb-8 max-w-3xl">
          <Heading
            level={1}
            variant="display"
            className="text-4xl text-fg-heading sm:text-5xl"
          >
            {album.title}
          </Heading>
          <p className="mt-1 text-fg-subtle">
            {dateRange(album.startDate, album.endDate)}
            {photos && ` · ${photoCount(photos.length)}`}
          </p>
          {album.description && <p className="mt-4">{album.description}</p>}
        </header>

        {photos && <PhotoGrid album={album} photos={photos} />}

        {(newer || older) && (
          <nav
            aria-label="More albums"
            className="mt-16 flex justify-between gap-6 border-border-default border-t pt-8 text-sm"
          >
            {older ? (
              <Link
                to={albumPath(older)}
                prefetch="intent"
                className="inline-flex items-center gap-2 hover:text-fg-accent"
              >
                <Icon name="chevronLeft" /> {older.title}
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link
                to={albumPath(newer)}
                prefetch="intent"
                className="inline-flex items-center gap-2 hover:text-fg-accent"
              >
                {newer.title} <Icon name="chevronRight" />
              </Link>
            )}
          </nav>
        )}
      </div>

      {/* The photo viewer: /photos/:year/:album/photo/:photo */}
      <Outlet
        context={{ album, photos, help, setHelp } satisfies AlbumOutlet}
      />

      {!openPhoto && (
        <KeyboardHelp
          open={help}
          onClose={() => setHelp(false)}
          groups={ALBUM_SHORTCUTS}
        />
      )}
    </main>
  );
}
