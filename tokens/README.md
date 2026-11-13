# Design tokens

The site's colors and font stacks are defined here in the
[W3C Design Tokens (DTCG)](https://www.designtokens.org/) format.

**Figma is the source of truth.** These files are written by the
[Figma sync](../figma-plugin/README.md) from the
[Pond Design System](https://www.figma.com/design/OQAuXo6GwDBMN5QIsoJdWJ/Pond-Design-System)
file. Change tokens in Figma and sync, rather than editing these files by hand.
A hand edit is overwritten the next time someone syncs.

```
tokens/
  color/brand.json      Pond brand ramps (primary, secondary)        ← Figma: Primitives
  color/palette.json    Supporting palette (gray, orange, teal, …)   ← Figma: Primitives
  color/semantic.json   Purpose-named colors, light + dark           ← Figma: Color (Light) / Color (Dark)
  font/family.json      Font stacks (sans, serif, mono)              ← Figma: Primitives font/*
```

## Using tokens in code

Prefer **semantic** classes. They switch between light and dark automatically:

| Use | Class | Light | Dark |
|---|---|---|---|
| Page background | `bg-surface-default` / `bg-surface-subtle` | white / primary-200 | primary-700 |
| Text | `text-fg-default`, `-strong`, `-heading`, `-subtle`, `-faint` | | |
| Link hover, accents | `text-fg-accent` | orange-500 | orange-400 |
| Dividers | `border-border-default` | secondary-200 | secondary-500 |
| Tags | `bg-tag-neutral-bg`, `bg-tag-muted-bg`, `bg-tag-highlight-bg` (+ `-fg`) | | |

Primitive classes (`bg-primary-500`, `text-orange-300`, …) still work, but
they don't adapt to dark mode. If you need one, consider asking for a semantic
token in Figma instead. There's no need for `dark:` classes.

## How it builds

`yarn tokens` (Style Dictionary 5, [scripts/build-tokens.mjs](../scripts/build-tokens.mjs)) generates:

- `app/styles/theme.css`: a Tailwind v4 `@theme` block that turns every token
  into a CSS variable and utility class (`color.fg.subtle` → `--color-fg-subtle` →
  `text-fg-subtle`). It also writes a `prefers-color-scheme: dark` block that
  overrides the semantic variables.
- `app/design-tokens.ts`: light values as TypeScript constants, for runtime
  code such as the web manifest.

Semantic tokens store their light value in `$value` and their dark value in
`$extensions["design.pond.modes"].dark`, both as references to primitives.
CI fails if the generated files don't match the JSON.

To change the pipeline itself (new token types, output formats), edit
`scripts/build-tokens.mjs` or `scripts/import-figma-tokens.mjs`.
