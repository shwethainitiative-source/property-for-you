import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface Sponsorship {
  id: string;
  business_name: string;
  banner_url: string;
  destination_url: string;
}

const SponsoredAdsSidebar = () => {
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [api1, setApi1] = useState<CarouselApi>();
  const [api2, setApi2] = useState<CarouselApi>();
  const [current1, setCurrent1] = useState(0);
  const [current2, setCurrent2] = useState(0);
  const autoplay1Ref = useRef(Autoplay({ delay: 3000, stopOnInteraction: false }));
  const autoplay2Ref = useRef(Autoplay({ delay: 3000, stopOnInteraction: false }));

  useEffect(() => {
    fetchActiveSponsorships();
  }, []);

  useEffect(() => {
    if (!api1) return;
    setCurrent1(api1.selectedScrollSnap());
    api1.on("select", () => setCurrent1(api1.selectedScrollSnap()));
  }, [api1]);

  useEffect(() => {
    if (!api2) return;
    setCurrent2(api2.selectedScrollSnap());
    api2.on("select", () => setCurrent2(api2.selectedScrollSnap()));
  }, [api2]);

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
    return (
      <div className="sticky top-4 bg-muted/30 rounded-lg p-4 border">
        <h3 className="text-sm font-semibold mb-3">Sponsored</h3>
        <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Ad Space</span>
        </div>
      </div>
    );
  }

  const renderCarousel = (setApiFunc: (api: CarouselApi) => void, autoplayRef: any, current: number) => (
    <Card className="overflow-hidden">
      <Carousel
        opts={{ loop: true }}
        plugins={[autoplayRef.current]}
        setApi={setApiFunc}
      >
        <CarouselContent>
          {sponsorships.map((sponsorship) => (
            <CarouselItem key={sponsorship.id}>
              <div
                className="cursor-pointer relative"
                onClick={() => handleClick(sponsorship)}
              >
                {/* Banner Image */}
                <div className="relative aspect-video bg-muted">
                  <img
                    src={sponsorship.banner_url}
                    alt={sponsorship.business_name}
                    className="w-full h-full object-cover"
                  />
                  {/* Badge on every slide */}
                  <Badge className="absolute top-3 left-3 z-10 bg-green-500 text-white hover:bg-green-600">
                    Sponsored
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <h4 className="font-bold text-lg line-clamp-2">
                    {sponsorship.business_name}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    Premium services and exclusive offers
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      by {sponsorship.business_name}
                    </span>
                    <a
                      href={sponsorship.destination_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Learn More
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dots Indicator */}
      {sponsorships.length > 1 && (
        <div className="flex justify-center gap-1.5 py-3">
          {sponsorships.map((_, index) => (
            <button
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === current
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-muted-foreground/30"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      {renderCarousel(setApi1, autoplay1Ref, current1)}
      {renderCarousel(setApi2, autoplay2Ref, current2)}
    </div>
  );
};

export default SponsoredAdsSidebar;
