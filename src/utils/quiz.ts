import { supabase } from '@/integrations/supabase/client';
import type { LeadPayload } from '@/components/quiz/types';

/**
 * Submit a quiz lead. Failure modes are best-effort: we attempt the Supabase
 * insert and the edge-function email, but we never throw — the results panel
 * should render either way. Errors are logged for debugging.
 */
export async function submitQuizLead(payload: LeadPayload): Promise<{ saved: boolean; emailed: boolean }> {
  if (payload.contact.honeypot) {
    // Silently accept bot submissions so they don't retry.
    return { saved: false, emailed: false };
  }

  let saved = false;
  let emailed = false;

  // 1. Persist to Supabase
  try {
    const { error: dbError } = await supabase.from('quiz_leads').insert({
      quiz: payload.quiz,
      first_name: payload.contact.firstName.trim(),
      last_name: payload.contact.lastName.trim(),
      email: payload.contact.email.toLowerCase().trim(),
      answers: payload.answers,
      results: payload.results,
      utm: payload.utm ?? {},
      submitted_at: payload.submittedAt,
    });
    if (dbError) {
      console.error('[quiz-lead] db error:', dbError);
    } else {
      saved = true;
    }
  } catch (err) {
    console.error('[quiz-lead] db exception:', err);
  }

  // 2. Trigger the email-sending edge function
  try {
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-quiz-email`;
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      emailed = true;
    } else {
      const err = await response.json().catch(() => ({}));
      console.error('[quiz-lead] email error:', err);
    }
  } catch (err) {
    console.error('[quiz-lead] email exception:', err);
  }

  return { saved, emailed };
}
