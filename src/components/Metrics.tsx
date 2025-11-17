import { TrendingUp, Users, Award, MapPin } from "lucide-react";

const Metrics = () => {
  const stats = [
    {
      icon: TrendingUp,
      value: "10,000+",
      label: "Active Listings",
    },
    {
      icon: Users,
      value: "5,000+",
      label: "Happy Customers",
    },
    {
      icon: Award,
      value: "50+",
      label: "Expert Partners",
    },
    {
      icon: MapPin,
      value: "25+",
      label: "Cities Covered",
    },
  ];

  return (
    <section className="py-12 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-3 p-6 bg-card rounded-xl hover:shadow-lg transition-shadow"
            >
              <div className="p-3 bg-primary/10 rounded-full">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Metrics;
