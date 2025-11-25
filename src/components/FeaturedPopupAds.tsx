import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FeaturedListing {
  id: string;
  title: string;
  price: number;
  location_city: string;
  listing_images: { image_url: string }[];
  seller_phone: string;
}

const FeaturedPopupAds = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [listings, setListings] = useState<FeaturedListing[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Check if popup was shown today
    const lastShown = localStorage.getItem("featuredPopupLastShown");
    const today = new Date().toDateString();
    
    if (lastShown !== today) {
      fetchFeaturedListings();
    }
  }, []);

  const fetchFeaturedListings = async () => {
    try {
      const { data, error } = await supabase
        .from("listings")
        .select(`
          id,
          title,
          price,
          location_city,
          seller_phone,
          listing_images (image_url)
        `)
        .eq("is_featured", true)
        .eq("status", "active")
        .not("payment_proof", "is", null)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;

      if (data && data.length > 0) {
        setListings(data as any);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Error fetching featured listings:", error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("featuredPopupLastShown", new Date().toDateString());
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % listings.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + listings.length) % listings.length);
  };

  if (!isOpen || listings.length === 0) return null;

  const currentListing = listings[currentIndex];
  const images = currentListing.listing_images || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-background rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden animate-scale-in">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 bg-background/80 hover:bg-background rounded-full p-2 shadow-lg transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Featured Badge */}
        <Badge variant="featured" className="absolute top-4 left-4 z-20 text-sm px-3 py-1">
          Featured
        </Badge>

        {/* Image Carousel */}
        <div className="relative aspect-video bg-muted">
          {images.length > 0 ? (
            <>
              <img
                src={images[0].image_url}
                alt={currentListing.title}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 shadow-lg transition-all"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 shadow-lg transition-all"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image Available
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {currentListing.title}
            </h3>
            <p className="text-3xl font-bold text-primary">
              ₹{currentListing.price.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {currentListing.location_city}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => window.open(`tel:${currentListing.seller_phone}`, '_self')}
              className="flex-1 bg-primary hover:bg-primary/90"
              size="lg"
            >
              Call Now
            </Button>
            <Button
              onClick={() => window.open(`https://wa.me/${currentListing.seller_phone.replace(/\D/g, '')}`, '_blank')}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              size="lg"
            >
              WhatsApp
            </Button>
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
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to listing ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedPopupAds;
