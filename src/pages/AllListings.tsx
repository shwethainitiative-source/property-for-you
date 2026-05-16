import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FilterDrawer } from "@/components/FilterDrawer";
import { ListingSort } from "@/components/ListingSort";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { statesAndDistricts } from "@/data/india-locations";
import { ListingCard } from "@/components/ListingCard";
import { Filter, X } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Listing {
  id: string;
  title: string;
  price: number;
  location_city: string;
  location_locality: string | null;
  is_featured: boolean;
  attributes: any;
  created_at: string;
  category_id: string;
  listing_images: { image_url: string }[];
  categories: { name: string };
}

const ITEMS_PER_PAGE = 12;

const AllListings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    state: "",
    district: "",
    taluk: "",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [listings, filters, sortBy]);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from("listings")
        .select(`
          id,
          title,
          price,
          location_city,
          location_locality,
          is_featured,
          attributes,
          created_at,
          category_id,
          listing_images(image_url),
          categories(name)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...listings];

    if (filters.search) {
      filtered = filtered.filter((listing) =>
        listing.title.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.state && filters.state !== "all") {
      const stateDistricts = statesAndDistricts.find(s => s.state === filters.state)?.districts || [];
      filtered = filtered.filter(listing => 
        stateDistricts.some(d => d.name === listing.location_city)
      );
    }

    if (filters.district && filters.district !== "all") {
      filtered = filtered.filter(
        (listing) => listing.location_city.toLowerCase() === filters.district.toLowerCase()
      );
    }

    if (filters.taluk && filters.taluk !== "all") {
      filtered = filtered.filter(
        (listing) => 
          listing.location_locality?.toLowerCase() === filters.taluk.toLowerCase()
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter(
        (listing) => listing.price >= parseFloat(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(
        (listing) => listing.price <= parseFloat(filters.maxPrice)
      );
    }

    filtered.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;

      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredListings(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: "",
      state: "",
      district: "",
      taluk: "",
      minPrice: "",
      maxPrice: "",
    });
  };

  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentListings = filteredListings.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">All Listings</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Browse {filteredListings.length} listings
            </p>
          </div>
          
          <div className="flex gap-2 sm:gap-4">
            <Button onClick={() => setFilterOpen(true)} variant="outline" className="shrink-0">
              <Filter className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search all categories..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full"
              />
              {Object.values(filters).some(v => v && v !== "all") && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleReset}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <FilterDrawer
          category="all"
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          onSearch={applyFiltersAndSort}
          open={filterOpen}
          onOpenChange={setFilterOpen}
        />

        <ListingSort value={sortBy} onChange={setSortBy} />

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading listings...</p>
          </div>
        ) : currentListings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No listings found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {currentListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={
                        currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AllListings;
