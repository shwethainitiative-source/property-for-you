import { CheckCircle, Shield, Clock, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const WhyChooseUs = () => {
  const features = [
    {
      icon: CheckCircle,
      title: "10,000+ Properties Listed",
      description: "Verified listings across Karnataka with detailed information",
    },
    {
      icon: Heart,
      title: "5,000+ Happy Customers",
      description: "Trusted by thousands for buying, selling, and renting",
    },
    {
      icon: Shield,
      title: "50+ Expert Partners",
      description: "Professional agents and verified sellers at your service",
    },
    {
      icon: Clock,
      title: "25+ Cities Covered",
      description: "Major cities and towns across Karnataka",
    },
  ];

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="space-y-10">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Why Choose Us
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Your trusted marketplace for properties, automobiles, and jewellery
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
