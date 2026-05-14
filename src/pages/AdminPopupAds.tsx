import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CheckCircle, XCircle, Eye, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface PopupSchedule {
  id: string;
  schedule_date: string;
  slot_number: number;
  payment_status: string;
  payment_amount: number;
  payment_proof: string | null;
  admin_approved: boolean;
  listings: {
    id: string;
    title: string;
    price: number;
    profiles: { name: string; email: string };
  };
}

const AdminPopupAds = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [schedules, setSchedules] = useState<PopupSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; scheduleId: string | null }>({
    open: false,
    scheduleId: null,
  });
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    if (!authLoading) {
      checkAdminAccess();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (isAdmin) {
      fetchSchedules();
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

  const fetchSchedules = async () => {
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
          listings (
            id,
            title,
            price,
            profiles (name, email)
          )
        `)
        .order("schedule_date", { ascending: false })
        .order("slot_number", { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast({
        title: "Error",
        description: "Failed to fetch popup ad schedules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirm = async (action: "approve" | "reject") => {
    if (!paymentDialog.scheduleId) return;

    try {
      const updates: any = {
        payment_status: action === "approve" ? "paid" : "rejected",
      };

      if (action === "approve") {
        updates.admin_approved = true;
        if (paymentAmount) {
          updates.payment_amount = parseFloat(paymentAmount);
        }
      }

      const { error } = await supabase
        .from("popup_ad_schedules")
        .update(updates)
        .eq("id", paymentDialog.scheduleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Payment ${action === "approve" ? "approved" : "rejected"} successfully`,
      });

      setPaymentDialog({ open: false, scheduleId: null });
      setPaymentAmount("");
      fetchSchedules();
    } catch (error) {
      console.error("Error updating payment:", error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  const groupByDate = (schedules: PopupSchedule[]) => {
    const grouped: Record<string, PopupSchedule[]> = {};
    schedules.forEach((schedule) => {
      const date = schedule.schedule_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(schedule);
    });
    return grouped;
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

  const groupedSchedules = groupByDate(schedules);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Popup Ads Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage scheduled popup ads (max 3 per day)
          </p>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedSchedules).map(([date, daySchedules]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
                <CardDescription>
                  {daySchedules.length} / 3 slots booked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {daySchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">Slot {schedule.slot_number}</Badge>
                          <h3 className="font-semibold">{schedule.listings.title}</h3>
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
                          {schedule.admin_approved && (
                            <Badge variant="featured">Approved</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ₹{schedule.listings.price.toLocaleString()} • 
                          By {schedule.listings.profiles.name} ({schedule.listings.profiles.email})
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Popup Ad Fee: ₹{schedule.payment_amount.toLocaleString()}
                        </p>
                        {schedule.payment_proof && (
                          <a
                            href={schedule.payment_proof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            View Payment Proof
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/popup-ads/${schedule.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {schedule.payment_status === "pending" && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setPaymentDialog({ open: true, scheduleId: schedule.id });
                              setPaymentAmount(schedule.payment_amount.toString());
                            }}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Manage Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {Object.keys(groupedSchedules).length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No popup ads scheduled yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Management Dialog */}
      <Dialog open={paymentDialog.open} onOpenChange={(open) => setPaymentDialog({ open, scheduleId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Payment</DialogTitle>
            <DialogDescription>
              Confirm payment received and approve or reject the popup ad request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount (₹)</Label>
              <Input
                id="paymentAmount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter payment amount"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setPaymentDialog({ open: false, scheduleId: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handlePaymentConfirm("reject")}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              variant="default"
              onClick={() => handlePaymentConfirm("approve")}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPopupAds;
