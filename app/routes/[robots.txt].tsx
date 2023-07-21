export const loader = () => {
  const robotText = `User-agent: *
Allow: 
Disallow: /api

Sitemap: https://pond.design/sitemap.xml
`;

  return new Response(robotText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
