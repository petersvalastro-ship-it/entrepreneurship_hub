import { describe, expect, it } from 'vitest';
import { groupAssignmentWeeks, parseAssignmentDate, weekRangeLabel, weekMonday } from './assignment-weeks';

const d = (s: string) => new Date(`${s}T00:00:00Z`);
const items = [
  { id: 'fri-nov13', date: d('2026-11-13') },
  { id: 'tue-nov10', date: d('2026-11-10') },
  { id: 'founders', date: d('2026-10-26') },
  { id: 'thu-oct22', date: d('2026-10-22') },
  { id: 'mon-oct19', date: d('2026-10-19') },
];
const group = (today: string) => groupAssignmentWeeks(items, (i) => i.date, d(today));
const kinds = (today: string) => group(today).map((w) => [w.key, w.kind, w.items.length]);

describe('parseAssignmentDate', () => {
  it('reads a PDF header like "MS ENTREPRENEURSHIP | NOVEMBER 13 2026"', () => {
    expect(parseAssignmentDate('MS ENTREPRENEURSHIP | NOVEMBER 13 2026')?.toISOString().slice(0, 10)).toBe('2026-11-13');
  });
  it('reads a title like "Monday, October 19, 2026"', () => {
    expect(parseAssignmentDate('Monday, October 19, 2026')?.toISOString().slice(0, 10)).toBe('2026-10-19');
  });
});

describe('groupAssignmentWeeks', () => {
  it('labels the week range Monday – Friday', () => {
    expect(weekRangeLabel(weekMonday(d('2026-10-21')))).toBe('Monday, October 19 – Friday, October 23, 2026');
  });
  it('on Nov 2, This Week is Nov 2–6 (empty), Nov 9–13 is coming up, Oct 26–30 is last week, Oct 19–23 is prior', () => {
    expect(kinds('2026-11-02')).toEqual([
      ['2026-11-09', 'upcoming', 2],
      ['2026-11-02', 'current', 0],
      ['2026-10-26', 'last', 1],
      ['2026-10-19', 'prior', 2],
    ]);
  });
  it('on Nov 11, the Nov 9–13 lessons become This Week', () => {
    expect(group('2026-11-11').find((w) => w.kind === 'current')?.items.map((i) => i.id)).toEqual(['tue-nov10', 'fri-nov13']);
  });
  it('a week with no lessons between does not get called Last Week', () => {
    expect(group('2026-11-18').filter((w) => w.kind === 'last').map((w) => w.key)).toEqual(['2026-11-09']);
    expect(group('2026-11-25').filter((w) => w.kind === 'last')).toEqual([]);
  });
  it('sorts cards Monday to Friday inside a week', () => {
    expect(group('2026-11-02').find((w) => w.key === '2026-10-19')?.items.map((i) => i.id)).toEqual(['mon-oct19', 'thu-oct22']);
  });
});
