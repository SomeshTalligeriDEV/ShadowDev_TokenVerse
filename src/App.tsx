import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext";
import { AuthProvider } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import UserDashboard from "./pages/UserDashboard";
import BrandDashboard from "./pages/BrandDashboard";
import CampaignDetail from "./pages/CampaignDetail";
import MySubmissions from "./pages/MySubmissions";
import Redeem from "./pages/Redeem";
import Leaderboard from "./pages/Leaderboard";
import Shop from "./pages/Shop";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WalletProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/brand-dashboard" element={<BrandDashboard />} />
              <Route path="/campaign/:id" element={<CampaignDetail />} />
              <Route path="/my-submissions" element={<MySubmissions />} />
              <Route path="/redeem" element={<Redeem />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </WalletProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;