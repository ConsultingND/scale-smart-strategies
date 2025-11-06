# Newsletter Setup Guide

This guide will help you set up the newsletter functionality using Supabase + Resend.

## Prerequisites

- Supabase project (already configured)
- Resend account ([sign up here](https://resend.com))
- Domain for sending emails (verified in Resend)

---

## Step 1: Run Database Migration

Apply the database migration to create the `newsletter_subscribers` table:

### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref knuadvoywivfferdcwbd

# Apply the migration
supabase db push
```

### Option B: Using Supabase Dashboard

1. Go to your [Supabase Dashboard](https://app.supabase.com/project/knuadvoywivfferdcwbd)
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20250105000000_create_newsletter_subscribers.sql`
4. Paste and run the SQL

---

## Step 2: Set Up Resend

### 2.1 Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2.2 Verify Your Domain

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `ndscalesmart.com`)
4. Add the DNS records shown to your domain provider (Vercel DNS, Cloudflare, etc.)
5. Wait for verification (usually takes a few minutes)

### 2.3 Get Your API Key

1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it (e.g., "Production Newsletter")
4. Copy the API key (you won't see it again!)

---

## Step 3: Configure Supabase Environment Variables

### 3.1 Deploy the Edge Function

```bash
# Deploy the send-blog-newsletter function
supabase functions deploy send-blog-newsletter
```

### 3.2 Set Environment Secrets

```bash
# Set Resend API key
supabase secrets set RESEND_API_KEY=re_123456789...

# Set your site URL (production URL)
supabase secrets set SITE_URL=https://your-site.vercel.app

# Set the from email (must match your verified domain)
supabase secrets set FROM_EMAIL=newsletter@ndscalesmart.com
```

### 3.3 Set Local Environment Variables (for development)

Create or update `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

---

## Step 4: Testing the Newsletter

### 4.1 Test Newsletter Subscription

1. Go to your site's homepage
2. Scroll to the "Stay ahead of the curve" section
3. Enter your email and subscribe
4. Check the Supabase database to verify the subscriber was added:
   ```sql
   SELECT * FROM newsletter_subscribers;
   ```

### 4.2 Test Sending a Newsletter

You can test sending a newsletter using this code snippet:

```typescript
import { sendBlogPostNewsletter } from '@/utils/newsletter';

// Call this when you publish a blog post
const result = await sendBlogPostNewsletter({
  title: "Test Blog Post",
  slug: "test-blog-post",
  excerpt: "This is a test blog post to verify newsletter functionality."
});

console.log(result); // Check the results
```

Or test directly via the Supabase Functions:

```bash
curl -i --location --request POST 'https://knuadvoywivfferdcwbd.supabase.co/functions/v1/send-blog-newsletter' \
  --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"blogPost":{"title":"Test Post","slug":"test","excerpt":"Test excerpt"}}'
```

---

## Step 5: Integrate with Blog Publishing

When you publish a new blog post, call the `sendBlogPostNewsletter` function:

```typescript
import { sendBlogPostNewsletter } from '@/utils/newsletter';

// Example: When publishing a blog post
async function publishBlogPost(post) {
  // 1. Save the blog post to your database/CMS

  // 2. Send newsletter to subscribers
  try {
    const result = await sendBlogPostNewsletter({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
    });

    console.log(`Newsletter sent to ${result.sent} subscribers`);
  } catch (error) {
    console.error('Failed to send newsletter:', error);
    // Handle error (maybe notify admin)
  }
}
```

---

## Features Included

✅ **Newsletter subscription form** with first name and last name fields
✅ **Supabase database** to store subscribers
✅ **Duplicate prevention** - won't allow same email twice
✅ **Unsubscribe functionality** with unique tokens
✅ **Beautiful email template** with your branding
✅ **Edge Function** to send emails via Resend
✅ **Error handling** and validation

---

## Monitoring & Management

### View Subscribers

```sql
-- See all active subscribers
SELECT email, first_name, last_name, subscribed_at
FROM newsletter_subscribers
WHERE is_active = true
ORDER BY subscribed_at DESC;

-- Count subscribers
SELECT COUNT(*) FROM newsletter_subscribers WHERE is_active = true;
```

### Resend Dashboard

- Monitor email delivery rates
- View bounce rates
- Check open rates (if enabled)
- See delivery logs

---

## Costs

### Resend Pricing
- **Free tier**: 100 emails/day, 3,000 emails/month
- **Paid tier**: $20/month for 50,000 emails/month
- **Pay as you go**: $0.10 per 1,000 emails

### Supabase
- Database storage: Free tier includes 500MB
- Edge Functions: Free tier includes 500K invocations/month

---

## Troubleshooting

### Emails not sending?

1. Check Resend API key is set correctly
2. Verify your domain in Resend
3. Check Edge Function logs:
   ```bash
   supabase functions logs send-blog-newsletter
   ```

### Subscribers not being saved?

1. Check browser console for errors
2. Verify Supabase environment variables
3. Check RLS policies are applied correctly

### Unsubscribe not working?

1. Verify the token exists in the database
2. Check the unsubscribe URL format
3. Review Edge Function logs

---

## Next Steps

1. Customize the email template in `supabase/functions/send-blog-newsletter/index.ts`
2. Add analytics tracking (UTM parameters)
3. Set up welcome email for new subscribers
4. Create an admin panel to view/manage subscribers
5. Add email preferences (frequency, topics)

---

## Support

If you need help:
- Resend Documentation: https://resend.com/docs
- Supabase Documentation: https://supabase.com/docs
- Edge Functions Guide: https://supabase.com/docs/guides/functions
