import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("properties");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "properties", label: "Properties", placeholder: "Search properties by location or type..." },
    { id: "automobiles", label: "Automobiles", placeholder: "Search cars by brand or model..." },
    { id: "jewellery", label: "Jewellery", placeholder: "Search jewellery by type or material..." },
  ];

  const handleCategoryChange = (categoryId: string) => {
    setActiveTab(categoryId);
    setSearchQuery("");
    navigate(`/${categoryId}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/${activeTab}?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const currentCategory = categories.find(cat => cat.id === activeTab);

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

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`rounded-full px-6 py-2 transition-all ${
                  activeTab === category.id
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-background text-primary border-2 border-primary hover:bg-primary/10"
                }`}
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={currentCategory?.placeholder || "Search..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-background border-2 border-border rounded-full"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8"
            >
              Search
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Hero;
