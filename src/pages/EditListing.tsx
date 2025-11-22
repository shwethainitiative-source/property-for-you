import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listing, setListing] = useState<any>(null);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setListing(data);
    } catch (error) {
      console.error("Error fetching listing:", error);
      toast.error("Failed to load listing");
      navigate("/my-listings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("listings")
        .update({
          title: listing.title,
          description: listing.description,
          price: listing.price,
          location_city: listing.location_city,
          location_locality: listing.location_locality,
          seller_name: listing.seller_name,
          seller_phone: listing.seller_phone,
          seller_email: listing.seller_email,
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Listing updated successfully!");
      navigate("/my-listings");
    } catch (error) {
      console.error("Error updating listing:", error);
      toast.error("Failed to update listing");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/my-listings")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Listings
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={listing?.title || ""}
                  onChange={(e) => setListing({ ...listing, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={listing?.description || ""}
                  onChange={(e) => setListing({ ...listing, description: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={listing?.price || ""}
                    onChange={(e) => setListing({ ...listing, price: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location_city">City *</Label>
                  <Input
                    id="location_city"
                    value={listing?.location_city || ""}
                    onChange={(e) => setListing({ ...listing, location_city: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_locality">Locality</Label>
                <Input
                  id="location_locality"
                  value={listing?.location_locality || ""}
                  onChange={(e) => setListing({ ...listing, location_locality: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seller_name">Seller Name *</Label>
                  <Input
                    id="seller_name"
                    value={listing?.seller_name || ""}
                    onChange={(e) => setListing({ ...listing, seller_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seller_phone">Seller Phone *</Label>
                  <Input
                    id="seller_phone"
                    value={listing?.seller_phone || ""}
                    onChange={(e) => setListing({ ...listing, seller_phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seller_email">Seller Email</Label>
                <Input
                  id="seller_email"
                  type="email"
                  value={listing?.seller_email || ""}
                  onChange={(e) => setListing({ ...listing, seller_email: e.target.value })}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/my-listings")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default EditListing;
