import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Metrics from "@/components/Metrics";
import ActiveSponsorships from "@/components/ActiveSponsorships";
import SponsoredSection from "@/components/SponsoredSection";
import FeaturedListings from "@/components/FeaturedListings";
import WhyChooseUs from "@/components/WhyChooseUs";
import RegularListings from "@/components/RegularListings";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Metrics />
        <ActiveSponsorships />
        <SponsoredSection />
        <FeaturedListings />
        
        {/* All Listings Section with Category Tabs */}
        <section className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-primary mb-2">All Listings</h2>
            <p className="text-muted-foreground">Browse through all available listings</p>
          </div>
          
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/all-listings")}
              className="px-6 py-2 rounded-full font-medium transition-all bg-primary text-primary-foreground hover:bg-primary/90"
            >
              All
            </button>
            <button
              onClick={() => navigate("/properties")}
              className="px-6 py-2 rounded-full font-medium transition-all bg-background text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground"
            >
              Properties
            </button>
            <button
              onClick={() => navigate("/automobiles")}
              className="px-6 py-2 rounded-full font-medium transition-all bg-background text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground"
            >
              Automobiles
            </button>
            <button
              onClick={() => navigate("/jewellery")}
              className="px-6 py-2 rounded-full font-medium transition-all bg-background text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground"
            >
              Jewellery
            </button>
          </div>
          
          <RegularListings />
        </section>
        
        <WhyChooseUs />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
