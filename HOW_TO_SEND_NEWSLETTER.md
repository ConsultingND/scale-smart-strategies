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

### Option A: Manual Trigger (Quick Test)

You can manually send a newsletter from the browser console:

```javascript
// Open browser console (F12) and paste this:
import { sendBlogPostNewsletter } from '@/utils/newsletter';

await sendBlogPostNewsletter({
  title: "Your Blog Post Title",
  slug: "your-blog-post-slug",
  excerpt: "A brief description of your blog post that will appear in the email."
});
```

### Option B: Integrate with Blog Publishing Workflow

If you're managing blog posts through a CMS or admin panel, add this code to your blog publishing function:

```typescript
import { sendBlogPostNewsletter } from '@/utils/newsletter';

async function publishBlogPost(post) {
  // 1. Save/publish your blog post first
  const published = await saveBlogPost(post);

  // 2. Send newsletter to all subscribers
  try {
    const result = await sendBlogPostNewsletter({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
    });

    console.log(`Newsletter sent to ${result.sent} subscribers`);
  } catch (error) {
    console.error('Newsletter send failed:', error);
    // Handle error - maybe notify admin
  }
}
```

### Option C: Create a Custom Admin Page

You can create a simple admin page to send newsletters:

**File: `src/pages/Admin/SendNewsletter.tsx`**

```typescript
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendBlogPostNewsletter } from "@/utils/newsletter";

const SendNewsletter = () => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await sendBlogPostNewsletter({ title, slug, excerpt });
      setResult(res);
      alert(`Newsletter sent to ${res.sent} subscribers!`);
    } catch (error) {
      alert('Failed to send newsletter: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Send Newsletter</h1>

      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block mb-2">Blog Post Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter blog post title"
          />
        </div>

        <div>
          <label className="block mb-2">Blog Post Slug</label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            placeholder="blog-post-slug"
          />
        </div>

        <div>
          <label className="block mb-2">Excerpt</label>
          <Textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
            placeholder="Brief description that will appear in the email"
            rows={4}
          />
        </div>

        <Button type="submit" disabled={sending}>
          {sending ? "Sending..." : "Send Newsletter to All Subscribers"}
        </Button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <p>✅ Newsletter sent successfully!</p>
          <p>Total: {result.total} subscribers</p>
          <p>Sent: {result.sent} emails</p>
          <p>Failed: {result.failed} emails</p>
        </div>
      )}
    </div>
  );
};

export default SendNewsletter;
```

Then add the route to `src/App.tsx`:

```typescript
import SendNewsletter from "./pages/Admin/SendNewsletter";

// In your Routes:
<Route path="/admin/send-newsletter" element={<SendNewsletter />} />
```

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

### Function to Send Newsletter
```typescript
import { sendBlogPostNewsletter } from '@/utils/newsletter';

await sendBlogPostNewsletter({
  title: "Blog Post Title",
  slug: "blog-post-slug",
  excerpt: "Brief description..."
});
```

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
