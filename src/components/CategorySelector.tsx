import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  slug: string;
  placeholder: string;
}

const categories: Category[] = [
  { id: "1", name: "Properties", slug: "properties", placeholder: "Search properties by location or type..." },
  { id: "2", name: "Automobiles", slug: "automobiles", placeholder: "Search cars by brand or model..." },
  { id: "3", name: "Jewellery", slug: "jewellery", placeholder: "Search jewellery by type or material..." },
];

export const CategorySelector = () => {
  const [selectedCategory, setSelectedCategory] = useState("properties");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setSearchQuery("");
    navigate(`/${slug}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/${selectedCategory}?search=${encodeURIComponent(searchQuery)}`);
  };

  const currentCategory = categories.find(cat => cat.slug === selectedCategory);

  return (
    <div className="w-full bg-card rounded-2xl shadow-lg p-6 space-y-4 border border-border">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => handleCategoryChange(category.slug)}
            variant={selectedCategory === category.slug ? "default" : "outline"}
            className={`rounded-full px-6 py-2 transition-all ${
              selectedCategory === category.slug
                ? "bg-[#007BFF] text-white hover:bg-[#0056b3]"
                : "bg-background text-[#007BFF] border-[#007BFF] hover:bg-[#007BFF]/10"
            }`}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <Input
          type="text"
          placeholder={currentCategory?.placeholder || "Search..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-4 py-6 rounded-full text-base"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#007BFF] hover:bg-[#0056b3]"
        >
          Search
        </Button>
      </form>
    </div>
  );
};
