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
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-primary">
              The Property For You — Buy. Sell. Connect.
            </h1>
            <p className="text-lg md:text-xl text-primary/80 max-w-2xl mx-auto">
              Find verified listings for land, homes, cars, and jewellery — all in one trusted place.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search properties, vehicles, jewellery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 pr-32 h-14 bg-background border-2 border-border rounded-full text-base shadow-lg"
              />
              <Button
                type="submit"
                size="lg"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8"
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
