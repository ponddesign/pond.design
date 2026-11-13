# pond.design

Source for [pond.design](https://pond.design): a React Router site deployed on
Vercel, styled with Tailwind CSS 4 and design tokens synced from Figma.

## Stack

| | |
|---|---|
| Framework | [React Router 7](https://reactrouter.com) (framework mode), React 19 |
| Build | Vite 8, TypeScript 6 |
| Styling | Tailwind CSS 4, with the theme generated from [design tokens](tokens/README.md) |
| Design tokens | W3C DTCG JSON, built with Style Dictionary, sourced from the [Pond Design System](https://www.figma.com/design/OQAuXo6GwDBMN5QIsoJdWJ/Pond-Design-System) Figma file via the [sync plugin](figma-plugin/README.md) |
| Fonts | DM Sans, DM Serif Display and DM Mono, self-hosted via [Fontsource](https://fontsource.org) (`app/styles/fonts.css`) |
| Lint and format | [Biome](https://biomejs.dev) |
| Hosting | Vercel. Static pages are pre-rendered at build time; server rendering stays on for future dynamic routes. |

## Development

Requires Node 24 (see `.nvmrc`) and Yarn 1.

```sh
yarn install
yarn dev        # start the dev server
yarn build      # production build (pre-renders static routes)
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
```

## Routes and rendering

Pages and files that never change (`/`, `/resume`, `robots.txt`,
`sitemap.xml`, `site.webmanifest`) are listed under `prerender` in
`react-router.config.ts` and served as static files. Everything else, including
`/.well-known/webfinger`, is server-rendered on Vercel Functions. To add a
dynamic route (for example an auth callback), create it under `app/routes` and
leave it out of `prerender`.
