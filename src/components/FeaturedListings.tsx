import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Listing {
  id: string;
  title: string;
  price: string;
  location: string;
  category: string;
  images: string[];
  isFeatured: boolean;
}

const FeaturedListings = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);

  useEffect(() => {
    loadFeaturedListings();
  }, []);

  const loadFeaturedListings = () => {
    const stored = localStorage.getItem("listings");
    if (stored) {
      const allListings: Listing[] = JSON.parse(stored);
      const featured = allListings.filter((listing) => listing.isFeatured);
      setFeaturedListings(featured);
    }
  };

  const categories = [
    { id: "all", label: "All" },
    { id: "properties", label: "Properties" },
    { id: "automobiles", label: "Vehicles" },
    { id: "jewellery", label: "Jewellery" },
  ];

  const filteredListings =
    activeCategory === "all"
      ? featuredListings
      : featuredListings.filter(
          (listing) => listing.category.toLowerCase() === activeCategory
        );

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Star className="h-6 w-6 text-primary fill-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Featured Listings
              </h2>
            </div>
            <p className="text-muted-foreground text-lg">
              Premium verified listings across all categories
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                onClick={() => setActiveCategory(category.id)}
                className="rounded-full"
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* Listings Grid */}
          {filteredListings.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <Link key={listing.id} to={`/listing/${listing.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="relative aspect-video bg-muted">
                      {listing.images[0] ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-semibold text-foreground line-clamp-1">
                        {listing.title}
                      </h3>
                      <p className="text-xl font-bold text-primary">{listing.price}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{listing.location}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {listing.category}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-4">
              <p className="text-xl text-muted-foreground">
                No featured listings available
              </p>
              <Link to="/post-ad">
                <Button size="lg" className="rounded-full">
                  List Your Item as Featured
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
