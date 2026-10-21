# How to Send Newsletter Emails

This guide explains when and how emails are automatically sent to subscribers.

---

## 📧 **Automatic Emails**

Your newsletter system now automatically sends **2 types of emails**:

### 1. **Welcome Email** (Automatic)
✅ **Triggers:** When someone subscribes via the newsletter form
✅ **Already configured:** No action needed!

When a visitor subscribes:
1. They're added to the database
2. A welcome email is automatically sent
3. They see a success message

**What the email contains:**
- Welcome message with their name (if provided)
- List of what they'll receive (weekly insights)
- Links to your blog and services
- Contact information

---

### 2. **Blog Post Notification Email** (Manual trigger)
⚠️ **Triggers:** When you manually call the send function
⚠️ **Requires:** Manual integration when publishing blog posts

---

## 📝 **How to Send Blog Post Emails**

Sending is **admin-only**. The `/send` route requires the `NEWSLETTER_ADMIN_SECRET`
in an `x-admin-secret` header. Never call it from the website: anything in the
client bundle is public.

One-time setup:

```bash
supabase secrets set NEWSLETTER_ADMIN_SECRET="$(openssl rand -hex 32)"
```

Keep that value in your password manager. Then, to send a post:

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/send-blog-newsletter/send" \
  -H "Authorization: Bearer <anon-key>" \
  -H "x-admin-secret: <NEWSLETTER_ADMIN_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"blogPost":{"title":"Your Blog Post Title","slug":"your-blog-post-slug","excerpt":"A brief description."}}'
```

The response reports `total`, `sent` and `failed`. If `NEWSLETTER_ADMIN_SECRET`
is not set, the function refuses to send (HTTP 503).

---

## 🔔 **Email Content**

### Welcome Email Includes:
- Personalized greeting with subscriber's name
- What they'll receive (weekly insights)
- Links to blog and services pages
- Contact information
- Unsubscribe link

### Blog Post Email Includes:
- Personalized greeting
- Blog post title
- Blog post excerpt/preview
- "Read Full Article" button linking to the blog post
- Unsubscribe link

---

## 📊 **Email Tracking**

All sent emails are tracked in the `newsletter_send_results` table:

```sql
-- View recent newsletter sends
SELECT
  newsletter_slug,
  COUNT(*) as total_sent,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed
FROM newsletter_send_results
GROUP BY newsletter_slug
ORDER BY MAX(sent_at) DESC;
```

---

## 🚨 **Important Notes**

### Rate Limiting
- Emails are sent in batches of 50
- 1 second delay between batches
- Prevents hitting Resend's rate limits

### Email Delivery
- Resend free tier: 100 emails/day, 3,000/month
- Make sure you have enough quota before sending
- Check Resend dashboard for delivery stats

### Best Practices
1. **Test first**: Send to a test subscriber before sending to everyone
2. **Proofread**: Double-check title and excerpt for typos
3. **Timing**: Send during business hours for better open rates
4. **Consistency**: Maintain a regular schedule (e.g., weekly)

---

## 🎯 **Recommended Workflow**

1. **Write and publish blog post** on your site
2. **Verify** the blog post is live and accessible
3. **Send newsletter** using one of the methods above
4. **Monitor** the Resend dashboard for delivery status
5. **Check** the database for send results

---

## 🔍 **Troubleshooting**

### Emails not sending?
1. Check Resend API key is set in Edge Function
2. Verify domain is verified in Resend
3. Check Edge Function logs in Supabase
4. Ensure you haven't hit rate limits

### Welcome email not arriving?
1. Check spam folder
2. Verify email address is correct
3. Check Resend dashboard for delivery status
4. Look for errors in browser console

### Newsletter sends but subscribers don't receive?
1. Check Resend dashboard for bounces
2. Verify FROM_EMAIL is set correctly
3. Ensure domain is verified in Resend
4. Check if emails are marked as spam

---

## 📚 **Quick Reference**

### Send a Newsletter
Admin-only, via the `curl` command in **How to Send Blog Post Emails** above
(requires the `x-admin-secret` header).

### Function to Send Welcome Email (automatic)
```typescript
import { sendWelcomeEmail } from '@/utils/newsletter';

await sendWelcomeEmail(
  "subscriber@example.com",
  "First Name",  // optional
  "Last Name"     // optional
);
```

---

## ✅ **Next Steps**

1. Deploy the updated Edge Function to Supabase
2. Test the welcome email by subscribing yourself
3. Test sending a newsletter with a sample blog post
4. Set up a regular publishing schedule
5. Monitor engagement and delivery rates in Resend

---

Need help? Check the main `NEWSLETTER_SETUP.md` for full setup instructions.
