import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const SponsoredSection = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <Card className="overflow-hidden hover:shadow-xl transition-shadow">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="aspect-video md:aspect-square bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">💎</div>
                <p className="text-2xl font-bold text-primary">Luxury Collection</p>
              </div>
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-center space-y-4">
              <Badge className="w-fit bg-accent text-accent-foreground">Sponsored</Badge>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                Certified Jewellery Collection
              </h3>
              <p className="text-muted-foreground text-lg">
                Hallmarked gold & diamond jewellery. Certified quality. Trusted by thousands.
              </p>
              <div className="pt-4">
                <a
                  href="#"
                  className="inline-flex items-center text-primary font-semibold hover:underline"
                >
                  View Collection →
                </a>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default SponsoredSection;
