import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, Check, Clock, Filter, Grid3x3, LockOpen, RefreshCw, RotateCcw, Search, ShieldAlert, Sliders, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  dismissFlag,
  getClassMastery,
  resetStudentXp,
  saveClassSettings,
  setGateState,
  setStudentThreshold,
  type ClassMasteryPayload,
  type ClassStudent,
} from '@/lib/mastery-teacher.functions';
import { LAUNCHPAD_CHAPTERS } from '@/lib/launchpad-content';
import { CURRICULUM_MODULES, MODULES_BY_CHAPTER, assessmentById } from '@/lib/assessments';
import { ANOMALY_LABEL, STATUS_LABEL, formatDuration, type NodeStatus } from '@/lib/mastery';

type Props = { highContrast: boolean };
type Tab = 'overview' | 'matrix' | 'mastery' | 'engagement';
type SortKey = 'name' | 'lowest_mastery' | 'failed_gates' | 'flagged' | 'high_time_low_mastery' | 'awaiting_retake';

const bestFor = (student: ClassStudent, assessmentId: string): number | null => {
  const scores = student.attempts.filter((a) => a.assessmentId === assessmentId).map((a) => a.scorePct);
  return scores.length ? Math.max(...scores) : null;
};

function statusFor(student: ClassStudent, assessmentId: string, nodeId: string, threshold: number): NodeStatus {
  const override = student.overrides.find((o) => o.nodeId === nodeId);
  if (override?.state === 'retake_required') return 'retake_required';
  const attempts = student.attempts.filter((a) => a.assessmentId === assessmentId);
  if (!attempts.length) return override?.state === 'teacher_unlocked' ? 'teacher_unlocked' : 'not_started';
  const best = Math.max(...attempts.map((a) => a.scorePct));
  if (best >= 95) return 'mastered';
  if (best >= threshold) return 'passed';
  return 'failed';
}

function studentMastery(student: ClassStudent): { percent: number; assessed: number } {
  const map = new Map<string, number>();
  for (const attempt of student.attempts) {
    if (attempt.tier === 'section') continue;
    map.set(attempt.assessmentId, Math.max(map.get(attempt.assessmentId) ?? 0, attempt.scorePct));
  }
  const scores = [...map.values()];
  if (!scores.length) return { percent: 0, assessed: 0 };
  return { percent: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length), assessed: scores.length };
}

export default function TeacherMasteryPanels({ highContrast }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [data, setData] = useState<ClassMasteryPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('name');
  const [openStudent, setOpenStudent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // XP reset dialog
  const [resetFor, setResetFor] = useState<ClassStudent | null>(null);
  const [scope, setScope] = useState<'all' | 'chapter' | 'module'>('chapter');
  const [scopeNode, setScopeNode] = useState('ch1');
  const [reason, setReason] = useState('');
  const [requireRetake, setRequireRetake] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getClassMastery());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load class mastery data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const settings = data?.settings ?? { masteryGateEnabled: true, defaultThreshold: 80, dailyXpCap: 150, minSectionSeconds: 90 };
  const students = data?.students ?? [];

  const thresholdFor = (student: ClassStudent, nodeId: string) => {
    const override = student.overrides.find((o) => o.nodeId === nodeId)?.thresholdOverride;
    if (typeof override === 'number') return override;
    if (typeof student.thresholdOverride === 'number') return student.thresholdOverride;
    return settings.defaultThreshold;
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = students.filter((s) => !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    const mastery = (s: ClassStudent) => studentMastery(s).percent;
    const failedGates = (s: ClassStudent) =>
      s.attempts.filter((a) => a.tier !== 'section' && !a.passed).length;
    if (sort === 'lowest_mastery') list = [...list].sort((a, b) => mastery(a) - mastery(b));
    if (sort === 'failed_gates') list = [...list].sort((a, b) => failedGates(b) - failedGates(a));
    if (sort === 'flagged') list = [...list].sort((a, b) => b.flags.filter((f) => !f.dismissedAt).length - a.flags.filter((f) => !f.dismissedAt).length);
    if (sort === 'high_time_low_mastery')
      list = [...list].sort((a, b) => b.activeSeconds / Math.max(1, mastery(b)) - a.activeSeconds / Math.max(1, mastery(a)));
    if (sort === 'awaiting_retake')
      list = [...list].sort(
        (a, b) =>
          b.overrides.filter((o) => o.state === 'retake_required').length -
          a.overrides.filter((o) => o.state === 'retake_required').length,
      );
    return list;
  }, [query, sort, students]);

  const alerts = useMemo(() => {
    const out: { id: string; text: string; studentId?: string; action: string }[] = [];
    for (const student of students) {
      const mastery = studentMastery(student);
      if (student.activeSeconds > 3600 && mastery.assessed > 0 && mastery.percent < 60) {
        out.push({
          id: `effort-${student.userId}`,
          studentId: student.userId,
          text: `${student.name} — ${formatDuration(student.activeSeconds)} logged, ${mastery.percent}% mastery. Effort is outpacing assessment scores.`,
          action: 'Reset XP or require a retake',
        });
      }
      const openFlags = student.flags.filter((f) => !f.dismissedAt);
      const rapid = openFlags.filter((f) => f.type === 'rapid_click').length;
      if (rapid) {
        out.push({
          id: `rapid-${student.userId}`,
          studentId: student.userId,
          text: `${student.name} — rapid clicking recorded ${rapid}×.`,
          action: 'Review sessions or clear the flag',
        });
      }
      const lowEffort = student.attempts.filter((a) => a.lowEffort).length;
      if (lowEffort) {
        out.push({
          id: `low-${student.userId}`,
          studentId: student.userId,
          text: `${student.name} — ${lowEffort} assessment attempt(s) answered faster than 3 seconds per question.`,
          action: 'Require a retake',
        });
      }
      for (const override of student.overrides.filter((o) => o.state === 'retake_required')) {
        out.push({
          id: `retake-${student.userId}-${override.nodeId}`,
          studentId: student.userId,
          text: `${student.name} — awaiting retake of ${override.nodeId}.`,
          action: 'Open student detail',
        });
      }
    }
    for (const chapter of LAUNCHPAD_CHAPTERS) {
      const failures = students.filter((s) =>
        s.attempts.some((a) => a.assessmentId === `chapter:${chapter.id}` && !a.passed) &&
        !s.attempts.some((a) => a.assessmentId === `chapter:${chapter.id}` && a.passed),
      );
      if (failures.length >= 2) {
        out.push({
          id: `chapter-${chapter.id}`,
          text: `${failures.length} students have not yet passed the Chapter ${chapter.number} assessment.`,
          action: 'Open item analysis',
        });
      }
    }
    return out;
  }, [students]);

  const itemAnalysis = useMemo(() => {
    const map = new Map<string, { concept: string; stem: string; right: number; total: number; missedBy: string[] }>();
    for (const student of students) {
      for (const attempt of student.attempts) {
        for (const response of attempt.responses ?? []) {
          const assessment = assessmentById(attempt.assessmentId);
          const item = assessment?.items.find((i) => i.id === response.itemId);
          const entry =
            map.get(response.itemId) ?? { concept: response.concept, stem: item?.stem ?? response.itemId, right: 0, total: 0, missedBy: [] };
          entry.total += 1;
          if (response.correct) entry.right += 1;
          else if (!entry.missedBy.includes(student.name)) entry.missedBy.push(student.name);
          map.set(response.itemId, entry);
        }
      }
    }
    return [...map.entries()]
      .map(([id, value]) => ({ id, ...value, percent: Math.round((value.right / value.total) * 100) }))
      .sort((a, b) => a.percent - b.percent);
  }, [students]);

  const overview = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const activeToday = students.filter((s) => s.sessionDays.some((d) => String(d).slice(0, 10) === today)).length;
    const masteryScores = students.map((s) => studentMastery(s)).filter((m) => m.assessed > 0);
    const weekAgo = Date.now() - 7 * 86400_000;
    const gatesPassed = students.reduce(
      (sum, s) => sum + s.attempts.filter((a) => a.tier !== 'section' && a.passed && new Date(a.createdAt).getTime() > weekAgo).length,
      0,
    );
    return {
      activeToday,
      avgMastery: masteryScores.length
        ? Math.round(masteryScores.reduce((sum, m) => sum + m.percent, 0) / masteryScores.length)
        : 0,
      assessedCount: masteryScores.length,
      gatesPassed,
      flagged: students.reduce((sum, s) => sum + s.flags.filter((f) => !f.dismissedAt).length, 0),
      awaitingRetake: students.reduce((sum, s) => sum + s.overrides.filter((o) => o.state === 'retake_required').length, 0),
    };
  }, [students]);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(true);
    setNotice(null);
    try {
      await fn();
      await load();
      setNotice(label);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'That action did not go through.');
    } finally {
      setBusy(false);
    }
  };

  const card = highContrast ? 'bg-zinc-900 border-2 border-yellow-400 text-white' : 'bg-white border border-[#414042]/12 text-[#414042]';
  const muted = highContrast ? 'text-yellow-200' : 'text-[#414042]/70';
  const accent = highContrast ? 'text-yellow-300' : 'text-[#C51C63]';

  const tileText = (status: NodeStatus, score: number | null) => {
    if (status === 'not_started') return '—';
    if (status === 'locked') return 'locked';
    if (status === 'retake_required') return 'retake';
    return `${score ?? 0}%`;
  };

  if (loading) {
    return (
      <p className={`rounded-xl p-6 text-sm font-bold ${card}`}>
        <RefreshCw className="mr-2 inline size-4 animate-spin" aria-hidden="true" /> Loading class mastery data…
      </p>
    );
  }
  if (error) {
    return <p className={`rounded-xl p-6 text-sm font-bold ${card}`}>{error}</p>;
  }

  return (
    <div className="space-y-5">
      {/* CONTROL BAR */}
      <div className={`flex flex-wrap items-center gap-3 rounded-xl p-4 ${card}`}>
        <div className="flex flex-wrap gap-1">
          {(
            [
              ['overview', 'Overview', Users],
              ['matrix', 'Matrix', Grid3x3],
              ['mastery', 'Mastery', BarChart3],
              ['engagement', 'Engagement', Clock],
            ] as [Tab, string, typeof Users][]
          ).map(([id, label, Icon]) => (
            <Button
              key={id}
              type="button"
              variant={tab === id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTab(id)}
            >
              <Icon aria-hidden="true" /> {label}
            </Button>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold">
            <Sliders className="size-4" aria-hidden="true" /> Mastery gate
            <input
              type="checkbox"
              checked={settings.masteryGateEnabled}
              onChange={(event) =>
                run('Mastery gate updated.', () =>
                  saveClassSettings({ data: { ...settings, masteryGateEnabled: event.target.checked } }),
                )
              }
            />
          </label>
          <label className="flex items-center gap-2 text-xs font-bold">
            Threshold
            <input
              type="number"
              min={60}
              max={100}
              defaultValue={settings.defaultThreshold}
              onBlur={(event) =>
                run('Threshold saved.', () =>
                  saveClassSettings({ data: { ...settings, defaultThreshold: Number(event.target.value) } }),
                )
              }
              className="w-16 rounded border px-2 py-1 text-black"
            />
            %
          </label>
          <label className="flex items-center gap-2 text-xs font-bold">
            Daily XP cap
            <input
              type="number"
              min={0}
              max={1000}
              defaultValue={settings.dailyXpCap}
              onBlur={(event) =>
                run('Daily XP cap saved.', () => saveClassSettings({ data: { ...settings, dailyXpCap: Number(event.target.value) } }))
              }
              className="w-20 rounded border px-2 py-1 text-black"
            />
          </label>
          <Button type="button" variant="outline" size="sm" onClick={load} disabled={busy}>
            <RefreshCw aria-hidden="true" /> Refresh
          </Button>
        </div>
      </div>

      {notice && <p className={`rounded-xl p-3 text-sm font-bold ${card}`}>{notice}</p>}

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { label: 'Active today', value: String(overview.activeToday) },
              { label: `Avg mastery (${overview.assessedCount} assessed)`, value: `${overview.avgMastery}%` },
              { label: 'Gates passed this week', value: String(overview.gatesPassed) },
              { label: 'Open flags', value: String(overview.flagged) },
              { label: 'Awaiting retake', value: String(overview.awaitingRetake) },
            ].map((tile) => (
              <div key={tile.label} className={`rounded-xl p-4 ${card}`}>
                <p className={`text-xs font-bold uppercase ${muted}`}>{tile.label}</p>
                <p className="text-2xl font-black">{tile.value}</p>
              </div>
            ))}
          </div>

          <div className={`rounded-xl p-4 ${card}`}>
            <h3 className={`flex items-center gap-2 text-lg font-black ${accent}`}>
              <AlertTriangle className="size-5" aria-hidden="true" /> Needs attention
            </h3>
            {alerts.length === 0 ? (
              <p className={`mt-2 text-sm ${muted}`}>Nothing flagged right now.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {alerts.map((alert) => (
                  <li key={alert.id} className="grid gap-2 rounded-lg bg-black/5 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <div className="min-w-0">
                      <p className="text-sm font-bold">{alert.text}</p>
                      <p className={`text-xs ${muted}`}>Suggested: {alert.action}</p>
                    </div>
                    {alert.studentId && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTab('matrix');
                          setOpenStudent(alert.studentId!);
                        }}
                      >
                        Open student
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* MATRIX */}
      {tab === 'matrix' && (
        <div className="space-y-3">
          <div className={`flex flex-wrap items-center gap-3 rounded-xl p-3 ${card}`}>
            <label className="flex items-center gap-2 text-sm font-bold">
              <Search className="size-4" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find a student"
                className="rounded border px-2 py-1 text-black"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-bold">
              <Filter className="size-4" aria-hidden="true" />
              <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="rounded border px-2 py-1 text-black">
                <option value="name">Name</option>
                <option value="lowest_mastery">Lowest mastery</option>
                <option value="failed_gates">Failed gates</option>
                <option value="flagged">Flagged patterns</option>
                <option value="high_time_low_mastery">High time, low mastery</option>
                <option value="awaiting_retake">Awaiting retake</option>
              </select>
            </label>
          </div>

          <div className={`overflow-x-auto rounded-xl ${card}`}>
            <table className="w-full min-w-max text-sm">
              <thead>
                <tr className="text-left">
                  <th className="sticky left-0 z-10 bg-inherit px-3 py-2">Student</th>
                  {LAUNCHPAD_CHAPTERS.map((chapter) => (
                    <th key={chapter.id} className="px-3 py-2">Ch {chapter.number}</th>
                  ))}
                  <th className="px-3 py-2">XP</th>
                  <th className="px-3 py-2">Mastery</th>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Flags</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((student) => {
                  const mastery = studentMastery(student);
                  const openFlags = student.flags.filter((f) => !f.dismissedAt);
                  return (
                    <tr key={student.userId} className="border-t border-black/10 align-top">
                      <th scope="row" className="sticky left-0 z-10 bg-inherit px-3 py-2 text-left font-bold">{student.name}</th>
                      {LAUNCHPAD_CHAPTERS.map((chapter) => {
                        const status = statusFor(student, `chapter:${chapter.id}`, chapter.id, thresholdFor(student, chapter.id));
                        const score = bestFor(student, `chapter:${chapter.id}`);
                        return (
                          <td key={chapter.id} className="px-3 py-2">
                            <span className="inline-flex flex-col">
                              <span className="font-bold">{tileText(status, score)}</span>
                              <span className={`text-xs ${muted}`}>{STATUS_LABEL[status]}</span>
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 font-bold">{student.xp}</td>
                      <td className="px-3 py-2 font-bold">{mastery.assessed ? `${mastery.percent}%` : '—'}</td>
                      <td className="px-3 py-2">{formatDuration(student.activeSeconds)}</td>
                      <td className="px-3 py-2">
                        {openFlags.length ? (
                          <span className="inline-flex items-center gap-1 font-bold">
                            <ShieldAlert className="size-4" aria-hidden="true" /> {openFlags.length}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setOpenStudent(openStudent === student.userId ? null : student.userId)}
                          aria-expanded={openStudent === student.userId}
                        >
                          Actions
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-black/20 font-bold">
                  <th scope="row" className="sticky left-0 z-10 bg-inherit px-3 py-2 text-left">Class average</th>
                  {LAUNCHPAD_CHAPTERS.map((chapter) => {
                    const scores = rows
                      .map((student) => bestFor(student, `chapter:${chapter.id}`))
                      .filter((value): value is number => value !== null);
                    return (
                      <td key={chapter.id} className="px-3 py-2">
                        {scores.length ? `${Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)}% (${scores.length})` : '—'}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2">
                    {rows.length ? Math.round(rows.reduce((s, r) => s + r.xp, 0) / rows.length) : 0}
                  </td>
                  <td className="px-3 py-2">
                    {rows.filter((r) => studentMastery(r).assessed).length
                      ? `${Math.round(
                          rows.filter((r) => studentMastery(r).assessed).reduce((s, r) => s + studentMastery(r).percent, 0) /
                            rows.filter((r) => studentMastery(r).assessed).length,
                        )}%`
                      : '—'}
                  </td>
                  <td className="px-3 py-2">
                    {formatDuration(rows.length ? Math.round(rows.reduce((s, r) => s + r.activeSeconds, 0) / rows.length) : 0)}
                  </td>
                  <td className="px-3 py-2">{rows.reduce((s, r) => s + r.flags.filter((f) => !f.dismissedAt).length, 0)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

          {/* STUDENT DETAIL + ACTIONS MENU */}
          {openStudent && (() => {
            const student = students.find((s) => s.userId === openStudent);
            if (!student) return null;
            const mastery = studentMastery(student);
            return (
              <div className={`rounded-xl p-4 ${card}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="text-lg font-black">{student.name}</h3>
                  <p className={`text-sm font-bold ${muted}`}>
                    XP {student.xp} · Mastery {mastery.assessed ? `${mastery.percent}%` : 'not assessed'} · Active {formatDuration(student.activeSeconds)} · Idle {formatDuration(student.idleSeconds)}
                  </p>
                </div>

                {student.flags.filter((f) => !f.dismissedAt).map((flag) => (
                  <div key={flag.id} className="mt-2 grid gap-2 rounded-lg bg-black/5 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <p className="text-sm font-bold">
                      {ANOMALY_LABEL[flag.type as keyof typeof ANOMALY_LABEL] ?? flag.type} · {flag.nodeId || 'course'} ·{' '}
                      {new Date(flag.createdAt).toLocaleDateString()}
                    </p>
                    <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => run('Flag cleared.', () => dismissFlag({ data: { flagId: flag.id, note: 'Reviewed with student' } }))}>
                      <Check aria-hidden="true" /> Clear flag
                    </Button>
                  </div>
                ))}

                <div className="mt-3 space-y-3">
                  {LAUNCHPAD_CHAPTERS.map((chapter) => (
                    <div key={chapter.id}>
                      <p className="text-sm font-black">Chapter {chapter.number} — {chapter.title}</p>
                      <ul className={`mt-1 space-y-1 text-sm ${muted}`}>
                        {(MODULES_BY_CHAPTER[chapter.id] ?? []).map((module) => {
                          const attempts = student.attempts.filter((a) => a.assessmentId === `module:${module.id}`);
                          const done = module.sectionIds.filter((id) => student.completedSections.includes(id)).length;
                          const best = bestFor(student, `module:${module.id}`);
                          return (
                            <li key={module.id} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                              <span>
                                Module {module.label} · sections {done}/{module.sectionIds.length} · assessment{' '}
                                {best === null ? 'not attempted' : `${best}% (${attempts.length} attempt${attempts.length === 1 ? '' : 's'})`}
                              </span>
                              <span className="flex flex-wrap gap-1">
                                <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => run('Retake required.', () => setGateState({ data: { studentId: student.userId, nodeId: module.id, state: 'retake_required', reason: 'Teacher requested a retake' } }))}>
                                  <RotateCcw aria-hidden="true" /> Require retake
                                </Button>
                                <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => run('Gate unlocked.', () => setGateState({ data: { studentId: student.userId, nodeId: module.id, state: 'teacher_unlocked', reason: 'Teacher unlocked' } }))}>
                                  <LockOpen aria-hidden="true" /> Unlock
                                </Button>
                              </span>
                            </li>
                          );
                        })}
                        <li className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                          <span>
                            Chapter assessment{' '}
                            {bestFor(student, `chapter:${chapter.id}`) === null
                              ? 'not attempted'
                              : `${bestFor(student, `chapter:${chapter.id}`)}%`}
                          </span>
                          <span className="flex flex-wrap gap-1">
                            <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => run('Retake required.', () => setGateState({ data: { studentId: student.userId, nodeId: chapter.id, state: 'retake_required', reason: 'Teacher requested a retake' } }))}>
                              <RotateCcw aria-hidden="true" /> Require retake
                            </Button>
                            <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => run('Gate unlocked.', () => setGateState({ data: { studentId: student.userId, nodeId: chapter.id, state: 'teacher_unlocked', reason: 'Teacher unlocked' } }))}>
                              <LockOpen aria-hidden="true" /> Unlock
                            </Button>
                            <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => run('Override cleared.', () => setGateState({ data: { studentId: student.userId, nodeId: chapter.id, state: 'clear' } }))}>
                              Clear override
                            </Button>
                          </span>
                        </li>
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setResetFor(student);
                      setScope('chapter');
                      setScopeNode('ch1');
                      setReason('');
                      setRequireRetake(false);
                    }}
                  >
                    <RotateCcw aria-hidden="true" /> Reset XP
                  </Button>
                  <label className="flex items-center gap-2 text-xs font-bold">
                    Passing score for this student
                    <input
                      type="number"
                      min={50}
                      max={100}
                      defaultValue={student.thresholdOverride ?? settings.defaultThreshold}
                      onBlur={(event) =>
                        run('Passing score saved.', () =>
                          setStudentThreshold({ data: { studentId: student.userId, threshold: Number(event.target.value) } }),
                        )
                      }
                      className="w-16 rounded border px-2 py-1 text-black"
                    />
                    %
                  </label>
                  <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => run('Back to the class passing score.', () => setStudentThreshold({ data: { studentId: student.userId, threshold: null } }))}>
                    Use class score
                  </Button>
                </div>

                {student.adminActions.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-bold">Audit trail</p>
                    <ul className={`mt-1 space-y-1 text-xs ${muted}`}>
                      {student.adminActions.map((action) => (
                        <li key={action.id}>
                          {new Date(action.createdAt).toLocaleString()} · {action.action} · {action.scope}
                          {action.nodeId ? ` ${action.nodeId}` : ''} · {action.xpRemoved} XP · {action.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* MASTERY / ITEM ANALYSIS */}
      {tab === 'mastery' && (
        <div className={`rounded-xl p-4 ${card}`}>
          <h3 className="text-lg font-black">Item analysis</h3>
          <p className={`text-sm ${muted}`}>Percent correct across every recorded attempt, weakest questions first.</p>
          {itemAnalysis.length === 0 ? (
            <p className={`mt-3 text-sm ${muted}`}>No assessment attempts yet.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-max text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="px-3 py-2">Question</th>
                    <th className="px-3 py-2">Concept</th>
                    <th className="px-3 py-2">Correct</th>
                    <th className="px-3 py-2">Attempts</th>
                    <th className="px-3 py-2">Missed by</th>
                  </tr>
                </thead>
                <tbody>
                  {itemAnalysis.map((item) => (
                    <tr key={item.id} className="border-t border-black/10 align-top">
                      <td className="max-w-md px-3 py-2">{item.stem}</td>
                      <td className="px-3 py-2 font-bold">{item.concept}</td>
                      <td className="px-3 py-2 font-bold">{item.percent}%</td>
                      <td className="px-3 py-2">{item.total}</td>
                      <td className="px-3 py-2">{item.missedBy.join(', ') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ENGAGEMENT */}
      {tab === 'engagement' && (
        <div className="space-y-4">
          <div className={`overflow-x-auto rounded-xl p-4 ${card}`}>
            <h3 className="text-lg font-black">Active vs idle time</h3>
            <table className="mt-3 w-full min-w-max text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-3 py-2">Student</th>
                  <th className="px-3 py-2">Active</th>
                  <th className="px-3 py-2">Idle</th>
                  <th className="px-3 py-2">Sections done</th>
                  <th className="px-3 py-2">Mastery</th>
                  <th className="px-3 py-2">Pattern</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const mastery = studentMastery(student);
                  const pattern =
                    student.activeSeconds > 3600 && mastery.assessed && mastery.percent < 60
                      ? 'High time, low mastery'
                      : student.flags.some((f) => !f.dismissedAt && f.type === 'rapid_click')
                        ? 'Rapid clicking'
                        : student.attempts.some((a) => a.lowEffort)
                          ? 'Fast answers'
                          : '—';
                  return (
                    <tr key={student.userId} className="border-t border-black/10">
                      <th scope="row" className="px-3 py-2 text-left font-bold">{student.name}</th>
                      <td className="px-3 py-2">{formatDuration(student.activeSeconds)}</td>
                      <td className="px-3 py-2">{formatDuration(student.idleSeconds)}</td>
                      <td className="px-3 py-2">{student.sectionsDone}</td>
                      <td className="px-3 py-2">{mastery.assessed ? `${mastery.percent}%` : '—'}</td>
                      <td className="px-3 py-2 font-bold">{pattern}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={`rounded-xl p-4 ${card}`}>
            <h3 className="text-lg font-black">Flagged patterns</h3>
            <p className={`text-sm ${muted}`}>Patterns to look at — not accusations. Clear one once you have talked it through.</p>
            <ul className="mt-3 space-y-2">
              {students.flatMap((student) =>
                student.flags
                  .filter((flag) => !flag.dismissedAt)
                  .map((flag) => (
                    <li key={flag.id} className="grid gap-2 rounded-lg bg-black/5 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                      <p className="text-sm font-bold">
                        {student.name} · {ANOMALY_LABEL[flag.type as keyof typeof ANOMALY_LABEL] ?? flag.type} ·{' '}
                        {flag.nodeId || 'course'} · {new Date(flag.createdAt).toLocaleString()}
                      </p>
                      <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => run('Flag cleared.', () => dismissFlag({ data: { flagId: flag.id, note: 'Reviewed' } }))}>
                        Clear
                      </Button>
                    </li>
                  )),
              )}
              {students.every((student) => student.flags.every((flag) => flag.dismissedAt)) && (
                <li className={`text-sm ${muted}`}>No open flags.</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* XP RESET DIALOG */}
      {resetFor && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Reset XP">
          <div className={`w-full max-w-lg rounded-2xl p-5 ${card}`}>
            <h3 className="text-lg font-black">Reset XP — {resetFor.name}</h3>
            <fieldset className="mt-3 space-y-2">
              <legend className="text-sm font-bold">Scope</legend>
              {(['all', 'chapter', 'module'] as const).map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm font-semibold">
                  <input type="radio" name="scope" checked={scope === option} onChange={() => setScope(option)} />
                  {option === 'all' ? 'All XP' : option === 'chapter' ? 'One chapter' : 'One module'}
                </label>
              ))}
            </fieldset>

            {scope !== 'all' && (
              <label className="mt-3 block text-sm font-bold">
                {scope === 'chapter' ? 'Chapter' : 'Module'}
                <select value={scopeNode} onChange={(event) => setScopeNode(event.target.value)} className="mt-1 w-full rounded border px-2 py-2 text-black">
                  {scope === 'chapter'
                    ? LAUNCHPAD_CHAPTERS.map((chapter) => (
                        <option key={chapter.id} value={chapter.id}>
                          Chapter {chapter.number} — {chapter.title}
                        </option>
                      ))
                    : CURRICULUM_MODULES.map((module) => (
                        <option key={module.id} value={module.id}>
                          Module {module.label} — {module.title}
                        </option>
                      ))}
                </select>
              </label>
            )}

            <label className="mt-3 block text-sm font-bold">
              Reason (required)
              <input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="e.g. XP farmed by re-clicking sections"
                className="mt-1 w-full rounded border px-2 py-2 text-black"
              />
            </label>

            <label className="mt-3 flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={requireRetake} onChange={(event) => setRequireRetake(event.target.checked)} />
              Also require a retake of this assessment
            </label>

            <p className={`mt-3 text-xs ${muted}`}>
              Mastery scores and every past attempt stay exactly as they are. The student sees this reset and your reason.
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setResetFor(null)}>Cancel</Button>
              <Button
                type="button"
                disabled={busy || reason.trim().length < 3}
                onClick={async () => {
                  const student = resetFor;
                  await run('XP reset recorded.', async () => {
                    const result = await resetStudentXp({
                      data: {
                        studentId: student.userId,
                        scope,
                        nodeId: scope === 'all' ? '' : scopeNode,
                        reason,
                        requireRetake,
                      },
                    });
                    setNotice(`Removed ${result.xpRemoved} XP from ${student.name}. New total: ${result.newTotal} XP.`);
                  });
                  setResetFor(null);
                }}
              >
                Reset XP
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
