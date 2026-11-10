CREATE TABLE public.student_profile (
  user_id uuid PRIMARY KEY,
  xp integer NOT NULL DEFAULT 0,
  mastered_terms jsonb NOT NULL DEFAULT '[]'::jsonb,
  completed_scenarios jsonb NOT NULL DEFAULT '{}'::jsonb,
  goals jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_profile TO authenticated;
GRANT ALL ON public.student_profile TO service_role;

ALTER TABLE public.student_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own student profile" ON public.student_profile
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own student profile" ON public.student_profile
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own student profile" ON public.student_profile
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own student profile" ON public.student_profile
  FOR DELETE TO authenticated USING (auth.uid() = user_id);