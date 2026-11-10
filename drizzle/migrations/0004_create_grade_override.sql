CREATE TABLE public.grade_override (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  item_key text NOT NULL,
  score numeric NOT NULL,
  note text NOT NULL DEFAULT '',
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, item_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.grade_override TO authenticated;
GRANT ALL ON public.grade_override TO service_role;

ALTER TABLE public.grade_override ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers read grade overrides" ON public.grade_override
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'teacher'::app_role));
CREATE POLICY "Teachers insert grade overrides" ON public.grade_override
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'teacher'::app_role));
CREATE POLICY "Teachers update grade overrides" ON public.grade_override
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'teacher'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'teacher'::app_role));
CREATE POLICY "Teachers delete grade overrides" ON public.grade_override
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'teacher'::app_role));
