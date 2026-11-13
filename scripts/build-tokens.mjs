// Builds design tokens (W3C DTCG format, in ./tokens) into:
//   - app/styles/theme.css  — a Tailwind v4 `@theme` block (CSS variables + utilities),
//                             plus dark-mode overrides for semantic colors
//   - app/design-tokens.ts  — typed constants for runtime use (light values)
//
// Semantic tokens (tokens/color/semantic.json) keep their light value in
// `$value` and their dark value in `$extensions["design.pond.modes"].dark`,
// both as references to primitives.
//
// Run with `yarn tokens`. Both outputs are committed; CI fails if they are stale.
import StyleDictionary from 'style-dictionary';

const HEADER = '/**\n * Do not edit directly — generated from ./tokens by `yarn tokens`.\n */';
const MODES_KEY = 'design.pond.modes';

StyleDictionary.registerFormat({
  name: 'css/tailwind-theme',
  format: ({ dictionary }) => {
    const lines = dictionary.allTokens.map(
      (token) => `  --${token.name}: ${token.$value};`,
    );

    // Resolve each semantic token's dark reference ("{color.primary.700}")
    // to the primitive's final value.
    const byPath = new Map(
      dictionary.allTokens.map((t) => [t.path.join('.'), t]),
    );
    const darkLines = dictionary.allTokens.flatMap((token) => {
      const ref = token.original.$extensions?.[MODES_KEY]?.dark;
      if (!ref) return [];
      const target = byPath.get(ref.replace(/^\{|\}$/g, ''));
      if (!target) throw new Error(`${token.name}: unknown dark reference ${ref}`);
      return [`      --${token.name}: ${target.$value};`];
    });
    const dark = darkLines.length
      ? `\n/* Dark mode: Tailwind utilities read these variables, so overriding them\n   switches every semantic class at once. */\n@layer base {\n  @media (prefers-color-scheme: dark) {\n    :root {\n${darkLines.join('\n')}\n    }\n  }\n}\n`
      : '';

    // `--color-*: initial` removes Tailwind's default palette so only our
    // tokens generate color utilities.
    return `${HEADER}\n@theme {\n  --color-*: initial;\n${lines.join('\n')}\n}\n${dark}`;
  },
});

const sd = new StyleDictionary({
  source: ['tokens/**/*.json'],
  usesDtcg: true,
  log: { verbosity: 'default' },
  platforms: {
    tailwind: {
      transformGroup: 'css',
      buildPath: 'app/styles/',
      files: [{ destination: 'theme.css', format: 'css/tailwind-theme' }],
    },
    ts: {
      transformGroup: 'js',
      buildPath: 'app/',
      files: [{ destination: 'design-tokens.ts', format: 'javascript/es6' }],
    },
  },
});

await sd.buildAllPlatforms();
