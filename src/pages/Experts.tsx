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
    if (window.innerWidth < 768) {
      window.location.href = "tel:+917899828127";
    } else {
      // On desktop, just display - number is already shown in the button
      return;
    }
  };

  const serviceBoxes = [
    {
      image: "https://i.pinimg.com/1200x/fd/5e/8a/fd5e8a33cb42d9b7377e85e2f92f0fb6.jpg",
      title: "Property Services",
      description: "Find your dream property",
    },
    {
      image: "https://i.pinimg.com/1200x/d2/77/ff/d277ffad8c3d5211bacb7f0ead2c8b28.jpg",
      title: "Automobile Services",
      description: "Buy or sell vehicles",
    },
    {
      image: "https://i.pinimg.com/736x/f8/ee/6b/f8ee6bd6aa6a40b05c41a87efc4e30fd.jpg",
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

          {/* How Can We Help Section */}
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">How Can We Help?</h2>
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
                <Button
                  onClick={handleCallClick}
                  className="bg-[#001a4d] text-white hover:bg-[#002d7a] rounded-full px-8 py-6 text-lg font-semibold"
                >
                  {typeof window !== 'undefined' && window.innerWidth < 768 ? "Call Now" : "+91 7899828127"}
                </Button>
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
                <Button
                  onClick={handleWhatsAppClick}
                  className="bg-[#001a4d] text-white hover:bg-[#002d7a] rounded-full px-8 py-6 text-lg font-semibold"
                >
                  {typeof window !== 'undefined' && window.innerWidth < 768 ? "Chat Now" : "WhatsApp"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Experts;
