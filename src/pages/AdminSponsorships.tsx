import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import ImageUpload from "@/components/admin/ImageUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ExternalLink, CheckCircle, XCircle, Clock } from "lucide-react";

interface Sponsorship {
  id: string;
  business_name: string;
  contact_person: string;
  email: string;
  phone: string;
  banner_url: string;
  destination_url: string;
  duration: number;
  price: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  clicks: number;
  created_at: string;
}

const AdminSponsorships = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [selectedSponsorship, setSelectedSponsorship] = useState<Sponsorship | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      checkAdminStatus();
    }
  }, [user, authLoading, navigate]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (error) throw error;

      if (!data) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      fetchSponsorships();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/");
    }
  };

  const fetchSponsorships = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsorships')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSponsorships(data || []);
    } catch (error: any) {
      console.error("Error fetching sponsorships:", error);
      toast.error("Failed to load sponsorships");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, dates?: { start_date?: string; end_date?: string }) => {
    try {
      const updateData: any = { status };
      
      if (dates) {
        if (dates.start_date) updateData.start_date = dates.start_date;
        if (dates.end_date) updateData.end_date = dates.end_date;
      }

      const { error } = await supabase
        .from('sponsorships')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast.success(`Sponsorship ${status}`);
      fetchSponsorships();
    } catch (error: any) {
      console.error("Error updating sponsorship:", error);
      toast.error("Failed to update sponsorship");
    }
  };

  const handleFileUpload = async (id: string, url: string, column: 'banner_url' | 'payment_proof') => {
    if (!url) return;
    try {
      const { error } = await supabase
        .from('sponsorships')
        .update({ [column]: url })
        .eq('id', id);

      if (error) throw error;
      toast.success(`${column === 'banner_url' ? 'Banner' : 'Payment proof'} updated`);
      fetchSponsorships();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to update file");
    }
  };

  const handleApprove = () => {
    if (!selectedSponsorship || !startDate || !endDate) {
      toast.error("Please set both start and end dates");
      return;
    }

    updateStatus(selectedSponsorship.id, 'approved', {
      start_date: startDate,
      end_date: endDate,
    });
    setSelectedSponsorship(null);
    setStartDate("");
    setEndDate("");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", icon: Clock },
      approved: { variant: "default", icon: CheckCircle },
      rejected: { variant: "destructive", icon: XCircle },
      expired: { variant: "outline", icon: Clock },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="capitalize">
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const filterByStatus = (status: string) => {
    return sponsorships.filter(s => s.status === status);
  };

  if (authLoading || loading || !isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sponsorship Management</h1>
          <p className="text-muted-foreground mt-1">Manage and review sponsorship applications</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({filterByStatus('pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({filterByStatus('approved').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({filterByStatus('rejected').length})
            </TabsTrigger>
            <TabsTrigger value="expired">
              Expired ({filterByStatus('expired').length})
            </TabsTrigger>
          </TabsList>

          {(['pending', 'approved', 'rejected', 'expired'] as const).map((status) => (
            <TabsContent key={status} value={status}>
              <div className="grid gap-6">
                {filterByStatus(status).map((sponsorship) => (
                  <Card key={sponsorship.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{sponsorship.business_name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Contact: {sponsorship.contact_person}
                          </p>
                        </div>
                        {getStatusBadge(sponsorship.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-1">Contact Details</p>
                            <p className="text-sm text-muted-foreground">
                              Email: {sponsorship.email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Phone: {sponsorship.phone}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium mb-1">Package Details</p>
                            <p className="text-sm text-muted-foreground">
                              Duration: {sponsorship.duration} days
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Price: ₹{sponsorship.price}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Clicks: {sponsorship.clicks}
                            </p>
                          </div>

                          <div className="space-y-2">
                             <p className="text-sm font-medium mb-1">Payment Proof</p>
                             {(sponsorship as any).payment_proof ? (
                                <a href={(sponsorship as any).payment_proof} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                   View Payment Proof
                                </a>
                             ) : (
                                <div className="w-32">
                                  <ImageUpload 
                                    bucket="sponsorship-banners"
                                    onUploadComplete={(url) => handleFileUpload(sponsorship.id, url, 'payment_proof')}
                                    label="Upload Proof"
                                  />
                                </div>
                             )}
                          </div>

                          {sponsorship.start_date && sponsorship.end_date && (
                            <div>
                              <p className="text-sm font-medium mb-1">Active Period</p>
                              <p className="text-sm text-muted-foreground">
                                Start: {new Date(sponsorship.start_date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                End: {new Date(sponsorship.end_date).toLocaleDateString()}
                              </p>
                            </div>
                          )}

                          <div>
                            <a
                              href={sponsorship.destination_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline inline-flex items-center"
                            >
                              Destination URL
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Banner Preview</p>
                            <img
                              src={sponsorship.banner_url}
                              alt="Banner"
                              className="w-full rounded-lg border mb-2"
                            />
                            <div className="w-full">
                               <ImageUpload 
                                  bucket="sponsorship-banners"
                                  onUploadComplete={(url) => handleFileUpload(sponsorship.id, url, 'banner_url')}
                                  label="Change Banner"
                               />
                            </div>
                          </div>

                          {sponsorship.status === 'pending' && (
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    className="flex-1"
                                    onClick={() => setSelectedSponsorship(sponsorship)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Approve Sponsorship</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="startDate">Start Date</Label>
                                      <Input
                                        id="startDate"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="endDate">End Date</Label>
                                      <Input
                                        id="endDate"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                      />
                                    </div>
                                    <Button onClick={handleApprove} className="w-full">
                                      Confirm Approval
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={() => updateStatus(sponsorship.id, 'rejected')}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}

                          {sponsorship.status === 'approved' && (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => updateStatus(sponsorship.id, 'expired')}
                            >
                              Mark as Expired
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filterByStatus(status).length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No {status} sponsorships found
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSponsorships;
