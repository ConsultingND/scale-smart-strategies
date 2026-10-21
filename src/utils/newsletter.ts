import { supabase } from "@/integrations/supabase/client";

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
 * Unsubscribe a user from the newsletter using their unique token.
 * Throws if the token doesn't match a subscriber.
 */
export async function unsubscribeFromNewsletter(token: string) {
  const { data, error } = await supabase.rpc('unsubscribe_newsletter', { p_token: token });

  if (error) {
    console.error('Error unsubscribing:', error);
    throw error;
  }

  if (data !== true) {
    throw new Error('Invalid or expired unsubscribe token');
  }

  return { success: true };
}
