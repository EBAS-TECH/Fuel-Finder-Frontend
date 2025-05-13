import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Fuel,
  CalendarClock,
  MessageSquare,
  UserRound,
  Search,
  LogOut,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import axios from "axios";
import logoImage from "@/assets/logo.png";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: string;
  profile_pic: string;
  verified: boolean;
  created_at: string;
  updated_at: string | null;
}

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
          ? "bg-green-500 text-white"
          : "text-gray-600 hover:bg-green-100 hover:text-green-700"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default function GasStationDashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const pathName = location.pathname;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check both storage locations
        const storedUser =
          localStorage.getItem("userData") ||
          sessionStorage.getItem("userData");

        if (!storedUser) {
          throw new Error("No user data found");
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        try {
          // Optional: Fetch fresh user data from API
          const response = await axios.get(
            `http://localhost:5001/api/user/${parsedUser.id}`,
            {
              headers: {
                Authorization: `Bearer ${
                  localStorage.getItem("authToken") ||
                  sessionStorage.getItem("authToken")
                }`,
              },
            }
          );

          const updatedUser = response.data.data;
          setUser(updatedUser);

          // Update the appropriate storage
          if (localStorage.getItem("userData")) {
            localStorage.setItem("userData", JSON.stringify(updatedUser));
          } else {
            sessionStorage.setItem("userData", JSON.stringify(updatedUser));
          }
        } catch (apiError) {
          console.error("Failed to fetch updated user data:", apiError);
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

    // Handle profile updates from ProfilePage
    const handleUserUpdate = () => {
      const storedUser =
        localStorage.getItem("userData") || sessionStorage.getItem("userData");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    // Listen for both custom events and storage changes
    window.addEventListener("userUpdated", handleUserUpdate);
    window.addEventListener("storage", handleUserUpdate);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
      window.removeEventListener("storage", handleUserUpdate);
    };
  }, [toast, navigate]);

  const handleLogout = () => {
    // Clear both storage types
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("userRole");

    toast({
      title: "Logged out successfully",
      description: "You have been logged out",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        No user data available
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm rounded-b-2xl z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/gas-station/dashboard" className="flex items-center">
              <img
                src={logoImage}
                alt="Fuel Finder Logo"
                className="w-16 ml-12 h-auto"
              />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <DropdownMenu onOpenChange={setProfileDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:bg-green-100 px-3 py-1 rounded-full transition-all">
                    <div className="text-right">
                      <h4 className="text-green-600 font-medium">
                        {user.first_name} {user.last_name}
                      </h4>
                      <p className="text-xs text-gray-500 capitalize">
                        {user.role.toLowerCase().replace("_", " ")}
                      </p>
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-green-100">
                      <AvatarImage src={user.profile_pic} />
                      <AvatarFallback>
                        {user.first_name?.charAt(0)}
                        {user.last_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {profileDropdownOpen ? (
                      <ChevronUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-green-600" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2" align="end">
                  <div className="px-2 py-1.5 text-sm font-medium text-gray-500">
                    My Account
                  </div>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/gas-station/profile"
                      className="w-full cursor-pointer flex items-center gap-2 text-gray-700"
                    >
                      <UserRound className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm rounded-r-2xl mt-2 ml-2 h-[calc(100vh-5rem)] sticky top-4">
          <div className="p-4 h-full flex flex-col">
            <div className="space-y-2 mt-4">
              <SidebarItem
                icon={<LayoutDashboard className="h-5 w-5" />}
                label="Dashboard"
                to="/gas-station/dashboard"
                active={pathName.includes("/gas-station/dashboard")}
              />
              <SidebarItem
                icon={<Fuel className="h-5 w-5" />}
                label="Fuel Availability"
                to="/gas-station/fuel-availability"
                active={pathName.includes("/gas-station/fuel-availability")}
              />

              <SidebarItem
                icon={<MessageSquare className="h-5 w-5" />}
                label="Feedbacks"
                to="/gas-station/feedbacks"
                active={pathName.includes("/gas-station/feedbacks")}
              />
              <SidebarItem
                icon={<UserRound className="h-5 w-5" />}
                label="Profile"
                to="/gas-station/profile"
                active={pathName.includes("/gas-station/profile")}
              />
            </div>
          </div>
        </aside>

        {/* Page Content */}
        <main className="flex-1 p-6 ml-4 mt-4 bg-white rounded-tl-2xl rounded-bl-2xl shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
