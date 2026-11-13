// Imports a Figma variables export (from figma-plugin/) into ./tokens.
//
//   node scripts/import-figma-tokens.mjs <export.json> [summary.md]
//
// Figma is the source of truth for every token it can represent:
//   Primitives colors  -> tokens/color/brand.json (primary, secondary) and palette.json
//   Primitives font/*  -> tokens/font/family.json (first family only; code keeps fallbacks)
//   Light/Dark colors  -> tokens/color/semantic.json (dark values in $extensions)
// Tokens Figma can't represent (non-hex colors such as transparent and
// currentColor) are kept from the existing files.
//
// The export is untrusted input: values end up in generated CSS, so every
// name and value is validated strictly.
import fs from 'node:fs';

const [exportPath, summaryPath] = process.argv.slice(2);
if (!exportPath) {
  console.error(
    'Usage: node scripts/import-figma-tokens.mjs <export.json> [summary.md]',
  );
  process.exit(1);
}

const MODES_KEY = 'design.pond.modes';
const BRAND_GROUPS = new Set(['primary', 'secondary']);
const FILES = {
  brand: 'tokens/color/brand.json',
  palette: 'tokens/color/palette.json',
  semantic: 'tokens/color/semantic.json',
  font: 'tokens/font/family.json',
};

const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;
const HEX = /^#[0-9A-F]{6}(?:[0-9A-F]{2})?$/;
const FONT = /^[A-Za-z0-9][A-Za-z0-9 -]{0,63}$/;

const fail = (message) => {
  console.error(`Invalid Figma export: ${message}`);
  process.exit(1);
};
const readJson = (path) =>
  fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf8')) : {};
const writeJson = (path, data) =>
  fs.writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
const text = (s) => (typeof s === 'string' ? s.trim().slice(0, 300) : '');

// ---------- validate ----------
const data = readJson(exportPath);
if (data.version !== 1) fail('unsupported version');
if (!data.primitives || typeof data.primitives !== 'object')
  fail('missing primitives');
if (!data.modes?.light) fail('missing light mode');

const colors = {};
const fonts = {};
for (const [name, token] of Object.entries(data.primitives)) {
  if (!NAME.test(name)) fail(`bad primitive name "${name}"`);
  if (name.startsWith('font/')) {
    if (token.type !== 'string' || !FONT.test(token.value))
      fail(`bad font "${name}"`);
    fonts[name.slice(5)] = token;
  } else {
    if (token.type !== 'color' || !HEX.test(token.value))
      fail(`bad color "${name}"`);
    colors[name] = token;
  }
}
for (const [mode, tokens] of Object.entries(data.modes)) {
  if (!['light', 'dark'].includes(mode)) fail(`unknown mode "${mode}"`);
  for (const [name, token] of Object.entries(tokens)) {
    if (!NAME.test(name)) fail(`bad semantic name "${name}"`);
    if (colors[name])
      fail(`"${name}" is both a primitive and a semantic color`);
    if (token.alias !== undefined) {
      if (!colors[token.alias])
        fail(`"${name}" (${mode}) aliases unknown color "${token.alias}"`);
    } else if (!HEX.test(token.value ?? ''))
      fail(`bad value for "${name}" (${mode})`);
  }
}

// ---------- helpers ----------
const ref = (token) =>
  token.alias ? `{color.${token.alias.replaceAll('/', '.')}}` : token.value;

// Nest "a/b/c" names into DTCG groups. A group gets a $description when all of
// its direct tokens share the same one.
function nest(entries) {
  const root = {};
  for (const [name, token] of entries) {
    const parts = name.split('/');
    let node = root;
    for (const part of parts.slice(0, -1)) node = node[part] ??= {};
    node[parts.at(-1)] = token;
  }
  const hoist = (group) => {
    const children = Object.entries(group).filter(([k]) => !k.startsWith('$'));
    const leaves = children.filter(([, v]) => '$value' in v);
    const descs = new Set(leaves.map(([, v]) => v.$description ?? ''));
    if (
      leaves.length > 1 &&
      leaves.length === children.length &&
      descs.size === 1
    ) {
      const [desc] = descs;
      for (const [, leaf] of leaves) delete leaf.$description;
      if (desc) return { $description: desc, ...group };
    }
    for (const [k, v] of children) if (!('$value' in v)) group[k] = hoist(v);
    return group;
  };
  return hoist(root);
}
const leaf = (value, description, extra) => ({
  ...(text(description) && { $description: text(description) }),
  $value: value,
  ...extra,
});

// Flatten token files to { "path.to.token": JSON(value + extensions) } for diffing.
function flatten(obj, prefix = [], out = {}) {
  for (const [k, v] of Object.entries(obj ?? {})) {
    if (k.startsWith('$') || typeof v !== 'object') continue;
    const path = [...prefix, k];
    if ('$value' in v)
      out[path.join('.')] = JSON.stringify([v.$value, v.$extensions ?? null]);
    else flatten(v, path, out);
  }
  return out;
}
const before = Object.assign(
  {},
  ...Object.values(FILES).map((f) => flatten(readJson(f))),
);

// ---------- colors ----------
// Keep tokens Figma can't hold (e.g. transparent, currentColor) from the old files.
const codeOnly = (file) =>
  Object.entries(readJson(file).color ?? {}).filter(
    ([k, v]) => !k.startsWith('$') && '$value' in v && !/^#/.test(v.$value),
  );
const colorEntries = (brand) =>
  Object.entries(colors)
    .filter(([name]) => BRAND_GROUPS.has(name.split('/')[0]) === brand)
    .map(([name, t]) => [name, leaf(t.value, t.description)]);

writeJson(FILES.brand, {
  color: { $type: 'color', ...nest(colorEntries(true)) },
});
writeJson(FILES.palette, {
  color: {
    $type: 'color',
    ...Object.fromEntries(codeOnly(FILES.palette)),
    ...nest(colorEntries(false)),
  },
});

// ---------- semantic ----------
const { light, dark = {} } = data.modes;
writeJson(FILES.semantic, {
  color: {
    $type: 'color',
    ...nest(
      Object.entries(light).map(([name, t]) => [
        name,
        leaf(
          ref(t),
          t.description,
          dark[name] && {
            $extensions: { [MODES_KEY]: { dark: ref(dark[name]) } },
          },
        ),
      ]),
    ),
  },
});

// ---------- fonts ----------
// Figma holds the family name; the repo keeps each stack's fallbacks.
const oldFonts = readJson(FILES.font).font ?? {};
writeJson(FILES.font, {
  font: {
    $type: 'fontFamily',
    ...Object.fromEntries(
      Object.entries(fonts).map(([name, t]) => {
        const fallbacks = (oldFonts[name]?.$value ?? []).slice(1);
        const desc = text(t.description) || oldFonts[name]?.$description;
        return [
          name,
          {
            ...(desc && { $description: desc }),
            $value: [t.value, ...fallbacks],
          },
        ];
      }),
    ),
  },
});

// ---------- summary ----------
const after = Object.assign(
  {},
  ...Object.values(FILES).map((f) => flatten(readJson(f))),
);
const added = Object.keys(after).filter((k) => !(k in before));
const removed = Object.keys(before).filter((k) => !(k in after));
const changed = Object.keys(after).filter(
  (k) => k in before && before[k] !== after[k],
);
const fmt = (src) => {
  const [value, ext] = JSON.parse(src);
  const shown = Array.isArray(value) ? value[0] : value;
  const darkValue = ext?.[MODES_KEY]?.dark;
  return darkValue ? `${shown} (dark: ${darkValue})` : shown;
};
const show = (k, src) => `\`${k}\` ${fmt(src[k])}`;
const lines = [
  `Synced from **${text(data.source?.fileName) || 'Figma'}** at ${text(data.source?.exportedAt) || 'an unknown time'}.`,
  '',
  `| | Count |`,
  `|---|---|`,
  `| Added | ${added.length} |`,
  `| Changed | ${changed.length} |`,
  `| Removed | ${removed.length} |`,
  '',
  ...(added.length
    ? ['**Added**', ...added.map((k) => `- ${show(k, after)}`), '']
    : []),
  ...(changed.length
    ? [
        '**Changed**',
        ...changed.map(
          (k) => `- \`${k}\` ${fmt(before[k])} → ${fmt(after[k])}`,
        ),
        '',
      ]
    : []),
  ...(removed.length
    ? ['**Removed**', ...removed.map((k) => `- ${show(k, before)}`), '']
    : []),
];
const summary = lines.join('\n');
if (summaryPath) fs.writeFileSync(summaryPath, `${summary}\n`);
console.log(summary);
