import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";

const Payment = () => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      toast.success("Payment successful! Your ad is now featured.");
      sessionStorage.removeItem("pendingListing");
      navigate("/");
      setProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Payment</h1>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-semibold">Featured Ad Listing</h2>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">Featured Listing (30 days)</span>
              <span className="font-semibold">₹999</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">Processing Fee</span>
              <span className="font-semibold">₹99</span>
            </div>
            <div className="flex justify-between py-3 text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-primary">₹1,098</span>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Benefits of Featured Ads:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Appear at the top of search results</li>
              <li>✓ 10x more visibility</li>
              <li>✓ Featured badge on your listing</li>
              <li>✓ Priority placement for 30 days</li>
            </ul>
          </div>

          <Button
            onClick={handlePayment}
            disabled={processing}
            className="w-full"
            size="lg"
          >
            {processing ? "Processing Payment..." : "Proceed to Payment"}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Secure payment gateway • Your information is protected
          </p>
        </Card>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/post-ad")}
          >
            Back to Ad Details
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;
