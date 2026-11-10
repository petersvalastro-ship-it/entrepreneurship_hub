// Turns assignment dates (as printed in the header of each assignment PDF, e.g.
// "Monday, October 19, 2026" or "MS ENTREPRENEURSHIP | NOVEMBER 13 2026") into
// school weeks, then decides which week is "This Week", "Last Week" or "Prior".

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const DAY = 86_400_000;

/** Finds the first "Month Day[,] Year" in a piece of text. Returns a UTC midnight date or null. */
export function parseAssignmentDate(text: string): Date | null {
  const m = text.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/i);
  if (!m) return null;
  const month = MONTHS.indexOf((m[1] ?? '').toLowerCase());
  const d = new Date(Date.UTC(Number(m[3]), month, Number(m[2])));
  return d.getUTCDate() === Number(m[2]) ? d : null;
}

/** Monday (UTC midnight) of the week containing the date. */
export function weekMonday(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const offset = (d.getUTCDay() + 6) % 7; // Monday = 0
  return new Date(d.getTime() - offset * DAY);
}

const fmt = (d: Date, withYear: boolean) =>
  d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', ...(withYear ? { year: 'numeric' } : {}), timeZone: 'UTC' });

/** "Monday, October 19 – Friday, October 23, 2026" */
export function weekRangeLabel(monday: Date): string {
  const friday = new Date(monday.getTime() + 4 * DAY);
  return `${fmt(monday, monday.getUTCFullYear() !== friday.getUTCFullYear())} – ${fmt(friday, true)}`;
}

export type WeekKind = 'upcoming' | 'current' | 'last' | 'prior';
export type AssignmentWeek<T> = { key: string; kind: WeekKind; range: string; items: T[] };

/**
 * Groups items into calendar weeks (newest first), sorted Monday → Friday inside each week.
 * "This Week" is always the calendar week containing today (included even when empty),
 * later weeks are "upcoming", the calendar week right before is "last", and older weeks are "prior".
 */
export function groupAssignmentWeeks<T>(items: T[], dateOf: (item: T) => Date, today: Date = new Date()): AssignmentWeek<T>[] {
  const byWeek = new Map<number, T[]>();
  const now = weekMonday(today).getTime();
  byWeek.set(now, []);
  for (const item of items) {
    const k = weekMonday(dateOf(item)).getTime();
    byWeek.set(k, [...(byWeek.get(k) ?? []), item]);
  }
  const lastMonday = now - 7 * DAY;
  return [...byWeek.keys()]
    .sort((a, b) => b - a)
    .map((k) => ({
      key: new Date(k).toISOString().slice(0, 10),
      kind: (k > now ? 'upcoming' : k === now ? 'current' : k === lastMonday ? 'last' : 'prior') as WeekKind,
      range: weekRangeLabel(new Date(k)),
      items: [...byWeek.get(k)!].sort((a, b) => dateOf(a).getTime() - dateOf(b).getTime()),
    }));
}
