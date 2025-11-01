import { Code2, Cpu, Wrench } from "lucide-react";
import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";

const Home = () => {
  const services = [
    {
      icon: Code2,
      title: "Web App Development",
      description: "Build custom web applications from scratch, tailored to your business needs.",
      features: [
        "Full-stack development with modern frameworks",
        "Responsive, mobile-first design",
        "Scalable architecture from day one",
        "API integrations and third-party services",
      ],
    },
    {
      icon: Cpu,
      title: "AI Strategy",
      description: "Leverage AI to streamline operations and unlock new opportunities.",
      features: [
        "AI readiness assessment",
        "Custom AI solution design",
        "Implementation and integration",
        "Training and ongoing support",
      ],
    },
    {
      icon: Wrench,
      title: "Technical Strategy & Maintenance",
      description: "Long-term support to keep your systems running smoothly as you scale.",
      features: [
        "Performance monitoring and optimization",
        "Security updates and patches",
        "Feature enhancements",
        "Strategic technical planning",
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <Hero />

      {/* Services Overview */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              How We Help You Scale
            </h2>
            <p className="text-lg text-muted-foreground">
              From initial strategy to ongoing maintenance, we're your trusted technology partner every step of the way.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <ServiceCard {...service} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      {/* <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Trusted by Growing Businesses
            </h2>
            <p className="text-lg text-muted-foreground">
              We partner with startups and small businesses across industries to turn their vision into reality.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-50">
            {/* Placeholder for client logos 
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-32 h-16 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm"
              >
                Client {i}
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Ready to Build Your Next Project?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            Let's discuss how we can help you build smart and scale confidently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-11 px-8"
            >
              Get Started
            </a>
            <a
              href="/services"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-primary-foreground/20 bg-transparent hover:bg-primary-foreground/10 h-11 px-8"
            >
              View Services
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
