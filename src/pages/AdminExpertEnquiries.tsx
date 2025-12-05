import { useState, useEffect } from "react";
import { Eye, Trash2, Check } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface ExpertEnquiry {
  id: string;
  expert_id: string | null;
  name: string;
  phone: string;
  message: string;
  read: boolean;
  created_at: string;
  expert?: {
    name: string;
    category: string;
  } | null;
}

const AdminExpertEnquiries = () => {
  const [enquiries, setEnquiries] = useState<ExpertEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<ExpertEnquiry | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    const { data, error } = await supabase
      .from("expert_contacts")
      .select(`
        *,
        expert:experts(name, category)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching enquiries:", error);
      toast.error("Failed to fetch enquiries");
      return;
    }

    setEnquiries(data || []);
    setLoading(false);
  };

  const handleView = async (enquiry: ExpertEnquiry) => {
    setSelectedEnquiry(enquiry);
    setViewDialogOpen(true);

    // Mark as read if not already
    if (!enquiry.read) {
      const { error } = await supabase
        .from("expert_contacts")
        .update({ read: true })
        .eq("id", enquiry.id);

      if (!error) {
        setEnquiries(prev =>
          prev.map(e => (e.id === enquiry.id ? { ...e, read: true } : e))
        );
      }
    }
  };

  const handleMarkAsRead = async (id: string) => {
    const { error } = await supabase
      .from("expert_contacts")
      .update({ read: true })
      .eq("id", id);

    if (error) {
      toast.error("Failed to mark as read");
      return;
    }

    setEnquiries(prev =>
      prev.map(e => (e.id === id ? { ...e, read: true } : e))
    );
    toast.success("Marked as read");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;

    const { error } = await supabase
      .from("expert_contacts")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete enquiry");
      return;
    }

    setEnquiries(prev => prev.filter(e => e.id !== id));
    toast.success("Enquiry deleted");
  };

  const unreadCount = enquiries.filter(e => !e.read).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Expert Enquiries</h1>
            <p className="text-muted-foreground">
              Contact requests from users to experts
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {unreadCount} Unread
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Enquiries</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : enquiries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No enquiries yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>User Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Expert</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enquiries.map((enquiry) => (
                    <TableRow key={enquiry.id} className={!enquiry.read ? "bg-muted/50" : ""}>
                      <TableCell>
                        <Badge variant={enquiry.read ? "secondary" : "default"}>
                          {enquiry.read ? "Read" : "New"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{enquiry.name}</TableCell>
                      <TableCell>{enquiry.phone}</TableCell>
                      <TableCell>
                        {enquiry.expert ? (
                          <div>
                            <p className="font-medium">{enquiry.expert.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {enquiry.expert.category}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(enquiry.created_at), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(enquiry)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!enquiry.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarkAsRead(enquiry.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(enquiry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">User Name</p>
                <p className="text-foreground">{selectedEnquiry.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-foreground">{selectedEnquiry.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expert</p>
                <p className="text-foreground">
                  {selectedEnquiry.expert?.name || "-"}{" "}
                  {selectedEnquiry.expert?.category && (
                    <span className="text-muted-foreground">
                      ({selectedEnquiry.expert.category})
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Message</p>
                <p className="text-foreground whitespace-pre-wrap">
                  {selectedEnquiry.message}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                <p className="text-foreground">
                  {format(new Date(selectedEnquiry.created_at), "PPpp")}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminExpertEnquiries;
