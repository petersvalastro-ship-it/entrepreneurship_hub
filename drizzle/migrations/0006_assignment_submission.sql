CREATE TABLE public.assignment_submission (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  assignment_key text NOT NULL,
  assignment_title text NOT NULL DEFAULT '',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  submit_count integer NOT NULL DEFAULT 1,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  teacher_note text NOT NULL DEFAULT '',
  UNIQUE (student_id, assignment_key)
);
GRANT SELECT, INSERT, UPDATE ON public.assignment_submission TO authenticated;
GRANT ALL ON public.assignment_submission TO service_role;
ALTER TABLE public.assignment_submission ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students insert own submissions" ON public.assignment_submission FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students read own submissions" ON public.assignment_submission FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Students update own submissions" ON public.assignment_submission FOR UPDATE TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Teachers read all submissions" ON public.assignment_submission FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'teacher'::app_role));
CREATE POLICY "Teachers review submissions" ON public.assignment_submission FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'teacher'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'teacher'::app_role));

CREATE OR REPLACE FUNCTION public.assignment_submission_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'teacher'::app_role) AND auth.uid() <> NEW.student_id THEN
    -- teacher may only change review fields
    NEW.answers := OLD.answers; NEW.submit_count := OLD.submit_count; NEW.submitted_at := OLD.submitted_at;
    NEW.student_id := OLD.student_id; NEW.assignment_key := OLD.assignment_key; NEW.assignment_title := OLD.assignment_title;
  ELSE
    IF TG_OP = 'UPDATE' THEN
      NEW.submit_count := OLD.submit_count + 1;
      NEW.reviewed_at := NULL;
      NEW.teacher_note := OLD.teacher_note;
    ELSE
      NEW.submit_count := 1; NEW.reviewed_at := NULL; NEW.teacher_note := '';
    END IF;
    NEW.submitted_at := now();
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER assignment_submission_guard BEFORE INSERT OR UPDATE ON public.assignment_submission
FOR EACH ROW EXECUTE FUNCTION public.assignment_submission_guard();