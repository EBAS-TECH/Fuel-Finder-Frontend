import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  Users,
  UserRound,
  LogOut,
  ChevronDown,
  ChevronUp,
  Fuel,
} from "lucide-react";
import logoImage from "../../assets/logo.png";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const SidebarItem = ({
  icon,
  label,
  to,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
}) => {
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

export default function DashboardPage() {
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
        const storedUser =
          localStorage.getItem("userData") ||
          sessionStorage.getItem("userData");

        if (!storedUser) {
          throw new Error("No user data found");
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
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

    const handleUserUpdate = () => {
      const storedUser =
        localStorage.getItem("userData") || sessionStorage.getItem("userData");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    window.addEventListener("userUpdated", handleUserUpdate);
    window.addEventListener("storage", handleUserUpdate);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
      window.removeEventListener("storage", handleUserUpdate);
    };
  }, [toast, navigate]);

  const handleLogout = () => {
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
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
      <header className="bg-white shadow-sm rounded-b-2xl z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/admin/dashboard" className="flex items-center">
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
                        {user.role}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-green-100">
                      <img
                        src={user.profile_pic}
                        alt="User Avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
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
                      to="/admin/profile"
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

      <div className="flex flex-1">
        <aside className="w-64 bg-white shadow-sm rounded-r-2xl mt-2 ml-2 h-[calc(100vh-5rem)] sticky top-4">
          <div className="p-4 h-full flex flex-col">
            <div className="space-y-2 mt-4">
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
                icon={<Fuel className="h-5 w-5" />}
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
                icon={
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 6v6l4 2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 10h.01M16 10h.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
                label="Fuel Price"
                to="/admin/fuel-price"
                active={pathName.includes("/admin/fuel-price")}
              />
              <SidebarItem
                icon={<UserRound className="h-5 w-5" />}
                label="Profile"
                to="/admin/profile"
                active={pathName.includes("/admin/profile")}
              />
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 ml-4 mt-4 bg-white rounded-tl-2xl rounded-bl-2xl shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
