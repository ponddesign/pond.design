// Pond Tokens → GitHub
//
// Reads this file's design-token variables and sends them to the repo's
// "Sync design tokens from Figma" GitHub Action, which opens a PR.
//
// Expected collections (see figma-plugin/README.md):
//   Primitives       1 mode   raw colors (e.g. primary/500) and font families (font/sans)
//   Color (Light)    1 mode   semantic colors, aliased to Primitives
//   Color (Dark)     1 mode   same variable names as Color (Light)
// On paid plans, a single "Color" collection with "Light" and "Dark" modes
// works too.
//
// Plain JavaScript, no build step. Keep `exportTokens` self-contained: it is
// also run headlessly to test the import pipeline.

async function exportTokens() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const variables = await figma.variables.getLocalVariablesAsync();
  const byId = new Map(variables.map((v) => [v.id, v]));
  const find = (name) => collections.find((c) => c.name === name);

  const toHex = ({ r, g, b, a }) => {
    const h = (n) =>
      Math.round(n * 255)
        .toString(16)
        .padStart(2, '0')
        .toUpperCase();
    return `#${h(r)}${h(g)}${h(b)}${a !== undefined && a < 1 ? h(a) : ''}`;
  };
  const varsIn = (collection) =>
    collection.variableIds.map((id) => byId.get(id)).filter(Boolean);

  const primitivesCollection = find('Primitives');
  if (!primitivesCollection)
    throw new Error('No "Primitives" collection found.');
  const primitiveIds = new Set(primitivesCollection.variableIds);

  const primitives = {};
  const primitiveMode = primitivesCollection.modes[0].modeId;
  for (const v of varsIn(primitivesCollection)) {
    const value = v.valuesByMode[primitiveMode];
    if (v.resolvedType === 'COLOR' && value && 'r' in value) {
      primitives[v.name] = {
        type: 'color',
        value: toHex(value),
        description: v.description,
      };
    } else if (v.resolvedType === 'STRING' && typeof value === 'string') {
      primitives[v.name] = {
        type: 'string',
        value,
        description: v.description,
      };
    }
  }

  const readSemantic = (collection, modeId) => {
    const out = {};
    for (const v of varsIn(collection)) {
      if (v.resolvedType !== 'COLOR') continue;
      const value = v.valuesByMode[modeId];
      if (value && value.type === 'VARIABLE_ALIAS') {
        if (!primitiveIds.has(value.id)) {
          throw new Error(`"${v.name}" must alias a Primitives variable.`);
        }
        out[v.name] = {
          alias: byId.get(value.id).name,
          description: v.description,
        };
      } else if (value && 'r' in value) {
        out[v.name] = { value: toHex(value), description: v.description };
      }
    }
    return out;
  };

  const modes = {};
  const combined = find('Color');
  if (combined && combined.modes.length > 1) {
    for (const mode of combined.modes) {
      modes[mode.name.toLowerCase()] = readSemantic(combined, mode.modeId);
    }
  } else {
    for (const [mode, name] of [
      ['light', 'Color (Light)'],
      ['dark', 'Color (Dark)'],
    ]) {
      const c = find(name) || (mode === 'light' ? combined : undefined);
      if (c) modes[mode] = readSemantic(c, c.modes[0].modeId);
    }
  }
  if (!modes.light) throw new Error('No "Color (Light)" collection found.');

  return {
    version: 1,
    source: { fileName: figma.root.name, exportedAt: new Date().toISOString() },
    primitives,
    modes,
  };
}

if (typeof figma !== 'undefined' && figma.showUI) {
  figma.showUI(__html__, { width: 380, height: 420, themeColors: true });

  figma.ui.onmessage = async (msg) => {
    try {
      if (msg.type === 'init') {
        const settings = (await figma.clientStorage.getAsync('settings')) || {};
        figma.ui.postMessage({ type: 'settings', settings });
      } else if (msg.type === 'save-settings') {
        await figma.clientStorage.setAsync('settings', msg.settings);
      } else if (msg.type === 'export') {
        const payload = await exportTokens();
        figma.ui.postMessage({ type: 'payload', payload });
      }
    } catch (error) {
      figma.ui.postMessage({
        type: 'error',
        message: String(error.message || error),
      });
    }
  };
}
