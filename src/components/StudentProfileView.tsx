import { useEffect, useMemo, useState } from 'react';
import { Target, Trophy, BookOpen, GraduationCap, Plus, Check, Trash2, UserCircle, Sparkles, Wand2, Loader2, AlertTriangle } from 'lucide-react';
import type { GoalMetric, StudentGoal } from '@/hooks/useHubProgress';
import type { ProgressMap } from '@/hooks/useStudentAuth';
import { generateStudyPlan } from '@/lib/study-plan.functions';
import { LAUNCHPAD_CHAPTERS, ALL_LAUNCHPAD_SECTION_IDS } from '@/lib/launchpad-content';
import { supabase } from '@/integrations/supabase/client';
import LearningProgressMap from './LearningProgressMap';

type Props = {
  displayName: string;
  email?: string | null;
  xp: number;
  masteredCount: number;
  totalTerms: number;
  scenariosCount: number;
  totalScenarios: number;
  sectionsDone: number;
  totalSections: number;
  goals: StudentGoal[];
  setGoals: (value: StudentGoal[] | ((prev: StudentGoal[]) => StudentGoal[])) => void;
  cloudSaving: boolean;
  highContrast: boolean;
  setActiveTab: (tab: string) => void;
  userId?: string | null;
  completedSectionIds?: string[];
  sectionProgress: ProgressMap;
  onOpenSection: (sectionId: string) => void;
};

const METRIC_LABEL: Record<GoalMetric, string> = {
  xp: 'Experience Points',
  terms: 'Glossary terms mastered',
  scenarios: 'Scenarios solved',
  sections: 'Textbook sections completed',
  custom: 'Personal goal (check off yourself)',
};

export default function StudentProfileView({
  displayName,
  email,
  xp,
  masteredCount,
  totalTerms,
  scenariosCount,
  totalScenarios,
  sectionsDone,
  totalSections,
  goals,
  setGoals,
  cloudSaving,
  highContrast,
  setActiveTab,
  userId,
  completedSectionIds = [],
  sectionProgress,
  onOpenSection,
}: Props) {
  const [title, setTitle] = useState('');
  const [metric, setMetric] = useState<GoalMetric>('terms');
  const [target, setTarget] = useState(5);
  const [plan, setPlan] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // Bring back the plan the student generated last time.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('student_profile')
        .select('study_plan')
        .eq('user_id', userId)
        .maybeSingle();
      if (!cancelled && data?.study_plan) setPlan(data.study_plan as string);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const sectionTitle = (id: string) => {
    for (const chapter of LAUNCHPAD_CHAPTERS) {
      const section = chapter.sections.find((s) => s.id === id);
      if (section) return `${section.label} ${section.title}`;
    }
    return id;
  };

  const makePlan = async () => {
    setPlanLoading(true);
    setPlanError(null);
    try {
      const done = new Set(completedSectionIds);
      const result = await generateStudyPlan({
        data: {
          displayName,
          xp,
          masteredCount,
          totalTerms,
          scenariosCount,
          totalScenarios,
          sectionsDone,
          totalSections,
          completedSectionTitles: completedSectionIds.map(sectionTitle),
          remainingSectionTitles: ALL_LAUNCHPAD_SECTION_IDS.filter((id) => !done.has(id)).map(sectionTitle),
          goals: goals.map((g) => ({ title: g.title, metric: g.metric, target: g.target, done: g.done })),
        },
      });
      setPlan(result.plan);
    } catch (err) {
      setPlanError(
        err instanceof Error ? err.message : 'Something went wrong building your plan. Please try again.',
      );
    } finally {
      setPlanLoading(false);
    }
  };

  const progressFor = (goal: StudentGoal) => {
    switch (goal.metric) {
      case 'xp': return xp;
      case 'terms': return masteredCount;
      case 'scenarios': return scenariosCount;
      case 'sections': return sectionsDone;
      default: return goal.done ? goal.target : 0;
    }
  };

  const suggestions = useMemo(
    () => [
      { title: `Master ${Math.min(10, totalTerms)} glossary terms`, metric: 'terms' as GoalMetric, target: Math.min(10, totalTerms) },
      { title: `Solve all ${totalScenarios} real-world scenarios`, metric: 'scenarios' as GoalMetric, target: totalScenarios },
      { title: 'Finish 6 LaunchPad textbook sections', metric: 'sections' as GoalMetric, target: 6 },
      { title: 'Earn 250 Experience Points', metric: 'xp' as GoalMetric, target: 250 },
      { title: 'Build and present my 60-second pitch', metric: 'custom' as GoalMetric, target: 1 },
    ],
    [totalTerms, totalScenarios],
  );

  const card = highContrast ? 'bg-zinc-900 border-2 border-yellow-400 text-white' : 'bg-white border border-[#414042]/12 text-[#414042]';
  const heading = highContrast ? 'text-yellow-300' : 'text-[#414042]';
  const muted = highContrast ? 'text-yellow-200' : 'text-[#414042]/70';

  const addGoal = (t: string, m: GoalMetric, target: number) => {
    if (!t.trim()) return;
    setGoals((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title: t.trim(), metric: m, target: Math.max(1, target), done: false, createdAt: new Date().toISOString() },
    ]);
  };

  const stats = [
    { icon: Trophy, label: 'Experience Points', value: `${xp}`, tab: 'dashboard' },
    { icon: BookOpen, label: 'Glossary Terms Mastered', value: `${masteredCount} / ${totalTerms}`, tab: 'glossary' },
    { icon: Target, label: 'Scenarios Solved', value: `${scenariosCount} / ${totalScenarios}`, tab: 'practice' },
    { icon: GraduationCap, label: 'Textbook Sections Done', value: `${sectionsDone} / ${totalSections}`, tab: 'textbook' },
  ];

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl p-6 ${highContrast ? 'bg-zinc-900 border-2 border-yellow-400' : 'bg-[#414042]'} text-white`}>
        <div className="flex items-center gap-4">
          <UserCircle className={`w-14 h-14 ${highContrast ? 'text-yellow-300' : 'text-[#EFA835]'}`} />
          <div className="min-w-0">
            <h2 className="text-2xl font-black leading-tight">{displayName}</h2>
            {email && <p className={`text-sm truncate ${highContrast ? 'text-yellow-200' : 'text-white/70'}`}>{email}</p>}
            <p className={`text-xs mt-1 ${highContrast ? 'text-yellow-200' : 'text-white/70'}`}>
              {cloudSaving ? 'Saving your progress…' : 'Your progress is saved to your account.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.label}
              onClick={() => setActiveTab(s.tab)}
              className={`rounded-xl p-4 text-left transition hover:shadow-md ${card}`}
            >
              <Icon className={`w-6 h-6 mb-2 ${highContrast ? 'text-yellow-300' : 'text-[#C51C63]'}`} />
              <div className="text-2xl font-black">{s.value}</div>
              <div className={`text-xs font-medium ${muted}`}>{s.label}</div>
            </button>
          );
        })}
      </div>

      <LearningProgressMap
        progress={sectionProgress}
        highContrast={highContrast}
        onOpenSection={onOpenSection}
      />

      {/* AI study plan */}
      <div className={`rounded-2xl p-6 ${card}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className={`text-lg font-bold flex items-center gap-2 ${heading}`}>
              <Wand2 className={highContrast ? 'text-yellow-300' : 'text-[#C51C63]'} /> My Personalized Study Plan
            </h3>
            <p className={`text-sm ${muted}`}>
              Builds a two-week plan from your saved progress and learning goals.
            </p>
          </div>
          <button
            onClick={makePlan}
            disabled={planLoading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-60 ${
              highContrast ? 'bg-yellow-400 text-black' : 'bg-[#C51C63] text-white hover:bg-[#C51C63]/90'
            }`}
          >
            {planLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {planLoading ? 'Building your plan…' : plan ? 'Refresh my plan' : 'Build my study plan'}
          </button>
        </div>

        {planError && (
          <p className={`mt-3 text-sm flex items-start gap-2 ${highContrast ? 'text-yellow-200' : 'text-[#E94928]'}`}>
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {planError}
          </p>
        )}

        {planLoading && !plan && (
          <p className={`mt-3 text-sm ${muted}`}>This can take up to a minute — thanks for waiting.</p>
        )}

        {plan && (
          <div className="mt-4 space-y-2 text-sm leading-relaxed">
            {plan.split('\n').map((line, i) => {
              const text = line.trim();
              if (!text) return null;
              if (text.startsWith('### '))
                return <h5 key={i} className={`font-bold pt-1 ${heading}`}>{text.slice(4)}</h5>;
              if (text.startsWith('## '))
                return (
                  <h4 key={i} className={`font-extrabold pt-2 ${highContrast ? 'text-yellow-300' : 'text-[#C51C63]'}`}>
                    {text.slice(3)}
                  </h4>
                );
              if (text.startsWith('- ') || text.startsWith('* '))
                return (
                  <p key={i} className="pl-4">
                    • {text.slice(2).replace(/\*\*/g, '')}
                  </p>
                );
              return <p key={i}>{text.replace(/\*\*/g, '')}</p>;
            })}
          </div>
        )}
      </div>



      {/* Goal builder */}
      <div className={`rounded-2xl p-6 ${card}`}>
        <h3 className={`text-lg font-bold flex items-center gap-2 mb-1 ${heading}`}>
          <Target className={highContrast ? 'text-yellow-300' : 'text-[#C51C63]'} /> Set a Learning Goal
        </h3>
        <p className={`text-sm mb-4 ${muted}`}>Choose something on the Hub you want to accomplish. Goals track themselves as you work.</p>

        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto] items-end">
          <label className="text-sm font-semibold">
            Goal
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master 10 glossary terms"
              className={`mt-1 w-full rounded-lg px-3 py-2 text-sm font-normal border ${highContrast ? 'bg-black border-yellow-400 text-white' : 'bg-white border-[#414042]/20'}`}
            />
          </label>
          <label className="text-sm font-semibold">
            Track by
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as GoalMetric)}
              className={`mt-1 w-full rounded-lg px-3 py-2 text-sm font-normal border ${highContrast ? 'bg-black border-yellow-400 text-white' : 'bg-white border-[#414042]/20'}`}
            >
              {(Object.keys(METRIC_LABEL) as GoalMetric[]).map((m) => (
                <option key={m} value={m}>{METRIC_LABEL[m]}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Target
            <input
              type="number"
              min={1}
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className={`mt-1 w-24 rounded-lg px-3 py-2 text-sm font-normal border ${highContrast ? 'bg-black border-yellow-400 text-white' : 'bg-white border-[#414042]/20'}`}
            />
          </label>
        </div>
        <button
          onClick={() => { addGoal(title, metric, target); setTitle(''); }}
          className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
            highContrast ? 'bg-yellow-400 text-black' : 'bg-[#C51C63] text-white hover:bg-[#C51C63]/90'
          }`}
        >
          <Plus className="w-4 h-4" /> Add Goal
        </button>

        <div className="mt-5">
          <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${muted}`}>Quick picks</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s.title}
                onClick={() => addGoal(s.title, s.metric, s.target)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  highContrast ? 'border-yellow-400 text-yellow-300 hover:bg-zinc-800' : 'border-[#414042]/20 text-[#414042] hover:bg-[#414042]/5'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${highContrast ? 'text-yellow-300' : 'text-[#EFA835]'}`} /> {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Goal list */}
      <div className={`rounded-2xl p-6 ${card}`}>
        <h3 className={`text-lg font-bold mb-4 ${heading}`}>My Goals</h3>
        {goals.length === 0 ? (
          <p className={`text-sm ${muted}`}>No goals yet — add one above to start tracking your progress.</p>
        ) : (
          <ul className="space-y-3">
            {goals.map((goal) => {
              const current = Math.min(progressFor(goal), goal.target);
              const pct = Math.round((current / goal.target) * 100);
              const complete = goal.metric === 'custom' ? goal.done : current >= goal.target;
              return (
                <li key={goal.id} className={`rounded-xl p-4 border ${highContrast ? 'border-yellow-400' : 'border-[#414042]/12'`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`font-bold text-sm ${complete ? 'line-through opacity-70' : ''}`}>{goal.title}</p>
                      <p className={`text-xs ${muted}`}>{METRIC_LABEL[goal.metric]} · {current} / {goal.target}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {goal.metric === 'custom' && (
                        <button
                          onClick={() => setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, done: !g.done } : g)))}
                          aria-label={goal.done ? 'Mark goal as not done' : 'Mark goal as done'}
                          className={`p-2 rounded-lg transition ${
                            goal.done
                              ? highContrast ? 'bg-yellow-400 text-black' : 'bg-[#C51C63] text-white'
                              : highContrast ? 'border-2 border-yellow-400 text-yellow-300' : 'border border-[#414042]/20 text-[#414042]'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setGoals((prev) => prev.filter((g) => g.id !== goal.id))}
                        aria-label="Delete goal"
                        className={`p-2 rounded-lg transition ${highContrast ? 'text-yellow-300 hover:bg-zinc-800' : 'text-[#E94928] hover:bg-[#E94928]/10'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className={`mt-3 h-2 rounded-full overflow-hidden ${highContrast ? 'bg-zinc-700' : 'bg-[#414042]/10'}`}>
                    <div
                      className={`h-full rounded-full transition-all ${complete ? 'bg-[#EFA835]' : highContrast ? 'bg-yellow-400' : 'bg-[#C51C63]'}`}
                      style={{ width: `${complete ? 100 : pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
