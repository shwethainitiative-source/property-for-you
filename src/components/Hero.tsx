import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("properties");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    
    if (!query) return;

    // Route based on keywords
    if (query.includes('propert') || query.includes('home') || query.includes('land') || query.includes('villa') || query.includes('house')) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery)}`);
    } else if (query.includes('auto') || query.includes('car') || query.includes('bike') || query.includes('vehicle')) {
      navigate(`/automobiles?search=${encodeURIComponent(searchQuery)}`);
    } else if (query.includes('jewel') || query.includes('gold') || query.includes('diamond') || query.includes('ring') || query.includes('necklace')) {
      navigate(`/jewellery?search=${encodeURIComponent(searchQuery)}`);
    } else {
      // Default to properties if no match
      navigate(`/properties?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative bg-background py-16 md:py-24 overflow-hidden">
      {/* Background Image with Overlay - Fixed */}
      <div className="absolute inset-0">
        <img
          src="https://i.pinimg.com/736x/68/0b/aa/680baa96545e9d1e21c9ae225b4b84bf.jpg"
          alt="Background"
          className="w-full h-full object-cover bg-fixed"
          style={{ backgroundAttachment: 'fixed' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background/95" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Buy. Sell. Connect.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Find verified listings for land, homes, cars, and jewellery — all in one trusted place.
            </p>
          </div>

          {/* Search Bar - Compact & Rectangular */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto pt-2">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search properties, cars, jewellery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-28 h-12 bg-background/95 border-2 border-border rounded-lg text-sm shadow-lg backdrop-blur"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-6 h-9"
              >
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Hero;
