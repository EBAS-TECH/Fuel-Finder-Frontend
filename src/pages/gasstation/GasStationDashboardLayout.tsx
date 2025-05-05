import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoImage from '@/assets/logo.png';
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

const GasStationDashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // First try to get user data from localStorage/sessionStorage
        const storedUser = localStorage.getItem("userData") || sessionStorage.getItem("userData");
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Fetch updated user data from API
          try {
            const response = await axios.get(`http://localhost:5001/api/user/${parsedUser.id}`);
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

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-10 flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-gray-10 flex items-center justify-center">No user data available</div>;
  }

  return (
    <div className="min-h-screen bg-gray-10">
      <div className="bg-white rounded-lg m-0 md:m-4 shadow-sm overflow-hidden">
        {/* Header */}
        <header className="border-b p-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img
                src={logoImage}
                alt="Fuel Finder Logo"
                className="w-20 h-auto"
              />
            </Link>
            <div className="relative w-[500px] ml-44 hidden md:block">
  <Input
    type="text"
    placeholder="Search..."
    className="pl-10 bg-fuelGreen-50 border-2 border-gray-150 rounded-xl h-10 w-full"
  />
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
</div>


          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-2">
              <p className="text-fuelGreen-500 font-medium">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role?.toLowerCase().replace("_", " ")}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-fuelGreen-500">
                  <Avatar>
                    <AvatarImage src={user.avatar || user.profile_picture} alt={`${user.first_name} ${user.last_name}`} />
                    <AvatarFallback>
                      {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem asChild>
                  <Link to="/gas-station/profile" className="w-full cursor-pointer">
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

        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <aside className="w-full md:w-56 bg-white p-4 md:border-r">
            <nav className="space-y-1">
              <Link
                to="/gas-station/dashboard"
                className={`flex items-center px-4 py-3 rounded-md ${
                  isActive("/gas-station/dashboard")
                    ? "bg-fuelGreen-100 text-fuelGreen-500"
                    : "text-gray-600 hover:bg-fuelGreen-50"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                <span>Dashboard</span>
              </Link>

              <Link
                to="/gas-station/fuel-availability"
                className={`flex items-center px-4 py-3 rounded-md ${
                  isActive("/gas-station/fuel-availability")
                    ? "bg-fuelGreen-100 text-fuelGreen-500"
                    : "text-gray-600 hover:bg-fuelGreen-50"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>Fuel Availability</span>
              </Link>

              <Link
                to="/gas-station/feedbacks"
                className={`flex items-center px-4 py-3 rounded-md ${
                  isActive("/gas-station/feedbacks")
                    ? "bg-fuelGreen-100 text-fuelGreen-500"
                    : "text-gray-600 hover:bg-fuelGreen-50"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path>
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"></path>
                </svg>
                <span>Feedbacks</span>
              </Link>

              <Link
                to="/gas-station/profile"
                className={`flex items-center px-4 py-3 rounded-md ${
                  isActive("/gas-station/profile")
                    ? "bg-fuelGreen-100 text-fuelGreen-500"
                    : "text-gray-600 hover:bg-fuelGreen-50"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>Profile</span>
              </Link>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default GasStationDashboardLayout;