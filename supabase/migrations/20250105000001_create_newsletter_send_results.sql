-- Create newsletter_send_results table to track email sends
CREATE TABLE IF NOT EXISTS public.newsletter_send_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  newsletter_slug TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_first_name TEXT,
  recipient_last_name TEXT,
  unsubscribe_token TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  response_text TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_newsletter_send_results_slug ON public.newsletter_send_results(newsletter_slug);
CREATE INDEX IF NOT EXISTS idx_newsletter_send_results_email ON public.newsletter_send_results(recipient_email);
CREATE INDEX IF NOT EXISTS idx_newsletter_send_results_success ON public.newsletter_send_results(success);
CREATE INDEX IF NOT EXISTS idx_newsletter_send_results_sent_at ON public.newsletter_send_results(sent_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.newsletter_send_results ENABLE ROW LEVEL SECURITY;

-- Only allow service role to read/write (this is internal tracking data)
CREATE POLICY "Service role only"
  ON public.newsletter_send_results
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Prevent public access
CREATE POLICY "No public access"
  ON public.newsletter_send_results
  FOR ALL
  TO public
  USING (false);

-- Grant permissions
GRANT ALL ON public.newsletter_send_results TO service_role;
GRANT ALL ON public.newsletter_send_results TO authenticated;
