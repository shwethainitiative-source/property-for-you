import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const sponsoredAds = [
  {
    id: 1,
    emoji: "💎",
    title: "Luxury Collection",
    subtitle: "Certified Jewellery Collection",
    description: "Hallmarked gold & diamond jewellery. Certified quality. Trusted by thousands.",
  },
  {
    id: 2,
    emoji: "🚗",
    title: "Premium Cars",
    subtitle: "Verified Automobile Dealers",
    description: "Wide range of certified pre-owned cars. Best prices guaranteed.",
  },
  {
    id: 3,
    emoji: "🏡",
    title: "Dream Homes",
    subtitle: "Verified Property Listings",
    description: "Exclusive properties in prime locations. Direct from owners.",
  },
];

const SponsoredSection = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <Carousel className="w-full" opts={{ loop: true }}>
          <CarouselContent>
            {sponsoredAds.map((ad) => (
              <CarouselItem key={ad.id}>
                <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="aspect-video md:aspect-square bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="text-6xl mb-4">{ad.emoji}</div>
                        <p className="text-2xl font-bold text-primary">{ad.title}</p>
                      </div>
                    </div>
                    <div className="p-6 md:p-8 flex flex-col justify-center space-y-4">
                      <Badge className="w-fit bg-green-500 text-white hover:bg-green-600">Sponsored</Badge>
                      <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                        {ad.subtitle}
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        {ad.description}
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
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>
    </section>
  );
};

export default SponsoredSection;
