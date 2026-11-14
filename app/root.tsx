import dmSansLatin from '@fontsource-variable/dm-sans/files/dm-sans-latin-opsz-normal.woff2?url';
import type { LinksFunction } from 'react-router';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import appleTouchIcon from './assets/apple-touch-icon.png';
import favicon from './assets/favicon.svg';
import './tailwind.css';

// Cloudflare Web Analytics site token, set as a build variable in production.
const analyticsToken = import.meta.env.VITE_CF_ANALYTICS_TOKEN;

export const links: LinksFunction = () => [
  // favicon svg
  {
    rel: 'icon',
    type: 'image/svg+xml',
    href: favicon,
  },
  // safari
  {
    rel: 'mask-icon',
    href: favicon,
    color: '#6A726F',
  },
  // apple touch icon
  {
    rel: 'apple-touch-icon',
    href: appleTouchIcon,
  },
  // Preload the body font so text renders in DM Sans without a swap.
  {
    rel: 'preload',
    href: dmSansLatin,
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'manifest',
    href: '/site.webmanifest',
  },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-surface-default text-fg-default">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {analyticsToken && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: analyticsToken })}
          />
        )}
      </body>
    </html>
  );
}
