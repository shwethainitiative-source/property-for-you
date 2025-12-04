import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Zap, Star, Crown, Upload, CheckCircle, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface PricingPlan {
  id: string;
  plan_type: string;
  duration: number;
  price: number;
  display_order: number;
}

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [selectedFeaturedPlan, setSelectedFeaturedPlan] = useState<PricingPlan | null>(null);
  const [selectedPopupPlan, setSelectedPopupPlan] = useState<PricingPlan | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please login to continue");
      navigate("/auth?redirect=/payment");
    }
  }, [user, loading, navigate]);

  const fetchPricingPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("pricing_plans")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setPricingPlans(data || []);
    } catch (error) {
      console.error("Error fetching pricing plans:", error);
      toast.error("Failed to fetch pricing plans");
    }
  };

  const getMaxDatesForPlan = (duration: number): number => {
    if (duration === 30) return 7;
    if (duration === 60) return 17;
    if (duration === 90) return 26;
    return 0;
  };

  const handleFeaturedPlanSelect = (plan: PricingPlan) => {
    if (selectedFeaturedPlan?.id === plan.id) {
      setSelectedFeaturedPlan(null);
    } else {
      setSelectedFeaturedPlan(plan);
    }
  };

  const handlePopupPlanSelect = (plan: PricingPlan) => {
    if (selectedPopupPlan?.id === plan.id) {
      setSelectedPopupPlan(null);
      setSelectedDates([]);
    } else {
      setSelectedPopupPlan(plan);
      setSelectedDates([]);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (!dates || !selectedPopupPlan) return;
    
    const maxDates = getMaxDatesForPlan(selectedPopupPlan.duration);
    if (dates.length > maxDates) {
      toast.error(`Maximum ${maxDates} dates allowed for this plan`);
      return;
    }
    
    setSelectedDates(dates);
  };

  const getTotalAmount = (): number => {
    let total = 0;
    if (selectedFeaturedPlan) total += selectedFeaturedPlan.price;
    if (selectedPopupPlan) total += selectedPopupPlan.price;
    return total;
  };

  const handleProceedToPayment = () => {
    if (!selectedFeaturedPlan && !selectedPopupPlan) {
      toast.error("Please select at least one plan");
      return;
    }
    setShowPayment(true);
  };

  const handleSubmitPayment = async () => {
    if (!screenshot) {
      toast.error("Please upload payment screenshot");
      return;
    }

    if (selectedPopupPlan && selectedDates.length === 0) {
      toast.error("Please select dates for popup promotion");
      return;
    }

    if (!user) {
      toast.error("Please login to continue");
      navigate("/auth");
      return;
    }

    setUploading(true);

    try {
      const pendingListingData = sessionStorage.getItem("pendingListing");
      if (!pendingListingData) {
        toast.error("No pending listing found. Please start over.");
        navigate("/post-ad");
        return;
      }

      const listingData = JSON.parse(pendingListingData);

      // Upload payment screenshot
      const fileExt = screenshot.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(`payment-proofs/${fileName}`, screenshot);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("listing-images")
        .getPublicUrl(`payment-proofs/${fileName}`);

      // Create the listing
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .insert({
          user_id: user.id,
          category_id: listingData.categoryId,
          title: listingData.title,
          price: listingData.price,
          description: listingData.description,
          location_city: listingData.location_city,
          location_locality: listingData.location_locality,
          seller_name: listingData.seller_name,
          seller_email: listingData.seller_email,
          seller_phone: listingData.seller_phone,
          attributes: listingData.attributes,
          is_featured: false,
          payment_proof: publicUrl,
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Associate uploaded images
      if (listingData.imageUrls && listingData.imageUrls.length > 0) {
        for (let i = 0; i < listingData.imageUrls.length; i++) {
          await supabase.from("listing_images").insert({
            listing_id: listing.id,
            image_url: listingData.imageUrls[i],
            display_order: i,
          });
        }
      }

      // If popup promotion selected, create popup_ad_schedules
      if (selectedPopupPlan && selectedDates.length > 0) {
        const { error: popupError } = await supabase
          .from("popup_ad_schedules")
          .insert({
            listing_id: listing.id,
            schedule_date: selectedDates[0].toISOString().split('T')[0],
            slot_number: 1,
            payment_amount: selectedPopupPlan.price,
            payment_proof: publicUrl,
            payment_status: "pending",
            admin_approved: false,
            selected_dates: selectedDates.map(d => d.toISOString().split('T')[0]),
          });

        if (popupError) throw popupError;
      }

      const hasPopup = selectedPopupPlan !== null;
      const hasFeatured = selectedFeaturedPlan !== null;

      if (hasPopup && hasFeatured) {
        toast.success("Featured listing and popup promotion submitted! Admin will review your payment.");
      } else if (hasPopup) {
        toast.success("Popup promotion request submitted! Admin will review your payment.");
      } else {
        toast.success("Payment screenshot uploaded! Your listing will be featured once admin approves.");
      }

      sessionStorage.removeItem("pendingListing");
      navigate("/my-listings");
    } catch (error) {
      console.error("Error submitting payment:", error);
      toast.error("Failed to submit payment. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const getIconForPlan = (planType: string) => {
    if (planType.includes("30")) return Star;
    if (planType.includes("60")) return Zap;
    if (planType.includes("90")) return Crown;
    return Star;
  };

  const getBenefitsForPlan = (planType: string, duration: number) => {
    if (planType.startsWith("popup")) {
      const maxDates = getMaxDatesForPlan(duration);
      return [
        `Select ${maxDates} dates for popup display`,
        "Homepage popup visibility",
        "Highest priority placement",
        "Full contact details visible",
        `${duration} days validity`
      ];
    } else {
      return [
        "Featured listing badge",
        "Higher visibility in search",
        "Priority placement",
        "Full contact details",
        `${duration} days duration`
      ];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center">
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const featuredPlans = pricingPlans.filter(p => p.plan_type.startsWith("featured"));
  const popupPlans = pricingPlans.filter(p => p.plan_type.startsWith("popup"));
  const totalAmount = getTotalAmount();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {!showPayment ? (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-4">Choose Your Plan</h1>
              <p className="text-muted-foreground text-lg">Select the plans that work best for your business</p>
            </div>

            {/* Featured Plans */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Featured Listing Plans</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {featuredPlans.map((plan) => {
                  const Icon = getIconForPlan(plan.plan_type);
                  const benefits = getBenefitsForPlan(plan.plan_type, plan.duration);
                  const isPopular = plan.duration === 90;
                  const isSelected = selectedFeaturedPlan?.id === plan.id;
                  
                  return (
                    <Card
                      key={plan.id}
                      className={`relative overflow-hidden hover:shadow-xl transition-all cursor-pointer ${
                        isSelected ? "ring-2 ring-primary border-primary" : ""
                      } ${isPopular ? "border-primary" : ""}`}
                      onClick={() => handleFeaturedPlanSelect(plan)}
                    >
                      {isPopular && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold">
                          Most Popular
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute top-3 left-3">
                          <CheckCircle className="h-6 w-6 text-primary fill-primary" />
                        </div>
                      )}
                      <CardHeader className="text-center pb-4">
                        <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Featured {plan.duration}D</CardTitle>
                        <CardDescription className="text-base">{plan.duration} days</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center mb-6">
                          <div className="text-4xl font-bold text-primary mb-2">₹{plan.price}</div>
                          <p className="text-sm text-muted-foreground">one-time payment</p>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                          {benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{benefit}</span>
                            </div>
                          ))}
                        </div>

                        <Button
                          className="w-full"
                          variant={isSelected ? "default" : "outline"}
                          size="lg"
                        >
                          {isSelected ? "Selected" : "Select Plan"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Popup Plans */}
            {popupPlans.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Popup Promotion Plans</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {popupPlans.map((plan) => {
                    const Icon = getIconForPlan(plan.plan_type);
                    const benefits = getBenefitsForPlan(plan.plan_type, plan.duration);
                    const maxDates = getMaxDatesForPlan(plan.duration);
                    const isSelected = selectedPopupPlan?.id === plan.id;
                    
                    return (
                      <Card
                        key={plan.id}
                        className={`relative overflow-hidden hover:shadow-xl transition-all cursor-pointer border-purple-200 dark:border-purple-800 ${
                          isSelected ? "ring-2 ring-purple-500" : ""
                        }`}
                        onClick={() => handlePopupPlanSelect(plan)}
                      >
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 text-sm font-semibold">
                          Premium
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 left-3">
                            <CheckCircle className="h-6 w-6 text-purple-500 fill-purple-500" />
                          </div>
                        )}
                        <CardHeader className="text-center pb-4">
                          <div className="mx-auto mb-4 p-3 bg-purple-100 dark:bg-purple-900 rounded-full w-fit">
                            <Icon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                          </div>
                          <CardTitle className="text-2xl">Popup {plan.duration}D</CardTitle>
                          <CardDescription className="text-base">
                            {maxDates} popup dates
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center mb-6">
                            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                              ₹{plan.price}
                            </div>
                            <p className="text-sm text-muted-foreground">one-time payment</p>
                          </div>
                          
                          <div className="space-y-3 mb-6">
                            {benefits.map((benefit, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{benefit}</span>
                              </div>
                            ))}
                          </div>

                          <Button
                            className={`w-full ${isSelected ? "bg-purple-600" : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"}`}
                            size="lg"
                          >
                            {isSelected ? "Selected" : "Select Plan"}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Total and Proceed Button */}
            {(selectedFeaturedPlan || selectedPopupPlan) && (
              <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg p-4 z-50">
                <div className="container mx-auto max-w-6xl flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Selected Plans:</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedFeaturedPlan && (
                        <Badge variant="secondary">
                          Featured {selectedFeaturedPlan.duration}D - ₹{selectedFeaturedPlan.price}
                        </Badge>
                      )}
                      {selectedPopupPlan && (
                        <Badge className="bg-purple-500 text-white">
                          Popup {selectedPopupPlan.duration}D - ₹{selectedPopupPlan.price}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold text-primary">₹{totalAmount}</p>
                    </div>
                    <Button size="lg" onClick={handleProceedToPayment}>
                      Proceed to Payment
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setShowPayment(false)}
              className="mb-6"
            >
              ← Back to Plans
            </Button>

            <Card>
              <CardHeader>
                <CardTitle>Complete Payment</CardTitle>
                <CardDescription>
                  <div className="space-y-1">
                    {selectedFeaturedPlan && (
                      <div>Featured {selectedFeaturedPlan.duration}D - ₹{selectedFeaturedPlan.price}</div>
                    )}
                    {selectedPopupPlan && (
                      <div>Popup {selectedPopupPlan.duration}D - ₹{selectedPopupPlan.price}</div>
                    )}
                    <div className="font-semibold text-foreground pt-1 border-t mt-2">
                      Total: ₹{totalAmount}
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Selection for Popup Plans */}
                {selectedPopupPlan && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Select Popup Dates</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Select {getMaxDatesForPlan(selectedPopupPlan.duration)} dates for your popup ads to appear
                    </p>
                    <Calendar
                      mode="multiple"
                      selected={selectedDates}
                      onSelect={handleDateSelect}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border mx-auto"
                      modifiers={{
                        selected: selectedDates
                      }}
                      modifiersStyles={{
                        selected: {
                          backgroundColor: 'rgb(239 68 68)',
                          color: 'white',
                          borderRadius: '50%'
                        }
                      }}
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Selected dates:</span>
                      <Badge variant="secondary">
                        {selectedDates.length} / {getMaxDatesForPlan(selectedPopupPlan.duration)}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* QR Code */}
                <div className="text-center">
                  <div className="inline-block p-8 bg-muted rounded-lg mb-4">
                    <div className="w-48 h-48 bg-gradient-to-br from-primary to-primary/50 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-mono">PAYTM QR CODE</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Scan this QR code with your Paytm app to make payment
                  </p>
                  <p className="text-lg font-semibold mt-2">
                    Amount: ₹{totalAmount}
                  </p>
                </div>

                {/* Upload Screenshot */}
                <div className="space-y-4">
                  <Label>Upload Payment Screenshot *</Label>
                  {screenshotPreview ? (
                    <div className="space-y-4">
                      <img
                        src={screenshotPreview}
                        alt="Payment screenshot"
                        className="max-h-64 mx-auto rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setScreenshot(null);
                          setScreenshotPreview("");
                        }}
                        className="w-full"
                      >
                        Change Screenshot
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <Button type="button" variant="outline" asChild>
                        <label htmlFor="screenshot" className="cursor-pointer">
                          Choose File
                        </label>
                      </Button>
                      <Input
                        id="screenshot"
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="hidden"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Upload screenshot of your payment confirmation
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleSubmitPayment}
                  disabled={!screenshot || uploading || (selectedPopupPlan && selectedDates.length === 0)}
                  className="w-full"
                  size="lg"
                >
                  {uploading ? "Uploading..." : "Submit for Approval"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Your listing will be activated once admin approves your payment
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Payment;
