import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, Check, ExternalLink, FileUp, Loader2, Sparkles, Trash2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { parseAssignmentDate, groupAssignmentWeeks } from '@/lib/assignment-weeks';
import { renderLessonHtml, type LessonSpec } from '@/lib/lesson-render';
import { structureLesson } from '@/lib/lesson-upload.functions';
import { formatLessonDate, LESSON_BUCKET, lessonTab, useAssignments } from '@/hooks/useAssignments';

type Draft = { file: File; text: string; links: string[]; pages: number };

const KIND_LABEL = { current: 'This Week', upcoming: 'Coming Up', last: 'Last Week (Prior Assignments)', prior: 'Prior Assignments' } as const;

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

async function readPdf(file: File): Promise<Draft> {
  const { getDocumentProxy, extractText } = await import('unpdf');
  const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()));
  const { text } = await extractText(pdf, { mergePages: false });
  const links = new Set<string>();
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    for (const a of await page.getAnnotations()) if (typeof a.url === 'string' && /^https?:/i.test(a.url)) links.add(a.url);
  }
  const pages = Array.isArray(text) ? text : [text];
  return { file, text: pages.map((t, i) => `--- PAGE ${i + 1} ---\n${t}`).join('\n\n'), links: [...links], pages: pdf.numPages };
}

export default function LessonUploader({ highContrast: hc, onOpenLesson }: { highContrast: boolean; onOpenLesson?: ((tab: string) => void) | undefined }) {
  const { entries, reload } = useAssignments();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [date, setDate] = useState('');
  const [until, setUntil] = useState('');
  const [dateFound, setDateFound] = useState(false);
  const [spec, setSpec] = useState<LessonSpec | null>(null);
  const [focus, setFocus] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState<'' | 'reading' | 'building' | 'publishing'>('');
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState<{ title: string; tab: string } | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const card = hc ? 'bg-zinc-900 border-2 border-yellow-400 text-white' : 'bg-white border border-[#414042]/12 text-[#414042]';
  const muted = hc ? 'text-yellow-200' : 'text-[#414042]/70';
  const btn = `inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 ${hc ? 'bg-yellow-400 text-black' : 'bg-[#C51C63] text-white hover:bg-[#C51C63]/90'}`;
  const ghost = `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold ${hc ? 'border-2 border-yellow-400 text-yellow-200' : 'border border-[#414042]/25 text-[#414042] hover:bg-[#414042]/5'}`;
  const input = `w-full px-3 py-2 rounded-lg text-sm outline-none ${hc ? 'bg-black border-2 border-yellow-400 text-yellow-100' : 'bg-white border border-[#414042]/25 text-[#414042]'}`;

  const dateText = date ? formatLessonDate(date) : '';
  const week = useMemo(() => {
    if (!date) return null;
    return groupAssignmentWeeks([{ d: new Date(`${date}T00:00:00Z`) }], (x) => x.d).find((w) => w.items.length > 0) ?? null;
  }, [date]);
  const previewHtml = useMemo(() => (spec && dateText ? renderLessonHtml(spec, dateText) : ''), [spec, dateText]);
  const uploads = entries.filter((e) => e.uploaded);

  const reset = () => { setDraft(null); setSpec(null); setDate(''); setUntil(''); setFocus(''); setDescription(''); setError(null); };

  async function onFile(file: File | undefined) {
    if (!file) return;
    reset(); setPublished(null);
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) { setError('Please choose a PDF file.'); return; }
    setBusy('reading');
    try {
      const d = await readPdf(file);
      setDraft(d);
      const found = parseAssignmentDate(d.text);
      setDateFound(!!found);
      if (found) setDate(found.toISOString().slice(0, 10));
      if (d.text.replace(/--- PAGE \d+ ---/g, '').trim().length < 40) setError('This PDF has almost no readable text (it may be a scanned image), so the page cannot be built from it.');
    } catch {
      setError('That PDF could not be read. Try exporting it again as a PDF.');
    } finally { setBusy(''); }
  }

  async function build() {
    if (!draft) return;
    setBusy('building'); setError(null);
    try {
      const r = await structureLesson({ data: { text: draft.text.slice(0, 80_000), links: draft.links } });
      setSpec(r.spec); setFocus(r.focus); setDescription(r.description);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The assignment page could not be built.');
    } finally { setBusy(''); }
  }

  async function publish() {
    if (!draft || !spec || !date) return;
    setBusy('publishing'); setError(null);
    try {
      const base = slugify(`${spec.title}-${date}`) || `lesson-${date}`;
      const taken = new Set(uploads.map((u) => u.uploaded!.slug));
      let slug = base; let n = 2;
      while (taken.has(slug)) slug = `${base}-${n++}`;
      const pdfPath = `${slug}.pdf`;
      const up = await supabase.storage.from(LESSON_BUCKET).upload(pdfPath, draft.file, { contentType: 'application/pdf', upsert: true });
      if (up.error) throw new Error('The PDF could not be uploaded.');
      const { data: { user } } = await supabase.auth.getUser();
      const { error: insErr } = await supabase.from('lesson_upload').insert({
        slug, title: spec.title, lesson_date: date, until_date: until || null, focus, description,
        spec: spec as never, html: renderLessonHtml(spec, dateText), pdf_path: pdfPath,
        pdf_name: `${spec.title.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '')}-Student-Guide.pdf`, created_by: user?.id ?? null,
      });
      if (insErr) throw new Error('The assignment page could not be saved.');
      await reload();
      setPublished({ title: spec.title, tab: lessonTab(slug) });
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publishing failed.');
    } finally { setBusy(''); }
  }

  async function remove(id: string, pdfPath: string) {
    setBusy('publishing'); setError(null);
    const { error: delErr } = await supabase.from('lesson_upload').delete().eq('id', id);
    if (!delErr && pdfPath) await supabase.storage.from(LESSON_BUCKET).remove([pdfPath]);
    if (delErr) setError('That lesson could not be removed.');
    setRemoving(null);
    await reload();
    setBusy('');
  }

  return (
    <div className="space-y-4">
      <div className={`rounded-xl p-5 ${card}`}>
        <h3 className="text-lg font-bold flex items-center gap-2"><FileUp className="w-5 h-5" /> Upload a Lesson PDF</h3>
        <p className={`text-sm mt-1 ${muted}`}>Choose a lesson PDF. The date is read from its title or header, the assignment page is built from its text, and it is placed in the right week on the Assignments page. Students can submit it and view the PDF.</p>
        <label className={`mt-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 cursor-pointer text-sm font-bold ${hc ? 'border-yellow-400 text-yellow-200' : 'border-[#C51C63]/40 text-[#414042] hover:bg-[#C51C63]/5'}`}>
          {busy === 'reading' ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
          {busy === 'reading' ? 'Reading the PDF…' : draft ? `${draft.file.name} · ${draft.pages} pages — choose another` : 'Click to choose a lesson PDF'}
          <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }} />
        </label>

        {error && <p className={`mt-3 text-sm font-bold flex items-start gap-2 ${hc ? 'text-yellow-300' : 'text-[#E94928]'}`}><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}</p>}

        {published && (
          <div className={`mt-3 rounded-lg p-3 text-sm flex flex-wrap items-center gap-3 ${hc ? 'bg-black border-2 border-yellow-400' : 'bg-[#C51C63]/10 border border-[#C51C63]/30'}`}>
            <Check className="w-4 h-4" /> <b>{published.title}</b> is now on the Assignments page.
            {onOpenLesson && <button onClick={() => onOpenLesson(published.tab)} className={ghost}><ExternalLink className="w-4 h-4" /> Open it</button>}
          </div>
        )}

        {draft && (
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <label className="text-sm font-bold">Lesson date{dateFound ? ' (found in the PDF)' : ''}
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`mt-1 ${input}`} />
              {!dateFound && <span className={`block mt-1 text-xs font-normal ${hc ? 'text-yellow-300' : 'text-[#E94928]'}`}>No date was found in the PDF — please pick one.</span>}
            </label>
            <label className="text-sm font-bold">Last day (optional, for multi-day assignments)
              <input type="date" value={until} min={date} onChange={(e) => setUntil(e.target.value)} className={`mt-1 ${input}`} />
            </label>
            {week && (
              <p className={`sm:col-span-2 text-sm flex items-center gap-2 ${muted}`}>
                <CalendarDays className="w-4 h-4" /> {dateText} → <b className={hc ? 'text-yellow-300' : 'text-[#C51C63]'}>{KIND_LABEL[week.kind]}</b> · {week.range}
              </p>
            )}
          </div>
        )}

        {draft && !spec && (
          <button onClick={build} disabled={!!busy || !date} className={`mt-4 ${btn}`}>
            {busy === 'building' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {busy === 'building' ? 'Building the assignment page… (about 30–60 seconds)' : 'Build assignment page'}
          </button>
        )}
      </div>

      {spec && draft && (
        <div className={`rounded-xl p-5 space-y-3 ${card}`}>
          <h3 className="text-lg font-bold">Check Before Publishing</h3>
          <label className="block text-sm font-bold">Title<input value={spec.title} onChange={(e) => setSpec({ ...spec, title: e.target.value })} className={`mt-1 ${input}`} /></label>
          <label className="block text-sm font-bold">Topic label on the card<input value={focus} onChange={(e) => setFocus(e.target.value)} className={`mt-1 ${input}`} /></label>
          <label className="block text-sm font-bold">Card description<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`mt-1 ${input}`} /></label>
          <p className={`text-xs ${muted}`}>Preview of the student page (Submit to Pietro and Print / Save as PDF buttons are added automatically):</p>
          <iframe title="Lesson preview" srcDoc={previewHtml} sandbox="" className="w-full rounded-xl bg-white border border-[#414042]/15" style={{ height: '70vh' }} />
          <div className="flex flex-wrap gap-2">
            <button onClick={publish} disabled={!!busy || !date || !spec.title.trim()} className={btn}>
              {busy === 'publishing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Publish to Assignments
            </button>
            <button onClick={build} disabled={!!busy} className={ghost}><Sparkles className="w-4 h-4" /> Rebuild</button>
            <button onClick={reset} disabled={!!busy} className={ghost}>Cancel</button>
          </div>
        </div>
      )}

      <div className={`rounded-xl p-5 ${card}`}>
        <h3 className="text-lg font-bold">Uploaded Lessons</h3>
        {uploads.length === 0 ? <p className={`text-sm mt-1 ${muted}`}>No lessons uploaded here yet.</p> : (
          <ul className="mt-2 divide-y divide-[#414042]/10">
            {uploads.map((u) => (
              <li key={u.key} className="py-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-bold">{u.title}</span><span className={muted}>{u.date}</span>
                <span className="ml-auto flex gap-2">
                  {onOpenLesson && <button onClick={() => onOpenLesson(u.tab)} className={ghost}><ExternalLink className="w-4 h-4" /> Open</button>}
                  {removing === u.key ? (
                    <>
                      <button onClick={() => remove(u.uploaded!.id, u.uploaded!.pdfPath)} disabled={!!busy} className={btn}><Trash2 className="w-4 h-4" /> Yes, remove</button>
                      <button onClick={() => setRemoving(null)} className={ghost}>Cancel</button>
                    </>
                  ) : <button onClick={() => setRemoving(u.key)} className={ghost}><Trash2 className="w-4 h-4" /> Remove</button>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
