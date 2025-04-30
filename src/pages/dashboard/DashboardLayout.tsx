
import { Link, Outlet } from "react-router-dom";
import { Menu, X, Home, Map, Clock, Settings, LogOut } from "lucide-react";
import { useState } from "react";
import Logo from "@/components/Logo";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-white border-r">
          <div className="flex items-center justify-between mb-8 px-2">
            <Logo className="w-32" />
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <ul className="space-y-2 font-medium">
            <li>
              <Link
                to="/dashboard"
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-fuelGreen-50 group"
              >
                <Home className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-fuelGreen-500" />
                <span className="ml-3">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/map"
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-fuelGreen-50 group"
              >
                <Map className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-fuelGreen-500" />
                <span className="ml-3">Find Gas Stations</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/history"
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-fuelGreen-50 group"
              >
                <Clock className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-fuelGreen-500" />
                <span className="ml-3">History</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/settings"
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-fuelGreen-50 group"
              >
                <Settings className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-fuelGreen-500" />
                <span className="ml-3">Settings</span>
              </Link>
            </li>
          </ul>
          <div className="absolute bottom-4 w-full px-3">
            <button 
              onClick={() => {
                // Logout logic will be handled by backend
                window.location.href = '/login';
              }}
              className="flex items-center w-full p-2 text-red-600 rounded-lg hover:bg-red-50 group"
            >
              <LogOut className="w-5 h-5 transition duration-75 group-hover:text-red-700" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden bg-white border-b px-4 py-2 flex items-center justify-between">
        <Logo className="w-32" />
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-gray-700"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Main content */}
      <div className="p-4 md:ml-64">
        <div className="mt-14 md:mt-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
