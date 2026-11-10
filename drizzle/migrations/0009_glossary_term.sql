CREATE TABLE public.glossary_term (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL CHECK (char_length(btrim(term)) BETWEEN 1 AND 80),
  definition text NOT NULL CHECK (char_length(btrim(definition)) BETWEEN 1 AND 600),
  example text NOT NULL DEFAULT '' CHECK (char_length(example) <= 400),
  category text NOT NULL DEFAULT 'Entrepreneurship',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX glossary_term_term_lower_idx ON public.glossary_term (lower(btrim(term)));

GRANT SELECT ON public.glossary_term TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.glossary_term TO authenticated;
GRANT ALL ON public.glossary_term TO service_role;

ALTER TABLE public.glossary_term ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read glossary terms" ON public.glossary_term
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Teachers add glossary terms" ON public.glossary_term
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'teacher') AND created_by = auth.uid());
CREATE POLICY "Teachers edit glossary terms" ON public.glossary_term
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'teacher')) WITH CHECK (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Teachers remove glossary terms" ON public.glossary_term
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'teacher'));