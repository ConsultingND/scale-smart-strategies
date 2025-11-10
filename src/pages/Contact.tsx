import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin } from "lucide-react";
import { submitContactForm } from "@/utils/contact";

const Contact = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    website: "",
    projectType: "",
    message: "",
    aiQuestion: "",
    aiQuestion1: "",
    aiQuestion2: "",
    aiQuestion3: "",
    aiQuestion4: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await submitContactForm(formData);

      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours. Check your email for confirmation!",
      });

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        website: "",
        projectType: "",
        message: "",
        aiQuestion: "",
        aiQuestion1: "",
        aiQuestion2: "",
        aiQuestion3: "",
        aiQuestion4: "",
      });
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: "Oops!",
        description: "Something went wrong. Please try again or email us directly at solutions@ndscalesmart.com",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 circuit-pattern opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
              Let's Build Something Great
            </h1>
            <p className="text-xl text-muted-foreground">
              Ready to start your project? Fill out the form below and we'll be in touch within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h2 className="text-2xl font-display font-bold mb-6">Get in Touch</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a href="mailto:solutions@ndscalesmart.com" className="text-muted-foreground hover:text-primary">
                        solutions@ndscalesmart.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground">Available upon request</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">Remote-first, serving clients worldwide</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-display font-semibold mb-3">What to Expect</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Response within 24 hours</li>
                  <li>• Free initial consultation</li>
                  <li>• No-obligation proposal</li>
                  <li>• Clear pricing and timeline</li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      required
                      placeholder="First name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      required
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    placeholder="john@company.com"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleChange("company", e.target.value)}
                      placeholder="Your Company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website (optional)</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                      placeholder="https://yoursite.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectType">Project Type *</Label>
                  <Select value={formData.projectType} onValueChange={(value) => handleChange("projectType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web-app">Web App Development</SelectItem>
                      <SelectItem value="feature-expansion">Feature Expansion</SelectItem>
                      <SelectItem value="ai-strategy">AI Strategy</SelectItem>
                      <SelectItem value="maintenance">Technical Maintenance</SelectItem>
                      <SelectItem value="consultation">General Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Tell Us About Your Project*</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    required
                    placeholder="Describe your project, goals, timeline, and any specific requirements..."
                    rows={5}
                  />
                </div>

                <Separator className="my-8" />

                <h3>AI Strategy Opportunity Questions</h3>

                <div className="space-y-2">
                  <Label htmlFor="aiQuestion">What aspect of your business could we help simplify right now?</Label>
                  <Textarea
                    id="aiQuestion"
                    value={formData.aiQuestion}
                    onChange={(e) => handleChange("aiQuestion", e.target.value)}
                    placeholder="e.g., Customer support, data entry..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiQuestion1">Where would AI save you or your team the most time?</Label>
                  <Textarea
                    id="aiQuestion"
                    value={formData.aiQuestion1}
                    onChange={(e) => handleChange("aiQuestion1", e.target.value)}
                    placeholder="e.g., Decision making, content creation..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiQuestion2">What aspect of your business needs the most improvement?</Label>
                  <Textarea
                    id="aiQuestion"
                    value={formData.aiQuestion2}
                    onChange={(e) => handleChange("aiQuestion2", e.target.value)}
                    placeholder="e.g., Report generation, scheduling..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiQuestion3">What frustrating task would you want AI to solve?</Label>
                  <Textarea
                    id="aiQuestion"
                    value={formData.aiQuestion3}
                    onChange={(e) => handleChange("aiQuestion3", e.target.value)}
                    placeholder="e.g., Manual data processing..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiQuestion4">If you are looking for consultation, describe the problem you need help resolving?</Label>
                  <Textarea
                    id="aiQuestion"
                    value={formData.aiQuestion4}
                    onChange={(e) => handleChange("aiQuestion4", e.target.value)}
                    placeholder="e.g., Tracking progress and measuring development success..."
                    rows={4}
                  />
                </div>

                <Button type="submit" size="lg" disabled={isLoading} className="w-full md:w-auto">
                  {isLoading ? "Sending..." : "Send Inquiry"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
