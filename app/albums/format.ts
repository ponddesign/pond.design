// Dates are shown in the photo's own local time, so they're parsed from the
// string rather than converted through the visitor's time zone.

const parts = (iso: string) => {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!m) return undefined;
  const [, y = '', mo = '', d = '', h = '0', mi = '0'] = m;
  return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi));
};

const fmt = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' });

const dayMonthYear = fmt({ month: 'short', day: 'numeric', year: 'numeric' });
const dayMonth = fmt({ month: 'short', day: 'numeric' });
const day = fmt({ day: 'numeric' });
const monthYear = fmt({ month: 'long', year: 'numeric' });
const shortMonthYear = fmt({ month: 'short', year: 'numeric' });
const dateTime = fmt({
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

/** "Aug 15–19, 2026", "Aug 30 – Sep 2, 2026", or "Aug 15, 2026". */
export function dateRange(start?: string, end?: string) {
  const a = start ? parts(start) : undefined;
  const b = end ? parts(end) : undefined;
  if (!a) return '';
  if (!b || a.getTime() === b.getTime()) return dayMonthYear.format(a);
  if (a.getUTCFullYear() !== b.getUTCFullYear())
    return `${dayMonthYear.format(a)} – ${dayMonthYear.format(b)}`;
  if (a.getUTCMonth() !== b.getUTCMonth())
    return `${dayMonth.format(a)} – ${dayMonthYear.format(b)}`;
  return `${dayMonth.format(a)}–${day.format(b)}, ${b.getUTCFullYear()}`;
}

export const albumMonth = (start?: string, short = false) => {
  const d = start ? parts(start) : undefined;
  return d ? (short ? shortMonthYear : monthYear).format(d) : '';
};

export const albumYear = (start?: string) => start?.slice(0, 4) ?? 'Undated';

/** "Aug 16, 2026, 5:30 PM" in the photo's local time. */
export const takenAt = (iso?: string) => {
  const d = iso ? parts(iso) : undefined;
  return d ? dateTime.format(d) : undefined;
};

export const photoCount = (n: number) => `${n} photo${n === 1 ? '' : 's'}`;

/** Groups items by year, keeping their order (newest first). */
export function byYear<T extends { startDate?: string }>(items: T[]) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const year = albumYear(item.startDate);
    groups.set(year, [...(groups.get(year) ?? []), item]);
  }
  return [...groups];
}
