import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyCode from "./pages/VerifyCode";
import NotFound from "./pages/NotFound";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import GasStationDashboardLayout from "./pages/gasstation/GasStationDashboardLayout";
import GasStationHome from "./pages/gasstation/GasStationHome";
import Profile from "./pages/gasstation/Profile";
import FuelAvailability from "./pages/gasstation/FuelAvailability";
import Feedbacks from "./pages/gasstation/Feedbacks";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          
          {/* Gas Station Routes */}
          <Route path="/gasstation" element={<GasStationDashboardLayout />}>
            <Route index element={<GasStationHome />} />
            <Route path="profile" element={<Profile />} />
            <Route path="fuel-availability" element={<FuelAvailability />} />
            <Route path="feedbacks" element={<Feedbacks />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;