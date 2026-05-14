import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Calendar, ArrowLeft, Star, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) {
        navigate("/");
        return;
      }

      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          categories(name, slug),
          listing_images(image_url, display_order)
        `)
        .eq("id", id)
        .eq("status", "active")
        .single();

      if (error || !data) {
        toast.error("Listing not found");
        navigate("/");
        return;
      }

      // Format data for display
      const formattedListing = {
        ...data,
        images: data.listing_images
          ?.sort((a: any, b: any) => a.display_order - b.display_order)
          .map((img: any) => img.image_url) || [],
        category: data.categories?.name,
        location: `${data.location_city}${data.location_locality ? ', ' + data.location_locality : ''}`,
        price: `₹${Number(data.price).toLocaleString()}`,
        sellerName: data.seller_name,
        phone: data.seller_phone,
        email: data.seller_email,
        isFeatured: data.is_featured,
        createdAt: data.created_at,
        // Extract attributes
        ...(data.attributes as any),
      };

      setListing(formattedListing);
    };

    fetchListing();
  }, [id, navigate]);

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-xl text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Listings
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {listing.images.length > 0 ? (
                  <>
                    <img
                      src={listing.images[currentImageIndex]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    {listing.isFeatured && (
                      <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Images Available
                  </div>
                )}
              </div>
              {listing.images.length > 1 && (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2 p-4 bg-card">
                  {listing.images.map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-primary"
                          : "border-transparent hover:border-muted-foreground/30"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Details */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">
                      {listing.title}
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{listing.location}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {listing.category}
                  </Badge>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-4xl font-bold text-primary">{listing.price}</p>
                </div>

                {listing.description && (
                  <div className="pt-4 border-t space-y-2">
                    <h3 className="text-lg font-semibold">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {listing.description}
                    </p>
                  </div>
                )}

                {/* Category-specific details */}
                <div className="pt-4 border-t space-y-3">
                  <h3 className="text-lg font-semibold">Details</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {listing.brand && (
                      <div className="flex justify-between py-2 px-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">Brand</span>
                        <span className="font-medium">{listing.brand}</span>
                      </div>
                    )}
                    {listing.model && (
                      <div className="flex justify-between py-2 px-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">Model</span>
                        <span className="font-medium">{listing.model}</span>
                      </div>
                    )}
                    {listing.year && (
                      <div className="flex justify-between py-2 px-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">Year</span>
                        <span className="font-medium">{listing.year}</span>
                      </div>
                    )}
                    {listing.fuelType && (
                      <div className="flex justify-between py-2 px-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">Fuel</span>
                        <span className="font-medium capitalize">{listing.fuelType}</span>
                      </div>
                    )}
                    {listing.kmDriven && (
                      <div className="flex justify-between py-2 px-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">KM Driven</span>
                        <span className="font-medium">{listing.kmDriven} km</span>
                      </div>
                    )}
                    {listing.propertyType && (
                      <div className="flex justify-between py-2 px-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium capitalize">{listing.propertyType}</span>
                      </div>
                    )}
                    {listing.size && (
                      <div className="flex justify-between py-2 px-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">Size</span>
                        <span className="font-medium">{listing.size} sq ft</span>
                      </div>
                    )}
                    {listing.bedrooms && (
                      <div className="flex justify-between py-2 px-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">Bedrooms</span>
                        <span className="font-medium">{listing.bedrooms} BHK</span>
                      </div>
                    )}
                    {listing.type && (
                      <div className="flex justify-between py-2 px-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium capitalize">{listing.type}</span>
                      </div>
                    )}
                    {listing.material && (
                      <div className="flex justify-between py-2 px-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">Material</span>
                        <span className="font-medium capitalize">{listing.material}</span>
                      </div>
                    )}
                    {listing.weight && (
                      <div className="flex justify-between py-2 px-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">Weight</span>
                        <span className="font-medium">{listing.weight}g</span>
                      </div>
                    )}
                    {listing.purity && (
                      <div className="flex justify-between py-2 px-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">Purity</span>
                        <span className="font-medium uppercase">{listing.purity}</span>
                      </div>
                    )}
                  </div>
                </div>

                {listing.createdAt && (
                  <div className="pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Posted on {new Date(listing.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Seller Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Seller Details</h3>
                  <p className="text-muted-foreground text-sm">
                    Contact the seller for more information
                  </p>
                </div>

                <div className="space-y-4">
                  {listing.sellerName && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-semibold">{listing.sellerName}</p>
                      {listing.phone && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {listing.phone}
                        </p>
                      )}
                    </div>
                  )}

                  {listing.phone && (
                    <div className="space-y-2">
                      <a
                        href={`tel:${listing.phone}`}
                        className="block md:pointer-events-none"
                      >
                        <Button className="w-full rounded-full">
                          <Phone className="h-4 w-4 mr-2" />
                          Call {listing.phone}
                        </Button>
                      </a>
                      <a
                        href={`https://wa.me/${listing.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in your listing: ${listing.title}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button className="w-full rounded-full" variant="outline">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp
                        </Button>
                      </a>
                    </div>
                  )}

                  {listing.email && (
                    <a
                      href={`mailto:${listing.email}?subject=${encodeURIComponent(`Inquiry about: ${listing.title}`)}&body=${encodeURIComponent(`Hi,\n\nI am interested in your listing: ${listing.title}\n\nPlease provide more details.\n\nThank you.`)}`}
                      className="block"
                    >
                      <Button variant="outline" className="w-full rounded-full">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Seller
                      </Button>
                    </a>
                  )}
                </div>

                <div className="pt-6 border-t space-y-3">
                  <p className="text-xs text-muted-foreground text-center">
                    Please verify all documents and details before making any transaction.
                  </p>
                  <Button
                    variant="destructive"
                    className="w-full rounded-full"
                    onClick={() => toast.info("Report functionality coming soon")}
                  >
                    Report this ad
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListingDetail;
