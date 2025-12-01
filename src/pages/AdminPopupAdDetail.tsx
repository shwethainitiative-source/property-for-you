import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin/AdminLayout";

interface PopupSchedule {
  id: string;
  schedule_date: string;
  slot_number: number;
  payment_status: string;
  payment_amount: number;
  payment_proof: string | null;
  admin_approved: boolean;
  selected_dates: string[] | null;
  listings: {
    id: string;
    title: string;
    price: number;
    description: string;
    location_city: string;
    profiles: { name: string; email: string; phone: string };
    listing_images: { image_url: string; display_order: number }[];
  };
}

const AdminPopupAdDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [schedule, setSchedule] = useState<PopupSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  useEffect(() => {
    if (!authLoading) {
      checkAdminAccess();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (isAdmin && id) {
      fetchScheduleDetail();
    }
  }, [isAdmin, id]);

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
        toast.error("Access Denied");
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/");
    }
  };

  const fetchScheduleDetail = async () => {
    try {
      const { data, error } = await supabase
        .from("popup_ad_schedules")
        .select(`
          id,
          schedule_date,
          slot_number,
          payment_status,
          payment_amount,
          payment_proof,
          admin_approved,
          selected_dates,
          listings (
            id,
            title,
            price,
            description,
            location_city,
            profiles (name, email, phone),
            listing_images (image_url, display_order)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setSchedule(data);
      
      // Convert string dates to Date objects
      if (data.selected_dates) {
        setSelectedDates(data.selected_dates.map((d: string) => new Date(d)));
      }
    } catch (error) {
      console.error("Error fetching schedule detail:", error);
      toast.error("Failed to fetch popup ad details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDates = async () => {
    if (!schedule) return;

    try {
      const { error } = await supabase
        .from("popup_ad_schedules")
        .update({
          selected_dates: selectedDates.map(d => d.toISOString().split('T')[0])
        })
        .eq("id", schedule.id);

      if (error) throw error;

      toast.success("Selected dates updated successfully");
      fetchScheduleDetail();
    } catch (error) {
      console.error("Error updating dates:", error);
      toast.error("Failed to update dates");
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

  if (!schedule) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Popup ad not found</p>
        </div>
      </AdminLayout>
    );
  }

  const mainImage = schedule.listings.listing_images
    .sort((a, b) => a.display_order - b.display_order)[0]?.image_url;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/admin/popup-ads")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Popup Ads
        </Button>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Listing Details */}
          <Card>
            <CardHeader>
              <CardTitle>Listing Details</CardTitle>
              <CardDescription>Popup ad listing information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mainImage && (
                <img
                  src={mainImage}
                  alt={schedule.listings.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="text-xl font-semibold">{schedule.listings.title}</h3>
                <p className="text-2xl font-bold text-primary mt-2">
                  ₹{schedule.listings.price.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {schedule.listings.location_city}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {schedule.listings.description}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Seller Information</h4>
                <p className="text-sm">
                  <strong>Name:</strong> {schedule.listings.profiles.name}
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> {schedule.listings.profiles.email}
                </p>
                <p className="text-sm">
                  <strong>Phone:</strong> {schedule.listings.profiles.phone}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Popup Schedule Details */}
          <Card>
            <CardHeader>
              <CardTitle>Popup Schedule Details</CardTitle>
              <CardDescription>Payment and scheduling information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Schedule Date</p>
                  <p className="font-semibold">
                    {new Date(schedule.schedule_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Slot Number</p>
                  <p className="font-semibold">Slot {schedule.slot_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Amount</p>
                  <p className="font-semibold">₹{schedule.payment_amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <Badge
                    variant={
                      schedule.payment_status === "paid"
                        ? "default"
                        : schedule.payment_status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {schedule.payment_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admin Approved</p>
                  <Badge variant={schedule.admin_approved ? "default" : "secondary"}>
                    {schedule.admin_approved ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>

              {schedule.payment_proof && (
                <div>
                  <h4 className="font-semibold mb-2">Payment Proof</h4>
                  <a
                    href={schedule.payment_proof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Payment Screenshot
                  </a>
                </div>
              )}

              {/* Selected Dates Calendar */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Selected Dates ({selectedDates.length})
                </h4>
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates || [])}
                  className="rounded-md border"
                />
                <Button
                  onClick={handleUpdateDates}
                  className="w-full mt-4"
                  disabled={selectedDates.length === 0}
                >
                  Update Selected Dates
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPopupAdDetail;