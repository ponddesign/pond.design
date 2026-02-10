import type { LinksFunction, MetaFunction } from 'react-router';
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
import tailwindHref from './tailwind.css?url';

export const links: LinksFunction = () => [
  // favicon svg
  {
    rel: 'favicon',
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
    rel: 'stylesheet',
    href: tailwindHref,
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
    rel: 'preload',
    href: 'https://fonts.googleapis.com/css2?family=DM+Mono&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,800;1,9..40,400;1,9..40,800&family=DM+Serif+Display:ital@0;1&display=swap',
    as: 'style',
  },
  {
    rel: 'manifest',
    href: '/site.webmanifest',
  },
];

// TODO:
export const meta: MetaFunction = () => {
  return [
    {
      name: 'viewport',
      content: 'width=device-width,initial-scale=1',
    },
    {
      httpEquiv: 'Content-Security-Policy',
      content:
        "default-src 'self'; connect-src 'self' https://vitals.vercel-insights.com; font-src https://fonts.gstatic.com; style-src: 'self' https://fonts.googleapis.com; img-src https://*; child-src 'none';",
    },
  ];
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen dark:bg-primary-700 text-primary-600 dark:text-primary-300">
        <Analytics />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
