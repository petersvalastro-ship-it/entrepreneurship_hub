import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Check, Clock, LockKeyhole, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Assessment } from '@/lib/assessments';
import {
  attemptsFor,
  bestScore,
  prescribedReview,
  retryState,
  type Attempt,
} from '@/lib/mastery';
import type { AttemptResponse } from '@/hooks/useMastery';

type Props = {
  assessment: Assessment;
  attempts: Attempt[];
  threshold: number;
  available: boolean;
  lockReason: string;
  reviewActiveSeconds: number;
  highContrast: boolean;
  onSubmit: (responses: AttemptResponse[], elapsedSeconds: number) => Promise<{ scorePct: number; passed: boolean; lowEffort: boolean; award: { xp: number; blockedReason: string } }>;
  onOpenSection: (sectionId: string) => void;
  onClose: () => void;
};

export default function AssessmentRunner({
  assessment,
  attempts,
  threshold,
  available,
  lockReason,
  reviewActiveSeconds,
  highContrast,
  onSubmit,
  onOpenSection,
  onClose,
}: Props) {
  const history = attemptsFor(attempts, assessment.id);
  const best = bestScore(attempts, assessment.id);
  const [phase, setPhase] = useState<'gate' | 'running' | 'result'>('gate');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [itemStart, setItemStart] = useState(Date.now());
  const [seconds, setSeconds] = useState<Record<string, number>>({});
  const [startedAt, setStartedAt] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    scorePct: number;
    passed: boolean;
    lowEffort: boolean;
    xp: number;
    blockedReason: string;
    responses: AttemptResponse[];
  } | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const retry = retryState(assessment, attempts, reviewActiveSeconds, now);
  const lastResponses = useMemo<{ itemId: string; concept: string; correct: boolean }[]>(() => {
    const previous = history[history.length - 1];
    if (!previous) return [];
    return assessment.items.map((item) => ({ itemId: item.id, concept: item.concept, correct: true }));
  }, [assessment.items, history]);

  const reviewList = prescribedReview(
    assessment,
    attempts,
    (result?.responses ?? lastResponses).map((r) => ({ itemId: r.itemId, concept: r.concept, correct: r.correct })),
  );

  const card = highContrast
    ? 'border-2 border-yellow-400 bg-zinc-900 text-white'
    : 'border border-[#414042]/12 bg-white text-[#414042] shadow-lg';
  const muted = highContrast ? 'text-yellow-100' : 'text-[#414042]/70';

  const start = () => {
    setAnswers({});
    setSeconds({});
    setIndex(0);
    setStartedAt(Date.now());
    setItemStart(Date.now());
    setPhase('running');
  };

  const choose = (itemId: string, option: number) => {
    setAnswers((current) => ({ ...current, [itemId]: option }));
    setSeconds((current) => ({ ...current, [itemId]: Math.max(1, Math.round((Date.now() - itemStart) / 1000)) }));
  };

  const finish = async () => {
    setBusy(true);
    const responses: AttemptResponse[] = assessment.items.map((item) => ({
      itemId: item.id,
      concept: item.concept,
      chosen: answers[item.id] ?? -1,
      correct: answers[item.id] === item.correct,
      seconds: seconds[item.id] ?? 1,
    }));
    const outcome = await onSubmit(responses, Math.round((Date.now() - startedAt) / 1000));
    setResult({
      scorePct: outcome.scorePct,
      passed: outcome.passed,
      lowEffort: outcome.lowEffort,
      xp: outcome.award.xp,
      blockedReason: outcome.award.blockedReason,
      responses,
    });
    setPhase('result');
    setBusy(false);
  };

  const conceptBreakdown = useMemo(() => {
    if (!result) return [];
    const map = new Map<string, { right: number; total: number }>();
    for (const response of result.responses) {
      const entry = map.get(response.concept) ?? { right: 0, total: 0 };
      entry.total += 1;
      if (response.correct) entry.right += 1;
      map.set(response.concept, entry);
    }
    return [...map.entries()]
      .map(([concept, value]) => ({ concept, percent: Math.round((value.right / value.total) * 100) }))
      .sort((a, b) => a.percent - b.percent);
  }, [result]);

  const mm = (total: number) => `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;

  return (
    <div className={`rounded-2xl p-5 sm:p-6 ${card}`} role="group" aria-label={assessment.title}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-xs font-extrabold uppercase ${highContrast ? 'text-yellow-300' : 'text-[#C51C63]'`}>
            {assessment.tier === 'chapter' ? 'Chapter assessment' : assessment.tier === 'module' ? 'Module assessment' : 'Section check'}
          </p>
          <h3 className="text-xl font-black">{assessment.title}</h3>
          <p className={`text-sm ${muted}`}>
            {assessment.items.length} questions · {threshold}% needed to pass
            {best !== null ? ` · your best so far: ${best}%` : ''}
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={onClose} aria-label="Close assessment">
          <X aria-hidden="true" />
        </Button>
      </div>

      {phase === 'gate' && (
        <div className="mt-5 space-y-4">
          {!available ? (
            <p className="flex items-start gap-2 rounded-xl bg-black/5 p-4 text-sm font-bold">
              <LockKeyhole className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {lockReason}
            </p>
          ) : (
            <>
              {history.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-bold">Your attempts</p>
                  <ul className={`space-y-1 text-sm ${muted}`}>
                    {history.map((attempt) => (
                      <li key={attempt.id}>
                        Attempt {attempt.attemptNumber}: {attempt.scorePct}%{' '}
                        {attempt.passed ? 'passed' : 'needs another try'}
                        {attempt.lowEffort ? ' · answered very fast' : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!retry.canRetry && assessment.tier !== 'section' && (
                <div className="space-y-3 rounded-xl bg-black/5 p-4">
                  <p className="text-sm font-bold">Before you try again, review:</p>
                  <ul className="space-y-2">
                    {reviewList.map((item) => (
                      <li key={item.sectionId}>
                        <Button type="button" variant="outline" size="sm" onClick={() => onOpenSection(item.sectionId)}>
                          <BookOpen aria-hidden="true" /> {item.sectionTitle}
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <p className={`flex items-center gap-2 text-sm ${muted}`}>
                    <Clock className="size-4" aria-hidden="true" />
                    {retry.secondsRemaining > 0
                      ? `Retry opens in ${mm(retry.secondsRemaining)}.`
                      : 'Spend about 2 minutes in a review section to open your retry.'}
                  </p>
                </div>
              )}

              <Button type="button" onClick={start} disabled={!retry.canRetry}>
                {history.length ? 'Start retry' : 'Start assessment'} <ArrowRight aria-hidden="true" />
              </Button>
            </>
          )}
        </div>
      )}

      {phase === 'running' && (
        <div className="mt-5 space-y-5">
          <div>
            <p className={`text-sm font-bold ${muted}`}>
              Question {index + 1} of {assessment.items.length}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded bg-black/10">
              <div
                className={`h-full ${highContrast ? 'bg-yellow-400' : 'bg-[#C51C63]'}`}
                style={{ width: `${((index + 1) / assessment.items.length) * 100}%` }}
              />
            </div>
          </div>

          {(() => {
            const item = assessment.items[index];
            if (!item) return null;
            return (
              <fieldset className="space-y-3">
                <legend className="text-lg font-black">{item.stem}</legend>
                {item.options.map((option, optionIndex) => {
                  const checked = answers[item.id] === optionIndex;
                  return (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 text-sm font-semibold transition ${
                        checked
                          ? highContrast
                            ? 'border-yellow-400 bg-black'
                            : 'border-[#C51C63] bg-[#C51C63]/10'
                          : highContrast
                            ? 'border-white/30'
                            : 'border-[#414042]/15 hover:border-[#C51C63]/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={item.id}
                        checked={checked}
                        onChange={() => choose(item.id, optionIndex)}
                        className="mt-1"
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </fieldset>
            );
          })()}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIndex((i) => Math.max(0, i - 1));
                setItemStart(Date.now());
              }}
              disabled={index === 0}
            >
              Back
            </Button>
            {index < assessment.items.length - 1 ? (
              <Button
                type="button"
                onClick={() => {
                  setIndex((i) => i + 1);
                  setItemStart(Date.now());
                }}
                disabled={answers[assessment.items[index]?.id ?? ''] === undefined}
              >
                Next <ArrowRight aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={finish}
                disabled={busy || Object.keys(answers).length < assessment.items.length}
              >
                {busy ? 'Scoring…' : 'Submit answers'}
              </Button>
            )}
          </div>
        </div>
      )}

      {phase === 'result' && result && (
        <div className="mt-5 space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-4xl font-black">{result.scorePct}%</span>
            <span className="flex items-center gap-1" aria-hidden="true">
              {[0, 1, 2].map((star) => (
                <Star
                  key={star}
                  className={`size-5 ${
                    result.scorePct >= 95 || (result.passed && star < 2) || (result.scorePct >= 90 && star < 3)
                      ? 'fill-current'
                      : 'opacity-25'
                  }`}
                />
              ))}
            </span>
            <span className="rounded-full bg-black/10 px-3 py-1 text-sm font-bold">
              {result.passed ? 'Passed — next step unlocked' : `${threshold}% needed — you can try again`}
            </span>
            {result.xp > 0 && <span className="text-sm font-bold">+{result.xp} XP</span>}
          </div>

          {result.blockedReason && <p className={`text-sm font-bold ${muted}`}>{result.blockedReason}</p>}
          {result.lowEffort && (
            <p className={`text-sm font-bold ${muted}`}>
              These answers came in very quickly, so this attempt records your score without XP. Take your time on the next one.
            </p>
          )}

          <div className="space-y-2">
            <p className="text-sm font-bold">How each idea went</p>
            <ul className="space-y-1">
              {conceptBreakdown.map((entry) => (
                <li key={entry.concept} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-sm">
                  <span className="truncate font-semibold">{entry.concept}</span>
                  <span className="font-bold">{entry.percent}%</span>
                </li>
              ))}
            </ul>
          </div>

          {!result.passed && (
            <div className="space-y-2 rounded-xl bg-black/5 p-4">
              <p className="text-sm font-bold">Two things to review before your retry</p>
              {reviewList.map((item) => (
                <Button key={item.sectionId} type="button" variant="outline" size="sm" onClick={() => onOpenSection(item.sectionId)}>
                  <BookOpen aria-hidden="true" /> {item.sectionTitle}
                </Button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setPhase('gate')}>
              Back to details
            </Button>
            <Button type="button" onClick={onClose}>
              {result.passed ? (
                <>
                  <Check aria-hidden="true" /> Done
                </>
              ) : (
                'Close'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
