import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PopupListing {
  id: string;
  title: string;
  description: string;
  price: number;
  location_city: string;
  listing_images: { image_url: string }[];
  seller_phone: string;
}

const FeaturedPopupAds = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [listings, setListings] = useState<PopupListing[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if popup was shown today
    const lastShown = localStorage.getItem("featuredPopupLastShown");
    const today = new Date().toDateString();
    
    if (lastShown !== today) {
      fetchScheduledPopupAds();
    }
  }, []);

  useEffect(() => {
    if (isOpen && listings.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % listings.length);
      }, 5000); // Auto-slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isOpen, listings.length]);

  const fetchScheduledPopupAds = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("popup_ad_schedules")
        .select(`
          listing_id,
          listings (
            id,
            title,
            description,
            price,
            location_city,
            seller_phone,
            listing_images (image_url)
          )
        `)
        .eq("schedule_date", today)
        .eq("admin_approved", true)
        .eq("payment_status", "paid")
        .order("slot_number", { ascending: true })
        .limit(3);

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedListings = data
          .filter(item => item.listings)
          .map(item => item.listings as any);
        
        if (formattedListings.length > 0) {
          setListings(formattedListings);
          setIsOpen(true);
        }
      }
    } catch (error) {
      console.error("Error fetching popup ads:", error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("featuredPopupLastShown", new Date().toDateString());
  };

  const handleListingClick = (listingId: string) => {
    handleClose();
    navigate(`/listing/${listingId}`);
  };

  if (!isOpen || listings.length === 0) return null;

  const currentListing = listings[currentIndex];
  const images = currentListing.listing_images || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-background rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-scale-in">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 bg-background/80 hover:bg-background rounded-full p-2 shadow-lg transition-all"
          aria-label="Close popup"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Featured Badge */}
        <Badge variant="featured" className="absolute top-3 left-3 z-20 text-xs px-2 py-1">
          Featured
        </Badge>

        {/* Image */}
        <div 
          className="relative aspect-video bg-muted cursor-pointer"
          onClick={() => handleListingClick(currentListing.id)}
        >
          {images.length > 0 ? (
            <img
              src={images[0].image_url}
              alt={currentListing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image Available
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div 
            className="cursor-pointer" 
            onClick={() => handleListingClick(currentListing.id)}
          >
            <h3 className="text-xl font-bold text-foreground mb-1">
              {currentListing.title}
            </h3>
            <p className="text-2xl font-bold text-primary mb-1">
              ₹{currentListing.price.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              {currentListing.location_city}
            </p>
            {currentListing.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {currentListing.description}
              </p>
            )}
          </div>

          {/* Indicator Dots */}
          {listings.length > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              {listings.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "w-6 bg-primary"
                      : "w-2 bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to listing ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Close Button at Bottom */}
          <Button
            onClick={handleClose}
            variant="outline"
            className="w-full mt-2"
            size="sm"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedPopupAds;
