import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Edit } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/admin/ImageUpload";

interface ListingDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  location_city: string;
  location_locality: string | null;
  status: string;
  is_featured: boolean;
  payment_proof: string | null;
  created_at: string;
  seller_name: string;
  seller_email: string;
  seller_phone: string;
  attributes: any;
  categories: { name: string };
  profiles: { name: string; email: string; phone: string };
  listing_images: { image_url: string }[];
}

const AdminListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          categories (name),
          profiles (name, email, phone),
          listing_images (image_url)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setListing(data);
    } catch (error) {
      console.error("Error fetching listing:", error);
      toast({
        title: "Error",
        description: "Failed to fetch listing details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewImageUpload = async (url: string) => {
    if (!url || !id) return;

    try {
      const { data: currentImages } = await supabase
        .from("listing_images")
        .select("display_order")
        .eq("listing_id", id)
        .order("display_order", { ascending: false })
        .limit(1);

      const nextOrder = currentImages && currentImages.length > 0 
        ? currentImages[0].display_order + 1 
        : 0;

      const { error } = await supabase
        .from("listing_images")
        .insert({
          listing_id: id,
          image_url: url,
          display_order: nextOrder
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Image added to listing",
      });
      fetchListing();
    } catch (error) {
      console.error("Error adding image:", error);
      toast({
        title: "Error",
        description: "Failed to add image to listing",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!listing) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <p className="text-muted-foreground">Listing not found</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/admin/listings/edit/${listing.id}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Badge variant={listing.status === "active" ? "default" : "secondary"}>
              {listing.status}
            </Badge>
            {listing.is_featured && <Badge variant="featured">Featured</Badge>}
            <Badge variant="outline">{listing.categories.name}</Badge>
          </div>
        </div>

        {/* Images */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 text-lg">Listing Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {listing.listing_images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img.image_url}
                    alt={`${listing.title} - ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg shadow-sm"
                  />
                </div>
              ))}
              <div className="border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/20 hover:bg-muted/50 transition-colors h-32">
                 <ImageUpload 
                    bucket="listing-images"
                    onUploadComplete={handleNewImageUpload}
                    label="Add Image"
                 />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Details */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{listing.title}</h1>
              <p className="text-3xl font-bold text-primary">₹{listing.price.toLocaleString()}</p>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{listing.location_city}{listing.location_locality ? `, ${listing.location_locality}` : ''}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Posted on {new Date(listing.created_at).toLocaleDateString()}</span>
            </div>

            {listing.description && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
              </div>
            )}

            {listing.attributes && Object.keys(listing.attributes).length > 0 && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Specifications</h3>
                <dl className="grid grid-cols-2 gap-3">
                  {Object.entries(listing.attributes).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </dt>
                      <dd className="text-sm font-medium">{value as string}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seller Information */}
        <Card>
          <CardContent className="p-6 space-y-3">
            <h3 className="font-semibold text-lg">Seller Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="text-sm font-medium">{listing.seller_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${listing.seller_phone}`} className="text-sm text-primary hover:underline">
                  {listing.seller_phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${listing.seller_email}`} className="text-sm text-primary hover:underline">
                  {listing.seller_email}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Proof */}
        {listing.payment_proof && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3">Payment Proof</h3>
              <a
                href={listing.payment_proof}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View Payment Proof Document
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminListingDetail;
