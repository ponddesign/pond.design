import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { byYear, photoCount } from '~/albums/format';
import {
  ALBUMS_SHORTCUTS,
  isHelpKey,
  moveGridFocus,
  useKeys,
} from '~/albums/keyboard';
import { PHOTOS, yearPath } from '~/albums/paths';
import type { AlbumSummary } from '~/albums/types';
import Heading from '~/components/Heading';
import AlbumCard from './AlbumCard';
import KeyboardHelp, { ShortcutsButton } from './KeyboardHelp';

/**
 * Albums grouped by year: the /photos page, and /photos/:year with a single
 * group. Esc goes up one level.
 */
export default function AlbumIndex({
  title,
  albums,
  up,
  upLabel,
}: {
  title: string;
  albums: AlbumSummary[];
  /** Where Esc and the breadcrumb go. */
  up: string;
  upLabel: string;
}) {
  const navigate = useNavigate();
  const [help, setHelp] = useState(false);
  useKeys((event) => {
    if (isHelpKey(event)) {
      setHelp(true);
      return true;
    }
    if (event.key === 'Escape') {
      navigate(up);
      return true;
    }
    return moveGridFocus(event.key, '[data-album-card]');
  }, !help);

  const groups = byYear(albums);
  const singleYear = groups.length === 1 && up === PHOTOS;
  let first = true;
  return (
    <main className="min-h-screen bg-surface-subtle px-6 py-12 text-fg-strong sm:px-10 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center">
          <Link to={up} className="text-fg-subtle text-sm hover:text-fg-accent">
            {upLabel}
          </Link>
          <ShortcutsButton onClick={() => setHelp(true)} className="ml-auto" />
        </div>
        <header className="mt-6 mb-12">
          <Heading
            level={1}
            variant="display"
            className="text-5xl text-fg-heading"
          >
            {title}
          </Heading>
          <p className="mt-1 text-fg-subtle">
            {albums.length === 1 ? '1 album' : `${albums.length} albums`} ·{' '}
            {photoCount(albums.reduce((n, a) => n + a.count, 0))}
          </p>
        </header>

        {albums.length === 0 && (
          <p className="text-fg-subtle">No albums yet.</p>
        )}

        <div className="space-y-16">
          {groups.map(([year, items]) => (
            <section
              key={year}
              aria-labelledby={singleYear ? undefined : `year-${year}`}
            >
              {!singleYear && (
                <Heading
                  level={2}
                  variant="section"
                  id={`year-${year}`}
                  className="mb-6 text-fg-heading"
                >
                  <Link to={yearPath(year)} className="hover:text-fg-accent">
                    {year}
                  </Link>
                </Heading>
              )}
              <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((album) => {
                  const priority = first;
                  first = false;
                  return (
                    <li key={`${album.year}/${album.slug}`}>
                      <AlbumCard album={album} priority={priority} />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
      <KeyboardHelp
        open={help}
        onClose={() => setHelp(false)}
        groups={ALBUMS_SHORTCUTS}
      />
    </main>
  );
}
