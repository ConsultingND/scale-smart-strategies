import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 md:pt-0">
      {/* Circuit Pattern Background */}
      <div className="absolute inset-0 circuit-pattern" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight">
            Build Smart.{" "}
            <span className="text-gradient">Scale Confidently.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            AI-driven web development and tech strategy for small businesses.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button asChild size="lg" className="group">
              <Link to="/contact">
                Work With Us
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/services">Explore Services</Link>
            </Button>
          </div>
          
          <div className="pt-8">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
              Trusted by startups and small businesses
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
