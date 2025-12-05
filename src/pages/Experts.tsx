import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ExpertContactDialog } from "@/components/ExpertContactDialog";

interface Expert {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
}

const Experts = () => {
  const navigate = useNavigate();
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact_number: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Trigger curtain animation on mount
    const timer = setTimeout(() => setCurtainOpen(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    const { data, error } = await supabase
      .from("experts")
      .select("*")
      .eq("status", "approved")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching experts:", error);
      return;
    }

    setExperts(data || []);
  };

  const handleContactExpert = (expert: Expert) => {
    setSelectedExpert(expert);
    setContactDialogOpen(true);
  };

  const phoneNumber = "917899828127";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("messages").insert([
        {
          name: formData.name,
          contact_number: formData.contact_number,
          email: formData.email,
          message: formData.message,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "Our expert team will contact you soon.",
      });

      setFormData({ name: "", contact_number: "", email: "", message: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceBoxes = [
    {
      image: "https://i.pinimg.com/736x/06/e7/30/06e73067adc157cb549e79145151489c.jpg",
      title: "Property Services",
      description: "Find your dream property",
    },
    {
      image: "https://i.pinimg.com/1200x/d2/77/ff/d277ffad8c3d5211bacb7f0ead2c8b28.jpg",
      title: "Automobile Services",
      description: "Buy or sell vehicles",
    },
    {
      image: "https://i.pinimg.com/736x/81/56/f9/8156f91d2e791a4544366777d8335628.jpg",
      title: "Jewellery Services",
      description: "Explore premium jewellery",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with Curtain Animation */}
      <section className="relative h-screen bg-[#001a4d] overflow-hidden flex items-center justify-center">
        {/* Curtain Left Panel */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full bg-[#000d26] transition-transform duration-1000 ease-in-out z-10 ${
            curtainOpen ? "-translate-x-full" : "translate-x-0"
          }`}
        />

        {/* Curtain Right Panel */}
        <div
          className={`absolute top-0 right-0 w-1/2 h-full bg-[#000d26] transition-transform duration-1000 ease-in-out z-10 ${
            curtainOpen ? "translate-x-full" : "translate-x-0"
          }`}
        />

        {/* Content */}
        <div className="text-center z-20 px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">CONNECT WITH US TODAY</h1>
          <p className="text-xl md:text-2xl text-white/90">Your Trusted Marketplace for Every Deal.</p>
        </div>
      </section>

      {/* Service Boxes Section */}
      <section className="bg-white py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {serviceBoxes.map((box, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="aspect-video bg-muted relative">
                  <img src={box.image} alt={box.title} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold text-foreground mb-2">{box.title}</h3>
                  <p className="text-muted-foreground">{box.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Experts for Your Needs Section */}
          <div className="mt-16">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center md:text-left">
                Experts for Your Needs
              </h2>
              <Button
                onClick={() => navigate("/user/add-expert")}
                className="bg-[#001a4d] hover:bg-[#002d7a]"
              >
                Become an Expert
              </Button>
            </div>
            
            {/* Property Experts */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <span>⭐</span> PROPERTY EXPERTS
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {experts
                  .filter((expert) => expert.category === "Property")
                  .map((expert) => (
                    <Card 
                      key={expert.id} 
                      className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(`/experts/${expert.id}`)}
                    >
                      <div className="flex justify-center pt-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
                          <img src={expert.image_url} alt={expert.name} className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <CardContent className="p-4 space-y-3 text-center">
                        <h4 className="font-bold text-foreground text-sm">{expert.name}</h4>
                        <p className="text-muted-foreground text-xs line-clamp-2">{expert.description}</p>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContactExpert(expert);
                          }}
                          size="sm"
                          className="w-full bg-[#001a4d] hover:bg-[#002d7a]"
                        >
                          Contact Expert
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Automobile Experts */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <span>🚗</span> AUTOMOBILE EXPERTS
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {experts
                  .filter((expert) => expert.category === "Automobile")
                  .map((expert) => (
                    <Card 
                      key={expert.id} 
                      className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(`/experts/${expert.id}`)}
                    >
                      <div className="flex justify-center pt-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
                          <img src={expert.image_url} alt={expert.name} className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <CardContent className="p-4 space-y-3 text-center">
                        <h4 className="font-bold text-foreground text-sm">{expert.name}</h4>
                        <p className="text-muted-foreground text-xs line-clamp-2">{expert.description}</p>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContactExpert(expert);
                          }}
                          size="sm"
                          className="w-full bg-[#001a4d] hover:bg-[#002d7a]"
                        >
                          Contact Expert
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Jewellery Experts */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <span>💍</span> JEWELLERY EXPERTS
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {experts
                  .filter((expert) => expert.category === "Jewellery")
                  .map((expert) => (
                    <Card 
                      key={expert.id} 
                      className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(`/experts/${expert.id}`)}
                    >
                      <div className="flex justify-center pt-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
                          <img src={expert.image_url} alt={expert.name} className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <CardContent className="p-4 space-y-3 text-center">
                        <h4 className="font-bold text-foreground text-sm">{expert.name}</h4>
                        <p className="text-muted-foreground text-xs line-clamp-2">{expert.description}</p>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContactExpert(expert);
                          }}
                          size="sm"
                          className="w-full bg-[#001a4d] hover:bg-[#002d7a]"
                        >
                          Contact Expert
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>

          {/* How Can We Help Section */}
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">How Can We Help?</h2>
            <div className="flex justify-center">
              <a
                href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent("Hi, I'd like to connect with you")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-[#001a4d] text-white hover:bg-[#002d7a] rounded-lg px-8 py-6 text-lg font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  Let's Talk
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Get in Touch Section */}
      <section className="bg-background py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Section Header */}
          <div className="mb-8">
            <div className="inline-block bg-[#001a4d] text-white px-4 py-1 rounded-md text-sm font-semibold mb-4">
              CONTACTS
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Get in Touch for Expert Consulting</h2>
          </div>

          {/* Service Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Call Center Card */}
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#001a4d]/10 rounded-full mb-2">
                  <Phone className="h-8 w-8 text-[#001a4d]" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Call Center</h3>
                <p className="text-muted-foreground">Connect with our support team instantly.</p>
                <div className="flex justify-center">
                  <a 
                    href={`tel:+${phoneNumber}`}
                    className="block md:pointer-events-none"
                  >
                    <Button className="bg-[#001a4d] text-white hover:bg-[#002d7a] rounded-lg px-8 py-6 text-lg font-semibold shadow-md hover:shadow-lg transition-all">
                      <span className="hidden md:inline">+91 7899828127</span>
                      <span className="md:hidden">Call Now</span>
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Chat 24/7 Card */}
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#001a4d]/10 rounded-full mb-2">
                  <MessageCircle className="h-8 w-8 text-[#001a4d]" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Chat 24/7</h3>
                <p className="text-muted-foreground">Send us a message anytime.</p>
                <div className="flex justify-center">
                  <a
                    href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent("Hi, I'd like to connect with you")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-[#001a4d] text-white hover:bg-[#002d7a] rounded-lg px-8 py-6 text-lg font-semibold shadow-md hover:shadow-lg transition-all">
                      <span className="hidden md:inline">WhatsApp</span>
                      <span className="md:hidden">Chat Now</span>
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Submit Your Issue Section */}
      <section className="bg-white py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Submit Your Issue</h2>
            <p className="text-muted-foreground">Our expert team will get back to you shortly</p>
          </div>

          <Card className="shadow-xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_number">Contact Number *</Label>
                  <Input
                    id="contact_number"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your contact number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email ID *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message / Issue Description *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    placeholder="Describe your issue or query"
                    rows={6}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#001a4d] text-white hover:bg-[#002d7a] rounded-lg px-8 py-6 text-lg font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Expert Contact Dialog */}
      {selectedExpert && (
        <ExpertContactDialog
          open={contactDialogOpen}
          onOpenChange={setContactDialogOpen}
          expertId={selectedExpert.id}
          expertName={selectedExpert.name}
        />
      )}

      <Footer />
    </div>
  );
};

export default Experts;
