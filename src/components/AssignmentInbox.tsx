import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, Check, Inbox, Printer, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { withAutosave } from '@/lib/assignment-autosave';
import { groupAssignmentWeeks } from '@/lib/assignment-weeks';
import { useAssignments } from '@/hooks/useAssignments';
import { formatDuration } from '@/lib/assignment-xp';

const WEEK_LABEL = { upcoming: 'Coming Up', current: 'This Week', last: 'Last Week', prior: 'Prior Week' } as const;
import type { StudentRow } from '@/lib/teacher.functions';

type Sub = { id: string; student_id: string; assignment_key: string; answers: Record<string, unknown>; submit_count: number; submitted_at: string; reviewed_at: string | null; teacher_note: string };

const when = (ts: string) => new Date(ts).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export default function AssignmentInbox({ highContrast: hc, roster, onNewCount }: { highContrast: boolean; roster: StudentRow[]; onNewCount?: (n: number) => void }) {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Sub | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [frameEl, setFrameEl] = useState<HTMLIFrameElement | null>(null);
  const { entries, byKey } = useAssignments();
  const weeks = useMemo(() => groupAssignmentWeeks(entries, (e) => e.dateObj).filter((w) => w.items.length > 0), [entries]);

  const [xpBy, setXpBy] = useState<Record<string, number>>({});
  const [timeBy, setTimeBy] = useState<Record<string, number>>({});
  async function load() {
    setLoading(true); setError(null);
    const [{ data: led }, { data: eng }] = await Promise.all([
      supabase.from('xp_ledger').select('student_id, node_id, xp_delta').eq('event_type', 'assignment_submit'),
      supabase.from('engagement_session').select('student_id, node_id, active_seconds'),
    ]);
    const x: Record<string, number> = {}; for (const r of led ?? []) { const k = `${r.student_id}|${r.node_id}`; x[k] = (x[k] ?? 0) + (r.xp_delta || 0); }
    const t: Record<string, number> = {}; for (const r of eng ?? []) { const k = `${r.student_id}|${r.node_id}`; t[k] = (t[k] ?? 0) + (r.active_seconds || 0); }
    setXpBy(x); setTimeBy(t);
    const { data, error } = await supabase.from('assignment_submission').select('id, student_id, assignment_key, answers, submit_count, submitted_at, reviewed_at, teacher_note').order('submitted_at', { ascending: false });
    if (error) setError('Could not load submissions.'); else setSubs((data ?? []) as Sub[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);
  useEffect(() => { onNewCount?.(subs.filter((s) => !s.reviewed_at).length); }, [subs, onNewCount]);

  const names = useMemo(() => new Map(roster.map((r) => [r.userId, r])), [roster]);
  const nameOf = (id: string) => names.get(id)?.name || names.get(id)?.email || 'Student';

  async function markReviewed(s: Sub, reviewed: boolean) {
    setSaving(true);
    const patch = { reviewed_at: reviewed ? new Date().toISOString() : null, teacher_note: note };
    const { error } = await supabase.from('assignment_submission').update(patch).eq('id', s.id);
    setSaving(false);
    if (error) { setError('Could not save review.'); return; }
    const next = { ...s, ...patch };
    setSubs((all) => all.map((x) => (x.id === s.id ? next : x)));
    setOpen(next);
  }

  const card = hc ? 'bg-zinc-900 border-2 border-yellow-400 text-white' : 'bg-white border border-[#414042]/15 shadow-sm text-[#414042]';
  const btn = hc ? 'bg-yellow-400 text-black' : 'bg-[#C51C63] text-white hover:bg-[#C51C63]/90';
  const ghost = hc ? 'border-2 border-yellow-400 text-yellow-200' : 'border border-[#414042]/20 text-[#414042] hover:bg-[#414042]/5';

  if (open) {
    const doc = byKey(open.assignment_key);
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setOpen(null)} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${ghost}`}><ArrowLeft className="w-4 h-4" /> Back to Inbox</button>
          <button onClick={() => frameEl?.contentWindow?.print()} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${ghost}`}><Printer className="w-4 h-4" /> Print / Save as PDF</button>
        </div>
        <div className={`rounded-2xl p-4 ${card}`}>
          <h3 className="text-lg font-bold">{nameOf(open.student_id)} · {doc?.title ?? open.assignment_key}</h3>
          <p className="text-sm opacity-80">{open.submit_count > 1 ? `Resubmitted (${open.submit_count} times)` : 'Submitted'} {when(open.submitted_at)}{open.reviewed_at ? ` · Reviewed ${when(open.reviewed_at)}` : ''}</p>
          <label className="block mt-3 text-sm font-bold" htmlFor="inbox-note">Private note (only you see this)</label>
          <textarea id="inbox-note" value={note} onChange={(e) => setNote(e.target.value)} className={`mt-1 w-full rounded-xl p-2 text-sm ${hc ? 'bg-black border-2 border-yellow-400 text-white' : 'border border-[#414042]/20'}`} rows={2} />
          <div className="mt-2 flex gap-2">
            <button disabled={saving} onClick={() => markReviewed(open, true)} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${btn}`}><Check className="w-4 h-4" /> {open.reviewed_at ? 'Save note' : 'Mark as reviewed'}</button>
            {open.reviewed_at && <button disabled={saving} onClick={() => markReviewed(open, false)} className={`px-4 py-2 rounded-xl text-sm font-bold ${ghost}`}>Mark as new</button>}
          </div>
        </div>
        {doc ? (
          <iframe ref={setFrameEl} title="Student submission" srcDoc={withAutosave(doc.html, open.assignment_key, doc.title, open.answers)} sandbox="allow-scripts allow-same-origin allow-modals"
            className="w-full rounded-2xl bg-white border border-[#414042]/15" style={{ height: '85vh', minHeight: 700 }} />
        ) : <p>This assignment is no longer on the site.</p>}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <h3 className={`text-xl font-bold flex items-center gap-2 ${hc ? 'text-yellow-300' : 'text-[#414042]'}`}><Inbox className="w-5 h-5" /> Assignment Inbox</h3>
        <button onClick={load} className={`ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${ghost}`}><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>
      {error && <p className="text-sm font-bold text-[#C51C63]">{error}</p>}
      {loading ? <p className="text-sm opacity-70">Loading submissions…</p> : weeks.map((w) => (
        <section key={w.key} className="space-y-3">
          <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ${w.kind === 'current' ? (hc ? 'bg-yellow-400 text-black' : 'bg-[#C51C63] text-white') : (hc ? 'bg-zinc-800 text-white' : 'bg-[#414042]/10 text-[#414042]')}`}>
            <CalendarDays className="w-5 h-5" /><div><p className="font-extrabold">{WEEK_LABEL[w.kind]}</p><p className="text-xs font-semibold opacity-90">{w.range}</p></div>
          </div>
          {w.items.map((d) => {
            const key = d.key;
            const list = subs.filter((s) => s.assignment_key === key);
            const done = new Set(list.map((s) => s.student_id));
            const missing = roster.filter((r) => !done.has(r.userId));
            return (
              <div key={key} className={`rounded-2xl p-4 ${card}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold">{d.title}</h4>
                  <span className="ml-auto text-xs font-bold opacity-80">{list.length} submitted · {missing.length} not yet</span>
                </div>
                {list.length === 0 ? <p className="mt-2 text-sm opacity-70">No submissions yet.</p> : (
                  <ul className="mt-2 divide-y divide-[#414042]/10">
                    {list.map((s) => (
                      <li key={s.id}>
                        <button onClick={() => { setOpen(s); setNote(s.teacher_note); }} className="w-full flex flex-wrap items-center gap-2 py-2 text-left text-sm hover:opacity-80">
                          <span className="font-bold">{nameOf(s.student_id)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${hc ? 'bg-yellow-400/20 text-yellow-200' : 'bg-[#C51C63]/10 text-[#C51C63]'}`}>+{xpBy[`${s.student_id}|${s.assignment_key}`] ?? 0} XP</span>
                          <span className="text-xs font-bold opacity-80">⏱ {formatDuration(timeBy[`${s.student_id}|${s.assignment_key}`] ?? 0)}</span>
                          <span className="opacity-70">{when(s.submitted_at)}{s.submit_count > 1 ? ` · resubmitted ×${s.submit_count}` : ''}</span>
                          <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${s.reviewed_at ? (hc ? 'bg-white/20' : 'bg-[#414042]/10') : (hc ? 'bg-yellow-400 text-black' : 'bg-[#EFA835] text-[#414042]')}`}>{s.reviewed_at ? 'Reviewed' : 'New'}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {missing.length > 0 && <p className="mt-2 text-xs opacity-70">Not yet submitted: {missing.map((r) => r.name || r.email).join(', ')}</p>}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
