import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Logo from "@/components/Logo";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const GasStationDashboardLayout = () => {
  const location = useLocation();
  const [user] = useState({
    name: "Bereket Nigussie",
    role: "User",
    avatar: "/lovable-uploads/daf30b32-b807-4f23-92a9-fa24c23000cb.png",
  });

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg m-0 md:m-4 shadow-sm overflow-hidden">
        {/* Header */}
        <header className="border-b p-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <Logo className="w-28" />
            <div className="relative w-64 hidden md:block">
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 bg-fuelGreen-50 border-none h-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-2">
              <p className="text-fuelGreen-500 font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <aside className="w-full md:w-56 bg-white p-4 md:border-r">
            <nav className="space-y-1">
              <Link
                to="/gasstation"
                className={`flex items-center px-4 py-3 rounded-md ${
                  isActive("/gasstation")
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
                to="/gasstation/fuel-availability"
                className={`flex items-center px-4 py-3 rounded-md ${
                  isActive("/gasstation/availability")
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
                to="/gasstation/feedbacks"
                className={`flex items-center px-4 py-3 rounded-md ${
                  isActive("/gasstation/feedbacks")
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
                to="/gasstation/profile"
                className={`flex items-center px-4 py-3 rounded-md ${
                  isActive("/gasstation/profile")
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
