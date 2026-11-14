import { summaries } from '~/albums/data.server';
import AlbumIndex from '~/components/albums/AlbumIndex';
import type { Route } from './+types/photos._index';

export const meta: Route.MetaFunction = () => [
  { title: 'Photos — Pond Design' },
  { name: 'description', content: 'Photo albums from pond.design.' },
];

export const loader = () => ({ albums: summaries() });

export default function Photos({ loaderData }: Route.ComponentProps) {
  return (
    <AlbumIndex
      title="Photos"
      albums={loaderData.albums}
      up="/"
      upLabel="pond.design"
    />
  );
}
