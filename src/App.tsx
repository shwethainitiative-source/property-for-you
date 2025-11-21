import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PostAd from "./pages/PostAd";
import ListingDetail from "./pages/ListingDetail";
import Auth from "./pages/Auth";
import Properties from "./pages/Properties";
import Automobiles from "./pages/Automobiles";
import Jewellery from "./pages/Jewellery";
import AllListings from "./pages/AllListings";
import Experts from "./pages/Experts";
import News from "./pages/News";
import Favorites from "./pages/Favorites";
import MyListings from "./pages/MyListings";
import Payment from "./pages/Payment";
import SponsorshipApply from "./pages/SponsorshipApply";
import AdminSponsorships from "./pages/AdminSponsorships";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
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
          <Route path="/all-listings" element={<AllListings />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/automobiles" element={<Automobiles />} />
          <Route path="/jewellery" element={<Jewellery />} />
          <Route path="/experts" element={<Experts />} />
          <Route path="/news" element={<News />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/sponsorship-apply" element={<SponsorshipApply />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/sponsorships" element={<AdminSponsorships />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
