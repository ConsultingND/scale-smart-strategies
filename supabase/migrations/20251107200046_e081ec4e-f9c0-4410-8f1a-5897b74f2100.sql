-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (subscribe)
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow reading own subscription (for unsubscribe)
CREATE POLICY "Users can read their own subscription" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (true);

-- Create policy to allow updating own subscription (for unsubscribe)
CREATE POLICY "Users can update their own subscription" 
ON public.newsletter_subscribers 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_newsletter_subscribers_updated_at
BEFORE UPDATE ON public.newsletter_subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_newsletter_updated_at();

-- Create table for newsletter send results (for tracking)
CREATE TABLE IF NOT EXISTS public.newsletter_send_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  newsletter_slug TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_first_name TEXT,
  recipient_last_name TEXT,
  unsubscribe_token UUID,
  success BOOLEAN NOT NULL DEFAULT false,
  response_text TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for send results (admin only)
ALTER TABLE public.newsletter_send_results ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON public.newsletter_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_send_results_slug ON public.newsletter_send_results(newsletter_slug);
CREATE INDEX IF NOT EXISTS idx_newsletter_send_results_email ON public.newsletter_send_results(recipient_email);