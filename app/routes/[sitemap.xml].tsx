import { albums } from '~/albums/data.server';
import { albumPath, PHOTOS, yearPath } from '~/albums/paths';

// Photo pages aren't listed: there are many, and each album links to them.
const photoUrls = [
  PHOTOS,
  ...new Set(albums.map((album) => yearPath(album.year))),
  ...albums.map(albumPath),
];

const buildTime = import.meta.env.BUILD_TIME;

export const loader = () => {
  const content = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pond.design/</loc>
    <lastmod>${buildTime}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://pond.design/resume</loc>
    <lastmod>${buildTime}</lastmod>
    <priority>1.0</priority>
  </url>
${photoUrls
  .map(
    (path) => `  <url>
    <loc>https://pond.design${path}</loc>
    <lastmod>${buildTime}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>
    `;

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'xml-version': '1.0',
      encoding: 'UTF-8',
    },
  });
};
