import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Award, BookOpen, Check, CircleDot, Clock, Flame, LockKeyhole, Sparkles, Star, Target, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProgressMap } from '@/hooks/useStudentAuth';
import type { useMastery } from '@/hooks/useMastery';
import { LAUNCHPAD_CHAPTERS } from '@/lib/launchpad-content';
import { MODULES_BY_CHAPTER, chapterAssessment, moduleAssessment, type Assessment } from '@/lib/assessments';
import {
  assessmentAvailable,
  assessmentStatus,
  bestScore,
  chapterUnlocked,
  formatDuration,
  masteryPercent,
  moduleSectionsComplete,
  moduleUnlocked,
  starsFor,
  STATUS_LABEL,
  streakDays,
  thresholdFor,
  type NodeStatus,
} from '@/lib/mastery';
import AssessmentRunner from './AssessmentRunner';

type Props = {
  displayName: string;
  gradeLabel?: string | null;
  xp: number;
  progress: ProgressMap;
  highContrast: boolean;
  mastery: ReturnType<typeof useMastery>;
  onOpenSection: (sectionId: string) => void;
  signedIn: boolean;
};

const EFFORT_TARGET_XP = 600;

function StatusIcon({ status }: { status: NodeStatus }) {
  if (status === 'mastered' || status === 'passed') return <Check className="size-4" aria-hidden="true" />;
  if (status === 'locked') return <LockKeyhole className="size-4" aria-hidden="true" />;
  if (status === 'failed' || status === 'retake_required') return <CircleDot className="size-4" aria-hidden="true" />;
  if (status === 'not_started') return <Target className="size-4" aria-hidden="true" />;
  return <Sparkles className="size-4" aria-hidden="true" />;
}

export default function MasteryPortal({
  displayName,
  gradeLabel,
  xp,
  progress,
  highContrast,
  mastery,
  onOpenSection,
  signedIn,
}: Props) {
  const [openAssessment, setOpenAssessment] = useState<Assessment | null>(null);

  const ctx = useMemo(
    () => ({
      attempts: mastery.attempts,
      progress: progress as never,
      settings: mastery.settings,
      overrides: mastery.overrides,
    }),
    [mastery.attempts, mastery.overrides, mastery.settings, progress],
  );

  const mastered = masteryPercent(mastery.attempts);
  const streak = streakDays(mastery.studyDays);
  const effortPercent = Math.min(100, Math.round((xp / EFFORT_TARGET_XP) * 100));

  useEffect(() => {
    if (openAssessment) mastery.setActiveNode(`assessment:${openAssessment.nodeId}`);
  }, [openAssessment, mastery]);

  const card = highContrast
    ? 'border-2 border-yellow-400 bg-zinc-900 text-white'
    : 'border border-[#414042]/12 bg-white text-[#414042] shadow-sm';
  const muted = highContrast ? 'text-yellow-100' : 'text-[#414042]/70';
  const accent = highContrast ? 'text-yellow-300' : 'text-[#C51C63]';

  const tileClass = (status: NodeStatus) => {
    if (highContrast) {
      return status === 'locked'
        ? 'border-white/40 bg-zinc-800 text-white/60'
        : 'border-yellow-400 bg-black text-white';
    }
    if (status === 'mastered' || status === 'passed') return 'border-progress-completed bg-progress-completed text-progress-completed-foreground';
    if (status === 'failed' || status === 'retake_required' || status === 'attempted') return 'border-progress-attempted bg-progress-attempted text-progress-attempted-foreground';
    if (status === 'locked') return 'border-progress-locked-border bg-progress-locked text-progress-locked-foreground';
    if (status === 'not_started') return 'border-[#414042]/20 bg-white text-[#414042]';
    return 'border-progress-recommended bg-progress-recommended text-progress-recommended-foreground';
  };

  // The next thing to do: first incomplete section in an unlocked module.
  const nextUp = useMemo(() => {
    for (const chapter of LAUNCHPAD_CHAPTERS) {
      if (!chapterUnlocked(chapter.id, ctx).unlocked) continue;
      for (const module of MODULES_BY_CHAPTER[chapter.id] ?? []) {
        if (!moduleUnlocked(module.id, ctx).unlocked) continue;
        const section = module.sectionIds.find((id) => !progress[id]?.completed);
        if (section) {
          const found = chapter.sections.find((s) => s.id === section);
          return { kind: 'section' as const, chapter, module, sectionId: section, title: `${found?.label} ${found?.title}` };
        }
        const assessment = moduleAssessment(module.id);
        if (assessment) {
          const threshold = thresholdFor(module.id, mastery.settings, mastery.overrides);
          const status = assessmentStatus(assessment.id, mastery.attempts, threshold, mastery.overrides.find((o) => o.nodeId === module.id)?.state);
          if (status !== 'passed' && status !== 'mastered') {
            return { kind: 'assessment' as const, chapter, module, assessment, title: assessment.title };
          }
        }
      }
      const chapterTest = chapterAssessment(chapter.id);
      if (chapterTest) {
        const threshold = thresholdFor(chapter.id, mastery.settings, mastery.overrides);
        const status = assessmentStatus(chapterTest.id, mastery.attempts, threshold, mastery.overrides.find((o) => o.nodeId === chapter.id)?.state);
        if (status !== 'passed' && status !== 'mastered') {
          return { kind: 'assessment' as const, chapter, assessment: chapterTest, title: chapterTest.title };
        }
      }
    }
    return null;
  }, [ctx, mastery.attempts, mastery.overrides, mastery.settings, progress]);

  const openSection = (sectionId: string) => {
    setOpenAssessment(null);
    onOpenSection(sectionId);
  };

  const runnerFor = (assessment: Assessment) => {
    const availability = assessmentAvailable(assessment, ctx);
    const threshold = thresholdFor(assessment.nodeId, mastery.settings, mastery.overrides);
    return (
      <AssessmentRunner
        assessment={assessment}
        attempts={mastery.attempts}
        threshold={threshold}
        available={availability.available}
        lockReason={availability.reason}
        reviewActiveSeconds={(assessment.tier === 'chapter'
          ? LAUNCHPAD_CHAPTERS.find((c) => c.id === assessment.nodeId)?.sections ?? []
          : []
        ).reduce((sum, section) => sum + mastery.activeSecondsFor(section.id), 0) || mastery.activeSecondsFor(assessment.nodeId)}
        highContrast={highContrast}
        onSubmit={(responses, elapsed) => mastery.recordAttempt(assessment, responses, elapsed)}
        onOpenSection={openSection}
        onClose={() => setOpenAssessment(null)}
      />
    );
  };

  return (
    <section className="space-y-5" aria-label="Mastery and assessments">
      {/* STATS BANNER — effort and mastery stay separate */}
      <div className={`rounded-2xl p-5 sm:p-6 ${card}`}>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="min-w-0">
            <p className={`text-xs font-extrabold uppercase ${accent}`}>Your mastery</p>
            <h2 className="text-2xl font-black">
              Hi {displayName}
              {gradeLabel ? ` — ${gradeLabel}` : ''}
            </h2>
            <p className={`mt-1 text-sm ${muted}`}>
              Effort shows how much work you put in. True mastery shows what you can explain — only mastery opens the next chapter.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
            {[
              { label: 'True mastery', value: `${mastered.percent}%`, icon: Trophy },
              { label: 'Active time', value: formatDuration(mastery.totalActiveSeconds), icon: Clock },
              { label: 'Streak', value: `${streak} day${streak === 1 ? '' : 's'}`, icon: Flame },
              { label: 'XP (effort)', value: String(xp), icon: Award },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className={`flex items-center gap-1 text-xs font-bold uppercase ${muted}`}>
                  <stat.icon className="size-3.5" aria-hidden="true" /> {stat.label}
                </dt>
                <dd className="text-xl font-black">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            { label: 'Effort (XP & time)', percent: effortPercent, bar: highContrast ? 'bg-yellow-400' : 'bg-progress-attempted' },
            { label: `True mastery (${mastered.assessed} assessment${mastered.assessed === 1 ? '' : 's'})`, percent: mastered.percent, bar: highContrast ? 'bg-yellow-300' : 'bg-progress-completed' },
          ].map((bar) => (
            <div key={bar.label}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span>{bar.label}</span>
                <span>{bar.percent}%</span>
              </div>
              <div className={`mt-1 h-2.5 overflow-hidden rounded ${highContrast ? 'bg-zinc-700' : 'bg-black/10'}`}>
                <div className={`h-full ${bar.bar}`} style={{ width: `${bar.percent}%` }} />
              </div>
            </div>
          ))}
        </div>

        {!signedIn && (
          <p className={`mt-4 text-sm font-bold ${muted}`}>
            Sign in to save your assessment scores and keep your streak going.
          </p>
        )}
      </div>

      {mastery.lastNotice && (
        <div
          role="status"
          className={`flex items-start justify-between gap-3 rounded-xl p-4 text-sm font-bold ${
            highContrast ? 'border-2 border-yellow-400 bg-black text-white' : 'border border-[#EFA835] bg-[#EFA835]/15 text-[#414042]'
          }`}
        >
          <span>{mastery.lastNotice}</span>
          <button type="button" onClick={() => mastery.setLastNotice(null)} aria-label="Dismiss message">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {mastery.adminActions.length > 0 && (
        <div className={`rounded-xl p-4 text-sm ${card}`}>
          <p className="font-bold">Teacher updates</p>
          <ul className={`mt-1 space-y-1 ${muted}`}>
            {mastery.adminActions.slice(0, 3).map((action) => (
              <li key={action.id}>
                {action.action === 'reset_xp'
                  ? `Your teacher reset ${action.scope === 'all' ? 'all of your XP' : `${action.nodeId} XP`} (${action.xpRemoved} XP) — ${action.reason}`
                  : action.action === 'require_retake'
                    ? `Your teacher asked you to retake ${action.nodeId}. Your earlier attempts are still saved.`
                    : `Your teacher unlocked ${action.nodeId} for you.`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* PICK UP WHERE YOU LEFT OFF */}
      {nextUp && !openAssessment && (
        <div className={`grid gap-4 rounded-2xl p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${highContrast ? 'border-2 border-yellow-400 bg-black text-white' : 'border border-progress-recommended/40 bg-progress-recommended/10'}`}>
          <div className="min-w-0">
            <p className={`flex items-center gap-2 text-xs font-extrabold uppercase ${accent}`}>
              <Sparkles className="size-4" aria-hidden="true" /> Pick up where you left off
            </p>
            <p className="mt-1 truncate text-lg font-black">
              Chapter {nextUp.chapter.number}
              {'module' in nextUp && nextUp.module ? ` · Module ${nextUp.module.label}` : ''} — {nextUp.title}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => (nextUp.kind === 'section' ? openSection(nextUp.sectionId) : setOpenAssessment(nextUp.assessment))}
            className={highContrast ? 'bg-yellow-400 text-black hover:bg-yellow-300' : ''}
          >
            {nextUp.kind === 'section' ? 'Continue lesson' : 'Open assessment'} <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      )}

      {openAssessment && runnerFor(openAssessment)}

      {/* LEGEND */}
      <div className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Map legend">
        {(['mastered', 'passed', 'failed', 'in_progress', 'not_started', 'locked'] as NodeStatus[]).map((status) => (
          <span key={status} className={`inline-flex items-center gap-1.5 text-xs font-bold ${muted}`}>
            <StatusIcon status={status} /> {STATUS_LABEL[status]}
          </span>
        ))}
      </div>

      {/* CHAPTER PATHWAY MAP */}
      <div className="space-y-4">
        {LAUNCHPAD_CHAPTERS.map((chapter) => {
          const gate = chapterUnlocked(chapter.id, ctx);
          const chapterTest = chapterAssessment(chapter.id);
          const chapterThreshold = thresholdFor(chapter.id, mastery.settings, mastery.overrides);
          const chapterStatus = chapterTest
            ? assessmentStatus(chapterTest.id, mastery.attempts, chapterThreshold, mastery.overrides.find((o) => o.nodeId === chapter.id)?.state)
            : 'not_started';
          const chapterBest = chapterTest ? bestScore(mastery.attempts, chapterTest.id) : null;

          return (
            <section key={chapter.id} className={`rounded-2xl p-4 sm:p-5 ${card}`} aria-labelledby={`mastery-${chapter.id}`}>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className={`text-xs font-extrabold uppercase ${accent}`}>Chapter {chapter.number}</p>
                  <h3 id={`mastery-${chapter.id}`} className="text-lg font-black">{chapter.title}</h3>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/10 px-3 py-1 text-xs font-bold">
                  <StatusIcon status={gate.unlocked ? chapterStatus : 'locked'} />
                  {gate.unlocked ? STATUS_LABEL[chapterStatus] : STATUS_LABEL.locked}
                  {chapterBest !== null ? ` · best ${chapterBest}%` : ''}
                </span>
              </div>

              {!gate.unlocked && <p className={`mt-2 text-sm font-bold ${muted}`}>{gate.reason}</p>}

              {(MODULES_BY_CHAPTER[chapter.id] ?? []).map((module) => {
                const moduleGate = moduleUnlocked(module.id, ctx);
                const test = moduleAssessment(module.id);
                const moduleThreshold = thresholdFor(module.id, mastery.settings, mastery.overrides);
                const moduleStatus = test
                  ? assessmentStatus(test.id, mastery.attempts, moduleThreshold, mastery.overrides.find((o) => o.nodeId === module.id)?.state)
                  : 'not_started';
                const moduleBest = test ? bestScore(mastery.attempts, test.id) : null;
                const sectionsDone = moduleSectionsComplete(module.id, progress as never);

                return (
                  <div key={module.id} className="mt-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-black">Module {module.label} — {module.title}</p>
                      {!moduleGate.unlocked && <p className={`text-xs font-bold ${muted}`}>{moduleGate.reason}</p>}
                    </div>

                    <div className="mt-3 overflow-x-auto pb-2">
                      <div className="flex min-w-max items-start gap-1">
                        {module.sectionIds.map((sectionId, index) => {
                          const section = chapter.sections.find((s) => s.id === sectionId);
                          const status: NodeStatus = !moduleGate.unlocked
                            ? 'locked'
                            : progress[sectionId]?.completed
                              ? 'passed'
                              : progress[sectionId]
                                ? 'in_progress'
                                : 'not_started';
                          return (
                            <div key={sectionId} className="flex items-start">
                              <div className="w-24 sm:w-28">
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={status === 'locked'}
                                  onClick={() => openSection(sectionId)}
                                  aria-label={`${section?.label} ${section?.title}: ${STATUS_LABEL[status]}`}
                                  className={`mx-auto grid size-14 place-items-center rounded-xl border-2 p-0 ${tileClass(status)}`}
                                >
                                  <span className="grid place-items-center gap-0.5">
                                    <StatusIcon status={status} />
                                    <span className="text-xs font-black">{section?.label}</span>
                                  </span>
                                </Button>
                                <p className="mt-1.5 line-clamp-2 min-h-8 text-center text-[11px] font-bold leading-4">{section?.title}</p>
                              </div>
                              {index < module.sectionIds.length - 1 && (
                                <div className={`mt-7 h-1 w-3 ${progress[sectionId]?.completed ? 'bg-progress-completed' : 'bg-black/15'}`} aria-hidden="true" />
                              )}
                            </div>
                          );
                        })}

                        {test && (
                          <div className="ml-2 w-40">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setOpenAssessment(test)}
                              disabled={!moduleGate.unlocked}
                              aria-label={`${test.title}: ${moduleGate.unlocked ? STATUS_LABEL[moduleStatus] : STATUS_LABEL.locked}`}
                              className={`h-14 w-full rounded-xl border-2 px-3 ${tileClass(moduleGate.unlocked ? moduleStatus : 'locked')}`}
                            >
                              <span className="grid text-left">
                                <span className="text-[11px] font-black uppercase">Module {module.label} test</span>
                                <span className="text-[11px] font-bold">
                                  {moduleBest !== null ? `best ${moduleBest}%` : sectionsDone ? 'ready' : 'finish lessons first'}
                                </span>
                              </span>
                            </Button>
                            <div className="mt-1.5 flex justify-center gap-0.5" aria-hidden="true">
                              {[0, 1, 2].map((star) => (
                                <Star key={star} className={`size-3 ${star < starsFor(moduleStatus, moduleBest) ? 'fill-current' : 'opacity-25'}`} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {chapterTest && (() => {
                const chapterLessonsDone = chapter.sections.every((section) => progress[section.id]?.completed);
                return (
                <div className={`mt-4 grid gap-3 rounded-xl p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${highContrast ? 'border-2 border-yellow-400' : 'border border-[#C51C63]/30 bg-[#C51C63]/5'}`}>
                  <div className="min-w-0">
                    <p className="text-sm font-black">Chapter {chapter.number} assessment — {chapterTest.items.length} questions</p>
                    <p className={`text-xs font-bold ${muted}`}>
                      You need {chapterThreshold}% to open Chapter {chapter.number + 1}.
                      {chapterBest !== null ? ` Your best so far: ${chapterBest}%.` : ''}
                      {!chapterLessonsDone ? ' Finish every lesson in this chapter first.' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex gap-0.5" aria-hidden="true">
                      {[0, 1, 2].map((star) => (
                        <Star key={star} className={`size-4 ${star < starsFor(chapterStatus, chapterBest) ? 'fill-current' : 'opacity-25'}`} />
                      ))}
                    </span>
                    <Button type="button" onClick={() => setOpenAssessment(chapterTest)} disabled={!gate.unlocked || !chapterLessonsDone}>
                      {gate.unlocked && chapterLessonsDone ? (
                        <>
                          <BookOpen aria-hidden="true" /> Open assessment
                        </>
                      ) : (
                        <>
                          <LockKeyhole aria-hidden="true" /> {gate.unlocked ? 'Finish lessons' : 'Locked'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                );
              })()}
            </section>
          );
        })}
      </div>
    </section>
  );
}
