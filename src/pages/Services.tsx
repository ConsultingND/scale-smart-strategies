import { Code2, Cpu, Wrench, CheckCircle2, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Services = () => {
  const services = [
    {
      id: "web-app-development",
      icon: Code2,
      title: "Web App Development",
      subtitle: "Build custom web applications from scratch",
      description: "We transform your vision into fully functional, scalable web applications. From concept to deployment, we handle every aspect of development.",
      benefits: [
        "Custom-built solutions aligned with your goals",
        "Modern tech stack (React, Node.js, PostgreSQL)",
        "Mobile-responsive design",
        "Database architecture & optimization",
        "API development and third-party integrations",
        "Comprehensive testing and QA",
        "Cloud deployment, infrastructure, and launch support",
      ],
    },
    {
      id: "feature-expansion",
      icon: Sparkles,
      title: "Feature Expansion",
      subtitle: "Add new functionalities or optimize existing systems",
      description: "Already have an application? We can enhance it with new features, improve performance, and modernize outdated code to keep your product competitive.",
      benefits: [
        "Code refactoring and technical assessments",
        "Feature planning and roadmap development",
        "Performance optimization",
        "Database redesign and migration",
        "Legacy system modernization",
        "Seamless integration with existing workflows",
      ],
    },
    {
      id: "ai-strategy",
      icon: Cpu,
      title: "AI Strategy & Integration",
      subtitle: "Integrate AI intelligently to streamline operations",
      description: "Move beyond the AI hype. We help you identify genuine AI opportunities and where AI can make the biggest impact in your business. Learn how to implement practical solutions, and train your team to leverage AI effectively for competitive advantage.",
      benefits: [
        "AI readiness assessment",
        "Use case identification and ROI analysis",
        "Custom AI solution design",
        "Integration with existing systems",
        "Training and documentation",
        "Data analysis & insights, with support and optimization",
      ],
    },
    {
      id: "technical-strategy",
      icon: Wrench,
      title: "Technical Strategy & Maintenance",
      subtitle: "Long-term support to keep your systems running smoothly",
      description: "Technology is never \"set it and forget it.\" We provide ongoing maintenance, monitoring, and strategic guidance to ensure your applications scale with your business.",
      benefits: [
        "24/7 monitoring and uptime management",
        "Regular security updates and patches",
        "Performance monitoring and optimization",
        "Backup and disaster recovery",
        "Strategic technical planning",
        "Priority support",
      ],
    },
    {
      id: "developer-vetting",
      icon: Users,
      title: "Developer Vetting & Consulting",
      subtitle: "Expert guidance for non-technical founders",
      description: "Building a successful product requires more than just hiring developers—it requires knowing how to work with them effectively. We help non-technical founders navigate the technical landscape with confidence.",
      benefits: [
        "How to communicate effectively with your dev team",
        "Tools and frameworks to convey project details, technical proposals, and estimates",
        "Tracking progress and measuring success",
        "Building a weekly cadence and productive workflows",
        "Vetting and interviewing technical candidates",
      ],
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 circuit-pattern opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
              Services That Scale With You
            </h1>
            <p className="text-xl text-muted-foreground">
              From initial development to long-term growth, we provide the technical expertise you need at every stage.
            </p>
          </div>
        </div>
      </section>

      {/* Services Detail */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-24">
            {services.map((service, index) => (
              <div
                key={index}
                className={`grid md:grid-cols-2 gap-12 items-center pl-8 ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className={`space-y-6 ${index % 2 === 1 ? "md:order-2" : ""}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                      index === 0 ? "bg-gradient-to-br from-blue-500 to-indigo-600" :
                      index === 1 ? "bg-gradient-to-br from-purple-500 to-pink-600" :
                      index === 2 ? "bg-gradient-to-br from-green-500 to-teal-600" :
                      index === 3 ? "bg-gradient-to-br from-orange-500 to-red-600" :
                      index === 4 ? "bg-gradient-to-br from-purple-500 to-pink-600" :
                      "bg-primary/10"
                    }`}>
                      <service.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 id={service.id} className="text-3xl font-display font-bold scroll-mt-24">{service.title}</h2>
                      <p className="text-muted-foreground">{service.subtitle}</p>
                    </div>
                  </div>
                  
                  <p className="text-lg text-muted-foreground">{service.description}</p>
                  
                  <Button asChild size="lg" className="mt-6">
                    <Link to="/contact">Get Started</Link>
                  </Button>
                </div>
                
                <div className={`bg-muted rounded-2xl min-h-80 flex items-center justify-center p-6 ${index % 2 === 1 ? "md:order-1" : ""}`}>
                  <div className="space-y-3 w-full">
                    {service.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm md:text-base text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Not Sure Where to Start?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            Book a free consultation and we'll help you identify the best path forward for your business.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/contact#top">Book a Consultation</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Services;
