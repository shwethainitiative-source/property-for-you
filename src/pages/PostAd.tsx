import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, X, Star, Image as ImageIcon, Phone, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

const PostAd = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [category, setCategory] = useState("automobiles");
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [postingType, setPostingType] = useState<"free" | "featured">("free");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    model: "",
    year: "",
    fuelType: "",
    kmDriven: "",
    ownership: "",
    condition: "",
    propertyType: "",
    size: "",
    bedrooms: "",
    furnishing: "",
    type: "",
    material: "",
    weight: "",
    purity: "",
    price: "",
    description: "",
    city: "",
    locality: "",
    sellerPhone: "",
  });

  // Load saved form data from sessionStorage on mount
  useEffect(() => {
    const savedFormData = sessionStorage.getItem("pendingAdFormData");
    if (savedFormData) {
      const parsed = JSON.parse(savedFormData);
      setFormData(parsed.formData);
      setCategory(parsed.category);
      setPostingType(parsed.postingType || "free");
      sessionStorage.removeItem("pendingAdFormData");
      toast.info("Your form data has been restored. Please continue posting your ad.");
    }
  }, []);

  useEffect(() => {
    const fetchCategoryId = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", category)
        .single();
      if (data) setCategoryId(data.id);
    };
    fetchCategoryId();
  }, [category]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const maxImages = postingType === "free" ? 1 : 6;
      const currentCount = images.length;
      const remainingSlots = maxImages - currentCount;
      
      if (remainingSlots <= 0) {
        toast.error(`Maximum ${maxImages} ${maxImages === 1 ? 'image' : 'images'} allowed for ${postingType} posts`);
        return;
      }
      
      const newFiles = Array.from(files).slice(0, remainingSlots);
      setImages((prev) => [...prev, ...newFiles]);
      
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (listingId: string) => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `${listingId}/${Date.now()}-${i}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from("listing-images")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("listing-images")
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (postingType === "featured" && !formData.description.trim()) {
      toast.error("Description is required for featured listings");
      return;
    }

    if (!formData.city.trim()) {
      toast.error("Please enter a city");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    const maxImages = postingType === "free" ? 1 : 6;
    if (images.length > maxImages) {
      toast.error(`Maximum ${maxImages} ${maxImages === 1 ? 'image' : 'images'} allowed for ${postingType} posts`);
      return;
    }

    // Check authentication
    if (!user) {
      const dataToSave = { formData, category, postingType };
      sessionStorage.setItem("pendingAdFormData", JSON.stringify(dataToSave));
      toast.error("Please login to post an ad");
      navigate("/auth?redirect=/post-ad");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        toast.error("Profile not found");
        return;
      }

      const title = formData.title || `${formData.brand || formData.propertyType || formData.type} ${formData.model || ""}`.trim();

      // Prepare attributes
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

      // For featured listings, redirect to payment
      if (postingType === "featured") {
        const tempListingId = `temp-${user.id}-${Date.now()}`;
        const imageUrls = await uploadImages(tempListingId);
        
        sessionStorage.setItem("pendingListing", JSON.stringify({
          title,
          categoryId,
          price: parseFloat(formData.price),
          description: formData.description || "",
          location_city: formData.city,
          location_locality: formData.locality || null,
          seller_name: profile.name,
          seller_email: profile.email,
          seller_phone: formData.sellerPhone || profile.phone,
          attributes,
          imageUrls,
        }));
        
        toast.info("Redirecting to payment page...");
        navigate("/payment");
        return;
      }

      // For free posts - use platform contact info
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .insert({
          user_id: user.id,
          category_id: categoryId,
          title,
          price: parseFloat(formData.price),
          description: formData.description || "Contact through platform for details",
          location_city: formData.city,
          location_locality: formData.locality || null,
          seller_name: profile.name,
          seller_email: profile.email,
          seller_phone: "+91 1234567890", // Platform number for free posts
          attributes,
          is_featured: false,
        })
        .select()
        .single();

      if (listingError) throw listingError;

      const imageUrls = await uploadImages(listing.id);

      for (let i = 0; i < imageUrls.length; i++) {
        await supabase.from("listing_images").insert({
          listing_id: listing.id,
          image_url: imageUrls[i],
          display_order: i,
        });
      }

      toast.success("Free ad posted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error posting ad:", error);
      toast.error("Failed to post ad. Please try again.");
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
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  placeholder="e.g., Maruti, Honda"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  placeholder="e.g., Swift, City"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  placeholder="2020"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuelType">Fuel Type</Label>
                <Select
                  value={formData.fuelType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, fuelType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="cng">CNG</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kmDriven">KM Driven</Label>
                <Input
                  id="kmDriven"
                  type="number"
                  value={formData.kmDriven}
                  onChange={(e) =>
                    setFormData({ ...formData, kmDriven: e.target.value })
                  }
                  placeholder="50000"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownership">Ownership</Label>
                <Select
                  value={formData.ownership}
                  onValueChange={(value) =>
                    setFormData({ ...formData, ownership: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ownership" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first">First Owner</SelectItem>
                    <SelectItem value="second">Second Owner</SelectItem>
                    <SelectItem value="third">Third Owner</SelectItem>
                    <SelectItem value="fourth">Fourth or More</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) =>
                    setFormData({ ...formData, condition: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );

      case "properties":
        return (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type *</Label>
                <Select
                  value={formData.propertyType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, propertyType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="land">Land/Plot</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Size (sq ft)</Label>
                <Input
                  id="size"
                  type="number"
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({ ...formData, size: e.target.value })
                  }
                  placeholder="1200"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Select
                  value={formData.bedrooms}
                  onValueChange={(value) =>
                    setFormData({ ...formData, bedrooms: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bedrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 BHK</SelectItem>
                    <SelectItem value="2">2 BHK</SelectItem>
                    <SelectItem value="3">3 BHK</SelectItem>
                    <SelectItem value="4">4 BHK</SelectItem>
                    <SelectItem value="5">5+ BHK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="furnishing">Furnishing</Label>
                <Select
                  value={formData.furnishing}
                  onValueChange={(value) =>
                    setFormData({ ...formData, furnishing: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select furnishing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="furnished">Fully Furnished</SelectItem>
                    <SelectItem value="semi-furnished">Semi Furnished</SelectItem>
                    <SelectItem value="unfurnished">Unfurnished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );

      case "jewellery":
        return (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ring">Ring</SelectItem>
                    <SelectItem value="necklace">Necklace</SelectItem>
                    <SelectItem value="earrings">Earrings</SelectItem>
                    <SelectItem value="bracelet">Bracelet</SelectItem>
                    <SelectItem value="pendant">Pendant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Select
                  value={formData.material}
                  onValueChange={(value) =>
                    setFormData({ ...formData, material: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="diamond">Diamond</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purity">Purity</Label>
                <Select
                  value={formData.purity}
                  onValueChange={(value) =>
                    setFormData({ ...formData, purity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select purity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24k">24 Karat</SelectItem>
                    <SelectItem value="22k">22 Karat</SelectItem>
                    <SelectItem value="18k">18 Karat</SelectItem>
                    <SelectItem value="14k">14 Karat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (grams)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                  placeholder="10.5"
                />
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const maxImages = postingType === "free" ? 1 : 6;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Post Your Ad</h1>

        {/* Posting Type Selection - Enhanced */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Free Post Option */}
          <Card 
            className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
              postingType === "free" 
                ? "border-2 border-primary shadow-md" 
                : "border-2 border-transparent"
            }`}
            onClick={() => {
              setPostingType("free");
              setImages([]);
              setImagePreviews([]);
            }}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Free Post
                  </h3>
                  <p className="text-sm text-muted-foreground">Basic visibility for your listing</p>
                </div>
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                  postingType === "free" ? "border-primary bg-primary" : "border-muted-foreground"
                }`}>
                  {postingType === "free" && <div className="h-3 w-3 rounded-full bg-white" />}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  <span>1 photo allowed</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <X className="h-4 w-4" />
                  <span>No description field</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>Contact through platform</span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  <strong>Note:</strong> For free posts, buyers will contact you through ThePropertyForYou team. Platform contact number will be displayed.
                </p>
              </div>
            </div>
          </Card>

          {/* Featured Post Option */}
          <Card 
            className={`p-6 cursor-pointer transition-all hover:shadow-lg relative overflow-hidden ${
              postingType === "featured" 
                ? "border-2 border-yellow-500 shadow-md" 
                : "border-2 border-transparent"
            }`}
            onClick={() => {
              setPostingType("featured");
              setImages([]);
              setImagePreviews([]);
            }}
          >
            <div className="absolute top-2 right-2">
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Featured Listing
                  </h3>
                  <p className="text-sm text-muted-foreground">Premium placement with maximum exposure</p>
                </div>
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                  postingType === "featured" ? "border-yellow-500 bg-yellow-500" : "border-muted-foreground"
                }`}>
                  {postingType === "featured" && <div className="h-3 w-3 rounded-full bg-white" />}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  <span>Up to 6 high-quality photos</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>Your personal contact number</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>Full description field</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-yellow-900 dark:text-yellow-100 font-medium">
                  ✨ Featured listings get more views, priority placement, and appear in popup ads!
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Category Selection */}
        <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Category</h2>
          <div className="flex gap-4">
            <Button
              variant={category === "automobiles" ? "default" : "outline"}
              onClick={() => setCategory("automobiles")}
            >
              Automobiles
            </Button>
            <Button
              variant={category === "properties" ? "default" : "outline"}
              onClick={() => setCategory("properties")}
            >
              Properties
            </Button>
            <Button
              variant={category === "jewellery" ? "default" : "outline"}
              onClick={() => setCategory("jewellery")}
            >
              Jewellery
            </Button>
          </div>
        </div>

        {/* Category-Specific Fields */}
        <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Item Details</h2>
          <div className="space-y-4">{renderCategoryFields()}</div>
        </div>

        {/* Common Fields */}
        <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter a descriptive title for your listing"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="Enter price"
                required
              />
            </div>

            {postingType === "featured" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe your item in detail..."
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellerPhone">Your Contact Number *</Label>
                  <Input
                    id="sellerPhone"
                    type="tel"
                    value={formData.sellerPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, sellerPhone: e.target.value })
                    }
                    placeholder="Enter your contact number"
                  />
                </div>
              </>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="e.g., Mumbai"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locality">Locality</Label>
                <Input
                  id="locality"
                  value={formData.locality}
                  onChange={(e) =>
                    setFormData({ ...formData, locality: e.target.value })
                  }
                  placeholder="e.g., Andheri West"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Upload Images * 
            <span className="text-sm text-muted-foreground ml-2">
              ({images.length}/{maxImages} {maxImages === 1 ? 'image' : 'images'})
            </span>
          </h2>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                id="image-upload"
                multiple={postingType === "featured"}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={images.length >= maxImages}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer flex flex-col items-center ${
                  images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  {images.length >= maxImages 
                    ? `Maximum ${maxImages} ${maxImages === 1 ? 'image' : 'images'} reached`
                    : `Click to upload (Max ${maxImages} ${maxImages === 1 ? 'image' : 'images'})`
                  }
                </span>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg shadow-md"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full ${
            postingType === "featured" 
              ? "bg-yellow-500 hover:bg-yellow-600 text-white" 
              : "bg-primary hover:bg-primary/90"
          }`}
          size="lg"
        >
          {isSubmitting 
            ? "Processing..." 
            : postingType === "featured" 
              ? "Continue to Payment" 
              : "Submit Free Listing"
          }
        </Button>
      </main>
      <Footer />
    </div>
  );
};

export default PostAd;
