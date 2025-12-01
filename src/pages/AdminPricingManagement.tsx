import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface PricingPlan {
  id: string;
  plan_type: string;
  duration: number;
  price: number;
  display_order: number;
}

const AdminPricingManagement = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPlan, setNewPlan] = useState({
    plan_type: "",
    duration: 30,
    price: 0,
    display_order: 0,
  });

  useEffect(() => {
    if (!authLoading) {
      checkAdminAccess();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (isAdmin) {
      fetchPlans();
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

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("pricing_plans")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to fetch pricing plans");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (plan: PricingPlan) => {
    try {
      const { error } = await supabase
        .from("pricing_plans")
        .update({
          duration: plan.duration,
          price: plan.price,
        })
        .eq("id", plan.id);

      if (error) throw error;

      toast.success("Pricing plan updated successfully");
      setEditingPlan(null);
      fetchPlans();
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error("Failed to update pricing plan");
    }
  };

  const handleAdd = async () => {
    if (!newPlan.plan_type || newPlan.duration <= 0 || newPlan.price <= 0) {
      toast.error("Please fill all fields with valid values");
      return;
    }

    try {
      const { error } = await supabase
        .from("pricing_plans")
        .insert({
          plan_type: newPlan.plan_type,
          duration: newPlan.duration,
          price: newPlan.price,
          display_order: newPlan.display_order,
        });

      if (error) throw error;

      toast.success("New pricing plan added successfully");
      setShowAddDialog(false);
      setNewPlan({ plan_type: "", duration: 30, price: 0, display_order: 0 });
      fetchPlans();
    } catch (error) {
      console.error("Error adding plan:", error);
      toast.error("Failed to add pricing plan");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pricing plan?")) return;

    try {
      const { error } = await supabase
        .from("pricing_plans")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Pricing plan deleted successfully");
      fetchPlans();
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete pricing plan");
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pricing Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage pricing plans for featured listings and popup ads
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Plan
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pricing Plans</CardTitle>
            <CardDescription>
              Update prices and durations for all plans. Changes apply immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Type</TableHead>
                  <TableHead>Duration (days)</TableHead>
                  <TableHead>Price (₹)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      {plan.plan_type.replace(/_/g, " ").toUpperCase()}
                    </TableCell>
                    <TableCell>
                      {editingPlan?.id === plan.id ? (
                        <Input
                          type="number"
                          value={editingPlan.duration}
                          onChange={(e) =>
                            setEditingPlan({ ...editingPlan, duration: parseInt(e.target.value) })
                          }
                          className="w-24"
                        />
                      ) : (
                        plan.duration
                      )}
                    </TableCell>
                    <TableCell>
                      {editingPlan?.id === plan.id ? (
                        <Input
                          type="number"
                          value={editingPlan.price}
                          onChange={(e) =>
                            setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) })
                          }
                          className="w-24"
                        />
                      ) : (
                        `₹${plan.price}`
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingPlan?.id === plan.id ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => handleSave(editingPlan)}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPlan(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPlan(plan)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(plan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add New Plan Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Pricing Plan</DialogTitle>
            <DialogDescription>
              Create a new pricing plan for featured listings or popup ads
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="plan_type">Plan Type</Label>
              <Input
                id="plan_type"
                value={newPlan.plan_type}
                onChange={(e) => setNewPlan({ ...newPlan, plan_type: e.target.value })}
                placeholder="e.g., featured_120 or popup_120"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                value={newPlan.duration}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, duration: parseInt(e.target.value) })
                }
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={newPlan.price}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, price: parseFloat(e.target.value) })
                }
                placeholder="199"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={newPlan.display_order}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, display_order: parseInt(e.target.value) })
                }
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPricingManagement;