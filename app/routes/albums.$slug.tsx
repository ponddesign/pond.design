import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { data, Link, useNavigate, useSearchParams } from 'react-router';
import { albums, getAlbum, summaries } from '~/albums/data.server';
import { dateRange, photoCount } from '~/albums/format';
import {
  ALBUM_SHORTCUTS,
  isHelpKey,
  moveGridFocus,
  useKeys,
} from '~/albums/keyboard';
import AlbumDrawer from '~/components/albums/AlbumDrawer';
import { Icon } from '~/components/albums/icons';
import KeyboardHelp, {
  ShortcutsButton,
} from '~/components/albums/KeyboardHelp';
import PhotoGrid from '~/components/albums/PhotoGrid';
import Heading from '~/components/Heading';
import type { Route } from './+types/albums.$slug';

// The lightbox only loads when a photo is opened.
const PhotoLightbox = lazy(() => import('~/components/albums/PhotoLightbox'));

export const meta: Route.MetaFunction = ({ loaderData }) =>
  loaderData
    ? [
        { title: `${loaderData.album.title} — Albums — Pond Design` },
        {
          name: 'description',
          content:
            loaderData.album.description ??
            `${loaderData.album.title}: ${photoCount(loaderData.album.photos.length)}.`,
        },
      ]
    : [{ title: 'Album not found — Pond Design' }];

export const loader = ({ params }: Route.LoaderArgs) => {
  const album = getAlbum(params.slug);
  if (!album) throw data(null, { status: 404 });
  // Albums are newest first, so "previous" is the newer one.
  const i = albums.indexOf(album);
  const neighbour = (a?: (typeof albums)[number]) =>
    a && { slug: a.slug, title: a.title };
  return {
    album,
    albums: summaries(),
    newer: neighbour(albums[i - 1]),
    older: neighbour(albums[i + 1]),
  };
};

export default function AlbumPage({ loaderData }: Route.ComponentProps) {
  const { album, newer, older } = loaderData;
  const [params, setParams] = useSearchParams();
  const index = album.photos.findIndex((p) => p.id === params.get('photo'));

  // The open photo lives in the URL (?photo=<id>), so it can be shared.
  const show = useCallback(
    (i: number | null) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const photo = i === null ? undefined : album.photos[i];
          if (photo) next.set('photo', photo.id);
          else next.delete('photo');
          return next;
        },
        { replace: true, preventScrollReset: true },
      ),
    [album.photos, setParams],
  );

  const navigate = useNavigate();
  const [help, setHelp] = useState(false);
  const GRID = '.pd-justified a';

  // Lightroom-style grid keys. The lightbox has its own while it's open.
  useKeys(
    (event) => {
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
        case 'E':
          show(Math.max(0, focused));
          return true;
        case '[':
          if (older) navigate(`/albums/${older.slug}`);
          return true;
        case ']':
          if (newer) navigate(`/albums/${newer.slug}`);
          return true;
        case 'a':
        case 'A':
          document.getElementById('album-drawer')?.togglePopover();
          return true;
        case 'Escape':
          // Let an open album list close first.
          if (drawerOpen) return false;
          navigate('/albums');
          return true;
      }
      return false;
    },
    index < 0 && !help,
  );

  // Back in the grid, focus the photo that was last open (as Lightroom does).
  const lastOpen = useRef(-1);
  useEffect(() => {
    if (index >= 0) {
      lastOpen.current = index;
      return;
    }
    if (lastOpen.current < 0) return;
    const link = document.querySelectorAll<HTMLElement>(GRID)[lastOpen.current];
    lastOpen.current = -1;
    requestAnimationFrame(() => {
      link?.focus({ preventScroll: true });
      link?.scrollIntoView({ block: 'nearest' });
    });
  }, [index]);

  return (
    <main className="min-h-screen bg-surface-subtle px-4 py-8 text-fg-strong sm:px-10 sm:py-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex items-center gap-4">
          <AlbumDrawer albums={loaderData.albums} current={album.slug} />
          <Link to="/" className="text-fg-subtle text-sm hover:text-fg-accent">
            pond.design
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
            {dateRange(album.startDate, album.endDate)} ·{' '}
            {photoCount(album.photos.length)}
          </p>
          {album.description && <p className="mt-4">{album.description}</p>}
        </header>

        <PhotoGrid slug={album.slug} photos={album.photos} onOpen={show} />

        {(newer || older) && (
          <nav
            aria-label="More albums"
            className="mt-16 flex justify-between gap-6 border-border-default border-t pt-8 text-sm"
          >
            {older ? (
              <Link
                to={`/albums/${older.slug}`}
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
                to={`/albums/${newer.slug}`}
                prefetch="intent"
                className="inline-flex items-center gap-2 hover:text-fg-accent"
              >
                {newer.title} <Icon name="chevronRight" />
              </Link>
            )}
          </nav>
        )}
      </div>

      {index >= 0 && (
        <Suspense fallback={null}>
          <PhotoLightbox
            slug={album.slug}
            photos={album.photos}
            index={index}
            onIndexChange={show}
            onClose={() => show(null)}
            help={help}
            onHelpChange={setHelp}
          />
        </Suspense>
      )}
      {index < 0 && (
        <KeyboardHelp
          open={help}
          onClose={() => setHelp(false)}
          groups={ALBUM_SHORTCUTS}
        />
      )}
    </main>
  );
}
