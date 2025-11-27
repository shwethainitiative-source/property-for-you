import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Upload, X, Star, Image as ImageIcon, Phone, Eye, Check, AlertTriangle, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

type PostingType = "free" | "featured" | "popup";

const PostAd = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [category, setCategory] = useState("automobiles");
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [postingType, setPostingType] = useState<PostingType>("free");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<number[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: "", brand: "", model: "", year: "", fuelType: "", kmDriven: "",
    ownership: "", condition: "", propertyType: "", size: "", bedrooms: "",
    furnishing: "", type: "", material: "", weight: "", purity: "", price: "",
    description: "", city: "", locality: "", sellerPhone: "",
  });

  useEffect(() => {
    const savedFormData = sessionStorage.getItem("pendingAdFormData");
    if (savedFormData) {
      const parsed = JSON.parse(savedFormData);
      setFormData(parsed.formData);
      setCategory(parsed.category);
      setPostingType(parsed.postingType || "free");
      sessionStorage.removeItem("pendingAdFormData");
      toast.info("Form data restored");
    }
  }, []);

  useEffect(() => {
    const fetchCategoryId = async () => {
      const { data } = await supabase.from("categories").select("id").eq("slug", category).single();
      if (data) setCategoryId(data.id);
    };
    fetchCategoryId();
  }, [category]);

  useEffect(() => {
    if (postingType === "popup" && selectedDate) {
      checkAvailableSlots(selectedDate);
    }
  }, [selectedDate, postingType]);

  const checkAvailableSlots = async (date: string) => {
    try {
      const { data, error } = await supabase.from("popup_ad_schedules").select("slot_number").eq("schedule_date", date);
      if (error) throw error;
      const bookedSlots = data.map(s => s.slot_number);
      const available = [1, 2, 3].filter(slot => !bookedSlots.includes(slot));
      setAvailableSlots(available);
      if (available.length === 0) toast.error("All slots booked for this date");
    } catch (error) {
      console.error("Error checking slots:", error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const maxImages = postingType === "free" ? 1 : 6;
      const remainingSlots = maxImages - images.length;
      if (remainingSlots <= 0) {
        toast.error(`Maximum ${maxImages} image${maxImages === 1 ? '' : 's'} allowed`);
        return;
      }
      const newFiles = Array.from(files).slice(0, remainingSlots);
      setImages(prev => [...prev, ...newFiles]);
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (listingId: string) => {
    const uploadedUrls: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `${listingId}/${Date.now()}-${i}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("listing-images").upload(fileName, file);
      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }
      const { data: { publicUrl } } = supabase.storage.from("listing-images").getPublicUrl(fileName);
      uploadedUrls.push(publicUrl);
    }
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.price || parseFloat(formData.price) <= 0 || !formData.city.trim() || images.length === 0 || !agreedToTerms) {
      toast.error("Please fill all required fields and agree to terms");
      return;
    }
    if (postingType !== "free" && !formData.description.trim()) {
      toast.error("Description required for featured/popup listings");
      return;
    }
    if (postingType === "popup" && (!selectedDate || selectedSlot === null)) {
      toast.error("Please select date and slot for popup");
      return;
    }
    if (!user) {
      sessionStorage.setItem("pendingAdFormData", JSON.stringify({ formData, category, postingType }));
      toast.error("Please login");
      navigate("/auth?redirect=/post-ad");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (!profile) {
        toast.error("Profile not found");
        return;
      }

      const title = formData.title || `${formData.brand || formData.propertyType || formData.type} ${formData.model || ""}`.trim();
      const attributes: any = {};
      
      if (category === "automobiles") {
        attributes.brand = formData.brand;
        attributes.model = formData.model;
        attributes.year = formData.year;
        attributes.fuelType = formData.fuelType;
        attributes.kmDriven = formData.kmDriven;
        attributes.ownership = formData.ownership;
        attributes.condition = formData.condition;
      } else if (category === "properties") {
        attributes.propertyType = formData.propertyType;
        attributes.size = formData.size;
        attributes.bedrooms = formData.bedrooms;
        attributes.furnishing = formData.furnishing;
      } else if (category === "jewellery") {
        attributes.type = formData.type;
        attributes.material = formData.material;
        attributes.weight = formData.weight;
        attributes.purity = formData.purity;
      }

      if (postingType === "popup" || postingType === "featured") {
        const tempListingId = `temp-${user.id}-${Date.now()}`;
        const imageUrls = await uploadImages(tempListingId);
        const pendingData: any = {
          title, categoryId,
          price: parseFloat(formData.price),
          description: formData.description || "",
          location_city: formData.city,
          location_locality: formData.locality || null,
          seller_name: profile.name,
          seller_email: profile.email,
          seller_phone: formData.sellerPhone || profile.phone,
          attributes, imageUrls,
        };
        if (postingType === "popup") {
          pendingData.popupSchedule = { date: selectedDate, slot: selectedSlot };
        }
        sessionStorage.setItem("pendingListing", JSON.stringify(pendingData));
        toast.info("Redirecting to payment...");
        navigate("/payment");
        return;
      }

      // Free post
      const { data: listing, error: listingError } = await supabase.from("listings").insert({
        user_id: user.id, category_id: categoryId, title,
        price: parseFloat(formData.price),
        description: formData.description || "Contact through platform",
        location_city: formData.city,
        location_locality: formData.locality || null,
        seller_name: profile.name,
        seller_email: profile.email,
        seller_phone: "+91 1234567890",
        attributes, is_featured: false,
      }).select().single();

      if (listingError) throw listingError;
      const imageUrls = await uploadImages(listing.id);
      for (let i = 0; i < imageUrls.length; i++) {
        await supabase.from("listing_images").insert({
          listing_id: listing.id, image_url: imageUrls[i], display_order: i,
        });
      }
      toast.success("Free ad posted!");
      navigate("/");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to post ad");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCategoryFields = () => {
    switch (category) {
      case "automobiles":
        return (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input id="brand" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} placeholder="e.g., Maruti" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input id="model" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} placeholder="e.g., Swift" />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Year</Label>
                <Input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} placeholder="2020" />
              </div>
              <div className="space-y-2">
                <Label>Fuel Type</Label>
                <Select value={formData.fuelType} onValueChange={(value) => setFormData({ ...formData, fuelType: value })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="cng">CNG</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>KM Driven</Label>
                <Input type="number" value={formData.kmDriven} onChange={(e) => setFormData({ ...formData, kmDriven: e.target.value })} placeholder="50000" />
              </div>
            </div>
          </>
        );
      case "properties":
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Property Type *</Label>
              <Select value={formData.propertyType} onValueChange={(value) => setFormData({ ...formData, propertyType: value })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="land">Land/Plot</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Size (sq ft)</Label>
              <Input type="number" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} placeholder="1200" />
            </div>
          </div>
        );
      case "jewellery":
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ring">Ring</SelectItem>
                  <SelectItem value="necklace">Necklace</SelectItem>
                  <SelectItem value="earrings">Earrings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Material</Label>
              <Select value={formData.material} onValueChange={(value) => setFormData({ ...formData, material: value })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="diamond">Diamond</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const maxImages = postingType === "free" ? 1 : 6;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Post Your Ad</h1>

        {/* Comparison Table */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Choose Your Plan</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead className="text-center">Free</TableHead>
                  <TableHead className="text-center bg-yellow-50 dark:bg-yellow-950">Featured</TableHead>
                  <TableHead className="text-center bg-purple-50 dark:bg-purple-950">Popup</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Images</TableCell>
                  <TableCell className="text-center">1</TableCell>
                  <TableCell className="text-center bg-yellow-50 dark:bg-yellow-950">6</TableCell>
                  <TableCell className="text-center bg-purple-50 dark:bg-purple-950">6</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Description</TableCell>
                  <TableCell className="text-center"><X className="h-4 w-4 mx-auto text-destructive" /></TableCell>
                  <TableCell className="text-center bg-yellow-50 dark:bg-yellow-950"><Check className="h-4 w-4 mx-auto text-green-500" /></TableCell>
                  <TableCell className="text-center bg-purple-50 dark:bg-purple-950"><Check className="h-4 w-4 mx-auto text-green-500" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Contact</TableCell>
                  <TableCell className="text-center">Platform</TableCell>
                  <TableCell className="text-center bg-yellow-50 dark:bg-yellow-950">Your Number</TableCell>
                  <TableCell className="text-center bg-purple-50 dark:bg-purple-950">Your Number</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Homepage Priority</TableCell>
                  <TableCell className="text-center"><X className="h-4 w-4 mx-auto text-destructive" /></TableCell>
                  <TableCell className="text-center bg-yellow-50 dark:bg-yellow-950"><Check className="h-4 w-4 mx-auto text-green-500" /></TableCell>
                  <TableCell className="text-center bg-purple-50 dark:bg-purple-950"><Check className="h-4 w-4 mx-auto text-green-500" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Popup Visibility</TableCell>
                  <TableCell className="text-center"><X className="h-4 w-4 mx-auto text-destructive" /></TableCell>
                  <TableCell className="text-center bg-yellow-50 dark:bg-yellow-950"><X className="h-4 w-4 mx-auto text-destructive" /></TableCell>
                  <TableCell className="text-center bg-purple-50 dark:bg-purple-950"><Check className="h-4 w-4 mx-auto text-green-500" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Pricing</TableCell>
                  <TableCell className="text-center font-bold text-green-600">FREE</TableCell>
                  <TableCell className="text-center bg-yellow-50 dark:bg-yellow-950 font-bold">₹499</TableCell>
                  <TableCell className="text-center bg-purple-50 dark:bg-purple-950 font-bold">₹999</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Posting Type Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className={`p-6 cursor-pointer transition-all hover:shadow-lg ${postingType === "free" ? "border-2 border-primary shadow-md" : "border-2 border-transparent"}`} onClick={() => { setPostingType("free"); setImages([]); setImagePreviews([]); }}>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <h3 className="text-xl font-bold flex items-center gap-2"><ImageIcon className="h-5 w-5" />Free</h3>
                <p className="text-sm text-muted-foreground">Basic visibility</p>
              </div>
              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${postingType === "free" ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                {postingType === "free" && <div className="h-3 w-3 rounded-full bg-white" />}
              </div>
            </div>
          </Card>

          <Card className={`p-6 cursor-pointer transition-all hover:shadow-lg relative ${postingType === "featured" ? "border-2 border-yellow-500 shadow-md" : "border-2 border-transparent"}`} onClick={() => { setPostingType("featured"); setImages([]); setImagePreviews([]); }}>
            <Star className="absolute top-2 right-2 h-6 w-6 text-yellow-500 fill-yellow-500" />
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <h3 className="text-xl font-bold flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" />Featured</h3>
                <p className="text-sm text-muted-foreground">Premium placement</p>
              </div>
              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${postingType === "featured" ? "border-yellow-500 bg-yellow-500" : "border-muted-foreground"}`}>
                {postingType === "featured" && <div className="h-3 w-3 rounded-full bg-white" />}
              </div>
            </div>
          </Card>

          <Card className={`p-6 cursor-pointer transition-all hover:shadow-lg relative ${postingType === "popup" ? "border-2 border-purple-500 shadow-md" : "border-2 border-transparent"}`} onClick={() => { setPostingType("popup"); setImages([]); setImagePreviews([]); }}>
            <Sparkles className="absolute top-2 right-2 h-6 w-6 text-purple-500" />
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <h3 className="text-xl font-bold flex items-center gap-2"><Sparkles className="h-5 w-5 text-purple-500" />Popup</h3>
                <p className="text-sm text-muted-foreground">Maximum exposure</p>
              </div>
              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${postingType === "popup" ? "border-purple-500 bg-purple-500" : "border-muted-foreground"}`}>
                {postingType === "popup" && <div className="h-3 w-3 rounded-full bg-white" />}
              </div>
            </div>
          </Card>
        </div>

        {/* Date & Slot for Popup */}
        {postingType === "popup" && (
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Select Popup Schedule</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="popupDate">Date</Label>
                <Input id="popupDate" type="date" value={selectedDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setSelectedDate(e.target.value)} />
              </div>
              {selectedDate && availableSlots.length > 0 && (
                <div className="space-y-2">
                  <Label>Available Slots</Label>
                  <div className="flex gap-2">
                    {availableSlots.map(slot => (
                      <Button key={slot} variant={selectedSlot === slot ? "default" : "outline"} onClick={() => setSelectedSlot(slot)}>Slot {slot}</Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Category */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Category</h2>
          <div className="flex gap-4">
            <Button variant={category === "automobiles" ? "default" : "outline"} onClick={() => setCategory("automobiles")}>Automobiles</Button>
            <Button variant={category === "properties" ? "default" : "outline"} onClick={() => setCategory("properties")}>Properties</Button>
            <Button variant={category === "jewellery" ? "default" : "outline"} onClick={() => setCategory("jewellery")}>Jewellery</Button>
          </div>
        </Card>

        {/* Category Fields */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Details</h2>
          <div className="space-y-4">{renderCategoryFields()}</div>
        </Card>

        {/* Common Fields */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Information</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="Enter price" />
            </div>
            {postingType !== "free" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your item..." rows={5} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellerPhone">Contact Number *</Label>
                  <Input id="sellerPhone" type="tel" value={formData.sellerPhone} onChange={(e) => setFormData({ ...formData, sellerPhone: e.target.value })} placeholder="Your phone" />
                </div>
              </>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="e.g., Mumbai" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locality">Locality</Label>
                <Input id="locality" value={formData.locality} onChange={(e) => setFormData({ ...formData, locality: e.target.value })} placeholder="e.g., Andheri" />
              </div>
            </div>
            {postingType === "free" && (
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <p className="text-xs text-blue-900 dark:text-blue-100"><strong>Note:</strong> For free posts, buyers contact you through ThePropertyForYou team. Platform contact displayed.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Images */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Images * ({images.length}/{maxImages})</h2>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input type="file" id="image-upload" multiple={postingType !== "free"} accept="image/*" onChange={handleImageUpload} className="hidden" disabled={images.length >= maxImages} />
              <label htmlFor="image-upload" className={`cursor-pointer flex flex-col items-center ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">{images.length >= maxImages ? `Max ${maxImages} reached` : `Upload (Max ${maxImages})`}</span>
              </label>
            </div>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-lg shadow-md" />
                    <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Terms */}
        <Card className="p-6 mb-6 border-2 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)} />
            <div className="space-y-2 flex-1">
              <Label htmlFor="terms" className="text-base font-semibold cursor-pointer">Terms & Conditions</Label>
              <div className="text-sm text-muted-foreground space-y-1 bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p><strong>Legal Notice:</strong> Only legal products allowed under Jewellery, Automobile, and Property categories.</p>
                </div>
                <p className="ml-6">Posting illegal items, counterfeit goods, or misleading information is prohibited.</p>
                <p className="ml-6">Admin may reject suspicious listings and file complaints for illegal activity.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Submit */}
        <Button onClick={handleSubmit} disabled={isSubmitting || !agreedToTerms} className={`w-full ${postingType === "popup" ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" : postingType === "featured" ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-primary hover:bg-primary/90"}`} size="lg">
          {isSubmitting ? "Processing..." : postingType === "popup" ? "Continue to Payment (₹999)" : postingType === "featured" ? "Continue to Payment (₹499)" : "Submit Free Listing"}
        </Button>
      </main>
      <Footer />
    </div>
  );
};

export default PostAd;
