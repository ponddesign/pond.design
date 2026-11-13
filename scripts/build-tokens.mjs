// Builds design tokens (W3C DTCG format, in ./tokens) into:
//   - app/styles/theme.css  — a Tailwind v4 `@theme` block (CSS variables + utilities)
//   - app/design-tokens.ts  — typed constants for runtime use (e.g. the web manifest)
//
// Run with `yarn tokens`. Both outputs are committed; CI fails if they are stale.
import StyleDictionary from 'style-dictionary';

const HEADER = '/**\n * Do not edit directly — generated from ./tokens by `yarn tokens`.\n */';

StyleDictionary.registerFormat({
  name: 'css/tailwind-theme',
  format: ({ dictionary }) => {
    const lines = dictionary.allTokens.map(
      (token) => `  --${token.name}: ${token.$value};`,
    );
    // `--color-*: initial` removes Tailwind's default palette so only our
    // tokens generate color utilities.
    return `${HEADER}\n@theme {\n  --color-*: initial;\n${lines.join('\n')}\n}\n`;
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
