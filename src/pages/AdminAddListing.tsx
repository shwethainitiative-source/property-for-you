import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ImageUpload from "@/components/admin/ImageUpload";
import { Loader2, Plus } from "lucide-react";

const AdminAddListing = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{ id: string, name: string, slug: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    categoryId: "",
    city: "",
    locality: "",
    sellerName: "Admin",
    sellerEmail: "",
    sellerPhone: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*");
    if (data) setCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error("Please select a category");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No admin user found");

      // 1. Create Listing
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .insert({
          user_id: user.id,
          category_id: formData.categoryId,
          title: formData.title,
          price: parseFloat(formData.price),
          description: formData.description,
          location_city: formData.city,
          location_locality: formData.locality || null,
          seller_name: formData.sellerName,
          seller_email: formData.sellerEmail,
          seller_phone: formData.sellerPhone,
          status: "active",
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // 2. Add Images
      if (imageUrls.length > 0) {
        const imageInserts = imageUrls.map((url, index) => ({
          listing_id: listing.id,
          image_url: url,
          display_order: index,
        }));
        await supabase.from("listing_images").insert(imageInserts);
      }

      toast.success("Listing created successfully!");
      navigate("/admin/listings");
    } catch (error: any) {
      console.error("Error creating listing:", error);
      toast.error(error.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Create New Listing</h1>
          <Button variant="outline" onClick={() => navigate("/admin/listings")}>
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder="e.g., 3BHK Apartment in Mumbai" 
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
                    placeholder="5000000" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input 
                    id="city" 
                    placeholder="Mumbai" 
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
                  placeholder="Tell us about the property..." 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Listing Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imageUrls.map((url, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden border relative">
                    <img src={url} className="w-full h-full object-cover" alt="Listing" />
                    <Button 
                      type="button"
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-1 right-1 h-6 w-6"
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
                    label="Upload Image"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seller Contact Info (Admin Overwrite)</CardTitle>
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Publish Listing"}
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminAddListing;
