// Mastery, gating and anti-XP-farming engine.
//
// Three signals stay separate on purpose:
//   Effort   = XP + active time  (never unlocks anything)
//   Progress = sections completed
//   Mastery  = assessment scores (the only thing that opens a gate)

import { LAUNCHPAD_CHAPTERS } from './launchpad-content';
import { CURRICULUM_MODULES, MODULES_BY_CHAPTER, type Assessment, type Tier } from './assessments';

export type Attempt = {
  id: string;
  assessmentId: string;
  tier: Tier;
  nodeId: string;
  attemptNumber: number;
  scorePct: number;
  passed: boolean;
  lowEffort: boolean;
  medianSeconds: number;
  createdAt: string;
};

export type GateOverrideRow = {
  nodeId: string;
  state: 'teacher_unlocked' | 'retake_required';
  thresholdOverride: number | null;
  reason?: string;
};

export type ClassSettings = {
  masteryGateEnabled: boolean;
  defaultThreshold: number;
  dailyXpCap: number;
  minSectionSeconds: number;
};

export const DEFAULT_SETTINGS: ClassSettings = {
  masteryGateEnabled: true,
  defaultThreshold: 80,
  dailyXpCap: 150,
  minSectionSeconds: 90,
};

export type NodeStatus =
  | 'not_started'
  | 'in_progress'
  | 'attempted'
  | 'failed'
  | 'passed'
  | 'mastered'
  | 'locked'
  | 'retake_required'
  | 'teacher_unlocked';

export const STATUS_LABEL: Record<NodeStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  attempted: 'Attempted',
  failed: 'Needs another try',
  passed: 'Passed',
  mastered: 'Mastered',
  locked: 'Locked',
  retake_required: 'Retake required',
  teacher_unlocked: 'Unlocked by teacher',
};

// ---------------------------------------------------------------- attempts

export function attemptsFor(attempts: Attempt[], assessmentId: string): Attempt[] {
  return attempts
    .filter((a) => a.assessmentId === assessmentId)
    .sort((a, b) => a.attemptNumber - b.attemptNumber);
}

export function bestScore(attempts: Attempt[], assessmentId: string): number | null {
  const list = attemptsFor(attempts, assessmentId);
  if (!list.length) return null;
  return Math.max(...list.map((a) => a.scorePct));
}

export function thresholdFor(
  nodeId: string,
  settings: ClassSettings,
  overrides: GateOverrideRow[],
  studentThreshold?: number | null,
): number {
  const override = overrides.find((o) => o.nodeId === nodeId)?.thresholdOverride;
  if (typeof override === 'number') return override;
  if (typeof studentThreshold === 'number') return studentThreshold;
  return settings.defaultThreshold;
}

export function assessmentStatus(
  assessmentId: string,
  attempts: Attempt[],
  threshold: number,
  overrideState?: GateOverrideRow['state'],
): NodeStatus {
  if (overrideState === 'retake_required') return 'retake_required';
  const list = attemptsFor(attempts, assessmentId);
  if (!list.length) return overrideState === 'teacher_unlocked' ? 'teacher_unlocked' : 'not_started';
  const best = Math.max(...list.map((a) => a.scorePct));
  const firstPassed = (list[0]?.scorePct ?? 0) >= threshold;
  if (best >= 95 || (firstPassed && best >= threshold)) return 'mastered';
  if (best >= threshold) return 'passed';
  return 'failed';
}

export function hasPassed(
  assessmentId: string,
  attempts: Attempt[],
  threshold: number,
  overrides: GateOverrideRow[] = [],
  nodeId?: string,
): boolean {
  const override = overrides.find((o) => o.nodeId === (nodeId ?? ''));
  if (override?.state === 'retake_required') return false;
  if (override?.state === 'teacher_unlocked') return true;
  const best = bestScore(attempts, assessmentId);
  return best !== null && best >= threshold;
}

// ------------------------------------------------------------------- gates

export type SectionProgressLike = Record<string, { completed?: boolean; notes?: string } | undefined>;

export function moduleSectionsComplete(moduleId: string, progress: SectionProgressLike): boolean {
  const module = CURRICULUM_MODULES.find((m) => m.id === moduleId);
  if (!module) return false;
  return module.sectionIds.every((id) => progress[id]?.completed);
}

/** Can this student open this module's lessons? */
export function moduleUnlocked(
  moduleId: string,
  ctx: {
    attempts: Attempt[];
    progress: SectionProgressLike;
    settings: ClassSettings;
    overrides: GateOverrideRow[];
    studentThreshold?: number | null;
  },
): { unlocked: boolean; reason: string } {
  const module = CURRICULUM_MODULES.find((m) => m.id === moduleId);
  if (!module) return { unlocked: false, reason: 'Module not found.' };
  if (!ctx.settings.masteryGateEnabled) return { unlocked: true, reason: '' };

  const override = ctx.overrides.find((o) => o.nodeId === moduleId);
  if (override?.state === 'teacher_unlocked') return { unlocked: true, reason: '' };

  const chapterGate = chapterUnlocked(module.chapterId, ctx);
  if (!chapterGate.unlocked) return chapterGate;

  const siblings = MODULES_BY_CHAPTER[module.chapterId] ?? [];
  const index = siblings.findIndex((m) => m.id === moduleId);
  if (index <= 0) return { unlocked: true, reason: '' };
  const previous = siblings[index - 1];
  if (!previous) return { unlocked: true, reason: '' };
  const threshold = thresholdFor(previous.id, ctx.settings, ctx.overrides, ctx.studentThreshold);
  if (hasPassed(`module:${previous.id}`, ctx.attempts, threshold, ctx.overrides, previous.id)) {
    return { unlocked: true, reason: '' };
  }
  return {
    unlocked: false,
    reason: `Unlocks after you pass the Module ${previous.label} assessment (${threshold}% needed).`,
  };
}

export function chapterUnlocked(
  chapterId: string,
  ctx: {
    attempts: Attempt[];
    settings: ClassSettings;
    overrides: GateOverrideRow[];
    studentThreshold?: number | null;
  },
): { unlocked: boolean; reason: string } {
  if (!ctx.settings.masteryGateEnabled) return { unlocked: true, reason: '' };
  const override = ctx.overrides.find((o) => o.nodeId === chapterId);
  if (override?.state === 'teacher_unlocked') return { unlocked: true, reason: '' };
  const index = LAUNCHPAD_CHAPTERS.findIndex((c) => c.id === chapterId);
  if (index <= 0) return { unlocked: true, reason: '' };
  const previous = LAUNCHPAD_CHAPTERS[index - 1];
  if (!previous) return { unlocked: true, reason: '' };
  const threshold = thresholdFor(previous.id, ctx.settings, ctx.overrides, ctx.studentThreshold);
  if (hasPassed(`chapter:${previous.id}`, ctx.attempts, threshold, ctx.overrides, previous.id)) {
    return { unlocked: true, reason: '' };
  }
  return {
    unlocked: false,
    reason: `Unlocks when you pass the Chapter ${previous.number} assessment (${threshold}% needed).`,
  };
}

/** A module/chapter assessment only opens once its lessons are done. */
export function assessmentAvailable(
  assessment: Assessment,
  ctx: {
    attempts: Attempt[];
    progress: SectionProgressLike;
    settings: ClassSettings;
    overrides: GateOverrideRow[];
    studentThreshold?: number | null;
  },
): { available: boolean; reason: string } {
  if (assessment.tier === 'section') return { available: true, reason: '' };
  if (assessment.tier === 'module') {
    const gate = moduleUnlocked(assessment.nodeId, ctx);
    if (!gate.unlocked) return { available: false, reason: gate.reason };
    if (!moduleSectionsComplete(assessment.nodeId, ctx.progress)) {
      return { available: false, reason: 'Finish every lesson in this module first.' };
    }
    return { available: true, reason: '' };
  }
  const gate = chapterUnlocked(assessment.nodeId, ctx);
  if (!gate.unlocked) return { available: false, reason: gate.reason };
  const modules = MODULES_BY_CHAPTER[assessment.nodeId] ?? [];
  const allDone = modules.every((m) => moduleSectionsComplete(m.id, ctx.progress));
  if (!allDone) return { available: false, reason: 'Finish every lesson in this chapter first.' };
  return { available: true, reason: '' };
}

/**
 * Cooldown after a failed gate: 10 minutes, plus at least one prescribed
 * review section opened for 2 active minutes.
 */
export function retryState(
  assessment: Assessment,
  attempts: Attempt[],
  reviewActiveSeconds: number,
  now: number = Date.now(),
): { canRetry: boolean; secondsRemaining: number; needsReview: boolean } {
  const list = attemptsFor(attempts, assessment.id);
  if (!list.length) return { canRetry: true, secondsRemaining: 0, needsReview: false };
  const last = list[list.length - 1];
  if (!last) return { canRetry: true, secondsRemaining: 0, needsReview: false };
  if (last.passed || assessment.tier === 'section') {
    return { canRetry: true, secondsRemaining: 0, needsReview: false };
  }
  const elapsed = Math.floor((now - new Date(last.createdAt).getTime()) / 1000);
  const secondsRemaining = Math.max(0, assessment.retryCooldownSeconds - elapsed);
  const needsReview = reviewActiveSeconds < 120;
  return { canRetry: secondsRemaining === 0 && !needsReview, secondsRemaining, needsReview };
}

/** Sections worth reviewing before a retry: the concepts most often missed. */
export function prescribedReview(
  assessment: Assessment,
  attempts: Attempt[],
  responses: { itemId: string; correct: boolean; concept: string }[],
): { concept: string; sectionId: string; sectionTitle: string }[] {
  const missed = new Map<string, number>();
  for (const response of responses) {
    if (!response.correct) missed.set(response.concept, (missed.get(response.concept) ?? 0) + 1);
  }
  const ranked = [...missed.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2);
  const chapterId = assessment.tier === 'chapter' ? assessment.nodeId : assessment.nodeId.split('-m')[0];
  const chapter = LAUNCHPAD_CHAPTERS.find((c) => c.id === chapterId);
  return ranked.map(([concept], index) => {
    const section =
      chapter?.sections.find((s) =>
        [...s.reading, s.check ?? '', s.takeaway ?? ''].join(' ').toLowerCase().includes(concept.toLowerCase()),
      ) ?? chapter?.sections[index % Math.max(1, chapter?.sections.length ?? 1)];
    return {
      concept,
      sectionId: section?.id ?? chapter?.sections[0]?.id ?? '',
      sectionTitle: section ? `${section.label} ${section.title}` : 'Chapter review',
    };
  });
}

// --------------------------------------------------------------------- XP

export type XpEvent =
  | 'section_open'
  | 'section_complete'
  | 'section_check_passed'
  | 'module_passed'
  | 'chapter_passed'
  | 'mastery_bonus'
  | 'scenario_activity';

export const XP_TABLE: Record<XpEvent, number[]> = {
  section_open: [0],
  section_complete: [3],
  section_check_passed: [5],
  module_passed: [25, 15, 8],
  chapter_passed: [60, 35, 18],
  mastery_bonus: [15],
  scenario_activity: [5],
};

export type XpAward = {
  xp: number;
  capped: boolean;
  multiplier: number;
  blockedReason: string;
};

export function xpForEvent(
  event: XpEvent,
  ctx: {
    attemptNumber?: number;
    activeSeconds?: number;
    hasEvidence?: boolean;
    alreadyAwarded?: boolean;
    xpToday?: number;
    flagged?: boolean;
    lowEffort?: boolean;
    settings?: ClassSettings;
  } = {},
): XpAward {
  const settings = ctx.settings ?? DEFAULT_SETTINGS;
  const none = (reason: string): XpAward => ({ xp: 0, capped: false, multiplier: 0, blockedReason: reason });

  if (event === 'section_open') return none('Opening a section never awards XP.');
  if (ctx.alreadyAwarded) return none('Already awarded once.');
  if (ctx.flagged) return none('Rapid clicking detected — no XP for this action.');
  if (ctx.lowEffort) return none('Answers were submitted too quickly to count for XP.');

  if (event === 'section_complete') {
    if ((ctx.activeSeconds ?? 0) < settings.minSectionSeconds) {
      return none(`This section needs about ${Math.round(settings.minSectionSeconds / 60)} minute(s) of real reading first.`);
    }
    if (!ctx.hasEvidence) return none('Save a note or answer the section check first.');
  }

  const tiers = XP_TABLE[event];
  const attempt = Math.max(1, ctx.attemptNumber ?? 1);
  const base = tiers[Math.min(attempt - 1, tiers.length - 1)] ?? 0;
  const first = tiers[0];
  const multiplier = first ? base / first : 1;

  const remaining = Math.max(0, settings.dailyXpCap - (ctx.xpToday ?? 0));
  if (remaining <= 0) {
    return { xp: 0, capped: true, multiplier, blockedReason: 'Daily XP limit reached — your progress still counts.' };
  }
  const xp = Math.min(base, remaining);
  return { xp, capped: xp < base, multiplier, blockedReason: '' };
}

// -------------------------------------------------------------- detectors

export type AnomalyType =
  | 'rapid_click'
  | 'rushing'
  | 'stuck'
  | 'low_effort_attempt'
  | 'inactive'
  | 'high_effort_low_mastery';

export const ANOMALY_LABEL: Record<AnomalyType, string> = {
  rapid_click: 'Rapid clicking',
  rushing: 'Rushing through sections',
  stuck: 'Stuck on one section',
  low_effort_attempt: 'Assessment answered very fast',
  inactive: 'Inactive for 7+ days',
  high_effort_low_mastery: 'High time, low mastery',
};

/** >6 advance actions in 60s, or a section completed in under 20s. */
export function detectRapidClick(actionTimestamps: number[], sectionActiveSeconds: number): boolean {
  const now = Date.now();
  const recent = actionTimestamps.filter((t) => now - t < 60_000);
  return recent.length > 6 || sectionActiveSeconds < 20;
}

/** Items answered faster than 3s median mark the attempt low effort. */
export function isLowEffortAttempt(medianSecondsPerItem: number): boolean {
  return medianSecondsPerItem > 0 && medianSecondsPerItem < 3;
}

// ------------------------------------------------------------- aggregates

export function masteryPercent(
  attempts: Attempt[],
  tiers: Tier[] = ['module', 'chapter'],
): { percent: number; assessed: number } {
  const byAssessment = new Map<string, number>();
  for (const attempt of attempts) {
    if (!tiers.includes(attempt.tier)) continue;
    byAssessment.set(attempt.assessmentId, Math.max(byAssessment.get(attempt.assessmentId) ?? 0, attempt.scorePct));
  }
  const scores = [...byAssessment.values()];
  if (!scores.length) return { percent: 0, assessed: 0 };
  return {
    percent: Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length),
    assessed: scores.length,
  };
}

export function starsFor(status: NodeStatus, score: number | null): 0 | 1 | 2 | 3 {
  if (status === 'mastered') return 3;
  if (status === 'passed') return score !== null && score >= 90 ? 3 : 2;
  if (status === 'failed' || status === 'attempted' || status === 'retake_required') return 1;
  return 0;
}

export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours) return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  return `${minutes}m`;
}

export function streakDays(dates: string[]): number {
  const days = new Set(dates.map((d) => new Date(d).toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (streak === 0 && days.size) {
      // allow a gap for today only
      cursor.setDate(cursor.getDate() - 1);
      if (!days.has(cursor.toISOString().slice(0, 10))) return 0;
    } else {
      return streak;
    }
  }
}
