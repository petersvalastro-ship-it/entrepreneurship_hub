import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ASSIGNMENT_DOCS, ASSIGNMENT_KEYS, assignmentDate } from '@/lib/assignment-docs';
import type { LessonSpec } from '@/lib/lesson-render';

/** One assignment, whether hand-built in the code or uploaded by the teacher. */
export type AssignmentEntry = {
  key: string;
  tab: string;
  path: string;
  title: string;
  date: string;
  until?: string | undefined;
  dateObj: Date;
  focus: string;
  description: string;
  html: string;
  pdfUrl: string;
  pdfName: string;
  uploaded?: { id: string; slug: string; pdfPath: string; spec: LessonSpec };
};

export const LESSON_BUCKET = 'lesson-pdfs';
export const lessonKey = (slug: string) => `lesson-${slug}`;
export const lessonTab = (slug: string) => `lesson:${slug}`;
export const lessonPath = (slug: string) => `/learning/assignments/lesson/${slug}`;

export function formatLessonDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

const STATIC: AssignmentEntry[] = ASSIGNMENT_KEYS.map((k) => {
  const d = ASSIGNMENT_DOCS[k];
  return {
    key: k, tab: d.tab, path: d.path, title: d.title, date: d.date, until: 'until' in d ? d.until : undefined,
    dateObj: assignmentDate(k), focus: d.focus, description: d.description, html: d.html, pdfUrl: d.pdfUrl, pdfName: d.pdfName,
  };
});

let uploaded: AssignmentEntry[] = [];
let loaded = false;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

export function reloadUploadedLessons(): Promise<void> {
  inflight = (async () => {
    const { data, error } = await supabase
      .from('lesson_upload')
      .select('id, slug, title, lesson_date, until_date, focus, description, html, pdf_path, pdf_name, spec')
      .order('lesson_date', { ascending: false });
    if (error || !data) { loaded = true; return; }
    const paths = data.map((r) => r.pdf_path).filter(Boolean);
    const signed = new Map<string, string>();
    if (paths.length) {
      const { data: urls } = await supabase.storage.from(LESSON_BUCKET).createSignedUrls(paths, 60 * 60 * 24 * 7);
      for (const u of urls ?? []) if (u.path && u.signedUrl) signed.set(u.path, u.signedUrl);
    }
    uploaded = data.map((r) => ({
      key: lessonKey(r.slug), tab: lessonTab(r.slug), path: lessonPath(r.slug), title: r.title,
      date: formatLessonDate(r.lesson_date), until: r.until_date ? formatLessonDate(r.until_date) : undefined,
      dateObj: new Date(`${r.lesson_date}T00:00:00Z`), focus: r.focus, description: r.description, html: r.html,
      pdfUrl: signed.get(r.pdf_path) ?? '', pdfName: r.pdf_name || `${r.slug}.pdf`,
      uploaded: { id: r.id, slug: r.slug, pdfPath: r.pdf_path, spec: r.spec as unknown as LessonSpec },
    }));
    loaded = true;
    listeners.forEach((l) => l());
  })();
  return inflight;
}

/** Every assignment: the built-in ones plus lessons the teacher uploaded. */
export function useAssignments() {
  const [, bump] = useState(0);
  useEffect(() => {
    const l = () => bump((n) => n + 1);
    listeners.add(l);
    if (!loaded && !inflight) reloadUploadedLessons();
    else if (loaded) l();
    return () => { listeners.delete(l); };
  }, []);
  const entries = useMemo(() => [...uploaded, ...STATIC], [uploaded]); // eslint-disable-line react-hooks/exhaustive-deps
  return {
    entries,
    loaded,
    byKey: (k: string) => entries.find((e) => e.key === k),
    byTab: (t: string) => entries.find((e) => e.tab === t),
    reload: reloadUploadedLessons,
  };
}
