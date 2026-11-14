import { data } from 'react-router';
import { albumsInYear, summaries } from '~/albums/data.server';
import { isYear, PHOTOS } from '~/albums/paths';
import AlbumIndex from '~/components/albums/AlbumIndex';
import type { Route } from './+types/photos.$year._index';

export const meta: Route.MetaFunction = ({ params }) => [
  { title: `${params.year} — Photos — Pond Design` },
  { name: 'description', content: `Photo albums from ${params.year}.` },
];

export const loader = ({ params }: Route.LoaderArgs) => {
  const albums = isYear(params.year) ? albumsInYear(params.year) : [];
  if (!albums.length) throw data(null, { status: 404 });
  return { year: params.year, albums: summaries(albums) };
};

export default function Year({ loaderData }: Route.ComponentProps) {
  return (
    <AlbumIndex
      title={loaderData.year}
      albums={loaderData.albums}
      up={PHOTOS}
      upLabel="Photos"
    />
  );
}
