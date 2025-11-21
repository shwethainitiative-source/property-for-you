import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface FilterDrawerProps {
  category: "properties" | "automobiles" | "jewellery" | "all";
  filters: any;
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
  onSearch: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FilterDrawer = ({
  category,
  filters,
  onFilterChange,
  onReset,
  onSearch,
  open,
  onOpenChange,
}: FilterDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Listings</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Search */}
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search listings..."
              value={filters.search || ""}
              onChange={(e) => onFilterChange("search", e.target.value)}
            />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="City or locality"
              value={filters.location || ""}
              onChange={(e) => onFilterChange("location", e.target.value)}
            />
          </div>

          {/* Price Range */}
          <div>
            <Label htmlFor="minPrice">Min Price</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="Min"
              value={filters.minPrice || ""}
              onChange={(e) => onFilterChange("minPrice", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="maxPrice">Max Price</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ""}
              onChange={(e) => onFilterChange("maxPrice", e.target.value)}
            />
          </div>

          {/* Category-specific filters */}
          {category === "properties" && (
            <>
              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <Select
                  value={filters.propertyType || ""}
                  onValueChange={(value) => onFilterChange("propertyType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Select
                  value={filters.bedrooms || ""}
                  onValueChange={(value) => onFilterChange("bedrooms", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="1">1 BHK</SelectItem>
                    <SelectItem value="2">2 BHK</SelectItem>
                    <SelectItem value="3">3 BHK</SelectItem>
                    <SelectItem value="4">4+ BHK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {category === "automobiles" && (
            <>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  placeholder="e.g., Honda, Toyota"
                  value={filters.brand || ""}
                  onChange={(e) => onFilterChange("brand", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="fuelType">Fuel Type</Label>
                <Select
                  value={filters.fuelType || ""}
                  onValueChange={(value) => onFilterChange("fuelType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="cng">CNG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="e.g., 2020"
                  value={filters.year || ""}
                  onChange={(e) => onFilterChange("year", e.target.value)}
                />
              </div>
            </>
          )}

          {category === "jewellery" && (
            <>
              <div>
                <Label htmlFor="material">Material</Label>
                <Select
                  value={filters.material || ""}
                  onValueChange={(value) => onFilterChange("material", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="diamond">Diamond</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="purity">Purity</Label>
                <Select
                  value={filters.purity || ""}
                  onValueChange={(value) => onFilterChange("purity", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="24k">24K</SelectItem>
                    <SelectItem value="22k">22K</SelectItem>
                    <SelectItem value="18k">18K</SelectItem>
                    <SelectItem value="14k">14K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            <Button 
              onClick={() => {
                onSearch();
                onOpenChange(false);
              }} 
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Search className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            <Button 
              variant="ghost" 
              onClick={onReset}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
