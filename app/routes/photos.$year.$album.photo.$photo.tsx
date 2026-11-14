import { lazy, Suspense, useEffect, useState } from 'react';
import { data, Link, useLocation, useNavigate } from 'react-router';
import { getAlbum } from '~/albums/data.server';
import {
  absoluteUrl,
  averageColor,
  photoSrc,
  photoSrcSet,
  shareImageSrc,
  widthAtLeast,
} from '~/albums/media';
import { useAlbumOutlet } from '~/albums/outlet';
import { albumPath, photoPath } from '~/albums/paths';
import type { AlbumRef, Photo } from '~/albums/types';
import { Icon } from '~/components/albums/icons';
import type { Route } from './+types/photos.$year.$album.photo.$photo';

// The interactive viewer loads in the browser only.
const PhotoLightbox = lazy(() => import('~/components/albums/PhotoLightbox'));

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) return [{ title: 'Photo not found — Pond Design' }];
  const { album, photo, index, count } = loaderData;
  const title = `${album.title} (${index + 1} of ${count})`;
  const description = [photo.alt, photo.location].filter(Boolean).join(' — ');
  return [
    { title: `${title} — Photos — Pond Design` },
    ...(description ? [{ name: 'description', content: description }] : []),
    { property: 'og:title', content: title },
    { property: 'og:image', content: absoluteUrl(shareImageSrc(album, photo)) },
    { name: 'twitter:card', content: 'summary_large_image' },
  ];
};

export const loader = ({ params }: Route.LoaderArgs) => {
  const album = getAlbum(params.year, params.album);
  const index = album?.photos.findIndex((p) => p.id === params.photo) ?? -1;
  const photo = album?.photos[index];
  if (!album || !photo) throw data(null, { status: 404 });
  // Small on purpose: just this photo and its neighbours' ids. The full
  // photo list comes from the album route.
  const n = album.photos.length;
  return {
    album: { year: album.year, slug: album.slug, title: album.title },
    photo,
    index,
    count: n,
    prev: album.photos[(index - 1 + n) % n]?.id,
    next: album.photos[(index + 1) % n]?.id,
  };
};

// After the first page load, the viewer can open straight away.
let hydrated = false;

export default function PhotoPage({ loaderData }: Route.ComponentProps) {
  const { album, photos, help, setHelp } = useAlbumOutlet();
  const navigate = useNavigate();
  const location = useLocation();
  const [ready, setReady] = useState(hydrated);
  useEffect(() => {
    hydrated = true;
    setReady(true);
  }, []);

  // The viewer's position updates at once; the URL follows. Back/forward
  // (or a link) moving the URL moves the viewer.
  const [index, setIndex] = useState(loaderData.index);
  useEffect(() => setIndex(loaderData.index), [loaderData.index]);

  const fromGrid = Boolean(
    (location.state as { fromGrid?: boolean } | null)?.fromGrid,
  );
  // Paging through photos replaces the history entry, so Back (or closing)
  // returns to the grid in one step.
  const go = (i: number) => {
    const photo = photos?.[i];
    if (!photo || i === index) return;
    setIndex(i);
    navigate(photoPath(album, photo), {
      replace: true,
      state: location.state,
      preventScrollReset: true,
    });
  };
  const close = () =>
    fromGrid
      ? navigate(-1)
      : navigate(albumPath(album), { replace: true, preventScrollReset: true });

  const fallback = <PhotoStatic {...loaderData} />;
  if (!ready || !photos) return fallback;
  return (
    <Suspense fallback={fallback}>
      <PhotoLightbox
        album={album}
        photos={photos}
        index={index}
        onIndexChange={go}
        onClose={close}
        help={help}
        onHelpChange={setHelp}
      />
    </Suspense>
  );
}

/**
 * The photo as plain HTML: what the server renders (and what works without
 * JavaScript), shown until the interactive viewer takes over.
 */
function PhotoStatic({
  album,
  photo,
  index,
  count,
  prev,
  next,
}: {
  album: AlbumRef;
  photo: Photo;
  index: number;
  count: number;
  prev?: string;
  next?: string;
}) {
  const link = 'rounded-full p-3 text-white/80 hover:text-white';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e1110] p-6">
      <img
        src={photoSrc(album, photo, widthAtLeast(photo, 1600))}
        srcSet={photoSrcSet(album, photo)}
        sizes="100vw"
        width={photo.width}
        height={photo.height}
        alt={photo.alt}
        fetchPriority="high"
        style={{ backgroundColor: averageColor(photo) }}
        className="max-h-full max-w-full object-contain"
      />
      <p className="absolute top-6 left-8 font-mono text-sm text-white/70">
        {index + 1} / {count}
      </p>
      <Link
        to={albumPath(album)}
        aria-label="Back to album"
        className={`absolute top-3 right-3 ${link}`}
      >
        <Icon name="x" size={28} />
      </Link>
      {prev && (
        <Link
          to={photoPath(album, { id: prev })}
          aria-label="Previous photo"
          className={`absolute left-2 ${link}`}
        >
          <Icon name="chevronLeft" size={28} />
        </Link>
      )}
      {next && (
        <Link
          to={photoPath(album, { id: next })}
          aria-label="Next photo"
          className={`absolute right-2 ${link}`}
        >
          <Icon name="chevronRight" size={28} />
        </Link>
      )}
    </div>
  );
}
