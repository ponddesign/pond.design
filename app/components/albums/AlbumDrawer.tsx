import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { albumMonth, byYear, photoCount } from '~/albums/format';
import { photoSrc } from '~/albums/media';
import type { AlbumSummary } from '~/albums/types';
import { Icon } from './icons';

/**
 * "Albums" button plus a pull-out drawer listing every album by year.
 * Uses the HTML popover API, so it opens, closes on Escape or an outside
 * click, and sits above the page without any JavaScript.
 * Figma: Albums — photo details explorations → Album nav item.
 */
export default function AlbumDrawer({
  albums,
  current,
}: {
  albums: AlbumSummary[];
  current?: string;
}) {
  // Fixed id: the A key toggles the drawer from the album page.
  const id = 'album-drawer';
  const drawer = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // Client-side navigation keeps the page, so close the drawer explicitly.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on navigation
  useEffect(() => {
    drawer.current?.hidePopover?.();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        popoverTarget={id}
        className="inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-default px-4 py-1.5 font-medium text-fg-strong text-sm hover:text-fg-accent focus-visible:outline-2 focus-visible:outline-fg-accent"
      >
        <Icon name="menu" />
        Albums
      </button>

      <div
        ref={drawer}
        id={id}
        popover="auto"
        role="dialog"
        aria-label="Albums"
        className="pd-drawer bg-surface-default text-fg-default"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <p className="font-serif text-2xl text-fg-heading">Albums</p>
          <button
            type="button"
            popoverTarget={id}
            popoverTargetAction="hide"
            aria-label="Close albums"
            className="rounded-full p-2 text-fg-subtle hover:text-fg-strong"
          >
            <Icon name="x" size={20} />
          </button>
        </div>
        <nav aria-label="Albums" className="pb-4">
          {byYear(albums).map(([year, items]) => (
            <section key={year}>
              <h2 className="sticky top-0 bg-surface-default/95 px-5 py-2 font-medium text-fg-subtle text-xs uppercase tracking-widest backdrop-blur">
                {year}
              </h2>
              <ul className="px-2">
                {items.map((album) => {
                  const isCurrent = album.slug === current;
                  return (
                    <li key={album.slug}>
                      <Link
                        to={`/albums/${album.slug}`}
                        prefetch="intent"
                        aria-current={isCurrent ? 'page' : undefined}
                        className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-surface-subtle aria-[current=page]:bg-surface-subtle"
                      >
                        <img
                          src={photoSrc(album.slug, album.cover, 480)}
                          alt=""
                          width={64}
                          height={44}
                          loading="lazy"
                          className="h-11 w-16 shrink-0 rounded-[3px] object-cover"
                        />
                        <span className="min-w-0">
                          <span
                            className={
                              isCurrent
                                ? 'block truncate font-extrabold text-fg-heading'
                                : 'block truncate font-medium text-fg-strong'
                            }
                          >
                            {album.title}
                          </span>
                          <span className="block text-fg-subtle text-sm">
                            {albumMonth(album.startDate, true)} ·{' '}
                            {photoCount(album.count)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </nav>
        <Link
          to="/albums"
          className="mx-5 mb-6 inline-flex items-center gap-2 font-medium text-fg-accent text-sm"
        >
          View all albums <Icon name="arrowRight" />
        </Link>
      </div>
    </>
  );
}
