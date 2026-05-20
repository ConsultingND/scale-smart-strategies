-- Quiz leads table — captures submissions from /quiz (beginner) and /expert-quiz.
CREATE TABLE IF NOT EXISTS public.quiz_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz TEXT NOT NULL CHECK (quiz IN ('beginner', 'expert')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  website TEXT,
  answers JSONB NOT NULL,
  results JSONB NOT NULL,
  utm JSONB,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_leads_email        ON public.quiz_leads(email);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_quiz         ON public.quiz_leads(quiz);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_submitted_at ON public.quiz_leads(submitted_at DESC);

ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;

-- Anonymous + authenticated users can submit
CREATE POLICY "Anyone can submit a quiz lead"
  ON public.quiz_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users (admin) can read
CREATE POLICY "Only authenticated users can view quiz leads"
  ON public.quiz_leads
  FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON TABLE public.quiz_leads IS 'Submissions from the beginner and expert lead-generation quizzes';
