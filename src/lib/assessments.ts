// Assessment structure for the LaunchPad curriculum.
//
// Chapter -> Module -> Section -> Section check. Every question is generated
// from the authoritative chapter vocabulary in launchpad-content.ts, so nothing
// here invents content that is not in the textbook.

import { LAUNCHPAD_CHAPTERS } from './launchpad-content';

export type Tier = 'section' | 'module' | 'chapter';

export type AssessmentItem = {
  id: string;
  stem: string;
  concept: string;
  options: string[];
  correct: number;
};

export type Assessment = {
  id: string;
  tier: Tier;
  nodeId: string;
  title: string;
  items: AssessmentItem[];
  retryCooldownSeconds: number;
};

export type CurriculumModule = {
  id: string;
  chapterId: string;
  chapterNumber: number;
  label: string;
  title: string;
  sectionIds: string[];
  vocabIndexes: number[];
};

/** Tiny deterministic shuffle so option order is stable for everyone. */
function seeded(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return Math.abs(h % 100000) / 100000;
  };
}

function shuffle<T>(list: T[], seed: string): T[] {
  const rand = seeded(seed);
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
}

/** Two modules per chapter, splitting the chapter's sections in half. */
export const CURRICULUM_MODULES: CurriculumModule[] = LAUNCHPAD_CHAPTERS.flatMap((chapter) => {
  const half = Math.ceil(chapter.sections.length / 2);
  const vocabHalf = Math.ceil(chapter.vocab.length / 2);
  const parts: CurriculumModule[] = [
    {
      id: `${chapter.id}-m1`,
      chapterId: chapter.id,
      chapterNumber: chapter.number,
      label: `${chapter.number}.1`,
      title: `Part 1 — ${chapter.sections[0]?.title ?? 'Foundations'}`,
      sectionIds: chapter.sections.slice(0, half).map((s) => s.id),
      vocabIndexes: chapter.vocab.map((_, i) => i).slice(0, vocabHalf),
    },
    {
      id: `${chapter.id}-m2`,
      chapterId: chapter.id,
      chapterNumber: chapter.number,
      label: `${chapter.number}.2`,
      title: `Part 2 — ${chapter.sections[half]?.title ?? 'Applying it'}`,
      sectionIds: chapter.sections.slice(half).map((s) => s.id),
      vocabIndexes: chapter.vocab.map((_, i) => i).slice(vocabHalf),
    },
  ];
  return parts.filter((part) => part.sectionIds.length > 0);
});

export const MODULES_BY_CHAPTER: Record<string, CurriculumModule[]> = Object.fromEntries(
  LAUNCHPAD_CHAPTERS.map((chapter) => [chapter.id, CURRICULUM_MODULES.filter((m) => m.chapterId === chapter.id)]),
);

export function moduleForSection(sectionId: string): CurriculumModule | undefined {
  return CURRICULUM_MODULES.find((m) => m.sectionIds.includes(sectionId));
}

function chapterItems(chapterId: string, vocabIndexes: number[]): AssessmentItem[] {
  const chapter = LAUNCHPAD_CHAPTERS.find((c) => c.id === chapterId);
  if (!chapter) return [];
  const terms = chapter.vocab;
  const allTerms = LAUNCHPAD_CHAPTERS.flatMap((c) => c.vocab);
  const items: AssessmentItem[] = [];

  for (const index of vocabIndexes) {
    const entry = terms[index];
    if (!entry) continue;

    const otherTerms = shuffle(
      allTerms.filter((v) => v.term !== entry.term).map((v) => v.term),
      `${chapterId}-t-${index}`,
    ).slice(0, 3);
    const forwardOptions = shuffle([entry.term, ...otherTerms], `${chapterId}-fo-${index}`);
    items.push({
      id: `${chapterId}-v${index}-f`,
      concept: entry.term,
      stem: `Which term matches this definition? “${entry.def}”`,
      options: forwardOptions,
      correct: forwardOptions.indexOf(entry.term),
    });

    const otherDefs = shuffle(
      allTerms.filter((v) => v.term !== entry.term).map((v) => v.def),
      `${chapterId}-d-${index}`,
    ).slice(0, 3);
    const reverseOptions = shuffle([entry.def, ...otherDefs], `${chapterId}-ro-${index}`);
    items.push({
      id: `${chapterId}-v${index}-r`,
      concept: entry.term,
      stem: `In this chapter, what does “${entry.term}” mean?`,
      options: reverseOptions,
      correct: reverseOptions.indexOf(entry.def),
    });
  }

  return items;
}

/** 2-4 item formative check for one section. Ungated, unlimited retries. */
export function sectionCheck(sectionId: string): Assessment | null {
  const module = moduleForSection(sectionId);
  if (!module) return null;
  const chapter = LAUNCHPAD_CHAPTERS.find((c) => c.id === module.chapterId);
  const section = chapter?.sections.find((s) => s.id === sectionId);
  const position = module.sectionIds.indexOf(sectionId);
  const pool = chapterItems(module.chapterId, module.vocabIndexes);
  if (!pool.length) return null;
  const start = (position * 3) % pool.length;
  const items = [0, 1, 2]
    .map((offset) => pool[(start + offset) % pool.length])
    .filter((item): item is AssessmentItem => Boolean(item));
  return {
    id: `check:${sectionId}`,
    tier: 'section',
    nodeId: sectionId,
    title: `${section?.label ?? ''} Section check`.trim(),
    items,
    retryCooldownSeconds: 0,
  };
}

/** 8-10 item module assessment. Mandatory gate for the next module. */
export function moduleAssessment(moduleId: string): Assessment | null {
  const module = CURRICULUM_MODULES.find((m) => m.id === moduleId);
  if (!module) return null;
  const pool = chapterItems(module.chapterId, module.vocabIndexes);
  const items = shuffle(pool, `mod-${moduleId}`).slice(0, Math.min(10, Math.max(8, pool.length)));
  return {
    id: `module:${moduleId}`,
    tier: 'module',
    nodeId: moduleId,
    title: `Module ${module.label} assessment`,
    items,
    retryCooldownSeconds: 600,
  };
}

/** 15-18 item chapter assessment mixing both modules. Mandatory gate. */
export function chapterAssessment(chapterId: string): Assessment | null {
  const chapter = LAUNCHPAD_CHAPTERS.find((c) => c.id === chapterId);
  if (!chapter) return null;
  const pool = chapterItems(chapterId, chapter.vocab.map((_, i) => i));
  const items = shuffle(pool, `chap-${chapterId}`).slice(0, Math.min(16, pool.length));
  return {
    id: `chapter:${chapterId}`,
    tier: 'chapter',
    nodeId: chapterId,
    title: `Chapter ${chapter.number} assessment`,
    items,
    retryCooldownSeconds: 600,
  };
}

export function assessmentById(assessmentId: string): Assessment | null {
  const [kind, node] = assessmentId.split(':');
  if (!node) return null;
  if (kind === 'check') return sectionCheck(node);
  if (kind === 'module') return moduleAssessment(node);
  if (kind === 'chapter') return chapterAssessment(node);
  return null;
}

export const ALL_ASSESSMENT_IDS = [
  ...LAUNCHPAD_CHAPTERS.flatMap((c) => c.sections.map((s) => `check:${s.id}`)),
  ...CURRICULUM_MODULES.map((m) => `module:${m.id}`),
  ...LAUNCHPAD_CHAPTERS.map((c) => `chapter:${c.id}`),
];
