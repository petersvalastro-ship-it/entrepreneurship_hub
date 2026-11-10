-- Class-wide mastery settings (single row, id = 'default')
CREATE TABLE public.class_setting (
  id text PRIMARY KEY DEFAULT 'default',
  mastery_gate_enabled boolean NOT NULL DEFAULT true,
  default_threshold integer NOT NULL DEFAULT 80,
  daily_xp_cap integer NOT NULL DEFAULT 150,
  min_section_seconds integer NOT NULL DEFAULT 90,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.class_setting TO authenticated;
GRANT INSERT, UPDATE ON public.class_setting TO authenticated;
GRANT ALL ON public.class_setting TO service_role;
ALTER TABLE public.class_setting ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone signed in reads class settings" ON public.class_setting
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers insert class settings" ON public.class_setting
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'teacher'::app_role));
CREATE POLICY "Teachers update class settings" ON public.class_setting
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'teacher'::app_role))
  WITH CHECK (has_role(auth.uid(), 'teacher'::app_role));
INSERT INTO public.class_setting (id) VALUES ('default');

-- Every assessment attempt, always preserved
CREATE TABLE public.assessment_attempt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  assessment_id text NOT NULL,
  tier text NOT NULL,
  node_id text NOT NULL,
  attempt_number integer NOT NULL DEFAULT 1,
  score_pct numeric NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  low_effort boolean NOT NULL DEFAULT false,
  median_seconds numeric NOT NULL DEFAULT 0,
  active_seconds integer NOT NULL DEFAULT 0,
  responses jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX assessment_attempt_student_idx ON public.assessment_attempt (student_id, assessment_id);
GRANT SELECT, INSERT ON public.assessment_attempt TO authenticated;
GRANT ALL ON public.assessment_attempt TO service_role;
ALTER TABLE public.assessment_attempt ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own attempts" ON public.assessment_attempt
  FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Students insert own attempts" ON public.assessment_attempt
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Teachers read all attempts" ON public.assessment_attempt
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'teacher'::app_role));

-- Teacher gate overrides / required retakes
CREATE TABLE public.gate_override (
  student_id uuid NOT NULL,
  node_id text NOT NULL,
  state text NOT NULL DEFAULT 'teacher_unlocked',
  threshold_override integer,
  reason text NOT NULL DEFAULT '',
  unlocked_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, node_id)
);
GRANT SELECT ON public.gate_override TO authenticated;
GRANT ALL ON public.gate_override TO service_role;
ALTER TABLE public.gate_override ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own gate overrides" ON public.gate_override
  FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Teachers read all gate overrides" ON public.gate_override
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'teacher'::app_role));

-- Active vs idle time per learning node
CREATE TABLE public.engagement_session (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  node_id text NOT NULL,
  active_seconds integer NOT NULL DEFAULT 0,
  idle_seconds integer NOT NULL DEFAULT 0,
  interaction_count integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX engagement_session_student_idx ON public.engagement_session (student_id, node_id);
GRANT SELECT, INSERT ON public.engagement_session TO authenticated;
GRANT ALL ON public.engagement_session TO service_role;
ALTER TABLE public.engagement_session ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own sessions" ON public.engagement_session
  FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Students insert own sessions" ON public.engagement_session
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Teachers read all sessions" ON public.engagement_session
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'teacher'::app_role));

-- Engagement / integrity patterns to look at
CREATE TABLE public.anomaly_flag (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  node_id text NOT NULL DEFAULT '',
  type text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  dismissed_by uuid,
  dismissed_at timestamptz,
  dismiss_note text NOT NULL DEFAULT ''
);
CREATE INDEX anomaly_flag_student_idx ON public.anomaly_flag (student_id, created_at DESC);
GRANT SELECT, INSERT ON public.anomaly_flag TO authenticated;
GRANT ALL ON public.anomaly_flag TO service_role;
ALTER TABLE public.anomaly_flag ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own flags" ON public.anomaly_flag
  FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Students insert own flags" ON public.anomaly_flag
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Teachers read all flags" ON public.anomaly_flag
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'teacher'::app_role));

-- Append-only XP audit trail
CREATE TABLE public.xp_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  node_id text NOT NULL DEFAULT '',
  event_type text NOT NULL,
  xp_delta integer NOT NULL DEFAULT 0,
  multiplier_applied numeric NOT NULL DEFAULT 1,
  capped boolean NOT NULL DEFAULT false,
  blocked_reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX xp_ledger_student_idx ON public.xp_ledger (student_id, created_at DESC);
GRANT SELECT, INSERT ON public.xp_ledger TO authenticated;
GRANT ALL ON public.xp_ledger TO service_role;
ALTER TABLE public.xp_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own xp ledger" ON public.xp_ledger
  FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Students insert own xp ledger" ON public.xp_ledger
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Teachers read all xp ledgers" ON public.xp_ledger
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'teacher'::app_role));

-- Teacher XP resets and overrides, visible to the student
CREATE TABLE public.xp_admin_action (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  teacher_id uuid NOT NULL,
  action text NOT NULL DEFAULT 'reset_xp',
  scope text NOT NULL DEFAULT 'all',
  node_id text NOT NULL DEFAULT '',
  xp_removed integer NOT NULL DEFAULT 0,
  require_retake boolean NOT NULL DEFAULT false,
  reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX xp_admin_action_student_idx ON public.xp_admin_action (student_id, created_at DESC);
GRANT SELECT ON public.xp_admin_action TO authenticated;
GRANT ALL ON public.xp_admin_action TO service_role;
ALTER TABLE public.xp_admin_action ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own admin actions" ON public.xp_admin_action
  FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Teachers read all admin actions" ON public.xp_admin_action
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'teacher'::app_role));

-- Per-student mastery threshold accommodation
ALTER TABLE public.student_profile ADD COLUMN IF NOT EXISTS threshold_override integer;
ALTER TABLE public.student_profile ADD COLUMN IF NOT EXISTS grade_level text;