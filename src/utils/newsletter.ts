import { supabase } from "@/integrations/supabase/client";

export interface BlogPostData {
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
}

/**
 * Send a blog post to all newsletter subscribers via Resend
 * This function calls a Supabase Edge Function that handles the email sending
 */
export async function sendBlogPostNewsletter(blogPost: BlogPostData) {
  try {
    const { data, error } = await supabase.functions.invoke('send-blog-newsletter/send', {
      body: { blogPost },
    });

    if (error) {
      console.error('Error sending newsletter:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send newsletter:', error);
    throw error;
  }
}

/**
 * Send a welcome email to a new subscriber
 */
export async function sendWelcomeEmail(email: string, firstName?: string, lastName?: string) {
  try {
    const { data, error } = await supabase.functions.invoke('send-blog-newsletter/welcome', {
      body: {
        email,
        firstName: firstName || null,
        lastName: lastName || null,
      },
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}

/**
 * Unsubscribe a user from the newsletter using their unique token
 */
export async function unsubscribeFromNewsletter(token: string) {
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ is_active: false })
      .eq('unsubscribe_token', token);

    if (error) {
      console.error('Error unsubscribing:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    throw error;
  }
}
