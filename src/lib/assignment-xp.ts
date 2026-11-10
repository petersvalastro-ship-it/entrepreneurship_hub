/** Fewest and most XP one assignment can be worth. */
export const MIN_ASSIGNMENT_XP = 20;
export const MAX_ASSIGNMENT_XP = 200;
/** XP per answer box in the assignment. */
export const XP_PER_FIELD = 5;
/** Extra XP for each extra day a multi-day lesson runs. */
export const XP_PER_EXTRA_DAY = 25;

/** XP an assignment is worth when every answer box is filled: longer, multi-day work is worth more. */
export function assignmentWorth(fieldCount: number, days = 1): number {
  const base = Math.max(0, fieldCount) * XP_PER_FIELD + Math.max(0, days - 1) * XP_PER_EXTRA_DAY;
  return Math.min(MAX_ASSIGNMENT_XP, Math.max(MIN_ASSIGNMENT_XP, Math.round(base)));
}

/** XP earned for the share of answer boxes actually filled in. */
export function earnedXp(worth: number, answered: number, fieldCount: number): number {
  if (fieldCount <= 0) return worth;
  const share = Math.min(1, Math.max(0, answered) / fieldCount);
  return Math.round(worth * share);
}

/** XP to add on this submission: only the gain over XP already earned for the assignment, so resubmitting can't farm XP. */
export function xpToAward(earnedNow: number, alreadyEarned: number): number {
  return Math.max(0, earnedNow - Math.max(0, alreadyEarned));
}

/** "1 h 5 min" / "12 min" / "under 1 min" */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  if (m < 1) return seconds > 0 ? 'under 1 min' : '0 min';
  const h = Math.floor(m / 60);
  return h ? `${h} h ${m % 60} min` : `${m} min`;
}
