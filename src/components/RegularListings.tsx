import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Loader2 } from "lucide-react";
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

const RegularListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("properties");

  useEffect(() => {
    loadListings();
  }, [selectedCategory]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
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
        .eq("is_featured", false)
        .eq("status", "active")
        .eq("categories.slug", selectedCategory)
        .order("created_at", { ascending: false })
        .limit(12);

      if (error) throw error;

      setListings(data as any || []);
    } catch (error) {
      console.error("Error loading regular listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { label: "Properties", value: "properties" },
    { label: "Automobiles", value: "automobiles" },
    { label: "Jewellery", value: "jewellery" },
  ];

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (listings.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              All Listings
            </h2>
            <p className="text-muted-foreground text-lg">
              Browse through all available listings
            </p>
          </div>

          {/* Category Tabs */}
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
        </div>
      </div>
    </section>
  );
};

export default RegularListings;
