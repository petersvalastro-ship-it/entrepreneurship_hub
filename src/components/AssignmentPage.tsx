import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, FileDown, Sparkles, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { withAutosave } from '@/lib/assignment-autosave';
import type { AssignmentEntry } from '@/hooks/useAssignments';

import { assignmentWorth, earnedXp, formatDuration, xpToAward } from '@/lib/assignment-xp';

function fmt(ts: string) {
  return new Date(ts).toLocaleString([], { weekday: 'long', hour: 'numeric', minute: '2-digit' });
}

type Sent = { at: string; count: number; xp: number; earned: number; worth: number; seconds: number };

/** Days a lesson spans (1 for single-day). */
function lessonDays(entry: AssignmentEntry): number {
  if (!entry.until) return 1;
  const end = new Date(entry.until);
  if (isNaN(end.getTime())) return 1;
  const diff = Math.round((end.getTime() - entry.dateObj.getTime()) / 86_400_000);
  return Math.max(1, Math.min(5, diff + 1));
}

/** Text answer boxes, and how many of them hold real answers. */
function countAnswers(answers: Record<string, unknown>) {
  const texts = Object.values(answers).filter((v) => typeof v === 'string') as string[];
  return { fields: texts.length, answered: texts.filter((t) => t.trim().length >= 3).length };
}

export default function AssignmentPage({ highContrast, onBack, onNeedSignIn, onEarnXp, entry }: { highContrast: boolean; onBack?: () => void; onNeedSignIn?: () => void; onEarnXp?: (xp: number) => void; entry: AssignmentEntry }) {
  const { key: assignment, title, html, pdfUrl, pdfName } = entry;
  const frame = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<string>('');
  const [sent, setSent] = useState<Sent | null>(null);

  const days = lessonDays(entry);
  const [worth, setWorth] = useState(() => assignmentWorth(0, days));
  const priorSeconds = useRef(0);
  const pending = useRef(0);
  const [seconds, setSeconds] = useState(0);

  // Active time: counts a second only while the page is visible and the student interacted in the last 60 seconds.
  useEffect(() => {
    let last = Date.now();
    const poke = () => { last = Date.now(); };
    let doc: Document | null = null;
    const attach = () => {
      doc = frame.current?.contentDocument ?? null;
      if (!doc) return;
      ['input', 'keydown', 'pointerdown', 'scroll', 'mousemove'].forEach((t) => doc!.addEventListener(t, poke, { passive: true, capture: true }));
      const n = doc.querySelectorAll('textarea, input[type=text], input:not([type])').length;
      setWorth(assignmentWorth(n, days));
    };
    const f = frame.current;
    f?.addEventListener('load', attach);
    attach();
    window.addEventListener('pointerdown', poke);
    const flush = async () => {
      const secs = pending.current;
      if (secs < 5) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      pending.current -= secs;
      const now = new Date();
      await supabase.from('engagement_session').insert({ student_id: session.user.id, node_id: assignment, active_seconds: secs, started_at: new Date(now.getTime() - secs * 1000).toISOString(), ended_at: now.toISOString() });
    };
    const tick = setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - last < 60_000) { pending.current += 1; setSeconds((s) => s + 1); }
    }, 1000);
    const saver = setInterval(flush, 30_000);
    const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      clearInterval(tick); clearInterval(saver); flush();
      f?.removeEventListener('load', attach);
      window.removeEventListener('pointerdown', poke);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [assignment, days]);

  const secondsRef = useRef(0);
  secondsRef.current = seconds;
  const tell = (text: string) => { setStatus(text); frame.current?.contentWindow?.postMessage({ type: 'neia-submit-status', text }, '*'); };

  // Show the student's existing submission status.
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: rows } = await supabase.from('engagement_session').select('active_seconds').eq('student_id', session.user.id).eq('node_id', assignment);
      priorSeconds.current = (rows ?? []).reduce((a, r) => a + (r.active_seconds || 0), 0);
      if (alive) setSeconds((s) => s + priorSeconds.current);
      const { data } = await supabase.from('assignment_submission').select('submitted_at, submit_count').eq('student_id', session.user.id).eq('assignment_key', assignment).maybeSingle();
      if (alive && data) setStatus(`Submitted ${fmt(data.submitted_at)} ✓`);
    })();
    return () => { alive = false; };
  }, [assignment]);

  useEffect(() => {
    async function onMsg(e: MessageEvent) {
      if (e.source !== frame.current?.contentWindow || e.data?.type !== 'neia-submit') return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { tell('Sign in to your student account to submit — your work is saved.'); onNeedSignIn?.(); return; }
      const { data, error } = await supabase.from('assignment_submission')
        .upsert({ student_id: session.user.id, assignment_key: assignment, assignment_title: title, answers: e.data.answers ?? {} }, { onConflict: 'student_id,assignment_key' })
        .select('submitted_at, submit_count').single();
      if (error || !data) { tell('Could not submit — please try again, or use Print / Save as PDF.'); return; }
      const { fields, answered } = countAnswers(e.data.answers ?? {});
      const earned = earnedXp(worth, answered, fields);
      const { data: led } = await supabase.from('xp_ledger').select('xp_delta').eq('student_id', session.user.id).eq('node_id', assignment).eq('event_type', 'assignment_submit');
      const already = (led ?? []).reduce((a, r) => a + (r.xp_delta || 0), 0);
      const xp = xpToAward(earned, already);
      if (xp > 0) {
        onEarnXp?.(xp);
        await supabase.from('xp_ledger').insert({ student_id: session.user.id, node_id: assignment, event_type: 'assignment_submit', xp_delta: xp });
      }
      tell(`${data.submit_count > 1 ? 'Resubmitted' : 'Submitted'} ${fmt(data.submitted_at)} ✓`);
      setSent({ at: data.submitted_at, count: data.submit_count, xp, earned: Math.max(earned, already), worth, seconds: secondsRef.current });
    }
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [assignment, title, onNeedSignIn, onEarnXp, worth]);

  return (
    <div className="space-y-4">
      {onBack && (
        <button
          onClick={onBack}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
            highContrast
              ? 'bg-yellow-400 text-black border-2 border-white'
              : 'bg-white border border-[#414042]/15 shadow-sm text-[#414042] hover:bg-[#414042]/5'
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Assignments
        </button>
      )}
      <h2 className={`text-2xl font-bold ${highContrast ? 'text-yellow-300' : 'text-[#414042]'}`}>{title}</h2>
      {pdfUrl && (
        <div className={`flex flex-wrap items-center gap-3 rounded-xl p-3 text-sm ${highContrast ? 'bg-black border-2 border-yellow-400 text-white' : 'bg-[#E94928]/10 border border-[#E94928]/35 text-[#414042]'}`}>
          <FileDown className={`w-5 h-5 shrink-0 ${highContrast ? 'text-yellow-300' : 'text-[#E94928]'}`} />
          <span>Prefer to read it on paper? The full student guide is also available as a PDF.</span>
          <a href={pdfUrl} target="_blank" rel="noreferrer" download={pdfName}
            className={`ml-auto inline-block px-4 py-2 rounded-xl font-bold ${highContrast ? 'bg-yellow-400 text-black' : 'bg-[#E94928] text-white hover:bg-[#E94928]/90'}`}>
            View / Download PDF
          </a>
        </div>
      )}
      <div className={`rounded-xl p-4 text-sm ${highContrast ? 'bg-black border-2 border-yellow-400 text-white' : 'bg-[#EFA835]/15 border border-[#EFA835]/40 text-[#414042]'}`}>
        <p className="font-bold">How to turn this in:</p>
        <ol className="list-decimal ml-5 mt-1 space-y-0.5">
          <li>Sign in to your student account, then fill out every part of the assignment below — your answers save as you type.</li>
          <li>Click <b>Submit to Pietro</b>. Your work goes straight to your teacher and this assignment is worth up to <b>{worth} XP</b> — longer assignments are worth more. You earn XP for the answers you actually fill in; submitting again with more answers earns the rest.</li>
          <li>Backup: click <b>Print / Save as PDF</b> and email the PDF if submitting doesn't work.</li>
        </ol>
        <p className="mt-2 text-xs opacity-75">Time spent working on this assignment: <b>{formatDuration(seconds)}</b> (counts only while you're active on the page).</p>
        {status && <p className={`mt-2 font-bold ${highContrast ? 'text-yellow-300' : 'text-[#61249a]'}`}>{status}</p>}
      </div>
      <iframe
        ref={frame}
        title={`${title} Assignment`}
        srcDoc={withAutosave(html, assignment, title)}
        sandbox="allow-scripts allow-forms allow-modals allow-same-origin allow-popups allow-downloads"
        className={`w-full rounded-2xl bg-white ${highContrast ? 'border-2 border-yellow-400' : 'border border-[#414042]/15 shadow-md'}`}
        style={{ height: '85vh', minHeight: 700 }}
      />

      {sent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="sent-title" onClick={() => setSent(null)}>
          <div onClick={(e) => e.stopPropagation()} className={`relative w-full max-w-md rounded-3xl p-7 text-center shadow-2xl ${highContrast ? 'bg-black border-2 border-yellow-400 text-white' : 'bg-white text-[#414042]'`}>
            <button onClick={() => setSent(null)} aria-label="Close" className="absolute top-3 right-3 p-2 rounded-full hover:bg-black/5"><X className="w-5 h-5" /></button>
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${highContrast ? 'bg-yellow-400 text-black' : 'bg-[#C51C63] text-white'} animate-[pulse_1.2s_ease-in-out_1]`}>
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 id="sent-title" className="mt-4 text-2xl font-extrabold">{sent.count > 1 ? 'Resubmitted to Pietro!' : 'Sent to Pietro!'}</h3>
            <p className={`mt-2 text-sm ${highContrast ? 'text-white/85' : 'text-[#414042]/75'}`}>
              <b>{title}</b> was delivered to your teacher {fmt(sent.at)}.
            </p>
            <p className={`mt-2 text-xs ${highContrast ? 'text-white/70' : 'text-[#414042]/60'}`}>XP for this assignment: {sent.earned} of {sent.worth} · Time spent: {formatDuration(sent.seconds)}</p>
            {sent.xp > 0 ? (
              <p className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold ${highContrast ? 'bg-yellow-400 text-black' : 'bg-[#EFA835] text-[#414042]'}`}>
                <Sparkles className="w-4 h-4" /> +{sent.xp} XP earned
              </p>
            ) : (
              <p className={`mt-4 text-xs ${highContrast ? 'text-white/70' : 'text-[#414042]/60'}`}>No new XP this time — you already earned XP for these answers. Your updated work replaced the earlier version.</p>
            )}
            <button onClick={() => setSent(null)} className={`mt-6 w-full px-4 py-3 rounded-xl font-bold ${highContrast ? 'bg-yellow-400 text-black' : 'bg-[#C51C63] text-white hover:bg-[#C51C63]/90'}`}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
