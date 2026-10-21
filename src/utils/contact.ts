import { supabase } from "@/integrations/supabase/client";

export interface ContactFormData {
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

export async function submitContactForm(formData: ContactFormData) {
  // 1. Save to database
  const { error: dbError } = await supabase
    .from('contact_submissions')
    .insert({
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email.toLowerCase().trim(),
      company: formData.company || null,
      website: formData.website || null,
      project_type: formData.projectType,
      message: formData.message,
      ai_question: formData.aiQuestion || null,
      ai_question1: formData.aiQuestion1 || null,
      ai_question2: formData.aiQuestion2 || null,
      ai_question3: formData.aiQuestion3 || null,
      ai_question4: formData.aiQuestion4 || null,
    });

  if (dbError) {
    console.error('Database error:', dbError);
    throw new Error('Failed to save contact form');
  }

  // 2. Send emails via Edge Function. The submission is already saved, so an
  // email failure is logged rather than surfaced; otherwise users resubmit and
  // create duplicate rows.
  const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`;

  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error('Email error:', response.status, body);
    }
  } catch (error) {
    console.error('Email request failed:', error);
  }

  return { success: true };
}
