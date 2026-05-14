import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

interface Sponsorship {
  id: string;
  business_name: string;
  banner_url: string;
  destination_url: string;
}

const SponsoredAdsCarousel = () => {
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const autoplayRef = useRef(Autoplay({ delay: 3000, stopOnInteraction: false }));

  useEffect(() => {
    fetchActiveSponsorships();
  }, []);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const fetchActiveSponsorships = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsorships')
        .select('id, business_name, banner_url, destination_url')
        .eq('status', 'approved')
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSponsorships(data || []);
    } catch (error) {
      console.error("Error fetching active sponsorships:", error);
    }
  };

  const handleClick = async (sponsorship: Sponsorship) => {
    try {
      const { data: currentData } = await supabase
        .from('sponsorships')
        .select('clicks')
        .eq('id', sponsorship.id)
        .single();

      if (currentData) {
        await supabase
          .from('sponsorships')
          .update({ clicks: (currentData.clicks || 0) + 1 })
          .eq('id', sponsorship.id);
      }

      window.open(sponsorship.destination_url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error("Error tracking click:", error);
      window.open(sponsorship.destination_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (sponsorships.length === 0) {
    return null;
  }

  return (
    <section className="py-6 mb-8 bg-muted/20">
      <div className="container mx-auto px-4 max-w-4xl">
        <Carousel
          className="w-full" 
          opts={{ loop: true }}
          plugins={[autoplayRef.current]}
          setApi={setApi}
        >
          <CarouselContent>
            {sponsorships.map((sponsorship) => (
              <CarouselItem key={sponsorship.id}>
                <Card 
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => handleClick(sponsorship)}
                >
                  {/* Banner Image with compact aspect ratio */}
                  <div className="relative aspect-[16/7] bg-muted">
                    <img
                      src={sponsorship.banner_url}
                      alt={sponsorship.business_name}
                      className="w-full h-full object-cover"
                    />
                    {/* Badge on every slide */}
                    <Badge className="absolute top-3 left-3 z-10 bg-green-500 text-white hover:bg-green-600 text-xs">
                      Sponsored
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-foreground">
                        {sponsorship.business_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Premium services and exclusive offers
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">
                        by {sponsorship.business_name}
                      </span>
                      <a
                        href={sponsorship.destination_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Learn More
                        <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Dots Indicator */}
        {sponsorships.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {sponsorships.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-2 rounded-full transition-all ${
                  index === current
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SponsoredAdsCarousel;
