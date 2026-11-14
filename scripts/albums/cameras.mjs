// Turns EXIF Make/Model/LensModel into the names people use.
// Add a model here when an album shows an internal code (e.g. ILCE-7CR).

const MODELS = {
  'ILCE-7CR': 'Sony α7CR',
  'ILCE-7CM2': 'Sony α7C II',
  'ILCE-7M4': 'Sony α7 IV',
  'ILCE-7RM5': 'Sony α7R V',
  'ILCE-1': 'Sony α1',
};

const MAKES = [
  [/^RICOH/i, 'Ricoh'],
  [/^SONY/i, 'Sony'],
  [/^FUJIFILM/i, 'Fujifilm'],
  [/^NIKON/i, 'Nikon'],
  [/^CANON/i, 'Canon'],
  [/^OLYMPUS|^OM DIGITAL/i, 'OM System'],
  [/^PANASONIC/i, 'Panasonic'],
  [/^LEICA/i, 'Leica'],
  [/^APPLE/i, 'Apple'],
  [/^GOOGLE/i, 'Google'],
];

const brandOf = (make = '') =>
  MAKES.find(([re]) => re.test(make.trim()))?.[1] ?? make.trim();

/** "RICOH IMAGING COMPANY, LTD." + "RICOH GR IV" → "Ricoh GR IV". */
export function cameraName(make, model) {
  if (!model) return undefined;
  const m = model.trim();
  if (MODELS[m]) return MODELS[m];
  const brand = brandOf(make);
  // Apple models already read "iPhone 17 Pro".
  if (brand === 'Apple') return m;
  // Strip a repeated brand ("RICOH GR IV", "Canon EOS R5").
  const rest = brand ? m.replace(new RegExp(`^${brand}\\s+`, 'i'), '') : m;
  return brand ? `${brand} ${rest}` : rest;
}

/**
 * Lens name, or undefined when it adds nothing: fixed-lens cameras such as
 * the Ricoh GR record a lens name that repeats the camera.
 */
export function lensName(model, lens) {
  if (!lens) return undefined;
  const l = lens.trim();
  const m = (model ?? '').trim();
  if (m && l.toUpperCase().includes(m.replace(/^RICOH\s+/i, '').toUpperCase()))
    return undefined;
  return l;
}
