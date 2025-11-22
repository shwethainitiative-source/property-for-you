import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Metrics from "@/components/Metrics";
import ActiveSponsorships from "@/components/ActiveSponsorships";
import SponsoredSection from "@/components/SponsoredSection";
import FeaturedListings from "@/components/FeaturedListings";
import WhyChooseUs from "@/components/WhyChooseUs";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { FavoriteButton } from "@/components/FavoriteButton";

interface Listing {
  id: string;
  title: string;
  price: number;
  location_city: string;
  location_locality: string | null;
  category_id: string;
  listing_images: { image_url: string }[];
  categories: { name: string; slug: string } | null;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadListings();
  }, [activeTab]);

  const loadListings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("listings")
        .select(`
          id,
          title,
          price,
          location_city,
          location_locality,
          category_id,
          categories!inner (name, slug)
          listing_images (image_url)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(12);

      // Filter by category if not "all"
      if (activeTab !== "all") {
        query = query.eq("categories.slug", activeTab);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Filter out any listings without a valid category
      const filteredData = (data as any || []).filter((listing: any) => 
        listing.categories && listing.categories.name && listing.categories.slug
      );
      
      setListings(filteredData);
    } catch (error) {
      console.error("Error loading listings:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Metrics />
        <ActiveSponsorships />
        <SponsoredSection />
        <FeaturedListings />
        
        {/* All Listings Section with Category Tabs */}
        <section className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-primary mb-2">All Listings</h2>
            <p className="text-muted-foreground">Browse through all available listings</p>
          </div>
          
          <div className="mb-6 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeTab === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("properties")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeTab === "properties"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              Properties
            </button>
            <button
              onClick={() => setActiveTab("automobiles")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeTab === "automobiles"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              Automobiles
            </button>
            <button
              onClick={() => setActiveTab("jewellery")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeTab === "jewellery"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              Jewellery
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No listings found</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <Link key={listing.id} to={`/listing/${listing.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="relative aspect-video bg-muted">
                      {listing.listing_images && listing.listing_images.length > 0 ? (
                        <img
                          src={listing.listing_images[0].image_url}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                      <FavoriteButton listingId={listing.id} />
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-semibold text-foreground line-clamp-1">
                        {listing.title}
                      </h3>
                      <p className="text-xl font-bold text-primary">
                        ₹{listing.price.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">
                          {listing.location_locality
                            ? `${listing.location_locality}, ${listing.location_city}`
                            : listing.location_city}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {listing.categories?.name || 'Uncategorized'}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
        
        <WhyChooseUs />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
