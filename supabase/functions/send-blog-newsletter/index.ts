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

const BATCH_SIZE = 50; // number of emails per batch
const BATCH_DELAY_MS = 1000; // delay between batches (ms) to avoid rate limits

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://ndscalesmart.com';
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'newsletter@ndscalesmart.com';

    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const url = new URL(req.url);
    const pathname = url.pathname.replace(/\/+$/, '');

    // Route: POST /send
    if (req.method === 'POST' && pathname.endsWith('/send')) {
      const payload = await req.json();
      const { blogPost }: { blogPost: BlogPost } = payload || {};

      if (!blogPost || !blogPost.title || !blogPost.slug) {
        return new Response(JSON.stringify({ error: 'Missing required blog post data (title, slug)' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // fetch active subscribers
      const { data: subscribers, error: subscribersError } = await supabase
        .from('newsletter_subscribers')
        .select('email, first_name, last_name, unsubscribe_token')
        .eq('is_active', true);

      if (subscribersError) throw subscribersError;

      if (!subscribers || subscribers.length === 0) {
        return new Response(JSON.stringify({ message: 'No active subscribers found', sent: 0 }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // chunk into batches
      const batches: any[][] = [];
      for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
        batches.push(subscribers.slice(i, i + BATCH_SIZE));
      }

      const results: any[] = [];

      // send batches sequentially with delay between batches
      for (let b = 0; b < batches.length; b++) {
        const batch = batches[b];
        // send all in the batch in parallel
        const promises = batch.map(async (subscriber: any) => {
          const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${subscriber.unsubscribe_token}`;
          const blogUrl = `${SITE_URL}/blog/${blogPost.slug}`;

          const greeting = subscriber.first_name ? `Hi ${subscriber.first_name},` : 'Hi there,';

          const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${blogPost.title}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0B1E3F 0%, #1a3a5f 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">ND Scale Smart</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 14px;">Start small. Scale smart.</p>
    </div>

    <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
      <p style="margin: 0 0 20px 0; font-size: 16px;">${greeting}</p>

      <h2 style="color: #0B1E3F; margin: 0 0 20px 0; font-size: 24px;">${blogPost.title}</h2>

      ${blogPost.excerpt ? `<p style="color: #6b7280; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">${blogPost.excerpt}</p>` : ''}

      <div style="text-align: center; margin: 40px 0;">
        <a href="${blogUrl}" style="display: inline-block; background: #0B1E3F; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">Read Full Article</a>
      </div>

      <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">
          You're receiving this because you subscribed to ND Scale Smart's newsletter.
        </p>
        <p style="color: #9ca3af; font-size: 14px; margin: 0;">
          <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
        </p>
      </div>
    </div>
  </body>
</html>
          `;

          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: FROM_EMAIL,
              to: subscriber.email,
              subject: `New Article: ${blogPost.title}`,
              html: htmlContent,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to send email to ${subscriber.email}:`, errorText);
            return { email: subscriber.email, success: false, error: errorText, subscriber };
          }

          return { email: subscriber.email, success: true, subscriber };
        });

        const batchResults = await Promise.all(promises);
        results.push(...batchResults);

        // delay between batches unless last
        if (b < batches.length - 1) {
          await new Promise((res) => setTimeout(res, BATCH_DELAY_MS));
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      // Persist results in background
      const toPersist = results.map(r => ({
        newsletter_slug: blogPost.slug,
        recipient_email: r.email,
        recipient_first_name: r.subscriber?.first_name ?? null,
        recipient_last_name: r.subscriber?.last_name ?? null,
        unsubscribe_token: r.subscriber?.unsubscribe_token ?? null,
        success: !!r.success,
        response_text: r.error ?? null,
      }));

      // Background write
      const persistPromise = (async () => {
        try {
          // Insert in small chunks to avoid huge inserts
          const CHUNK = 100;
          for (let i = 0; i < toPersist.length; i += CHUNK) {
            const chunk = toPersist.slice(i, i + CHUNK);
            const { error } = await supabase.from('newsletter_send_results').insert(chunk);
            if (error) console.error('Error persisting newsletter_send_results chunk:', error);
          }
        } catch (err) {
          console.error('Error persisting send results:', err);
        }
      })();

      // Use waitUntil for background work if available
      try {
        // @ts-ignore EdgeRuntime may be available in the environment
        if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime?.waitUntil) {
          // @ts-ignore
          EdgeRuntime.waitUntil(persistPromise);
        } else {
          // fall back: kick off but don't await
          persistPromise.catch(() => {});
        }
      } catch (e) {
        persistPromise.catch(() => {});
      }

      return new Response(JSON.stringify({
        message: 'Newsletter send initiated',
        total: subscribers.length,
        sent: successCount,
        failed: failureCount,
        resultsSummary: { success: successCount, failed: failureCount },
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Route: POST /welcome
    if (req.method === 'POST' && pathname.endsWith('/welcome')) {
      const body = await req.json();
      const { email, firstName, lastName } = body || {};

      if (!email) {
        return new Response(JSON.stringify({ error: 'Missing email' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';

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

      <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
        Thank you for subscribing to our newsletter! We're thrilled to have you as part of our community.
      </p>

      <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
        You'll receive weekly insights on:
      </p>

      <ul style="color: #374151; margin: 0 0 30px 20px; font-size: 16px; line-height: 1.8;">
        <li>AI and automation strategies for scaling your business</li>
        <li>Web development best practices and modern frameworks</li>
        <li>Technical strategy and maintenance tips</li>
        <li>Real-world case studies and lessons learned</li>
      </ul>

      <p style="color: #374151; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
        In the meantime, check out our latest articles and services:
      </p>

      <div style="text-align: center; margin: 40px 0;">
        <a href="${SITE_URL}/blog" style="display: inline-block; background: #0B1E3F; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 0 10px 10px 0;">Visit Our Blog</a>
        <a href="${SITE_URL}/services" style="display: inline-block; background: transparent; border: 2px solid #0B1E3F; color: #0B1E3F; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">View Services</a>
      </div>

      <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">
          Have questions? Feel free to reply to this email or <a href="${SITE_URL}/contact" style="color: #0B1E3F; text-decoration: underline;">contact us</a>.
        </p>
        <p style="color: #9ca3af; font-size: 14px; margin: 0;">
          If you didn't subscribe to this newsletter, you can <a href="${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #6b7280; text-decoration: underline;">unsubscribe here</a>.
        </p>
      </div>
    </div>
  </body>
</html>
      `;

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
          return new Response(JSON.stringify({ error: 'Failed to send welcome email', details: errorText }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
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

    // Route: POST /unsubscribe
    if (req.method === 'POST' && pathname.endsWith('/unsubscribe')) {
      const body = await req.json();
      const { token } = body || {};

      if (!token) {
        return new Response(JSON.stringify({ error: 'Missing token' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Find subscriber by token
      const { data: subs, error: findError } = await supabase
        .from('newsletter_subscribers')
        .select('id, email, is_active')
        .eq('unsubscribe_token', token)
        .limit(1)
        .single();

      if (findError) {
        // if not found, return not found
        return new Response(JSON.stringify({ error: 'Invalid token or subscriber not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Deactivate subscriber
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({ is_active: false })
        .eq('id', subs.id);

      if (updateError) {
        return new Response(JSON.stringify({ error: 'Failed to unsubscribe' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ message: 'Unsubscribed', email: subs.email }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: (error && error.message) ? error.message : String(error) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});