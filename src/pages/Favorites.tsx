import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart } from "lucide-react";
import { toast } from "sonner";

const Favorites = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?redirect=/favorites");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("favorites")
      .select(`
        id,
        listing_id,
        listings (
          id,
          title,
          price,
          location_city,
          location_locality,
          is_featured,
          categories(name, slug),
          listing_images(image_url, display_order)
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching favorites:", error);
      toast.error("Failed to load favorites");
    } else {
      setFavorites(data || []);
    }
    setIsLoading(false);
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", favoriteId);

    if (error) {
      toast.error("Failed to remove favorite");
    } else {
      toast.success("Removed from favorites");
      fetchFavorites();
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Favorites</h1>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-2">No favorites yet</p>
            <p className="text-sm text-muted-foreground mb-6">
              Start adding listings to your favorites
            </p>
            <Button onClick={() => navigate("/")}>Browse Listings</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const listing = favorite.listings;
              if (!listing) return null;

              const firstImage = listing.listing_images?.[0]?.image_url;

              return (
                <Card
                  key={favorite.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/listing/${listing.id}`)}
                >
                  <div className="relative">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={listing.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                    {listing.is_featured && (
                      <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                        Featured
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(favorite.id);
                      }}
                      className="absolute top-2 right-2 bg-background/80 hover:bg-background/90 backdrop-blur-sm"
                    >
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {listing.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">
                        {listing.location_city}
                        {listing.location_locality && `, ${listing.location_locality}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">
                        ₹{Number(listing.price).toLocaleString()}
                      </span>
                      <Badge variant="secondary">{listing.categories?.name}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
