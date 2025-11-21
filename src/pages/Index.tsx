import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Metrics from "@/components/Metrics";
import ActiveSponsorships from "@/components/ActiveSponsorships";
import SponsoredSection from "@/components/SponsoredSection";
import FeaturedListings from "@/components/FeaturedListings";
import WhyChooseUs from "@/components/WhyChooseUs";
import RegularListings from "@/components/RegularListings";
import Footer from "@/components/Footer";
import { CategorySelector } from "@/components/CategorySelector";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <div className="container mx-auto px-4 py-8">
          <CategorySelector />
        </div>
        <Metrics />
        <ActiveSponsorships />
        <SponsoredSection />
        <FeaturedListings />
        <WhyChooseUs />
        <RegularListings />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
