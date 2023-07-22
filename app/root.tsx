import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Analytics } from "@vercel/analytics/react";

import favicon from "./assets/favicon.svg";
import appleTouchIcon from "./assets/apple-touch-icon.png";
import styles from "./tailwind.css";

export const links: LinksFunction = () => [
  // favicon svg
  {
    rel: "favicon",
    href: favicon,
  },
  // safari
  {
    rel: "mask-icon",
    href: favicon,
    color: "#6A726F",
  },
  // apple touch icon
  {
    rel: "apple-touch-icon",
    href: appleTouchIcon,
  },
  {
    rel: "stylesheet",
    href: styles,
  },
  {
    rel: "preconnect",
    href: "https://fonts.googleapis.com",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100;0,400;0,700;0,900;1,100;1,400;1,700;1,900&display=swap",
  },
  {
    rel: "manifest",
    href: "/site.webmanifest",
  },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
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
      <body className="bg-white dark:bg-zinc-800 min-h-screen">
        <Analytics />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
