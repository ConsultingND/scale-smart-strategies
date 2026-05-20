import { supabase } from '@/integrations/supabase/client';
import type { LeadPayload } from '@/components/quiz/types';

export async function submitQuizLead(payload: LeadPayload): Promise<void> {
  if (payload.contact.honeypot) {
    // Silently accept bot submissions so they don't retry.
    return;
  }

  // 1. Persist to Supabase
  const { error: dbError } = await supabase.from('quiz_leads').insert({
    quiz: payload.quiz,
    first_name: payload.contact.firstName.trim(),
    last_name: payload.contact.lastName.trim(),
    email: payload.contact.email.toLowerCase().trim(),
    company: payload.contact.company.trim(),
    website: payload.contact.website?.trim() || null,
    answers: payload.answers,
    results: payload.results,
    utm: payload.utm ?? {},
    submitted_at: payload.submittedAt,
  });

  if (dbError) {
    console.error('[quiz-lead] db error:', dbError);
    throw new Error('Failed to save your quiz submission. Please try again.');
  }

  // 2. Fire-and-await the edge function for email delivery.
  const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-quiz-email`;
  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // The lead is already saved; surface a softer error.
    const err = await response.json().catch(() => ({}));
    console.error('[quiz-lead] email error:', err);
    // Don't throw — we still consider submission successful since the DB row exists.
  }
}
