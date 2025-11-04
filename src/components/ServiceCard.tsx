import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  iconBackground?: string;
}

const ServiceCard = ({ icon: Icon, title, description, features, iconBackground }: ServiceCardProps) => {
  return (
    <Card className="hover-lift h-full border-2 hover:border-primary/50 transition-all duration-300">
      <CardHeader>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${iconBackground || "bg-primary/10"}`}>
          <Icon className={`h-6 w-6 ${iconBackground ? "text-white" : "text-primary"}`} />
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button asChild variant="ghost" className="group">
          <Link to="/contact">
            Learn More
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
