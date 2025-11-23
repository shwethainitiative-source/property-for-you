import Header from "@/components/Header";
import SponsoredAdsCarousel from "@/components/SponsoredAdsCarousel";
import Metrics from "@/components/Metrics";
import FeaturedListings from "@/components/FeaturedListings";
import WhyChooseUs from "@/components/WhyChooseUs";
import Footer from "@/components/Footer";

const Index = () => {
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <SponsoredAdsCarousel />
        <Metrics />
        <FeaturedListings />
        <WhyChooseUs />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
