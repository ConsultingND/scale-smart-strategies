import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  website?: string;
  projectType: string;
  message: string;
  aiQuestion?: string;
  aiQuestion1?: string;
  aiQuestion2?: string;
  aiQuestion3?: string;
  aiQuestion4?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://ndscalesmart.com';
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'solutions@ndscalesmart.com';
    const ADMIN_EMAIL = 'solutions@ndscalesmart.com';

    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');

    if (req.method === 'POST') {
      const formData: ContactFormData = await req.json();

      if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Email 1: Confirmation to client
      const clientHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Contacting ND Scale Smart</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0B1E3F 0%, #1a3a5f 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Thank You!</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 14px;">Start small. Scale smart.</p>
    </div>
    <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
      <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${formData.firstName},</p>
      <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">Thank you for reaching out to ND Scale Smart! We've received your inquiry and will respond within 24 hours.</p>
      <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">Here's a copy of what you submitted:</p>

      <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
        <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${formData.email}</p>
        ${formData.company ? `<p style="margin: 0 0 10px 0;"><strong>Company:</strong> ${formData.company}</p>` : ''}
        ${formData.website ? `<p style="margin: 0 0 10px 0;"><strong>Website:</strong> ${formData.website}</p>` : ''}
        <p style="margin: 0 0 10px 0;"><strong>Project Type:</strong> ${formData.projectType}</p>
        <p style="margin: 0 0 10px 0;"><strong>Message:</strong><br>${formData.message.replace(/\n/g, '<br>')}</p>
      </div>

      <p style="color: #374151; margin: 20px 0; font-size: 16px; line-height: 1.6;">We're excited to learn more about your project and explore how we can help you scale smart!</p>

      <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 14px; margin: 0;">Questions? Reply to this email or visit <a href="${SITE_URL}" style="color: #0B1E3F; text-decoration: underline;">our website</a>.</p>
      </div>
    </div>
  </body>
</html>`;

      // Email 2: Notification to admin with all details
      const adminHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0B1E3F 0%, #1a3a5f 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">New Contact Form Submission</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 14px;">From ndscalesmart.com</p>
    </div>
    <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">

      <h2 style="color: #0B1E3F; margin: 0 0 20px 0; font-size: 20px;">Contact Information</h2>
      <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
        <p style="margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
        ${formData.company ? `<p style="margin: 0 0 10px 0;"><strong>Company:</strong> ${formData.company}</p>` : ''}
        ${formData.website ? `<p style="margin: 0 0 10px 0;"><strong>Website:</strong> <a href="${formData.website}" target="_blank">${formData.website}</a></p>` : ''}
        <p style="margin: 0;"><strong>Project Type:</strong> ${formData.projectType}</p>
      </div>

      <h2 style="color: #0B1E3F; margin: 30px 0 20px 0; font-size: 20px;">Project Details</h2>
      <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; white-space: pre-wrap;">${formData.message}</p>
      </div>

      ${formData.aiQuestion || formData.aiQuestion1 || formData.aiQuestion2 || formData.aiQuestion3 || formData.aiQuestion4 ? `
      <h2 style="color: #0B1E3F; margin: 30px 0 20px 0; font-size: 20px;">AI Strategy Questions</h2>
      <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
        ${formData.aiQuestion ? `
        <div style="margin-bottom: 20px;">
          <p style="margin: 0 0 5px 0; font-weight: 600;">What aspect of your business could we help simplify right now?</p>
          <p style="margin: 0; color: #374151;">${formData.aiQuestion}</p>
        </div>` : ''}

        ${formData.aiQuestion1 ? `
        <div style="margin-bottom: 20px;">
          <p style="margin: 0 0 5px 0; font-weight: 600;">Where would AI save you or your team the most time?</p>
          <p style="margin: 0; color: #374151;">${formData.aiQuestion1}</p>
        </div>` : ''}

        ${formData.aiQuestion2 ? `
        <div style="margin-bottom: 20px;">
          <p style="margin: 0 0 5px 0; font-weight: 600;">What aspect of your business needs the most improvement?</p>
          <p style="margin: 0; color: #374151;">${formData.aiQuestion2}</p>
        </div>` : ''}

        ${formData.aiQuestion3 ? `
        <div style="margin-bottom: 20px;">
          <p style="margin: 0 0 5px 0; font-weight: 600;">What frustrating task would you want AI to solve?</p>
          <p style="margin: 0; color: #374151;">${formData.aiQuestion3}</p>
        </div>` : ''}

        ${formData.aiQuestion4 ? `
        <div style="margin-bottom: 0;">
          <p style="margin: 0 0 5px 0; font-weight: 600;">If you are looking for consultation, describe the problem you need help resolving?</p>
          <p style="margin: 0; color: #374151;">${formData.aiQuestion4}</p>
        </div>` : ''}
      </div>
      ` : ''}

      <div style="margin-top: 30px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
        <p style="margin: 0; color: #92400e; font-weight: 600;">⏰ Response Expected Within 24 Hours</p>
      </div>
    </div>
  </body>
</html>`;

      // Send both emails
      const emailPromises = [
        // Email to client
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: formData.email,
            subject: 'Thank You for Contacting ND Scale Smart',
            html: clientHtml,
          }),
        }),
        // Email to admin
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: ADMIN_EMAIL,
            replyTo: formData.email,
            subject: `New Contact: ${formData.firstName} ${formData.lastName} - ${formData.projectType}`,
            html: adminHtml,
          }),
        }),
      ];

      const responses = await Promise.all(emailPromises);

      // Check if both emails sent successfully
      const allSuccessful = responses.every(r => r.ok);

      if (!allSuccessful) {
        const errors = await Promise.all(responses.map(async (r, i) => {
          if (!r.ok) {
            const text = await r.text();
            return { recipient: i === 0 ? 'client' : 'admin', error: text };
          }
          return null;
        }));

        console.error('Some emails failed:', errors.filter(e => e !== null));

        return new Response(JSON.stringify({
          error: 'Failed to send some emails',
          details: errors.filter(e => e !== null)
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        message: 'Contact form emails sent successfully',
        sent: 2
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
