import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    location_city: string;
    location_locality: string | null;
    is_featured?: boolean;
    listing_images?: { image_url: string }[];
    categories?: { name: string };
  };
}

export const ListingCard = ({ listing }: ListingCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col group"
      onClick={() => navigate(`/listing/${listing.id}`)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {listing.listing_images?.[0] ? (
          <img
            src={listing.listing_images[0].image_url}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {listing.is_featured && (
            <Badge className="bg-accent text-accent-foreground shadow-sm">
              Featured
            </Badge>
          )}
          {listing.categories?.name && (
            <Badge className="bg-primary shadow-sm">
              {listing.categories.name}
            </Badge>
          )}
        </div>
        
        <div className="absolute top-2 right-2">
          <FavoriteButton listingId={listing.id} />
        </div>
      </div>
      
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-2 min-h-[3rem]">
          {listing.title}
        </h3>
        
        <p className="text-xl font-bold text-primary mb-2">
          ₹{listing.price.toLocaleString()}
        </p>
        
        <div className="mt-auto flex items-center text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
          <span className="line-clamp-1">
            {listing.location_locality
              ? `${listing.location_locality}, ${listing.location_city}`
              : listing.location_city}
          </span>
        </div>
      </div>
    </Card>
  );
};
