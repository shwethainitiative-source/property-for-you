import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PostAd from "./pages/PostAd";
import ListingDetail from "./pages/ListingDetail";
import EditListing from "./pages/EditListing";
import Auth from "./pages/Auth";
import Properties from "./pages/Properties";
import Automobiles from "./pages/Automobiles";
import Jewellery from "./pages/Jewellery";
import Experts from "./pages/Experts";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Favorites from "./pages/Favorites";
import MyListings from "./pages/MyListings";
import Payment from "./pages/Payment";
import SponsorshipApply from "./pages/SponsorshipApply";
import AdminSponsorships from "./pages/AdminSponsorships";
import AdminExperts from "./pages/AdminExperts";
import UserAddExpert from "./pages/UserAddExpert";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboardNew";
import AdminUsers from "./pages/AdminUsers";
import AdminListings from "./pages/AdminListings";
import AdminFeatured from "./pages/AdminFeatured";
import AdminPopupAds from "./pages/AdminPopupAds";
import AdminPopupAdDetail from "./pages/AdminPopupAdDetail";
import AdminPricingManagement from "./pages/AdminPricingManagement";
import AdminListingDetail from "./pages/AdminListingDetail";
import AdminNews from "./pages/AdminNews";
import AdminMessages from "./pages/AdminMessages";
import AdminSettings from "./pages/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/post-ad" element={<PostAd />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/automobiles" element={<Automobiles />} />
          <Route path="/jewellery" element={<Jewellery />} />
          <Route path="/experts" element={<Experts />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/sponsorship-apply" element={<SponsorshipApply />} />
          <Route path="/user/add-expert" element={<UserAddExpert />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/listings" element={<AdminListings />} />
          <Route path="/admin/featured" element={<AdminFeatured />} />
          <Route path="/admin/popup-ads" element={<AdminPopupAds />} />
          <Route path="/admin/popup-ads/:id" element={<AdminPopupAdDetail />} />
          <Route path="/admin/pricing-management" element={<AdminPricingManagement />} />
          <Route path="/admin/listing/:id" element={<AdminListingDetail />} />
          <Route path="/admin/news" element={<AdminNews />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/sponsorships" element={<AdminSponsorships />} />
          <Route path="/admin/experts" element={<AdminExperts />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/edit-listing/:id" element={<EditListing />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;