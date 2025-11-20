import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

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

const FeaturedListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    loadListings();
  }, [selectedCategory]);

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
          categories (name, slug),
          listing_images (image_url)
        `)
        .eq("is_featured", true)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (selectedCategory !== "all") {
        const { data: categoryData } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", selectedCategory)
          .single();
        
        if (categoryData) {
          query = query.eq("category_id", categoryData.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      setListings(data as any || []);
    } catch (error) {
      console.error("Error loading featured listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { label: "All", value: "all" },
    { label: "Properties", value: "properties" },
    { label: "Vehicles", value: "automobiles" },
    { label: "Jewellery", value: "jewellery" },
  ];

  return (
    <section className="py-12 bg-accent/10">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              ⭐ Featured Listings
            </h2>
            <p className="text-muted-foreground text-lg">
              Premium verified listings across all categories
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === cat.value
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background text-foreground hover:bg-secondary"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <p className="text-muted-foreground text-lg">
                No featured listings available
              </p>
              <Link to="/post-ad">
                <Button className="rounded-full">
                  List Your Item as Featured
                </Button>
              </Link>
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
                      <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
                        Featured
                      </Badge>
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
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
