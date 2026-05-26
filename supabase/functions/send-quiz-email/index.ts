import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type QuizKey = 'beginner' | 'expert';

type ContactInfoValue = {
  firstName: string;
  lastName: string;
  email: string;
  consent: boolean;
  honeypot: string;
};

type ScoreDimension = { id: string; label: string; score: number };
type Recommendation = { headline: string; body: string; tag?: string };
type Results = {
  summary: string;
  recommendation: Recommendation;
  dimensions: ScoreDimension[];
  alternates?: Recommendation[];
  /** Admin-only — never rendered to the customer. */
  adminNotes?: string[];
};

type QuizLeadPayload = {
  quiz: QuizKey;
  contact: ContactInfoValue;
  answers: Record<string, unknown>;
  results: Results;
  utm?: Record<string, string | undefined>;
  submittedAt?: string;
};

const escape = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatAnswerValue = (v: unknown): string => {
  if (v == null) return '—';
  if (Array.isArray(v)) return v.map((x) => String(x)).join(', ');
  if (typeof v === 'object') return `<pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">${escape(JSON.stringify(v, null, 2))}</pre>`;
  return escape(String(v));
};

const dimensionsBlock = (dims: ScoreDimension[]): string => `
  <table style="width: 100%; border-collapse: collapse;">
    ${dims
      .map(
        (d) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>${escape(d.label)}</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-variant-numeric: tabular-nums;">${Math.round(d.score * 100)} / 100</td>
      </tr>`,
      )
      .join('')}
  </table>
`;

const answersBlock = (answers: Record<string, unknown>): string => `
  <table style="width: 100%; border-collapse: collapse;">
    ${Object.entries(answers)
      .filter(([key]) => key !== 'contact')
      .map(
        ([k, v]) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; vertical-align: top;"><strong>${escape(k)}</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; vertical-align: top; padding-left: 16px;">${formatAnswerValue(v)}</td>
      </tr>`,
      )
      .join('')}
  </table>
`;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'solutions@ndscalesmart.com';
    const ADMIN_EMAIL = 'solutions@ndscalesmart.com';

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = (await req.json()) as QuizLeadPayload;
    const { quiz, contact, answers, results } = payload;

    if (!quiz || !contact?.firstName || !contact?.lastName || !contact?.email || !results) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (contact.honeypot) {
      // Bot trap — pretend success so the bot doesn't retry
      return new Response(JSON.stringify({ message: 'ok' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!RESEND_API_KEY) {
      console.log('[send-quiz-email] RESEND_API_KEY not set — would have sent:', {
        to: contact.email,
        admin: ADMIN_EMAIL,
        quiz,
        recommendation: results.recommendation.headline,
      });
      return new Response(JSON.stringify({ message: 'logged (no RESEND_API_KEY)' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const quizLabel = quiz === 'beginner' ? 'Business → App Discovery' : 'Technical Audit';

    const clientHtml = `
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><title>Your quiz results from ND Scale Smart</title></head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0B1E3F 0%, #1a3a5f 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Your ${escape(quizLabel)} results</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 10px 0 0 0; font-size: 14px;">Start small. Scale smart.</p>
    </div>
    <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
      <p style="margin: 0 0 20px 0;">Hi ${escape(contact.firstName)},</p>
      <p>Thanks for taking the quiz. Here's what we heard:</p>
      <div style="background: #f9fafb; padding: 20px; border-left: 4px solid #0B1E3F; border-radius: 4px; margin: 24px 0;">
        ${results.recommendation.tag ? `<p style="margin: 0 0 8px 0; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: #6b7280;">${escape(results.recommendation.tag)}</p>` : ''}
        <h2 style="margin: 0 0 8px 0; color: #0B1E3F; font-size: 18px;">${escape(results.recommendation.headline)}</h2>
        <p style="margin: 0; color: #374151;">${escape(results.recommendation.body)}</p>
      </div>
      <h3 style="color: #0B1E3F; font-size: 16px;">Scorecard</h3>
      ${dimensionsBlock(results.dimensions)}
      <p style="margin-top: 30px;">Next step: reply to this email or <a href="mailto:${escape(ADMIN_EMAIL)}" style="color: #0B1E3F;">book a discovery call</a>. We typically respond within 24 hours.</p>
    </div>
  </body>
</html>`;

    const adminHtml = `
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><title>New quiz lead</title></head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 720px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #0B1E3F; font-size: 24px;">New ${escape(quizLabel)} lead</h1>
    <h2 style="color: #0B1E3F; font-size: 18px; margin-top: 30px;">Contact</h2>
    <div style="background: #f9fafb; padding: 20px; border-radius: 6px;">
      <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${escape(contact.firstName)} ${escape(contact.lastName)}</p>
      <p style="margin: 0;"><strong>Email:</strong> <a href="mailto:${escape(contact.email)}">${escape(contact.email)}</a></p>
    </div>

    <h2 style="color: #0B1E3F; font-size: 18px; margin-top: 30px;">Recommendation</h2>
    <div style="background: #f0f3f8; padding: 20px; border-radius: 6px;">
      ${results.recommendation.tag ? `<p style="margin: 0 0 8px 0; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: #6b7280;">${escape(results.recommendation.tag)}</p>` : ''}
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #0B1E3F;">${escape(results.recommendation.headline)}</p>
      <p style="margin: 0; color: #374151;">${escape(results.recommendation.body)}</p>
    </div>

    <h2 style="color: #0B1E3F; font-size: 18px; margin-top: 30px;">Scorecard</h2>
    ${dimensionsBlock(results.dimensions)}

    ${results.adminNotes && results.adminNotes.length
      ? `<h2 style="color: #0B1E3F; font-size: 18px; margin-top: 30px;">Reasoning (admin only)</h2>
         <ul style="background: #fef3c7; padding: 16px 16px 16px 32px; border-left: 4px solid #f59e0b; border-radius: 4px; color: #92400e; font-size: 13px; line-height: 1.6;">
           ${results.adminNotes.map((n) => `<li style="margin-bottom: 4px;">${escape(n)}</li>`).join('')}
         </ul>`
      : ''}

    <h2 style="color: #0B1E3F; font-size: 18px; margin-top: 30px;">Raw answers</h2>
    ${answersBlock(answers)}

    ${payload.utm && Object.keys(payload.utm).length
      ? `<h2 style="color: #0B1E3F; font-size: 18px; margin-top: 30px;">Attribution</h2>
         <pre style="background: #f9fafb; padding: 16px; border-radius: 6px; font-size: 12px;">${escape(JSON.stringify(payload.utm, null, 2))}</pre>`
      : ''}
  </body>
</html>`;

    const sends = [
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: contact.email,
          subject: `Your ${quizLabel} results`,
          html: clientHtml,
        }),
      }),
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          replyTo: contact.email,
          subject: `New ${quizLabel} lead: ${contact.firstName} ${contact.lastName} (${contact.company})`,
          html: adminHtml,
        }),
      }),
    ];

    const responses = await Promise.all(sends);
    const allSuccessful = responses.every((r) => r.ok);
    if (!allSuccessful) {
      const errors = await Promise.all(
        responses.map(async (r, i) =>
          r.ok ? null : { recipient: i === 0 ? 'client' : 'admin', error: await r.text() },
        ),
      );
      console.error('[send-quiz-email] partial failure:', errors.filter(Boolean));
      return new Response(
        JSON.stringify({ error: 'Failed to send some emails', details: errors.filter(Boolean) }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(JSON.stringify({ message: 'Quiz lead emails sent', sent: 2 }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[send-quiz-email] error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
