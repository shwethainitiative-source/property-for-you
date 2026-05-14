import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsCard from "@/components/admin/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Star, TrendingUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Stats {
  totalListings: number;
  pendingApprovals: number;
  activeSponsorships: number;
  totalUsers: number;
}

interface RecentActivity {
  id: string;
  title: string;
  type: string;
  time: string;
  status: string;
}

const AdminDashboardNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalListings: 0,
    pendingApprovals: 0,
    activeSponsorships: 0,
    totalUsers: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      checkAdminAccess();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate("/admin");
      return;
    }

    try {
      const { data: hasAdminRole, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin"
      });

      if (error) throw error;

      if (!hasAdminRole) {
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

  const fetchDashboardData = async () => {
    try {
      // Fetch total listings
      const { count: listingsCount } = await supabase
        .from("listings")
        .select("*", { count: "exact", head: true });

      // Fetch pending approvals (non-featured listings)
      const { count: pendingCount } = await supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("is_featured", false)
        .eq("status", "active");

      // Fetch active sponsorships
      const { count: sponsorshipsCount } = await supabase
        .from("sponsorships")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved")
        .lte("start_date", new Date().toISOString())
        .gte("end_date", new Date().toISOString());

      // Fetch total users
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch recent listings for activity
      const { data: recentListings } = await supabase
        .from("listings")
        .select("id, title, created_at, status, is_featured")
        .order("created_at", { ascending: false })
        .limit(5);

      const activities: RecentActivity[] = recentListings?.map(listing => ({
        id: listing.id,
        title: listing.title,
        type: listing.is_featured ? "Featured Listing" : "New Listing",
        time: new Date(listing.created_at).toLocaleString(),
        status: listing.status,
      })) || [];

      setStats({
        totalListings: listingsCount || 0,
        pendingApprovals: pendingCount || 0,
        activeSponsorships: sponsorshipsCount || 0,
        totalUsers: usersCount || 0,
      });

      setRecentActivity(activities);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAdmin || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Listings"
            value={stats.totalListings}
            icon={FileText}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            trend="+12% from last month"
          />
          <StatsCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={TrendingUp}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
          />
          <StatsCard
            title="Active Sponsored Ads"
            value={stats.activeSponsorships}
            icon={Star}
            color="bg-gradient-to-br from-green-500 to-green-600"
            trend="+5% from last week"
          />
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            trend="+8% from last month"
          />
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest listings and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground line-clamp-1">
                        {activity.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {activity.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/listing/${activity.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {recentActivity.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No recent activity
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => navigate("/admin/users")}
                >
                  <Users className="h-5 w-5" />
                  <span className="text-sm">Manage Users</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => navigate("/admin/listings")}
                >
                  <FileText className="h-5 w-5" />
                  <span className="text-sm">Manage Listings</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => navigate("/admin/featured")}
                >
                  <Star className="h-5 w-5" />
                  <span className="text-sm">Featured Requests</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => navigate("/admin/sponsorships")}
                >
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm">Sponsorships</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardNew;
