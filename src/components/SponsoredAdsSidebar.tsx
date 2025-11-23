import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

interface Sponsorship {
  id: string;
  business_name: string;
  banner_url: string;
  destination_url: string;
}

const SponsoredAdsSidebar = () => {
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
      <div className="sticky top-4 bg-muted/30 rounded-lg p-4 border">
        <h3 className="text-sm font-semibold mb-3">Sponsored</h3>
        <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Ad Space</span>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-4 space-y-4">
      <h3 className="text-sm font-semibold px-4">Sponsored</h3>
      {sponsorships.map((sponsorship) => (
        <Card 
          key={sponsorship.id}
          className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleClick(sponsorship)}
        >
          <div className="relative">
            <img
              src={sponsorship.banner_url}
              alt={`${sponsorship.business_name} - Sponsored`}
              className="w-full h-auto object-cover"
            />
            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur px-2 py-1 rounded-full text-xs font-medium">
              Sponsored
            </div>
          </div>
          <div className="p-3">
            <p className="text-sm font-semibold line-clamp-2">{sponsorship.business_name}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SponsoredAdsSidebar;
