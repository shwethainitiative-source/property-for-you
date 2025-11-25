import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Metrics from "@/components/Metrics";
import SponsoredAdsCarousel from "@/components/SponsoredAdsCarousel";
import FeaturedListings from "@/components/FeaturedListings";
import WhyChooseUs from "@/components/WhyChooseUs";
import Footer from "@/components/Footer";
import FeaturedPopupAds from "@/components/FeaturedPopupAds";

const Index = () => {
  
  return (
    <div className="min-h-screen bg-background">
      <FeaturedPopupAds />
      <Header />
      <main>
        <Hero />
        <Metrics />
        <SponsoredAdsCarousel />
        <FeaturedListings />
        <WhyChooseUs />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
