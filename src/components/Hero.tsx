import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Hero = () => {
  const [activeTab, setActiveTab] = useState("properties");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "properties", label: "Properties" },
    { id: "automobiles", label: "Automobiles" },
    { id: "jewellery", label: "Jewellery" },
  ];

  const handleSearch = () => {
    // Search functionality will be implemented with listings
    console.log("Searching for:", searchQuery);
  };

  return (
    <section className="relative bg-gradient-to-br from-primary to-primary/80 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-primary-foreground">
              The Property For You — Buy. Sell. Connect.
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Find verified listings for land, homes, cars, and jewellery — all in one trusted place.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeTab === category.id ? "secondary" : "outline"}
                onClick={() => setActiveTab(category.id)}
                className={`rounded-full ${
                  activeTab === category.id
                    ? "bg-background text-primary hover:bg-background/90"
                    : "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                }`}
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search properties, lands, homes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-background border-0 rounded-full"
              />
            </div>
            <Button
              onClick={handleSearch}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8"
            >
              Search
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
