import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ExpertContactDialog } from "@/components/ExpertContactDialog";

interface Expert {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
  phone: string | null;
}

const ExpertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expert, setExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  useEffect(() => {
    fetchExpert();
  }, [id]);

  const fetchExpert = async () => {
    if (!id) return;
    
    const { data, error } = await supabase
      .from("experts")
      .select("*")
      .eq("id", id)
      .eq("status", "approved")
      .single();

    if (error) {
      console.error("Error fetching expert:", error);
      navigate("/experts");
      return;
    }

    setExpert(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-16 px-4 text-center">
          <p>Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-16 px-4 text-center">
          <p>Expert not found</p>
          <Button onClick={() => navigate("/experts")} className="mt-4">
            Back to Experts
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case "Property":
        return "⭐";
      case "Automobile":
        return "🚗";
      case "Jewellery":
        return "💍";
      default:
        return "👤";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/experts")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Experts
        </Button>

        <Card className="max-w-3xl mx-auto overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Expert Image */}
              <div className="flex-shrink-0">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary/20">
                  <img
                    src={expert.image_url}
                    alt={expert.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Expert Details */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="text-2xl">{getCategoryEmoji(expert.category)}</span>
                  <span className="text-sm font-medium text-muted-foreground uppercase">
                    {expert.category} Expert
                  </span>
                </div>
                
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  {expert.name}
                </h1>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                      About
                    </h3>
                    <p className="text-foreground leading-relaxed">
                      {expert.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                      Category
                    </h3>
                    <p className="text-foreground">{expert.category}</p>
                  </div>
                </div>

                <Button
                  onClick={() => setContactDialogOpen(true)}
                  className="mt-6 bg-[#001a4d] hover:bg-[#002d7a]"
                  size="lg"
                >
                  Contact Expert
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />

      <ExpertContactDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        expertId={expert.id}
        expertName={expert.name}
      />
    </div>
  );
};

export default ExpertDetail;
