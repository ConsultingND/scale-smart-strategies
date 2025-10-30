import { useEffect, useState } from "react";
import { Quote } from "lucide-react";

const About = () => {
  const quotes = [
    "Technology should scale with your vision, not overwhelm it.",
    "Innovation isn't about having all the answers—it's about asking the right questions.",
    "The best solutions are the ones that grow with you.",
    "Small businesses deserve enterprise-level technology without the complexity.",
    "AI is a tool, not a magic wand. Strategy matters.",
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 24 * 60 * 60 * 1000); // Change once per day

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 circuit-pattern opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
              About ND Scalesmart
            </h1>
            <p className="text-xl text-muted-foreground">
              Building bridges between ambitious ideas and scalable technology.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border rounded-2xl p-8 md:p-12 shadow-lg">
              <h2 className="text-3xl font-display font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                At ND Scalesmart, we believe every small business deserves access to world-class technology—without the enterprise price tag or overwhelming complexity.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                We specialize in helping startups and growing businesses build fully functional, scalable web applications from the ground up. Whether you're launching your first product or expanding an existing platform, we provide the strategic guidance and technical expertise to make it happen.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our approach is simple: start small, build smart, and scale confidently. We focus on practical solutions that deliver real business value, not buzzwords or over-engineered systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Quote */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Quote className="h-12 w-12 text-primary mx-auto mb-6" />
            <blockquote className="text-2xl md:text-3xl font-display font-semibold leading-relaxed">
              "{quotes[currentQuote]}"
            </blockquote>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-muted rounded-2xl aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl font-display font-bold text-primary">ND</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <h2 className="text-3xl font-display font-bold">Meet the Founder</h2>
                <h3 className="text-xl font-semibold text-primary">Nahum Ducasse</h3>
                <p className="text-muted-foreground leading-relaxed">
                  With years of experience in software development and a passion for helping small businesses succeed, Nahum founded ND Scalesmart to make enterprise-level technology accessible to everyone.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Having worked with startups across various industries, Nahum understands the unique challenges small businesses face when it comes to technology. His approach combines technical expertise with business acumen to deliver solutions that truly move the needle.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  "I believe that the right technology, implemented thoughtfully, can be a game-changer for small businesses. My goal is to make that transformation as smooth and successful as possible."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-display font-bold mb-12 text-center">Core Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-xl font-display font-semibold mb-3">Clarity</h3>
                <p className="text-primary-foreground/80">
                  We explain complex concepts in plain language. No jargon, no confusion.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-display font-semibold mb-3">Partnership</h3>
                <p className="text-primary-foreground/80">
                  Your success is our success. We're in this together for the long haul.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-display font-semibold mb-3">Excellence</h3>
                <p className="text-primary-foreground/80">
                  We deliver quality work that stands the test of time and scales with your growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
