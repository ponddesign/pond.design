import { useEffect, useRef } from 'react';

/** Shortcut lists shown in the "/" help overlay, per screen. */
export type ShortcutGroup = { title: string; keys: [string[], string][] };

export const ALBUMS_SHORTCUTS: ShortcutGroup[] = [
  {
    title: 'Albums',
    keys: [
      [['←', '→', '↑', '↓'], 'Move between albums'],
      [['Enter'], 'Open album'],
      [['Esc'], 'Back to pond.design'],
      [['/'], 'Show or hide shortcuts'],
    ],
  },
];

export const ALBUM_SHORTCUTS: ShortcutGroup[] = [
  {
    title: 'Grid',
    keys: [
      [['←', '→', '↑', '↓'], 'Move between photos'],
      [['Home', 'End'], 'First or last photo'],
      [['Enter', 'E'], 'Open photo'],
      [['[', ']'], 'Older or newer album'],
      [['A'], 'Album list'],
      [['Esc'], 'Back to all albums'],
    ],
  },
  {
    title: 'Photo viewer',
    keys: [
      [['←', '→'], 'Previous or next photo'],
      [['Home', 'End'], 'First or last photo'],
      [['Z'], 'Zoom to 100% or fit'],
      [['+', '−'], 'Zoom in or out'],
      [['I'], 'Show or hide details'],
      [['F'], 'Full screen'],
      [['G', 'Esc'], 'Back to grid'],
    ],
  },
  { title: 'Help', keys: [[['/'], 'Show or hide shortcuts']] },
];

/** True when the key press belongs to a text field or a modified shortcut. */
const ignore = (event: KeyboardEvent) => {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey)
    return true;
  const target = event.target as HTMLElement | null;
  return Boolean(
    target?.closest('input, textarea, select, [contenteditable="true"]'),
  );
};

/**
 * Calls `handler` for unmodified key presses outside text fields. Return
 * `true` from the handler when the key was used, to prevent its default.
 */
export function useKeys(
  handler: (event: KeyboardEvent) => boolean | undefined,
  enabled = true,
) {
  const latest = useRef(handler);
  latest.current = handler;
  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      if (ignore(event)) return;
      if (latest.current(event)) event.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);
}

export const isHelpKey = (event: KeyboardEvent) =>
  event.key === '/' || event.key === '?';

/**
 * Moves focus between the links matching `selector` like a grid: left/right
 * step through them in order; up/down jump to the nearest item in the row
 * above or below. Home/End go to the first or last. Returns true if handled.
 */
export function moveGridFocus(key: string, selector: string) {
  const items = [...document.querySelectorAll<HTMLElement>(selector)];
  if (!items.length) return false;
  const current = items.indexOf(document.activeElement as HTMLElement);
  let next: HTMLElement | undefined;

  if (key === 'Home') next = items[0];
  else if (key === 'End') next = items.at(-1);
  else if (current < 0) {
    if (!key.startsWith('Arrow')) return false;
    next = items[0];
  } else if (key === 'ArrowLeft') next = items[Math.max(0, current - 1)];
  else if (key === 'ArrowRight')
    next = items[Math.min(items.length - 1, current + 1)];
  else if (key === 'ArrowUp' || key === 'ArrowDown') {
    const from = items[current]?.getBoundingClientRect();
    if (!from) return false;
    const down = key === 'ArrowDown';
    const x = from.left + from.width / 2;
    const rows = items
      .map((el) => ({ el, box: el.getBoundingClientRect() }))
      .filter(({ box }) =>
        down ? box.top >= from.bottom - 1 : box.bottom <= from.top + 1,
      );
    if (!rows.length) return true;
    // The nearest row, then the item in it closest to our horizontal centre.
    const rowTop = down
      ? Math.min(...rows.map(({ box }) => box.top))
      : Math.max(...rows.map(({ box }) => box.top));
    next = rows
      .filter(({ box }) => Math.abs(box.top - rowTop) < 2)
      .sort(
        (a, b) =>
          Math.abs(a.box.left + a.box.width / 2 - x) -
          Math.abs(b.box.left + b.box.width / 2 - x),
      )[0]?.el;
  } else return false;

  next?.focus();
  next?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  return true;
}
