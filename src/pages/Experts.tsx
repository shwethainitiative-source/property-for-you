import { useState, useEffect } from "react";
import { Phone, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Experts = () => {
  const [curtainOpen, setCurtainOpen] = useState(false);

  useEffect(() => {
    // Trigger curtain animation on mount
    const timer = setTimeout(() => setCurtainOpen(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/917899828127", "_blank");
  };

  const handleCallClick = () => {
    window.location.href = "tel:+917899828127";
  };

  const handleChatClick = () => {
    // Navigate to inbox/message form - update this path as needed
    window.location.href = "/contact";
  };

  const serviceBoxes = [
    {
      image: "https://i.pinimg.com/736x/15/ee/45/15ee451d23da0b12e8d6d77cd6b0eed4.jpg",
      title: "Property Services",
      description: "Find your dream property"
    },
    {
      image: "https://i.pinimg.com/736x/bb/b0/24/bbb024d53eeb8e6a1fda51de4e51a94f.jpg",
      title: "Automobile Services",
      description: "Buy or sell vehicles"
    },
    {
      image: "https://i.pinimg.com/736x/f8/ee/6b/f8ee6bd6aa6a40b05c41a87efc4e30fd.jpg",
      title: "Jewellery Services",
      description: "Explore premium jewellery"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section with Curtain Animation */}
      <section className="relative h-[60vh] bg-[#001a4d] overflow-hidden flex items-center justify-center">
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
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            CONNECT WITH US TODAY
          </h1>
          <p className="text-xl md:text-2xl text-white/90">
            Your Trusted Marketplace for Every Deal.
          </p>
        </div>
      </section>

      {/* Service Boxes Section */}
      <section className="bg-white py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {serviceBoxes.map((box, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="aspect-video bg-muted relative">
                  <img
                    src={box.image}
                    alt={box.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {box.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {box.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* How Can We Help Section */}
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              How Can We Help?
            </h2>
            <Button
              onClick={handleWhatsAppClick}
              size="lg"
              className="bg-[#001a4d] text-white hover:bg-[#002d7a] rounded-full px-8 py-6 text-lg font-semibold transition-all"
            >
              Let's Talk
            </Button>
          </div>
        </div>
      </section>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        {/* Call Button */}
        <Button
          onClick={handleCallClick}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-lg hover:shadow-xl transition-all w-14 h-14 md:w-auto md:h-auto md:px-6 md:py-3"
          title="Call Center"
        >
          <Phone className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Call Center</span>
        </Button>

        {/* Chat Button */}
        <Button
          onClick={handleChatClick}
          size="lg"
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full shadow-lg hover:shadow-xl transition-all w-14 h-14 md:w-auto md:h-auto md:px-6 md:py-3"
          title="Chat 24/7"
        >
          <MessageCircle className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Chat 24/7</span>
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default Experts;