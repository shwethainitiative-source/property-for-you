import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";

const PRICING = {
  7: 199,
  20: 499,
  45: 999,
};

const PLANS = [
  { days: 7, name: "Silver", price: 199 },
  { days: 20, name: "Gold", price: 499 },
  { days: 45, name: "Platinum", price: 999 },
];

const SponsorshipApply = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  
  const [formData, setFormData] = useState({
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    destinationUrl: "",
    duration: "",
  });

  const selectedPrice = formData.duration ? PRICING[parseInt(formData.duration) as keyof typeof PRICING] : 0;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/sponsorship-apply");
    }
  }, [user, authLoading, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login to continue");
      navigate("/auth?redirect=/sponsorship-apply");
      return;
    }

    if (!bannerFile) {
      toast.error("Please upload a banner image");
      return;
    }

    setLoading(true);

    try {
      // Upload banner
      const fileExt = bannerFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('sponsorship-banners')
        .upload(fileName, bannerFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('sponsorship-banners')
        .getPublicUrl(fileName);

      // Create sponsorship record
      const { error: insertError } = await supabase
        .from('sponsorships')
        .insert({
          user_id: user.id,
          business_name: formData.businessName,
          contact_person: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          banner_url: publicUrl,
          destination_url: formData.destinationUrl,
          duration: parseInt(formData.duration),
          price: selectedPrice,
          status: 'pending',
          payment_status: 'pending',
        });

      if (insertError) throw insertError;

      toast.success("Thank you! Your sponsorship request is submitted and under review.");
      
      // Reset form
      setFormData({
        businessName: "",
        contactPerson: "",
        email: "",
        phone: "",
        destinationUrl: "",
        duration: "",
      });
      setBannerFile(null);
      setBannerPreview("");
      
      navigate("/");
    } catch (error: any) {
      console.error("Error submitting sponsorship:", error);
      toast.error(error.message || "Failed to submit sponsorship request");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Sponsorship Plans</h1>
            <p className="text-muted-foreground text-lg">
              Boost your brand visibility with our premium sponsorship packages
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {PLANS.map((plan) => (
              <Card
                key={plan.days}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  formData.duration === plan.days.toString()
                    ? "border-primary ring-2 ring-primary"
                    : ""
                }`}
                onClick={() => setFormData({ ...formData, duration: plan.days.toString() })}
              >
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.days} Days</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-primary mb-4">
                    ₹{plan.price}
                  </div>
                  <Button
                    variant={formData.duration === plan.days.toString() ? "default" : "outline"}
                    className="w-full"
                  >
                    {formData.duration === plan.days.toString() ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Selected
                      </>
                    ) : (
                      "Select Plan"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Application Form */}
          <Card>
            <CardHeader>
              <CardTitle>Sponsorship Application Form</CardTitle>
              <CardDescription>
                Fill in the details below to submit your sponsorship request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person Name *</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destinationUrl">Destination Link *</Label>
                    <Input
                      id="destinationUrl"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.destinationUrl}
                      onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration *</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) => setFormData({ ...formData, duration: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 Days - ₹199</SelectItem>
                        <SelectItem value="20">20 Days - ₹499</SelectItem>
                        <SelectItem value="45">45 Days - ₹999</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banner">Upload Banner * (Max 5MB)</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                    {bannerPreview ? (
                      <div className="space-y-4">
                        <img
                          src={bannerPreview}
                          alt="Banner preview"
                          className="max-h-48 mx-auto rounded"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setBannerFile(null);
                            setBannerPreview("");
                          }}
                        >
                          Change Banner
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                        <div>
                          <Button type="button" variant="outline" asChild>
                            <label htmlFor="banner" className="cursor-pointer">
                              Choose File
                            </label>
                          </Button>
                          <Input
                            id="banner"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            required
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Upload your banner image (JPG, PNG, GIF)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedPrice > 0 && (
                  <div className="bg-muted p-6 rounded-lg">
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold">Total Price:</span>
                      <span className="text-2xl font-bold text-primary">
                        ₹{selectedPrice}
                      </span>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SponsorshipApply;
