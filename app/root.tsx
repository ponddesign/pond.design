import type { LinksFunction } from 'react-router';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import { Analytics } from '@vercel/analytics/react';

import favicon from './assets/favicon.svg';
import appleTouchIcon from './assets/apple-touch-icon.png';
import './tailwind.css';

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
  {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com',
  },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=DM+Mono&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,800;1,9..40,400;1,9..40,800&family=DM+Serif+Display:ital@0;1&display=swap',
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
        <Analytics />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
