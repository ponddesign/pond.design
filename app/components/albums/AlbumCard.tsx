import clsx from 'clsx';
import { type PointerEvent, useRef, useState } from 'react';
import { Link } from 'react-router';
import { albumMonth, photoCount } from '~/albums/format';
import { averageColor, photoSrc, widthAtLeast } from '~/albums/media';
import { albumPath } from '~/albums/paths';
import type { AlbumSummary } from '~/albums/types';

/**
 * An album on the /photos pages: key photo, title, month and photo count.
 * With a mouse, moving across the cover skims through a few photos from the
 * album (like iPhoto); touch and keyboard just show the key photo.
 * Figma: Albums — photo details explorations → Album card.
 */
export default function AlbumCard({
  album,
  priority = false,
}: {
  album: AlbumSummary;
  priority?: boolean;
}) {
  const [active, setActive] = useState(0);
  const preloaded = useRef(false);
  const { previews } = album;
  const src = (i: number) => {
    const photo = previews[i] ?? album.cover;
    return photoSrc(album, photo, widthAtLeast(photo, 960));
  };

  const preload = () => {
    if (preloaded.current) return;
    preloaded.current = true;
    for (let i = 1; i < previews.length; i++) new Image().src = src(i);
  };

  const skim = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse' || previews.length < 2) return;
    preload();
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    setActive(
      Math.min(
        previews.length - 1,
        Math.max(0, Math.floor(x * previews.length)),
      ),
    );
  };

  const shown = previews[active] ?? album.cover;
  return (
    <Link
      to={albumPath(album)}
      prefetch="intent"
      data-album-card
      className="group block rounded-[2px] outline-offset-4 focus-visible:outline-2 focus-visible:outline-fg-accent"
    >
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-surface-default"
        onPointerMove={skim}
        onPointerLeave={() => setActive(0)}
      >
        <img
          src={src(active)}
          alt=""
          width={shown.width}
          height={shown.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          style={{ backgroundColor: averageColor(shown) }}
          className="absolute inset-0 h-full w-full bg-cover bg-center object-cover"
        />
        {previews.length > 1 && (
          <div
            aria-hidden="true"
            className="absolute inset-x-3 bottom-3 flex gap-1 opacity-0 transition-opacity [@media(hover:hover)]:group-hover:opacity-100"
          >
            {previews.map((photo, i) => (
              <span
                key={photo.id}
                className={clsx(
                  'h-0.5 flex-1 rounded-full',
                  i === active ? 'bg-white' : 'bg-white/40',
                )}
              />
            ))}
          </div>
        )}
      </div>
      <h3 className="mt-3 font-extrabold text-fg-heading text-lg">
        {album.title}
      </h3>
      <p className="text-fg-subtle text-sm">
        {albumMonth(album.startDate)} · {photoCount(album.count)}
      </p>
    </Link>
  );
}
