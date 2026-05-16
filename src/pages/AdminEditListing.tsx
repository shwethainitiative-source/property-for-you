import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ImageUpload from "@/components/admin/ImageUpload";
import { Loader2, Plus, ArrowLeft } from "lucide-react";

const AdminEditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{ id: string, name: string, slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    categoryId: "",
    city: "",
    locality: "",
    sellerName: "",
    sellerEmail: "",
    sellerPhone: "",
    status: "active",
    isFeatured: false,
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Categories
      const { data: catData } = await supabase.from("categories").select("*");
      if (catData) setCategories(catData);

      // 2. Fetch Listing
      const { data: listing, error } = await supabase
        .from("listings")
        .select(`
          *,
          listing_images (image_url, display_order)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      if (listing) {
        setFormData({
          title: listing.title,
          price: listing.price.toString(),
          description: listing.description || "",
          categoryId: listing.category_id,
          city: listing.location_city,
          locality: listing.location_locality || "",
          sellerName: listing.seller_name,
          sellerEmail: listing.seller_email,
          sellerPhone: listing.seller_phone,
          status: listing.status,
          isFeatured: listing.is_featured,
        });

        const sortedImages = (listing.listing_images || [])
          .sort((a: any, b: any) => a.display_order - b.display_order)
          .map((img: any) => img.image_url);
        setImageUrls(sortedImages);
      }
    } catch (error) {
      console.error("Error fetching listing:", error);
      toast.error("Failed to load listing data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update Listing
      const { error: listingError } = await supabase
        .from("listings")
        .update({
          category_id: formData.categoryId,
          title: formData.title,
          price: parseFloat(formData.price),
          description: formData.description,
          location_city: formData.city,
          location_locality: formData.locality || null,
          seller_name: formData.sellerName,
          seller_email: formData.sellerEmail,
          seller_phone: formData.sellerPhone,
          status: formData.status,
          is_featured: formData.isFeatured,
        })
        .eq("id", id);

      if (listingError) throw listingError;

      // 2. Refresh Images (Delete old and insert new to maintain order)
      await supabase.from("listing_images").delete().eq("listing_id", id);
      
      if (imageUrls.length > 0) {
        const imageInserts = imageUrls.map((url, index) => ({
          listing_id: id,
          image_url: url,
          display_order: index,
        }));
        await supabase.from("listing_images").insert(imageInserts);
      }

      toast.success("Listing updated successfully!");
      navigate("/admin/listings");
    } catch (error: any) {
      console.error("Error updating listing:", error);
      toast.error(error.message || "Failed to update listing");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Edit Listing</h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin/listings")}>
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pb-12">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Listing Title *</Label>
                  <Input 
                    id="title" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(val) => setFormData({...formData, categoryId: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input 
                    id="city" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  rows={4} 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label>Status</Label>
                    <p className="text-sm text-muted-foreground">Listing visibility on platform</p>
                  </div>
                  <Select 
                    value={formData.status} 
                    onValueChange={(val) => setFormData({...formData, status: val})}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label>Featured Listing</Label>
                    <p className="text-sm text-muted-foreground">Highlight on homepage</p>
                  </div>
                  <Switch 
                    checked={formData.isFeatured}
                    onCheckedChange={(val) => setFormData({...formData, isFeatured: val})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imageUrls.map((url, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden border relative group">
                    <img src={url} className="w-full h-full object-cover" alt="Listing" />
                    <Button 
                      type="button"
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))}
                    >
                      <Plus className="h-4 w-4 rotate-45" />
                    </Button>
                  </div>
                ))}
                <div className="aspect-square">
                  <ImageUpload 
                    bucket="listing-images"
                    onUploadComplete={(url) => {
                      if (url) setImageUrls([...imageUrls, url]);
                    }}
                    label="Add Image"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seller Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sname">Seller Name</Label>
                  <Input 
                    id="sname" 
                    value={formData.sellerName}
                    onChange={(e) => setFormData({...formData, sellerName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semail">Seller Email</Label>
                  <Input 
                    id="semail" 
                    type="email"
                    value={formData.sellerEmail}
                    onChange={(e) => setFormData({...formData, sellerEmail: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sphone">Seller Phone</Label>
                  <Input 
                    id="sphone" 
                    value={formData.sellerPhone}
                    onChange={(e) => setFormData({...formData, sellerPhone: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? <Loader2 className="animate-spin mr-2" /> : "Save Changes"}
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminEditListing;
