# pond.design

Source for [pond.design](https://pond.design): a React Router site deployed on
Cloudflare Workers, styled with Tailwind CSS 4 and design tokens synced from Figma.

## Stack

| | |
|---|---|
| Framework | [React Router 8](https://reactrouter.com) (framework mode), React 19 |
| Build | Vite 8, TypeScript 7 |
| Styling | Tailwind CSS 4, with the theme generated from [design tokens](tokens/README.md) |
| Design tokens | W3C DTCG JSON, built with Style Dictionary, sourced from the [Pond Design System](https://www.figma.com/design/OQAuXo6GwDBMN5QIsoJdWJ/Pond-Design-System) Figma file via the [sync plugin](figma-plugin/README.md) |
| Fonts | DM Sans, DM Serif Display and DM Mono, self-hosted via [Fontsource](https://fontsource.org) (`app/styles/fonts.css`) |
| Lint and format | [Biome](https://biomejs.dev) |
| Hosting | [Cloudflare Workers](https://developers.cloudflare.com/workers/) with static assets. Static pages are pre-rendered at build time; a Worker renders everything else. |

## Development

Requires Node 26 (see `.nvmrc`) and Yarn 1.

```sh
yarn install
yarn dev        # start the dev server
yarn build      # production build (pre-renders static routes)
yarn preview    # build, then serve it in the Workers runtime (workerd)
yarn typecheck  # generate route types, then run tsc
yarn lint       # Biome lint + format check
yarn format     # apply Biome fixes and formatting
yarn tokens     # rebuild theme.css and design-tokens.ts from tokens/
```

## Project layout

```
app/
  routes/         file-based routes (pages and resource routes like sitemap.xml)
  components/     shared React components
  icons/          SVGs, imported as components with `?react`
  styles/         generated Tailwind theme (from tokens/, do not edit)
  data/           resume content (JSON Resume format)
tokens/           design tokens, synced from Figma
figma-plugin/     private Figma plugin that sends tokens to GitHub
scripts/          token build/import and CI checks
workers/          Cloudflare Worker entry and response headers
```

## Components

Shared UI lives in `app/components/` and has a matching component in the
[Pond Design System](https://www.figma.com/design/OQAuXo6GwDBMN5QIsoJdWJ/Pond-Design-System)
Figma file (**Components** page). The Figma components use the same color
variables and text styles, and their descriptions give the import path and props.

| Component | Props | Figma |
|---|---|---|
| `Tag` | `variant`: `neutral` \| `muted` \| `highlight`, `as`: `span` \| `p` | Tag (3 variants) |
| `Heading` | `level`: 1–6 (semantics), `variant`: `display` \| `section` \| `title` \| `subtitle` (look) | Heading (4 variants) |
| `Section` | `title`, `divider`, `contentClassName` | Section (Divider toggle) |

Components don't set their own outer margins or (for headings) text color;
the page sets those. Figma Code Connect would show this code in Dev Mode, but
it needs an Organization or Enterprise Figma plan.

## Routes and rendering

Pages and files that never change (`/`, `/resume`, `robots.txt`,
`sitemap.xml`, `site.webmanifest`) are listed under `prerender` in
`react-router.config.ts` and served as static assets, without running the
Worker. Everything else, including `/.well-known/webfinger` and 404s, is
server-rendered by the Worker (`workers/app.ts`). To add a dynamic route (for
example an auth callback), create it under `app/routes` and leave it out of
`prerender`. Loaders reach Cloudflare bindings (R2, D1, KV, …) with
`context.get(cloudflareContext)` from `app/cloudflare.ts`; declare bindings in
`wrangler.jsonc` and run `yarn typecheck` to regenerate their types.

## Deployment and headers

Cloudflare Workers Builds deploys `main` to production and gives every other
branch a preview URL. Security headers (CSP and friends) live in
`workers/headers.ts`: the build writes them to `build/client/_headers` for static
assets, and the Worker adds them to the responses it renders.

Cloudflare Web Analytics is on when the `VITE_CF_ANALYTICS_TOKEN` build variable
is set.
