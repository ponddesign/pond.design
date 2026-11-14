import dmSansLatin from '@fontsource-variable/dm-sans/files/dm-sans-latin-opsz-normal.woff2?url';
import type { ReactNode } from 'react';
import type { LinksFunction } from 'react-router';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import type { Route } from './+types/root';
import appleTouchIcon from './assets/apple-touch-icon.png';
import favicon from './assets/favicon.svg';
import ErrorPage from './components/ErrorPage';
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

/** The document shell, shared by every page and the error page. */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-surface-default text-fg-default">
        {children}
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

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404)
    return (
      <ErrorPage
        title="Page not found"
        message="There's nothing at this address. It may have moved, or the link may be mistyped."
      />
    );
  // Other failures: a generic message, with details only in development.
  const details = import.meta.env.DEV
    ? isRouteErrorResponse(error)
      ? `${error.status} ${error.statusText}`
      : error instanceof Error
        ? (error.stack ?? error.message)
        : String(error)
    : undefined;
  return (
    <ErrorPage
      title="Something went wrong"
      message="This page couldn't be loaded. Please try again in a moment."
      details={details}
    />
  );
}
