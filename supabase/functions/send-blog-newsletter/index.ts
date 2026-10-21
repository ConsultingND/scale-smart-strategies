import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
}

type Subscriber = { unsubscribe_token: string; first_name?: string | null; email: string };
type SendResult = { email: string; success: boolean };

const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 1000;
// Welcome emails can only be sent for subscriptions created this recently,
// so the endpoint can't be used to repeatedly email an existing subscriber.
const WELCOME_WINDOW_MS = 15 * 60 * 1000;

const escapeHtml = (v: unknown) => String(v ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const jsonResponse = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const readJson = async (req: Request): Promise<Record<string, unknown> | null> => {
  try {
    const body = await req.json();
    return body && typeof body === 'object' ? body : null;
  } catch {
    return null;
  }
};

const timingSafeEqual = (a: string, b: string) => {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://ndscalesmart.com';
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'solutions@ndscalesmart.com';

    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const url = new URL(req.url);
    const pathname = url.pathname.replace(/\/+$/, '');

    // Route: POST /send (for blog post newsletters)
    if (req.method === 'POST' && pathname.endsWith('/send')) {
      // Admin-only: requires the NEWSLETTER_ADMIN_SECRET in the x-admin-secret header.
      // The anon key is public, so a valid JWT alone is not authorization.
      const ADMIN_SECRET = Deno.env.get('NEWSLETTER_ADMIN_SECRET');
      if (!ADMIN_SECRET) {
        console.error('NEWSLETTER_ADMIN_SECRET is not set; refusing to send');
        return jsonResponse({ error: 'Newsletter sending is not configured' }, 503);
      }
      if (!timingSafeEqual(req.headers.get('x-admin-secret') ?? '', ADMIN_SECRET)) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }

      const payload = await readJson(req);
      if (!payload) return jsonResponse({ error: 'Invalid JSON body' }, 400);
      const blogPost = payload.blogPost as BlogPost | undefined;

      if (!blogPost || typeof blogPost.title !== 'string' || typeof blogPost.slug !== 'string' || !blogPost.title || !blogPost.slug) {
        return jsonResponse({ error: 'Missing required blog post data' }, 400);
      }

      const { data: subscribers, error: subscribersError } = await supabase
        .from('newsletter_subscribers')
        .select('email, first_name, unsubscribe_token')
        .eq('is_active', true);

      if (subscribersError) throw subscribersError;

      if (!subscribers || subscribers.length === 0) {
        return new Response(JSON.stringify({ message: 'No active subscribers', sent: 0 }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const batches: Subscriber[][] = [];
      for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
        batches.push(subscribers.slice(i, i + BATCH_SIZE));
      }

      const results: SendResult[] = [];

      for (let b = 0; b < batches.length; b++) {
        const batch = batches[b];
        const promises = batch.map(async (subscriber): Promise<SendResult> => {
          const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribe_token)}`;
          const blogUrl = `${SITE_URL}/blog/${encodeURIComponent(blogPost.slug)}`;
          const greeting = subscriber.first_name ? `Hi ${escapeHtml(subscriber.first_name)},` : 'Hi there,';

          const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(blogPost.title)}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0B1E3F 0%, #1a3a5f 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">ND Scale Smart</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 14px;">Start small. Scale smart.</p>
    </div>
    <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
      <p style="margin: 0 0 20px 0; font-size: 16px;">${greeting}</p>
      <h2 style="color: #0B1E3F; margin: 0 0 20px 0; font-size: 24px;">${escapeHtml(blogPost.title)}</h2>
      ${blogPost.excerpt ? `<p style="color: #6b7280; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">${escapeHtml(blogPost.excerpt)}</p>` : ''}
      <div style="text-align: center; margin: 40px 0;">
        <a href="${blogUrl}" style="display: inline-block; background: #0B1E3F; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">Read Full Article</a>
      </div>
      <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">You're receiving this because you subscribed to ND Scale Smart's newsletter.</p>
        <p style="color: #9ca3af; font-size: 14px; margin: 0;"><a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a></p>
      </div>
    </div>
  </body>
</html>`;

          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: FROM_EMAIL,
              to: subscriber.email,
              subject: `New Article: ${blogPost.title}`.replace(/[\r\n]+/g, ' '),
              html: htmlContent,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to send email to ${subscriber.email}:`, errorText);
            return { email: subscriber.email, success: false };
          }

          return { email: subscriber.email, success: true };
        });

        const batchResults = await Promise.all(promises);
        results.push(...batchResults);

        if (b < batches.length - 1) {
          await new Promise((res) => setTimeout(res, BATCH_DELAY_MS));
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      return new Response(JSON.stringify({
        message: 'Newsletter send initiated',
        total: subscribers.length,
        sent: successCount,
        failed: failureCount,
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Route: POST /welcome (for new subscriber welcome emails)
    if (req.method === 'POST' && pathname.endsWith('/welcome')) {
      const body = await readJson(req);
      if (!body) return jsonResponse({ error: 'Invalid JSON body' }, 400);
      const email = typeof body.email === 'string' ? body.email.trim() : '';

      if (!email) {
        return jsonResponse({ error: 'Missing email' }, 400);
      }

      const { data: subscriber, error: subError } = await supabase
        .from('newsletter_subscribers')
        .select('unsubscribe_token, first_name, subscribed_at, is_active')
        .eq('email', email)
        .maybeSingle();

      if (subError) throw subError;

      // Same response for "not found" and "not eligible" so the endpoint can't be
      // used to probe which addresses are subscribed.
      const subscribedAt = subscriber?.subscribed_at ? new Date(subscriber.subscribed_at).getTime() : 0;
      if (!subscriber || !subscriber.is_active || Date.now() - subscribedAt > WELCOME_WINDOW_MS) {
        return jsonResponse({ error: 'Subscriber not found' }, 404);
      }

      // Use the stored name, not the request body, so callers can't inject content.
      const greeting = subscriber.first_name ? `Hi ${escapeHtml(subscriber.first_name)},` : 'Hi there,';

      const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ND Scale Smart</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0B1E3F 0%, #1a3a5f 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to ND Scale Smart!</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 14px;">Start small. Scale smart.</p>
    </div>
    <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
      <p style="margin: 0 0 20px 0; font-size: 16px;">${greeting}</p>
      <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">Thank you for subscribing to our newsletter! We're thrilled to have you as part of our community.</p>
      <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">You'll receive weekly insights on:</p>
      <ul style="color: #374151; margin: 0 0 30px 20px; font-size: 16px; line-height: 1.8;">
        <li>AI and automation strategies for scaling your business</li>
        <li>Web development best practices and modern frameworks</li>
        <li>Technical strategy and maintenance tips</li>
        <li>Real-world case studies and lessons learned</li>
      </ul>
      <p style="color: #374151; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">In the meantime, check out our latest articles and services:</p>
      <div style="text-align: center; margin: 40px 0;">
        <a href="${SITE_URL}/blog" style="display: inline-block; background: #0B1E3F; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 0 10px 10px 0;">Visit Our Blog</a>
        <a href="${SITE_URL}/services" style="display: inline-block; background: transparent; border: 2px solid #0B1E3F; color: #0B1E3F; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">View Services</a>
      </div>
      <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">Have questions? Feel free to reply to this email or <a href="${SITE_URL}/contact" style="color: #0B1E3F; text-decoration: underline;">contact us</a>.</p>
        <p style="color: #9ca3af; font-size: 14px; margin: 0;">If you didn't subscribe to this newsletter, you can <a href="${SITE_URL}/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribe_token)}" style="color: #6b7280; text-decoration: underline;">unsubscribe here</a>.</p>
      </div>
    </div>
  </body>
</html>`;

      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: email,
            subject: 'Welcome to ND Scale Smart Newsletter!',
            html: htmlContent,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to send welcome email to ${email}:`, errorText);
          return jsonResponse({ error: 'Failed to send welcome email' }, 502);
        }

        const result = await response.json();
        console.log(`Welcome email sent to ${email}`);

        return new Response(JSON.stringify({ message: 'Welcome email sent', emailId: result.id }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error sending welcome email:', error);
        return new Response(JSON.stringify({ error: 'Failed to send welcome email' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
