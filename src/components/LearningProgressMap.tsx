import { ArrowRight, BookOpen, Check, CircleDot, LockKeyhole, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProgressMap } from '@/hooks/useStudentAuth';
import { ALL_LAUNCHPAD_SECTION_IDS, LAUNCHPAD_CHAPTERS } from '@/lib/launchpad-content';

type ModuleState = 'attempted' | 'completed' | 'locked' | 'recommended';

type Props = {
  progress: ProgressMap;
  highContrast: boolean;
  onOpenSection: (sectionId: string) => void;
};

const STATE_COPY: Record<ModuleState, string> = {
  attempted: 'Attempted',
  completed: 'Completed',
  locked: 'Locked',
  recommended: 'Recommended',
};

const stateClasses: Record<ModuleState, string> = {
  completed: 'border-progress-completed bg-progress-completed text-progress-completed-foreground shadow-sm',
  attempted: 'border-progress-attempted bg-progress-attempted text-progress-attempted-foreground shadow-sm',
  recommended: 'border-progress-recommended bg-progress-recommended text-progress-recommended-foreground shadow-md ring-4 ring-progress-recommended/15',
  locked: 'border-progress-locked-border bg-progress-locked text-progress-locked-foreground',
};

function StateIcon({ state }: { state: ModuleState }) {
  if (state === 'completed') return <Check className="size-4" aria-hidden="true" />;
  if (state === 'attempted') return <CircleDot className="size-4" aria-hidden="true" />;
  if (state === 'recommended') return <Sparkles className="size-4" aria-hidden="true" />;
  return <LockKeyhole className="size-4" aria-hidden="true" />;
}

export default function LearningProgressMap({ progress, highContrast, onOpenSection }: Props) {
  const firstIncompleteIndex = ALL_LAUNCHPAD_SECTION_IDS.findIndex((id) => !progress[id]?.completed);
  const completedCount = ALL_LAUNCHPAD_SECTION_IDS.filter((id) => progress[id]?.completed).length;
  const attemptedIds = ALL_LAUNCHPAD_SECTION_IDS.filter((id) => Boolean(progress[id]) && !progress[id]?.completed);
  const nextSectionId = attemptedIds[0] ?? (firstIncompleteIndex >= 0 ? ALL_LAUNCHPAD_SECTION_IDS[firstIncompleteIndex] : ALL_LAUNCHPAD_SECTION_IDS[0]);
  const nextSection = LAUNCHPAD_CHAPTERS.flatMap((chapter) => chapter.sections).find((section) => section.id === nextSectionId);
  const percent = Math.round((completedCount / ALL_LAUNCHPAD_SECTION_IDS.length) * 100);

  const getState = (sectionId: string): ModuleState => {
    const index = ALL_LAUNCHPAD_SECTION_IDS.indexOf(sectionId);
    if (progress[sectionId]?.completed) return 'completed';
    if (progress[sectionId]) return 'attempted';
    if (firstIncompleteIndex < 0 || index === firstIncompleteIndex) return 'recommended';
    return 'locked';
  };

  const surface = highContrast
    ? 'border-2 border-yellow-400 bg-zinc-900 text-white'
    : 'border border-border bg-card text-card-foreground shadow-sm';

  return (
    <section aria-labelledby="learning-map-title" className="space-y-4">
      <div className={`overflow-hidden rounded-xl ${surface}`}>
        <div className="grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6">
          <div className="min-w-0">
            <p className={`text-xs font-extrabold uppercase ${highContrast ? 'text-yellow-300' : 'text-primary'}`}>
              Your learning path
            </p>
            <h3 id="learning-map-title" className="mt-1 text-2xl font-black">LaunchPad Progress Map</h3>
            <p className={`mt-1 text-sm ${highContrast ? 'text-yellow-100' : 'text-muted-foreground'}`}>
              Complete each lesson to unlock the next step in your entrepreneurship journey.
            </p>
          </div>
          <div className="grid min-w-36 grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1">
            <span className={`row-span-2 text-3xl font-black ${highContrast ? 'text-yellow-300' : 'text-primary'}`}>{percent}%</span>
            <span className="text-sm font-bold">Course progress</span>
            <span className={`text-xs ${highContrast ? 'text-yellow-100' : 'text-muted-foreground'}`}>
              {completedCount} of {ALL_LAUNCHPAD_SECTION_IDS.length} complete
            </span>
          </div>
        </div>
        <div className={`h-2 ${highContrast ? 'bg-zinc-700' : 'bg-muted'}`}>
          <div className={`h-full transition-all ${highContrast ? 'bg-yellow-400' : 'bg-primary'}`} style={{ width: `${percent}%` }} />
        </div>
      </div>

      {completedCount < ALL_LAUNCHPAD_SECTION_IDS.length && nextSection && (
        <div className={`grid gap-4 rounded-xl p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${highContrast ? 'border-2 border-yellow-400 bg-black' : 'border border-progress-recommended/40 bg-progress-recommended/10'}`}>
          <div className="min-w-0">
            <div className={`flex items-center gap-2 text-xs font-extrabold uppercase ${highContrast ? 'text-yellow-300' : 'text-progress-recommended-foreground'}`}>
              <Sparkles className="size-4 shrink-0" /> Pick up where you left off
            </div>
            <p className="mt-1 truncate text-lg font-black">{nextSection.label} · {nextSection.title}</p>
            <p className={`text-sm ${highContrast ? 'text-yellow-100' : 'text-muted-foreground'}`}>
              {progress[nextSection.id] ? 'Your saved work is ready to continue.' : 'This is your recommended next lesson.'}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => onOpenSection(nextSection.id)}
            className={highContrast ? 'bg-yellow-400 text-black hover:bg-yellow-300' : ''}
          >
            {progress[nextSection.id] ? 'Continue' : 'Start lesson'} <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Progress map legend">
        {(['completed', 'attempted', 'recommended', 'locked'] as ModuleState[]).map((state) => (
          <span key={state} className={`inline-flex items-center gap-1.5 text-xs font-bold ${highContrast ? 'text-white' : 'text-muted-foreground'}`}>
            <StateIcon state={state} /> {STATE_COPY[state]}
          </span>
        ))}
      </div>

      <div className="space-y-5">
        {LAUNCHPAD_CHAPTERS.map((chapter) => {
          const chapterDone = chapter.sections.filter((section) => progress[section.id]?.completed).length;
          return (
            <section key={chapter.id} className={`rounded-xl p-4 sm:p-5 ${surface}`} aria-labelledby={`map-${chapter.id}`}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
                <div className="min-w-0">
                  <p className={`text-xs font-extrabold uppercase ${highContrast ? 'text-yellow-300' : 'text-primary'}`}>Chapter {chapter.number}</p>
                  <h4 id={`map-${chapter.id}`} className="truncate text-base font-black sm:text-lg">{chapter.title}</h4>
                </div>
                <span className={`shrink-0 text-xs font-bold ${highContrast ? 'text-yellow-100' : 'text-muted-foreground'}`}>
                  {chapterDone}/{chapter.sections.length}
                </span>
              </div>

              <div className="mt-4 overflow-x-auto pb-2">
                <div className="flex min-w-max items-start px-1">
                  {chapter.sections.map((section, index) => {
                    const state = getState(section.id);
                    const disabled = state === 'locked';
                    return (
                      <div key={section.id} className="flex items-start">
                        <div className="w-28 sm:w-32">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={disabled}
                            onClick={() => onOpenSection(section.id)}
                            aria-label={`${section.label} ${section.title}: ${STATE_COPY[state]}`}
                            className={`mx-auto grid size-16 place-items-center rounded-xl border-2 p-0 transition-transform enabled:hover:-translate-y-1 enabled:hover:shadow-lg sm:size-18 ${highContrast ? 'border-yellow-400 bg-black text-white disabled:border-white/40 disabled:bg-zinc-800 disabled:text-white/60' : stateClasses[state]}`}
                          >
                            <span className="grid place-items-center gap-0.5">
                              <StateIcon state={state} />
                              <span className="text-sm font-black">{section.label}</span>
                            </span>
                          </Button>
                          <p className={`mt-2 line-clamp-2 min-h-8 text-center text-xs font-bold leading-4 ${disabled && !highContrast ? 'text-muted-foreground' : ''}`}>
                            {section.title}
                          </p>
                          <div className="mt-1 flex h-3 justify-center gap-0.5" aria-hidden="true">
                            {[0, 1, 2].map((star) => (
                              <Star key={star} className={`size-3 ${state === 'completed' ? 'fill-current' : state === 'attempted' && star === 0 ? 'fill-current' : 'opacity-25'}`} />
                            ))}
                          </div>
                        </div>
                        {index < chapter.sections.length - 1 && (
                          <div className={`mt-8 h-1 w-5 sm:w-8 ${progress[section.id]?.completed ? highContrast ? 'bg-yellow-400' : 'bg-progress-completed' : highContrast ? 'bg-white/30' : 'bg-border'}`} aria-hidden="true" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {completedCount === ALL_LAUNCHPAD_SECTION_IDS.length && (
        <div className={`flex items-center gap-3 rounded-xl p-5 ${highContrast ? 'border-2 border-yellow-400 bg-black text-white' : 'border border-progress-completed bg-progress-completed text-progress-completed-foreground'}`}>
          <BookOpen className="size-7 shrink-0" />
          <div><p className="font-black">Every LaunchPad lesson is complete!</p><p className="text-sm">You can revisit any lesson from the map.</p></div>
        </div>
      )}
    </section>
  );
}