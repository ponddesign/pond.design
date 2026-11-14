import { albums } from '~/albums/data.server';

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
  <url>
    <loc>https://pond.design/albums</loc>
    <lastmod>${buildTime}</lastmod>
  </url>
${albums
  .map(
    (album) => `  <url>
    <loc>https://pond.design/albums/${album.slug}</loc>
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
