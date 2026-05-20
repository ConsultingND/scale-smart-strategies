import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    website: "",
    projectType: "",
  });

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
              Let&apos;s Build Something Great
            </h1>
            <p className="text-xl text-muted-foreground">
              Ready to start your project? Tell us a bit about you, then take the Clarity Engine so we can show up
              prepared.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
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

            {/* Lead-capture intro + Clarity Engine CTA */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      placeholder="First name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
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
                  <Label htmlFor="projectType">Project Type</Label>
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

                {/* Clarity Engine pitch */}
                <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary to-accent text-primary-foreground p-8 mt-4">
                  <div className="absolute inset-0 circuit-pattern opacity-20" />
                  <div className="relative">
                    <p className="text-xs uppercase tracking-widest font-semibold opacity-80 mb-3">
                      Clarity Engine
                    </p>
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-4 leading-tight">
                      The best time to invest in your idea was yesterday. The next best time is today.
                    </h2>
                    <p className="text-base md:text-lg opacity-90 mb-6 max-w-2xl">
                      Take the Clarity Engine to map exactly where you are in your business or startup — and what you
                      need to actually get started. Ten minutes. No fluff. We&apos;ll show up to the call already
                      prepared.
                    </p>
                    <Button asChild size="lg" variant="secondary" className="gap-2">
                      <Link to="/quiz">
                        Take the Clarity Engine
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
