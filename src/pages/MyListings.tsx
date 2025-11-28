import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Listing {
  id: string;
  title: string;
  price: number;
  location_city: string;
  location_locality: string | null;
  is_featured: boolean;
  status: string;
  listing_images: { image_url: string }[];
  categories: { name: string; slug: string } | null;
}

const MyListings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please login to view your listings");
      navigate("/auth?redirect=/my-listings");
    } else if (user) {
      checkAdminStatus();
      fetchMyListings();
    }
  }, [user, authLoading, navigate]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });
      
      if (!error && data) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const fetchMyListings = async () => {
    try {
      const { data, error } = await supabase
        .from("listings")
        .select(`
          id,
          title,
          price,
          location_city,
          location_locality,
          is_featured,
          status,
          listing_images(image_url),
          categories(name, slug)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error("Error fetching my listings:", error);
      toast.error("Failed to load your listings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", listingId);

      if (error) throw error;

      setListings((prev) => prev.filter((listing) => listing.id !== listingId));
      toast.success("Listing deleted successfully");
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("Failed to delete listing");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading your listings...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Listings</h1>
          <p className="text-muted-foreground">
            Manage your posted ads
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">You haven't posted any ads yet</p>
            <Button onClick={() => navigate("/post-ad")}>Post Your First Ad</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <Card
                key={listing.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div
                  className="aspect-video bg-muted relative cursor-pointer"
                  onClick={() => navigate(`/listing/${listing.id}`)}
                >
                  {listing.listing_images?.[0] ? (
                    <img
                      src={listing.listing_images[0].image_url}
                      alt={listing.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                  {listing.is_featured && (
                    <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                      Featured
                    </Badge>
                  )}
                  {listing.categories && (
                    <Badge className="absolute top-2 right-2 bg-primary">
                      {listing.categories.name}
                    </Badge>
                  )}
                  {listing.status !== "active" && (
                    <Badge className="absolute bottom-2 left-2 bg-destructive">
                      {listing.status}
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                    {listing.title}
                  </h3>
                  <p className="text-xl font-bold text-primary mb-2">
                    ₹{listing.price.toLocaleString()}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="line-clamp-1">
                      {listing.location_locality
                        ? `${listing.location_locality}, ${listing.location_city}`
                        : listing.location_city}
                    </span>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/edit-listing/${listing.id}`);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(listing.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyListings;
