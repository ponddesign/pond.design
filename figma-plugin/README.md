# Pond Tokens → GitHub (Figma plugin)

The [Pond Design System](https://www.figma.com/design/OQAuXo6GwDBMN5QIsoJdWJ/Pond-Design-System)
Figma file is the source of truth for design tokens. This private plugin sends
its variables to GitHub, where a workflow opens a pull request with the changes.

```
Figma variables ──plugin──▶ GitHub Action ──▶ tokens/*.json ──yarn tokens──▶ theme.css + design-tokens.ts ──▶ PR
```

## One-time setup

1. **Install the plugin.** In the Figma desktop app: *Plugins → Development →
   Import plugin from manifest…* and choose `figma-plugin/manifest.json` from a
   checkout of this repo. Development plugins work on every Figma plan.
2. **Create a GitHub token.** Create a [fine-grained personal access
   token](https://github.com/settings/personal-access-tokens/new):
   - Repository access: **Only select repositories** → `ponddesign/pond.design`
   - Permissions: **Actions: Read and write**. Nothing else is needed.

   The token can only start workflows on this repo. It can't push code or
   merge PRs.
3. Run the plugin and paste the token. Figma stores it on that device only
   (`figma.clientStorage`).

## Syncing a change

1. Edit variables in the Figma file.
2. Run *Plugins → Development → Pond Tokens → GitHub*, optionally add a note,
   and click **Send tokens to GitHub**.
3. The [Sync design tokens from Figma](../.github/workflows/figma-tokens.yml)
   workflow imports the tokens, rebuilds, runs lint, typecheck and build, then
   opens or updates the PR on the `figma/tokens` branch. The PR body lists every
   added, changed and removed token.

## How the Figma file maps to code

| Figma collection | Variable | Token file | CSS variable / Tailwind class |
|---|---|---|---|
| Primitives | `primary/500` | `tokens/color/brand.json` | `--color-primary-500` / `bg-primary-500` |
| Primitives | `orange/300` | `tokens/color/palette.json` | `--color-orange-300` / `bg-orange-300` |
| Primitives | `font/sans` (family name) | `tokens/font/family.json` | `--font-sans` / `font-sans` |
| Color (Light) + Color (Dark) | `fg/subtle` | `tokens/color/semantic.json` | `--color-fg-subtle` / `text-fg-subtle` |

Rules the import enforces:
- **Semantic colors must alias a primitive** (or use a raw hex value). Light
  and dark collections should have the same variable names. A name missing from
  Color (Dark) gets no dark override.
- `primary/*` and `secondary/*` go to `brand.json`; everything else in
  Primitives goes to `palette.json`.
- **Removing a variable in Figma removes the token in code.** The exceptions are
  tokens Figma can't hold (`transparent`, `currentColor`), which stay in code.
- Figma holds a font's family name only. The fallback stack after it is kept
  in `family.json`.
- Names must be lowercase `kebab-case` segments separated by `/`. Values are
  validated before they reach any generated CSS.

### Free (Starter) plan vs paid plans

The Starter plan allows one mode per collection, so light and dark live in two
collections: **Color (Light)** and **Color (Dark)**. On a paid plan, merge them
into one **Color** collection with `Light` and `Dark` modes. The plugin
detects that layout automatically and needs no code change.

## Editing the plugin

`code.js`, `ui.html` and `manifest.json` are plain files with no build step.
Re-run the plugin in Figma to pick up changes. `exportTokens()` in `code.js` is
the only part that reads the file. Keep it self-contained.
