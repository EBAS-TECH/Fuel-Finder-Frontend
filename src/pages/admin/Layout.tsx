import React, { useState, useEffect, useCallback } from "react";
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
  UserCog,
  Fuel,
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || API_BASE_URL.replace('https', 'wss');

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

interface MonthlyUserStats {
  month: string;
  drivers: number;
  gasStations: number;
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

const Counter = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 500;
    const start = 0;
    const increment = Math.max(1, Math.ceil(value / (duration / 10)));

    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        current = value;
        clearInterval(timer);
      }
      setDisplayValue(current);
    }, 10);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const pathName = location.pathname;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyUserStats[]>([]);
  const [dataVersion, setDataVersion] = useState(0);
  const [ws, setWs] = useState<WebSocket | null>(null);

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

        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/user/${parsedUser.id}`,
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

  useEffect(() => {
    const websocket = new WebSocket(`${WS_BASE_URL}/ws`);
    setWs(websocket);

    websocket.onopen = () => {
      console.log("WebSocket connected");
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "DATA_UPDATED") {
        setDataVersion((prev) => prev + 1);
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    websocket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      websocket.close();
    };
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user`, {
        headers: {
          Authorization: `Bearer ${
            localStorage.getItem("authToken") ||
            sessionStorage.getItem("authToken")
          }`,
        },
      });
      setUsers(response.data.data);
      processUserStats(response.data.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [dataVersion, fetchData]);

  const getLastSixMonths = useCallback(() => {
    const months = [];
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const date = new Date();

    for (let i = 0; i < 6; i++) {
      const month = date.getMonth();
      const year = date.getFullYear();
      months.unshift(`${monthNames[month]} ${year}`);
      date.setMonth(date.getMonth() - 1);
    }

    return months;
  }, []);

  const processUserStats = useCallback(
    (users: User[]) => {
      const lastSixMonths = getLastSixMonths();
      const statsByMonth: Record<
        string,
        { drivers: number; gasStations: number }
      > = {};

      lastSixMonths.forEach((month) => {
        statsByMonth[month] = { drivers: 0, gasStations: 0 };
      });

      users.forEach((user) => {
        const userDate = new Date(user.created_at);
        const month = userDate.getMonth();
        const year = userDate.getFullYear();
        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const monthYear = `${monthNames[month]} ${year}`;

        if (statsByMonth[monthYear] !== undefined) {
          if (user.role === "DRIVER") {
            statsByMonth[monthYear].drivers++;
          } else if (user.role === "GAS_STATION") {
            statsByMonth[monthYear].gasStations++;
          }
        }
      });

      const statsArray = lastSixMonths.map((month) => ({
        month,
        drivers: statsByMonth[month].drivers,
        gasStations: statsByMonth[month].gasStations,
      }));

      setMonthlyStats(statsArray);
    },
    [getLastSixMonths]
  );

  const handleLogout = () => {
    if (ws) {
      ws.close();
    }

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
          {pathName.includes("/admin/dashboard") ? (
            <div>
              <h2 className="text-2xl font-bold mb-6">User Statistics</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div className="bg-green-50 p-3 rounded-lg shadow hover:shadow-md transition-all duration-300">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Total Users
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    <Counter value={users.length} />
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg shadow hover:shadow-md transition-all duration-300">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Total Drivers
                  </h3>
                  <p className="text-2xl font-bold text-blue-600">
                    <Counter
                      value={users.filter((u) => u.role === "DRIVER").length}
                    />
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg shadow hover:shadow-md transition-all duration-300">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Total Gas Stations
                  </h3>
                  <p className="text-2xl font-bold text-purple-600">
                    <Counter
                      value={
                        users.filter((u) => u.role === "GAS_STATION").length
                      }
                    />
                  </p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg shadow hover:shadow-md transition-all duration-300">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Total Delegates
                  </h3>
                  <p className="text-2xl font-bold text-amber-600">
                    <Counter
                      value={
                        users.filter((u) => u.role === "MINISTRY_DELEGATE")
                          .length
                      }
                    />
                  </p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg shadow hover:shadow-md transition-all duration-300">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Total Admins
                  </h3>
                  <p className="text-2xl font-bold text-red-600">
                    <Counter
                      value={users.filter((u) => u.role === "ADMIN").length}
                    />
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h3 className="text-lg font-semibold mb-4">
                  Monthly User Registration (Last 6 Months)
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyStats}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="drivers"
                        name="Drivers"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="gasStations"
                        name="Gas Stations"
                        stroke="#10B981"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users
                        .sort(
                          (a, b) =>
                            new Date(b.created_at).getTime() -
                            new Date(a.created_at).getTime()
                        )
                        .slice(0, 5)
                        .map((user, index) => (
                          <tr
                            key={user.id}
                            className="opacity-0 animate-fade-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img
                                    className="h-10 w-10 rounded-full"
                                    src={user.profile_pic}
                                    alt=""
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.first_name} {user.last_name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.username}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                                {user.role.toLowerCase().replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.verified
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {user.verified ? "Verified" : "Pending"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}