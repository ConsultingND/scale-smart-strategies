import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

const NewsletterSection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call - replace with actual newsletter service integration
    setTimeout(() => {
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
      });
      setName("");
      setEmail("");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <section className="bg-gradient-to-br from-primary via-primary to-primary/90 py-16">
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
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
            />
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
            />
            <Button
              type="submit"
              disabled={isLoading}
              variant="secondary"
              className="w-full"
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
