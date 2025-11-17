import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
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

const RegularListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = () => {
    const stored = localStorage.getItem("listings");
    if (stored) {
      const allListings: Listing[] = JSON.parse(stored);
      setListings(allListings);
    }
  };

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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
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
                    {listing.isFeatured && (
                      <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
                        Featured
                      </Badge>
                    )}
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
        </div>
      </div>
    </section>
  );
};

export default RegularListings;
