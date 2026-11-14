import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { summaries } from '~/albums/data.server';
import { byYear, photoCount } from '~/albums/format';
import {
  ALBUMS_SHORTCUTS,
  isHelpKey,
  moveGridFocus,
  useKeys,
} from '~/albums/keyboard';
import AlbumCard from '~/components/albums/AlbumCard';
import KeyboardHelp, {
  ShortcutsButton,
} from '~/components/albums/KeyboardHelp';
import Heading from '~/components/Heading';
import type { Route } from './+types/albums._index';

export const meta: Route.MetaFunction = () => [
  { title: 'Albums — Pond Design' },
  { name: 'description', content: 'Photo albums from pond.design.' },
];

export const loader = () => ({ albums: summaries() });

export default function Albums({ loaderData }: Route.ComponentProps) {
  const { albums } = loaderData;
  const navigate = useNavigate();
  const [help, setHelp] = useState(false);
  useKeys((event) => {
    if (isHelpKey(event)) {
      setHelp(true);
      return true;
    }
    if (event.key === 'Escape') {
      navigate('/');
      return true;
    }
    return moveGridFocus(event.key, '[data-album-card]');
  }, !help);
  let first = true;
  return (
    <main className="min-h-screen bg-surface-subtle px-6 py-12 text-fg-strong sm:px-10 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center">
          <Link to="/" className="text-fg-subtle text-sm hover:text-fg-accent">
            pond.design
          </Link>
          <ShortcutsButton onClick={() => setHelp(true)} className="ml-auto" />
        </div>
        <header className="mt-6 mb-12">
          <Heading
            level={1}
            variant="display"
            className="text-5xl text-fg-heading"
          >
            Albums
          </Heading>
          <p className="mt-1 text-fg-subtle">
            {albums.length === 1 ? '1 album' : `${albums.length} albums`} ·{' '}
            {photoCount(albums.reduce((n, a) => n + a.count, 0))}
          </p>
        </header>

        {albums.length === 0 && (
          <p className="text-fg-subtle">
            No albums yet. Build one with <code>yarn album</code>.
          </p>
        )}

        <div className="space-y-16">
          {byYear(albums).map(([year, items]) => (
            <section key={year} aria-labelledby={`year-${year}`}>
              <Heading
                level={2}
                variant="section"
                id={`year-${year}`}
                className="mb-6 text-fg-heading"
              >
                {year}
              </Heading>
              <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((album) => {
                  const priority = first;
                  first = false;
                  return (
                    <li key={album.slug}>
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
