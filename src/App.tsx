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
import GasStationWaiting from "./pages/gasstation/GasStationWaiting";
import Profile from "./pages/gasstation/Profile";
import FuelAvailability from "./pages/gasstation/FuelAvailability";
import Feedbacks from "./pages/gasstation/Feedbacks";
import DelegatesPage from "./pages/admin/DeligatesPage";
import DriverDetailPage from "./pages/admin/DriverDetailPage";
import DashboardPage from "./pages/admin/DashboardPage";
import AdminLayout from "./pages/admin/Layout";
import DriversPage from "./pages/admin/DriversPage";
import StationsPage from "./pages/admin/StationsPage";
import StationDetailPage from "./pages/admin/StationDetailPage";
import ProfilePage from "./pages/admin/ProfilePage";
import FuelPricePage from "./pages/admin/FuelPricePage";
import DelegateStationDetailPage from "./pages/ministrydeligate/StationDetailPage";
import DeligatedashboardLayout from "./pages/ministrydeligate/DeligatedashboardLayout";
import DelegateStationsPage from "./pages/ministrydeligate/StationsPage";
import DelegateProfilePage from "./pages/ministrydeligate/ProfilePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-code" element={<VerifyCode />} />

          {/* Gas Station Routes */}
          <Route path="/gas-station">
            <Route path="waiting" element={<GasStationWaiting />} />
            <Route element={<GasStationDashboardLayout />}>
              <Route path="dashboard" element={<GasStationHome />} />
              <Route path="profile" element={<Profile />} />
              <Route path="fuel-availability" element={<FuelAvailability />} />
              <Route path="feedbacks" element={<Feedbacks />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="delegates" element={<DelegatesPage />} />
            <Route path="drivers" element={<DriversPage />} />
            <Route path="drivers/:id" element={<DriverDetailPage />} />
            <Route path="stations" element={<StationsPage />} />
            <Route path="stations/:id" element={<StationDetailPage />} />
            <Route path="fuel-price" element={<FuelPricePage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route
            path="/ministry-delegate"
            element={<DeligatedashboardLayout />}
          >
            <Route index element={<DelegateStationsPage />} />
            <Route path="profile" element={<DelegateProfilePage />} />
            <Route path="stations" element={<DelegateStationsPage />} />
            <Route
              path="stations/:id"
              element={<DelegateStationDetailPage />}
            />
          </Route>
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
