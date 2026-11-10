CREATE TABLE public.launchpad_progress (
  user_id uuid NOT NULL,
  section_id text NOT NULL,
  completed boolean NOT NULL DEFAULT true,
  notes text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, section_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.launchpad_progress TO authenticated;
GRANT ALL ON public.launchpad_progress TO service_role;

ALTER TABLE public.launchpad_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own launchpad progress"
ON public.launchpad_progress FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own launchpad progress"
ON public.launchpad_progress FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own launchpad progress"
ON public.launchpad_progress FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own launchpad progress"
ON public.launchpad_progress FOR DELETE TO authenticated
USING (auth.uid() = user_id);