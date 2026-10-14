// src/utils/dates.js

// Turn "2026-10-12" into a local Date WITHOUT timezone shifting.
// new Date("2026-10-12") is parsed as UTC midnight, which can display as the
// previous day for anyone in a timezone behind UTC.
export function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Local date back to "YYYY-MM-DD" (toISOString would convert to UTC and can shift the day)
function toISO(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// "Wednesday 14 October"
export function longDate(str) {
  return parseDate(str).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

// "October" or, across a month boundary, "October to November"
export function monthRange(items) {
  if (items.length === 0) return '';
  const fmt = (s) => parseDate(s).toLocaleDateString('en-GB', { month: 'long' });
  const first = fmt(items[0].date);
  const last = fmt(items[items.length - 1].date);
  return first === last ? first : `${first} to ${last}`;
}

// Groups [{ date, ... }] (sorted by date) into weeks of five cells, Monday to Friday.
// Days that aren't in the list (like a Monday that already passed) become null,
// so every week row still lines up under the Mon..Fri headings.
export function groupIntoWeeks(items) {
  const weeks = new Map(); // key: the Monday of that week
  for (const item of items) {
    const d = parseDate(item.date);
    const dow = d.getDay(); // 0 = Sunday ... 6 = Saturday
    if (dow === 0 || dow === 6) continue; // the calendar only shows weekdays

    const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - (dow - 1));
    const key = toISO(monday);
    if (!weeks.has(key)) weeks.set(key, [null, null, null, null, null]);
    weeks.get(key)[dow - 1] = item;
  }
  return [...weeks.values()]; // a Map keeps insertion order, so weeks stay chronological
}