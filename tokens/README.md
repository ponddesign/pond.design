# Design tokens

The site's colors and font stacks are defined here, in the
[W3C Design Tokens (DTCG)](https://www.designtokens.org/) format. Figma variables
and tools like Tokens Studio can read and write this format, so these files are
the shared contract between design and code.

```
tokens/
  color/brand.json     Pond brand ramps (primary, secondary)
  color/palette.json   Supporting palette (gray, orange, teal, …)
  font/family.json     Font stacks (sans, serif, mono)
```

## Changing a token

1. Edit the JSON (or export it from Figma).
2. Run `yarn tokens`.
3. Commit the JSON **and** the two generated files:
   - `app/styles/theme.css` — Tailwind v4 `@theme` block. Each token becomes a
     CSS variable and a utility: `color.primary.500` → `--color-primary-500`, which
     gives you `bg-primary-500`, `text-primary-500` and so on.
   - `app/design-tokens.ts` — the same values as TypeScript constants, for runtime
     code such as the web manifest.

CI fails if the generated files don't match the JSON. Never edit them by hand.

## Naming

A token's path becomes its CSS variable name. Under `color`, only tokens listed
here produce Tailwind color utilities, because the default Tailwind palette is
turned off (`--color-*: initial`). To add a color, add a token.
