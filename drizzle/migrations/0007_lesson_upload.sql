CREATE TABLE public.lesson_upload (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  lesson_date date NOT NULL,
  until_date date,
  focus text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  spec jsonb NOT NULL DEFAULT '{}'::jsonb,
  html text NOT NULL DEFAULT '',
  pdf_path text NOT NULL DEFAULT '',
  pdf_name text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lesson_upload TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_upload TO authenticated;
GRANT ALL ON public.lesson_upload TO service_role;
ALTER TABLE public.lesson_upload ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads published lessons" ON public.lesson_upload FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "Teachers read all lessons" ON public.lesson_upload FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'teacher'::app_role));
CREATE POLICY "Teachers add lessons" ON public.lesson_upload FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'teacher'::app_role));
CREATE POLICY "Teachers edit lessons" ON public.lesson_upload FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'teacher'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'teacher'::app_role));
CREATE POLICY "Teachers delete lessons" ON public.lesson_upload FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Teachers upload lesson PDFs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lesson-pdfs' AND public.has_role(auth.uid(), 'teacher'::app_role));
CREATE POLICY "Teachers replace lesson PDFs" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'lesson-pdfs' AND public.has_role(auth.uid(), 'teacher'::app_role));
CREATE POLICY "Teachers delete lesson PDFs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'lesson-pdfs' AND public.has_role(auth.uid(), 'teacher'::app_role));