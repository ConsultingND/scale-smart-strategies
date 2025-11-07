import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { sendWelcomeEmail } from "@/utils/newsletter";

const NewsletterSection = () => {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Save subscriber to Supabase
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: email.toLowerCase().trim(),
          first_name: firstName.trim() || null,
        });

      if (error) {
        // Check if it's a duplicate email error
        if (error.code === '23505') {
          toast({
            title: "Already subscribed",
            description: "This email is already subscribed to our newsletter.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        // Send welcome email in the background (don't wait for it)
        sendWelcomeEmail(email.toLowerCase().trim(), firstName.trim() || undefined)
          .catch((err) => console.error('Welcome email failed (non-critical):', err));

        toast({
          title: "Success!",
          description: "You've been subscribed to our newsletter. Check your email for a welcome message!",
        });
        setFirstName("");
        setEmail("");
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Oops!",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // bg-gradient-to-br from-primary via-primary to-primary/90 py-10 m-16 rounded-lg
    <section className="bg-gradient-to-br from-[#0B1E3F] to-[#1a3a5f] py-10 m-16 rounded-lg">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-foreground/10 p-4 rounded-full">
              <Mail className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          
          <h3 className="text-3xl font-display font-bold text-primary-foreground mb-4">
            Stay ahead of the curve
          </h3>
          
          <p className="text-primary-foreground/90 mb-8">
            Subscribe for weekly insights on AI, web development, and scaling your business smartly.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4 desktop:space-y-0 desktop:space-x-2">
            <Input
              type="text"
              placeholder="First name (optional)"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 block desktop:inline-block desktop:w-auto"
            />
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 block desktop:inline-block desktop:w-auto"
            />
            <Button
              type="submit"
              disabled={isLoading}
              variant="secondary"
              className="w-full desktop:w-auto desktop:inline-block"
            >
              {isLoading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
          
          <p className="text-sm text-primary-foreground/60 mt-6">
            No spam. Unsubscribe anytime. Your data is safe with us.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
