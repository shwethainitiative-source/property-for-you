import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Users, FileText, Edit, Trash2, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
  created_at: string;
  categories: { name: string };
  profiles: { name: string; email: string };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchListings();
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate("/admin");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Access Denied",
          description: "You are not authorized to access this page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/");
    }
  };

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from("listings")
        .select(`
          id,
          title,
          price,
          status,
          created_at,
          categories(name),
          profiles(name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", listingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });

      fetchListings();
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/admin");
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              <Home className="h-4 w-4 mr-2" />
              View Site
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{listings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {listings.filter((l) => l.status === "active").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" onClick={() => navigate("/admin/sponsorships")}>
                Manage Sponsorships
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Listings</CardTitle>
            <CardDescription>Manage all property listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{listing.title}</h3>
                      <Badge variant={listing.status === "active" ? "default" : "secondary"}>
                        {listing.status}
                      </Badge>
                      <Badge variant="outline">{listing.categories.name}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ₹{listing.price.toLocaleString()} • By {listing.profiles.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/listing/${listing.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(listing.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
