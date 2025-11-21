import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Zap, Star, Crown, Upload, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRICING_PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: 199,
    duration: 30,
    icon: Star,
    benefits: ["Standard visibility", "30 days duration", "Basic support"]
  },
  {
    id: "standard",
    name: "Standard",
    price: 349,
    duration: 60,
    icon: Zap,
    benefits: ["Higher visibility", "60 days duration", "Priority listing", "Featured badge"]
  },
  {
    id: "premium",
    name: "Premium",
    price: 500,
    duration: 90,
    icon: Crown,
    popular: true,
    benefits: ["Highest visibility", "90 days duration", "Top placement", "6× faster reach", "Premium support"]
  }
];

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowPayment(true);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitPayment = async () => {
    if (!screenshot) {
      toast.error("Please upload payment screenshot");
      return;
    }

    setUploading(true);
    
    // Simulate upload and submission
    setTimeout(() => {
      toast.success("Payment screenshot uploaded! Your listing will be featured once admin approves.");
      sessionStorage.removeItem("pendingListing");
      navigate("/my-listings");
      setUploading(false);
    }, 2000);
  };

  const selectedPlanDetails = PRICING_PLANS.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {!showPayment ? (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-4">Choose Your Featured Listing Plan</h1>
              <p className="text-muted-foreground text-lg">Select the plan that works best for your business</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {PRICING_PLANS.map((plan) => {
                const Icon = plan.icon;
                return (
                  <Card
                    key={plan.id}
                    className={`relative overflow-hidden hover:shadow-xl transition-all ${
                      plan.popular ? "border-primary ring-2 ring-primary" : ""
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold">
                        Most Popular
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription className="text-base">{plan.duration} days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-6">
                        <div className="text-4xl font-bold text-primary mb-2">₹{plan.price}</div>
                        <p className="text-sm text-muted-foreground">one-time payment</p>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        {plan.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={() => handlePlanSelect(plan.id)}
                        className="w-full"
                        variant={plan.popular ? "default" : "outline"}
                        size="lg"
                      >
                        Select Plan
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
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
                  {selectedPlanDetails?.name} Plan - ₹{selectedPlanDetails?.price} for {selectedPlanDetails?.duration} days
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dummy QR Code */}
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
                    Amount: ₹{selectedPlanDetails?.price}
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
                  disabled={!screenshot || uploading}
                  className="w-full"
                  size="lg"
                >
                  {uploading ? "Uploading..." : "Submit for Approval"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Your listing will be featured once admin approves your payment
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
