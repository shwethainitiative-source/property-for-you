import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FilterDrawer } from "@/components/FilterDrawer";
import { Button } from "@/components/ui/button";
import { ListingSort } from "@/components/ListingSort";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Filter } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
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
  listing_images: { image_url: string }[];
}

const ITEMS_PER_PAGE = 12;

const Jewellery = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    material: "",
    purity: "",
  });

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [listings, filters, sortBy]);

  const fetchListings = async () => {
    try {
      const { data: categories } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", "jewellery")
        .single();

      if (!categories) return;

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
          listing_images(image_url)
        `)
        .eq("category_id", categories.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error("Error fetching jewellery:", error);
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

    if (filters.location) {
      filtered = filtered.filter(
        (listing) =>
          listing.location_city
            .toLowerCase()
            .includes(filters.location.toLowerCase()) ||
          listing.location_locality
            ?.toLowerCase()
            .includes(filters.location.toLowerCase())
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

    if (filters.material && filters.material !== "all") {
      filtered = filtered.filter(
        (listing) =>
          listing.attributes?.material?.toLowerCase() ===
          filters.material.toLowerCase()
      );
    }

    if (filters.purity && filters.purity !== "all") {
      filtered = filtered.filter(
        (listing) =>
          listing.attributes?.purity?.toLowerCase() ===
          filters.purity.toLowerCase()
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
      location: "",
      minPrice: "",
      maxPrice: "",
      material: "",
      purity: "",
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Jewellery</h1>
            <p className="text-muted-foreground">
              Browse {filteredListings.length} jewellery listings
            </p>
          </div>
          <Button onClick={() => setFilterOpen(true)} variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <FilterDrawer
          category="jewellery"
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
            <p className="text-muted-foreground">Loading jewellery...</p>
          </div>
        ) : currentListings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No jewellery found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentListings.map((listing) => (
                <Card
                  key={listing.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/listing/${listing.id}`)}
                >
                  <div className="aspect-video bg-muted relative">
                    {listing.listing_images?.[0] ? (
                      <img
                        src={listing.listing_images[0].image_url}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}
                    {listing.is_featured && (
                      <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                        Featured
                      </Badge>
                    )}
                    <Badge className="absolute top-2 right-2 bg-primary">
                      Jewellery
                    </Badge>
                    <FavoriteButton listingId={listing.id} />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                      {listing.title}
                    </h3>
                    <p className="text-xl font-bold text-primary mb-2">
                      ₹{listing.price.toLocaleString()}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="line-clamp-1">
                        {listing.location_locality
                          ? `${listing.location_locality}, ${listing.location_city}`
                          : listing.location_city}
                      </span>
                    </div>
                  </div>
                </Card>
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

export default Jewellery;
