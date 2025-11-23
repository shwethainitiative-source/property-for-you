import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";

interface Sponsorship {
  id: string;
  business_name: string;
  banner_url: string;
  destination_url: string;
}

const SponsoredAdsCarousel = () => {
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);

  useEffect(() => {
    fetchActiveSponsorships();
  }, []);

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
      <section className="relative bg-gradient-to-br from-primary/10 to-accent/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-primary">
                The Property For You — Buy. Sell. Connect.
              </h1>
              <p className="text-lg md:text-xl text-primary/80 max-w-2xl mx-auto">
                Find verified listings for land, homes, cars, and jewellery — all in one trusted place.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <Carousel 
          className="w-full" 
          opts={{ loop: true, align: "start" }}
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
        >
          <CarouselContent>
            {sponsorships.map((sponsorship) => (
              <CarouselItem key={sponsorship.id}>
                <Card 
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleClick(sponsorship)}
                >
                  <div className="relative aspect-[3/1] md:aspect-[4/1]">
                    <img
                      src={sponsorship.banner_url}
                      alt={`${sponsorship.business_name} - Sponsored`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                      <h2 className="text-white text-3xl md:text-4xl font-bold mb-2">
                        {sponsorship.business_name}
                      </h2>
                      <Button 
                        variant="secondary" 
                        className="w-fit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClick(sponsorship);
                        }}
                      >
                        View Collection
                      </Button>
                    </div>
                    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">
                      Sponsored
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          {sponsorships.length > 1 && (
            <>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
};

export default SponsoredAdsCarousel;
