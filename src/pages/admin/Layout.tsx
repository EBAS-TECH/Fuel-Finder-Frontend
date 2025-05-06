import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LayoutDashboard, User, Users, UserRound, Search } from "lucide-react";
import axios from "axios";
import logoImage from '@/assets/logo.png';
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
}

const SidebarItem = ({ icon, label, to, active }: SidebarItemProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
        active
          ? "bg-emerald-100 text-emerald-600"
          : "text-gray-500 hover:bg-emerald-50"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const pathName = location.pathname;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // First try to get user data from localStorage/sessionStorage
        const storedUser =
          localStorage.getItem("userData") ||
          sessionStorage.getItem("userData");

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Fetch updated user data from API
          try {
            const response = await axios.get(
              `http://localhost:5001/api/user/${parsedUser.id}`
            );
            setUser(response.data);

            // Update the stored user data with fresh data
            if (localStorage.getItem("userData")) {
              localStorage.setItem("userData", JSON.stringify(response.data));
            } else {
              sessionStorage.setItem("userData", JSON.stringify(response.data));
            }
          } catch (apiError) {
            console.error("Failed to fetch updated user data:", apiError);
            // Continue with the stored data if API fails
          }
        } else {
          throw new Error("No user data found");
        }
      } catch (error) {
        console.error("User initialization error:", error);
        toast({
          title: "Session Error",
          description: "Please login again",
          variant: "destructive",
        });
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [toast, navigate]);

  const handleLogout = () => {
    // Clear all auth-related storage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("userData");

    // Show logout message
    toast({
      title: "Logged out successfully",
      description: "You have been logged out",
    });

    // Redirect to home page
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/admin/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-10 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-10 flex items-center justify-center">
        No user data available
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="min-h-screen bg-white shadow-sm">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-[220px] border-r min-h-screen p-4">
            <div className="flex justify-center mb-2 mt-1">
            <Link to="/admin/dashboard">
              <img
                src={logoImage}
                alt="Fuel Finder Logo"
                className="w-20 h-auto"
              />
            </Link>
              
            </div>

            <div className="space-y-1 mt-6">
              <SidebarItem
                icon={<LayoutDashboard className="h-5 w-5" />}
                label="Dashboard"
                to="/admin/dashboard"
                active={pathName.includes("/admin/dashboard")}
              />
              <SidebarItem
                icon={<User className="h-5 w-5" />}
                label="Drivers"
                to="/admin/drivers"
                active={pathName.includes("/admin/drivers")}
              />
              <SidebarItem
                icon={<Users className="h-5 w-5" />}
                label="Stations"
                to="/admin/stations"
                active={pathName.includes("/admin/stations")}
              />
              <SidebarItem
                icon={<Users className="h-5 w-5" />}
                label="Delegate"
                to="/admin/delegates"
                active={pathName.includes("/admin/delegates")}
              />
              <SidebarItem
                icon={<UserRound className="h-5 w-5" />}
                label="Profile"
                to="/admin/profile"
                active={pathName.includes("/admin/profile")}
              />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b">
              <div className="w-96 relative ml-24">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search..."
                  className="pl-10 bg-emerald-50 border border-emerald-100 rounded-xl h-10 focus:border-400 w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <h4 className="text-emerald-500 font-medium">
                    {user.first_name} {user.last_name}
                  </h4>
                  <p className="text-xs text-gray-400">{user.role}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={handleProfileClick}
                      className="h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <img
                        src={user.avatar || user.profile_picture}
                        alt="User Avatar"
                        className="h-10 w-10 rounded-full"
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin/profile"
                        className="w-full cursor-pointer"
                      >
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            {/* Page content */}
            <div className="p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
