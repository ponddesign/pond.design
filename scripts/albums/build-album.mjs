#!/usr/bin/env node
// Builds one photo album from a folder of JPEG exports.
//
//   yarn album <folder> --title "Family reunion" [--slug family-reunion-2026]
//                       [--description "…"] [--cover R0001306]
//
// For every photo it:
//   - reads the caption/title (alt text), place, camera, lens and exposure;
//   - writes AVIF sizes up to 5120 px on the long edge, with ALL metadata
//     removed (no GPS, no camera serials) and colors converted to sRGB;
//   - computes a ThumbHash placeholder.
// Then it writes app/data/albums/<slug>.json.
//
// Proof of concept: images go to public/albums-media/<slug>/ (git-ignored).
// The GitHub Action will run this same code and upload to R2 instead.

import { createHash } from 'node:crypto';
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readdirSync,
  readSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, extname, join, relative } from 'node:path';
import { parseArgs } from 'node:util';
import exifr from 'exifr';
import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash';
import { cameraName, lensName } from './cameras.mjs';

const ROOT = join(dirname(new URL(import.meta.url).pathname), '..', '..');
const WIDTHS = [480, 960, 1600, 2400, 3200, 4096, 5120];
const MAX_LONG_EDGE = 5120;
const AVIF = { quality: 60, effort: 4 };

const { values: args, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    title: { type: 'string' },
    slug: { type: 'string' },
    description: { type: 'string' },
    cover: { type: 'string' },
    out: { type: 'string', default: join(ROOT, 'public', 'albums-media') },
    concurrency: { type: 'string', default: '2' },
  },
});

const source = positionals[0];
if (!source || !args.title) {
  console.error(
    'Usage: yarn album <folder> --title "Album title" [--slug …] [--description …] [--cover <photo id>]',
  );
  process.exit(1);
}

const slugify = (s) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Camera-style file names make useless alt text ("DSC 1234").
const CAMERA_FILE_NAME =
  /^(_?DSC|DSCF|DSCN|IMG|_MG|PXL|GOPR|GX|DJI|R\d{6,}|P\d{6,}|\d{6,})/i;

// exifr's file reader breaks on Node 26, and metadata lives at the start of a
// JPEG anyway, so read just the first megabyte.
function readHead(file, bytes = 1 << 20) {
  const buf = Buffer.alloc(bytes);
  const fd = openSync(file, 'r');
  const n = readSync(fd, buf, 0, bytes, 0);
  closeSync(fd);
  return buf.subarray(0, n);
}

function listJpegs(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listJpegs(path);
    return /\.jpe?g$/i.test(entry.name) ? [path] : [];
  });
}

const text = (v) =>
  typeof v === 'string'
    ? v.trim() || undefined
    : v && typeof v === 'object' && 'value' in v
      ? text(v.value)
      : undefined;

function altText(meta, file) {
  const fromMeta =
    text(meta.description) ??
    text(meta.Caption) ??
    text(meta.ImageDescription) ??
    text(meta.title) ??
    text(meta.ObjectName);
  if (fromMeta) return { alt: fromMeta, source: 'metadata' };
  const name = basename(file, extname(file));
  if (CAMERA_FILE_NAME.test(name)) return { alt: '', source: 'missing' };
  const readable = name.replace(/[-_]+/g, ' ').trim();
  return {
    alt: readable.charAt(0).toUpperCase() + readable.slice(1),
    source: 'file name',
  };
}

function place(meta) {
  const parts = [
    text(meta.Sublocation) ?? text(meta.Location),
    text(meta.City),
    text(meta.State) ?? text(meta['Province-State']),
    text(meta.Country) ?? text(meta['Country-PrimaryLocationName']),
  ].filter(Boolean);
  return parts.length ? [...new Set(parts)].join(', ') : undefined;
}

const round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

function exposure(meta) {
  const e = {};
  if (meta.FocalLength) e.focalLength = `${round(meta.FocalLength)}mm`;
  if (meta.FNumber) e.aperture = `ƒ/${round(meta.FNumber)}`;
  const t = meta.ExposureTime;
  if (t) e.shutter = t >= 0.3 ? `${round(t)}s` : `1/${Math.round(1 / t)}s`;
  if (meta.ISO) e.iso = meta.ISO;
  return Object.keys(e).length ? e : undefined;
}

// "2026:08:15 22:37:35" + "-04:00" → "2026-08-15T22:37:35-04:00"
function takenAt(meta) {
  const raw = text(meta.DateTimeOriginal) ?? text(meta.CreateDate);
  if (!raw) return undefined;
  const m = raw.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!m) return undefined;
  const [, y, mo, d, h, mi, s] = m;
  const offset = text(meta.OffsetTimeOriginal) ?? text(meta.OffsetTime) ?? '';
  return `${y}-${mo}-${d}T${h}:${mi}:${s}${offset}`;
}

async function thumbHash(image) {
  const { data, info } = await image
    .clone()
    .resize(100, 100, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return Buffer.from(rgbaToThumbHash(info.width, info.height, data)).toString(
    'base64',
  );
}

async function processPhoto(file, outDir) {
  const head = readHead(file);
  const size = statSync(file).size;
  const hash = createHash('sha1')
    .update(head)
    .update(String(size))
    .digest('hex')
    .slice(0, 8);
  const meta =
    (await exifr.parse(head, {
      xmp: true,
      iptc: true,
      reviveValues: false,
      translateValues: false,
    })) ?? {};

  const image = sharp(file, { limitInputPixels: false }).rotate();
  const { width: w0, height: h0, orientation = 1 } = await image.metadata();
  const [width, height] = orientation >= 5 ? [h0, w0] : [w0, h0];
  const maxWidth = Math.min(
    width,
    Math.round((MAX_LONG_EDGE * width) / Math.max(width, height)),
  );
  const widths = WIDTHS.filter((w) => w <= maxWidth);
  if (widths.at(-1) !== maxWidth && maxWidth - (widths.at(-1) ?? 0) > 200)
    widths.push(maxWidth);

  const id = slugify(basename(file, extname(file)));
  const base = `${id}-${hash}`;
  for (const w of widths) {
    const target = join(outDir, `${base}-${w}.avif`);
    if (existsSync(target)) continue; // re-runs only encode what's new
    await image
      .clone()
      .resize({ width: w })
      .toColorspace('srgb')
      .avif(AVIF)
      .toFile(target); // sharp drops all metadata unless asked to keep it
  }

  const { alt, source: altSource } = altText(meta, file);
  const camera = cameraName(text(meta.Make), text(meta.Model));
  return {
    photo: {
      id,
      base,
      width,
      height,
      widths,
      alt,
      takenAt: takenAt(meta),
      location: place(meta),
      camera,
      lens: lensName(text(meta.Model), text(meta.LensModel)),
      exposure: exposure(meta),
      thumbHash: await thumbHash(image),
    },
    altSource,
    hasGps: meta.latitude != null || meta.GPSLatitude != null,
    contentKey: `${hash}`,
  };
}

async function pool(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i], i);
      }
    }),
  );
  return results;
}

const slug = args.slug ?? slugify(args.title);
const outDir = join(args.out, slug);
mkdirSync(outDir, { recursive: true });

const files = listJpegs(source);
const empty = files.filter((f) => statSync(f).size === 0);
const usable = files.filter((f) => statSync(f).size > 0);
console.log(
  `${usable.length} photos in ${source}${empty.length ? ` (${empty.length} empty file(s) skipped)` : ''}`,
);

let done = 0;
const started = Date.now();
const results = await pool(usable, Number(args.concurrency), async (file) => {
  const r = await processPhoto(file, outDir);
  done++;
  process.stdout.write(
    `\r  ${done}/${usable.length}  ${relative(source, file)}`.padEnd(70),
  );
  return { ...r, file };
});
process.stdout.write('\n');

// The same export can sit in two folders; keep the first copy.
const seen = new Set();
const unique = results.filter((r) => {
  if (seen.has(r.contentKey)) return false;
  seen.add(r.contentKey);
  return true;
});
const duplicates = results.length - unique.length;

const time = (p) =>
  p.takenAt ? Date.parse(p.takenAt) : Number.POSITIVE_INFINITY;
const photos = unique
  .map((r) => r.photo)
  .sort((a, b) => time(a) - time(b) || a.id.localeCompare(b.id));

// Ids must be unique within the album (they appear in URLs).
const ids = new Map();
for (const p of photos) {
  const n = ids.get(p.id) ?? 0;
  ids.set(p.id, n + 1);
  if (n) p.id = `${p.id}-${n + 1}`;
}

const dates = photos.map((p) => p.takenAt).filter(Boolean);
const cover = args.cover ? slugify(args.cover) : photos[0]?.id;
if (!photos.some((p) => p.id === cover))
  throw new Error(`--cover "${args.cover}" is not a photo in this album`);

const album = {
  slug,
  title: args.title,
  ...(args.description ? { description: args.description } : {}),
  visibility: 'public',
  startDate: dates[0]?.slice(0, 10),
  endDate: dates.at(-1)?.slice(0, 10),
  cover,
  photos,
};
const dataDir = join(ROOT, 'app', 'data', 'albums');
mkdirSync(dataDir, { recursive: true });
writeFileSync(
  join(dataDir, `${slug}.json`),
  `${JSON.stringify(album, null, 2)}\n`,
);

const missingAlt = unique.filter((r) => r.altSource === 'missing');
const fileNameAlt = unique.filter((r) => r.altSource === 'file name');
const files_ = readdirSync(outDir);
const bytes = files_.reduce((s, f) => s + statSync(join(outDir, f)).size, 0);
console.log(`
Album "${album.title}" → app/data/albums/${slug}.json
  ${photos.length} photos, ${album.startDate} to ${album.endDate}${duplicates ? `, ${duplicates} duplicate(s) skipped` : ''}
  ${files_.length} image files, ${(bytes / 1e6).toFixed(0)} MB in ${relative(ROOT, outDir)}
  ${unique.filter((r) => r.hasGps).length} photo(s) had GPS (removed from every published file)
  ${photos.filter((p) => p.location).length} with a place name, ${photos.filter((p) => p.camera).length} with camera details
  Alt text: ${unique.length - missingAlt.length - fileNameAlt.length} from captions/titles, ${fileNameAlt.length} from file names, ${missingAlt.length} missing
  Took ${Math.round((Date.now() - started) / 1000)}s`);
if (missingAlt.length)
  console.log(
    `  Missing captions (add a Caption in Lightroom): ${missingAlt.map((r) => basename(r.file)).join(', ')}`,
  );
