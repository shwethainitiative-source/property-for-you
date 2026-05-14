import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";

interface Expert {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
  status: string;
  phone: string | null;
  user_id: string | null;
}

const AdminExperts = () => {
  const navigate = useNavigate();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Property",
    description: "",
    image_url: "",
    phone: "",
  });

  useEffect(() => {
    checkAdminAccess();
    fetchExperts();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/admin/login");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      navigate("/admin/login");
    }
  };

  const fetchExperts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("experts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch experts");
      console.error(error);
    } else {
      setExperts(data || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (expert?: Expert) => {
    if (expert) {
      setEditingExpert(expert);
      setFormData({
        name: expert.name,
        category: expert.category,
        description: expert.description,
        image_url: expert.image_url,
        phone: expert.phone || "",
      });
    } else {
      setEditingExpert(null);
      setFormData({
        name: "",
        category: "Property",
        description: "",
        image_url: "",
        phone: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingExpert) {
      const { error } = await supabase
        .from("experts")
        .update({
          name: formData.name,
          category: formData.category,
          description: formData.description,
          image_url: formData.image_url,
          phone: formData.phone || null,
        })
        .eq("id", editingExpert.id);

      if (error) {
        toast.error("Failed to update expert");
        console.error(error);
      } else {
        toast.success("Expert updated successfully");
        fetchExperts();
        setDialogOpen(false);
      }
    } else {
      const { error } = await supabase.from("experts").insert({
        name: formData.name,
        category: formData.category,
        description: formData.description,
        image_url: formData.image_url,
        phone: formData.phone || null,
        status: "approved",
      });

      if (error) {
        toast.error("Failed to add expert");
        console.error(error);
      } else {
        toast.success("Expert added successfully");
        fetchExperts();
        setDialogOpen(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expert?")) return;

    const { error } = await supabase.from("experts").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete expert");
      console.error(error);
    } else {
      toast.success("Expert deleted successfully");
      fetchExperts();
    }
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from("experts")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) {
      toast.error("Failed to approve expert");
      console.error(error);
    } else {
      toast.success("Expert approved successfully");
      fetchExperts();
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from("experts")
      .update({ status: "rejected" })
      .eq("id", id);

    if (error) {
      toast.error("Failed to reject expert");
      console.error(error);
    } else {
      toast.success("Expert rejected");
      fetchExperts();
    }
  };

  const pendingExperts = experts.filter((e) => e.status === "pending");
  const approvedExperts = experts.filter((e) => e.status === "approved");
  const rejectedExperts = experts.filter((e) => e.status === "rejected");

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  const ExpertTable = ({ data, showActions = true, showApprovalActions = false }: { 
    data: Expert[]; 
    showActions?: boolean;
    showApprovalActions?: boolean;
  }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              No experts found
            </TableCell>
          </TableRow>
        ) : (
          data.map((expert) => (
            <TableRow key={expert.id}>
              <TableCell>
                <img
                  src={expert.image_url}
                  alt={expert.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              </TableCell>
              <TableCell className="font-medium">{expert.name}</TableCell>
              <TableCell>{expert.phone || "-"}</TableCell>
              <TableCell>{expert.category}</TableCell>
              <TableCell className="max-w-md truncate">{expert.description}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {showApprovalActions && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(expert.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(expert.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {showActions && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(expert)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(expert.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Experts Management</h1>
            <p className="text-muted-foreground">Manage expert profiles and approval requests</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expert
          </Button>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingExperts.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingExperts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedExperts.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedExperts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Expert Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpertTable data={pendingExperts} showApprovalActions={true} showActions={true} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved Experts</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpertTable data={approvedExperts} showActions={true} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpertTable data={rejectedExperts} showActions={true} showApprovalActions={true} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingExpert ? "Edit Expert" : "Add New Expert"}</DialogTitle>
              <DialogDescription>
                {editingExpert
                  ? "Update the expert information below"
                  : "Fill in the details to add a new expert"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Expert Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Real Estate Investment Advisor"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., +91 9876543210"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Property">Property</SelectItem>
                    <SelectItem value="Automobile">Automobile</SelectItem>
                    <SelectItem value="Jewellery">Jewellery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of expertise"
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingExpert ? "Update" : "Add"} Expert</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminExperts;