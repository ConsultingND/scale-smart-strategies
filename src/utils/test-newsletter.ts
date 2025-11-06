/**
 * Newsletter System Test Suite
 *
 * This file contains functions to test the newsletter implementation
 * Run these tests from the browser console after starting the dev server
 */

import { supabase } from "@/integrations/supabase/client";
import { sendBlogPostNewsletter } from "./newsletter";

/**
 * Test 1: Check if newsletter_subscribers table exists and is accessible
 */
export async function testDatabaseTables() {
  console.log("🔍 Test 1: Checking database tables...");

  try {
    // Test newsletter_subscribers table
    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .limit(1);

    if (subError) {
      console.error("❌ newsletter_subscribers table error:", subError);
      return { success: false, error: subError.message };
    }

    console.log("✅ newsletter_subscribers table exists and is accessible");

    // Test newsletter_send_results table (won't work from client due to RLS, but we can try)
    const { error: resultsError } = await supabase
      .from('newsletter_send_results')
      .select('id')
      .limit(1);

    if (resultsError && resultsError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is fine
      console.warn("⚠️  newsletter_send_results table access limited (expected due to RLS):", resultsError.message);
    } else {
      console.log("✅ newsletter_send_results table exists");
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Database test failed:", error);
    return { success: false, error };
  }
}

/**
 * Test 2: Test newsletter subscription with a test email
 */
export async function testNewsletterSubscription(testEmail: string = `test+${Date.now()}@example.com`) {
  console.log("🔍 Test 2: Testing newsletter subscription...");
  console.log(`Using test email: ${testEmail}`);

  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: testEmail,
        first_name: 'Test',
        last_name: 'User',
      })
      .select();

    if (error) {
      console.error("❌ Subscription failed:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Test subscriber added successfully:", data);

    // Verify the subscriber was added
    const { data: verifyData, error: verifyError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (verifyError) {
      console.error("❌ Could not verify subscriber:", verifyError);
      return { success: false, error: verifyError.message };
    }

    console.log("✅ Subscriber verified in database:", verifyData);
    console.log("   - Has unsubscribe token:", !!verifyData.unsubscribe_token);
    console.log("   - Is active:", verifyData.is_active);

    return { success: true, subscriber: verifyData };
  } catch (error) {
    console.error("❌ Subscription test failed:", error);
    return { success: false, error };
  }
}

/**
 * Test 3: Check if Edge Function is deployed and accessible
 */
export async function testEdgeFunction() {
  console.log("🔍 Test 3: Testing Edge Function accessibility...");

  try {
    // Try to invoke the function with minimal data
    const { data, error } = await supabase.functions.invoke('send-blog-newsletter/send', {
      body: {
        blogPost: {
          title: 'Test Post',
          slug: 'test-post',
          excerpt: 'This is a test',
        },
      },
    });

    if (error) {
      console.error("❌ Edge Function error:", error);

      // Check for specific error types
      if (error.message?.includes('RESEND_API_KEY')) {
        console.warn("⚠️  Edge Function is deployed but RESEND_API_KEY is not set");
        return { success: false, error: 'Missing RESEND_API_KEY environment variable', deployed: true };
      }

      if (error.message?.includes('not found') || error.message?.includes('404')) {
        console.error("❌ Edge Function not deployed or wrong endpoint");
        return { success: false, error: 'Function not found', deployed: false };
      }

      return { success: false, error: error.message, deployed: true };
    }

    console.log("✅ Edge Function is deployed and responded:", data);
    return { success: true, data, deployed: true };
  } catch (error) {
    console.error("❌ Edge Function test failed:", error);
    return { success: false, error, deployed: false };
  }
}

/**
 * Test 4: Check current subscriber count
 */
export async function getSubscriberCount() {
  console.log("🔍 Test 4: Getting subscriber count...");

  try {
    const { count, error } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (error) {
      console.error("❌ Could not count subscribers:", error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Active subscribers: ${count}`);
    return { success: true, count };
  } catch (error) {
    console.error("❌ Count test failed:", error);
    return { success: false, error };
  }
}

/**
 * Test 5: Send a test newsletter (only if there are subscribers and env is set up)
 */
export async function testSendNewsletter() {
  console.log("🔍 Test 5: Testing newsletter send...");
  console.log("⚠️  This will send emails to all subscribers!");
  console.log("⚠️  Make sure you have set up Resend API key first!");

  try {
    const result = await sendBlogPostNewsletter({
      title: "Test Newsletter Email",
      slug: "test-newsletter",
      excerpt: "This is a test email to verify the newsletter system is working correctly.",
    });

    console.log("✅ Newsletter send result:", result);
    return { success: true, result };
  } catch (error) {
    console.error("❌ Newsletter send failed:", error);
    return { success: false, error };
  }
}

/**
 * Run all tests sequentially
 */
export async function runAllTests(includeSendTest = false) {
  console.log("🚀 Starting Newsletter System Tests...\n");

  const results = {
    database: await testDatabaseTables(),
    subscription: await testNewsletterSubscription(),
    edgeFunction: await testEdgeFunction(),
    subscriberCount: await getSubscriberCount(),
  };

  console.log("\n📊 Test Results Summary:");
  console.log("========================");
  console.log("Database Tables:", results.database.success ? "✅ PASS" : "❌ FAIL");
  console.log("Subscription:", results.subscription.success ? "✅ PASS" : "❌ FAIL");
  console.log("Edge Function:", results.edgeFunction.success ? "✅ PASS" : "❌ FAIL");
  console.log("Subscriber Count:", results.subscriberCount.success ? "✅ PASS" : "❌ FAIL");

  if (includeSendTest) {
    console.log("\n⚠️  Running newsletter send test...");
    const sendResult = await testSendNewsletter();
    results.send = sendResult;
    console.log("Newsletter Send:", sendResult.success ? "✅ PASS" : "❌ FAIL");
  }

  const allPassed = Object.values(results).every((r: any) => r.success);

  console.log("\n" + "=".repeat(40));
  if (allPassed) {
    console.log("🎉 ALL TESTS PASSED! Newsletter system is ready!");
  } else {
    console.log("⚠️  Some tests failed. Check the errors above.");
  }
  console.log("=".repeat(40) + "\n");

  return results;
}

// Export for console usage
if (typeof window !== 'undefined') {
  (window as any).newsletterTests = {
    runAllTests,
    testDatabaseTables,
    testNewsletterSubscription,
    testEdgeFunction,
    getSubscriberCount,
    testSendNewsletter,
  };

  console.log("📝 Newsletter tests loaded! Use window.newsletterTests to run tests:");
  console.log("   - window.newsletterTests.runAllTests()");
  console.log("   - window.newsletterTests.testDatabaseTables()");
  console.log("   - window.newsletterTests.testNewsletterSubscription()");
  console.log("   - window.newsletterTests.testEdgeFunction()");
  console.log("   - window.newsletterTests.getSubscriberCount()");
  console.log("   - window.newsletterTests.testSendNewsletter() ⚠️  Will send real emails!");
}
