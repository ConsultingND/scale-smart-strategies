-- Security hardening: close public read/write access to subscriber and lead PII.
--
-- Previously, permissive policies (USING (true)) on newsletter_subscribers let
-- anyone holding the public anon key read every subscriber (emails, names,
-- unsubscribe tokens) and update any row. Permissive policies are OR'd, so the
-- "Prevent public reads" policy had no effect.
--
-- Not every environment has every table (some migrations were never applied to
-- production), so table-specific statements are skipped when the table is absent.
-- Safe to re-run.

-- newsletter_subscribers -------------------------------------------------------

DROP POLICY IF EXISTS "Users can read their own subscription" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public to unsubscribe" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Prevent public reads" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "prevent_public_reads" ON public.newsletter_subscribers;

-- Keep exactly one INSERT policy, whichever of the historical ones existed.
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "anon_can_insert_subscribe" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public to subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Allow public to subscribe"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Clients may only subscribe (INSERT). Reads and updates go through the
-- service role (edge functions) or the token-checked RPC below.
REVOKE SELECT, UPDATE, DELETE ON public.newsletter_subscribers FROM anon, authenticated;
GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;

-- Unsubscribe by token. Returns true if a subscription matched.
CREATE OR REPLACE FUNCTION public.unsubscribe_newsletter(p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  matched integer;
BEGIN
  IF p_token IS NULL OR length(p_token) = 0 THEN
    RETURN false;
  END IF;

  UPDATE public.newsletter_subscribers
     SET is_active = false
   WHERE unsubscribe_token::text = p_token;

  GET DIAGNOSTICS matched = ROW_COUNT;
  RETURN matched > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.unsubscribe_newsletter(text) FROM public;
GRANT EXECUTE ON FUNCTION public.unsubscribe_newsletter(text) TO anon, authenticated;

-- contact_submissions / quiz_leads / newsletter_send_results -------------------
-- Any signed-up user could read all leads. Restrict reads to the service role
-- (Supabase dashboard / edge functions), which bypasses RLS.

DO $$
BEGIN
  IF to_regclass('public.contact_submissions') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Only authenticated users can view submissions" ON public.contact_submissions';
    EXECUTE 'DROP POLICY IF EXISTS "Only admins can view submissions" ON public.contact_submissions';
    EXECUTE 'REVOKE SELECT, UPDATE, DELETE ON public.contact_submissions FROM anon, authenticated';
  END IF;

  IF to_regclass('public.quiz_leads') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Only authenticated users can view quiz leads" ON public.quiz_leads';
    EXECUTE 'REVOKE SELECT, UPDATE, DELETE ON public.quiz_leads FROM anon, authenticated';
  END IF;

  IF to_regclass('public.newsletter_send_results') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON public.newsletter_send_results FROM anon, authenticated';
  END IF;
END
$$;
