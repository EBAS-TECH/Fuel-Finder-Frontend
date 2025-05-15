import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Fuel,
  MessageSquare,
  Zap,
  AlertCircle,
  TrendingUp,
  Clock,
  Gauge,
  CircleDollarSign,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// Color palette
const COLORS = {
  primary: "#8B5CF6", // purple
  success: "#10B981", // emerald
  warning: "#F59E0B", // amber
  danger: "#EF4444", // red
  info: "#3B82F6", // blue
  lightBlue: "#93C5FD", // light blue
  dark: "#1F2937", // gray-800
};

// Define static fuel types and their colors
const staticFuelTypes = [
  { id: 1, name: "Petrol", color: COLORS.primary },
  { id: 2, name: "Diesel", color: COLORS.lightBlue },
];

export default function DashboardPage() {
  const [feedbackData, setFeedbackData] = useState(null);
  const [fuelAvailability, setFuelAvailability] = useState([]);
  const [stationId, setStationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      const userId =
        localStorage.getItem("userId") || sessionStorage.getItem("userId");

      if (!token || !userId) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);

        // First, fetch the station ID for this user
        const stationResponse = await fetch(
          `http://localhost:5001/api/station/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const stationData = await stationResponse.json();

        if (!stationData.data?.id) {
          throw new Error("No station found for this user");
        }

        setStationId(stationData.data.id);

        // Fetch feedback data
        const feedbackResponse = await fetch(
          "http://localhost:5001/api/feedback/rate",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const feedbackData = await feedbackResponse.json();
        setFeedbackData({
          ...feedbackData.data,
          average_rate: parseFloat(feedbackData.data.average_rate).toFixed(0),
        });

        // Use static fuel types instead of fetching from API
        const staticFuelData = staticFuelTypes.map((fuel) => ({
          fuel_type: fuel.name,
          availability_duration: Math.floor(Math.random() * 10 + 5), // Random duration for demo
          status: Math.random() > 0.5 ? "AVAILABLE" : "LOW", // Random status for demo
        }));

        setFuelAvailability(staticFuelData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Prepare data for charts
  const pieChartData = fuelAvailability.map((item) => ({
    name: item.fuel_type,
    value: item.availability_duration,
    color: staticFuelTypes.find((fuel) => fuel.name === item.fuel_type)?.color || COLORS.primary,
  }));

  // Alternative chart data - Fuel availability by status
  const statusData = [
    {
      name: "Available",
      value: fuelAvailability.filter((f) => f.status === "AVAILABLE").length,
    },
    {
      name: "Low Stock",
      value: fuelAvailability.filter((f) => f.status === "LOW").length,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Station Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back! Here's your station overview
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-100 px-3 py-1.5 rounded-full">
          <Zap className="h-5 w-5 text-emerald-600" />
          <span className="font-medium text-emerald-700">Live Data</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Rating Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium text-purple-800">
                    Average Rating
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-purple-200">
                    <Star className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-purple-900 mb-2">
                  {feedbackData?.average_rate || "0"}
                  <span className="text-lg text-purple-600">/5</span>
                </div>
                <div className="flex items-center gap-1">
                  {feedbackData?.average_rate > 3 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-emerald-700">
                        Good performance
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm text-amber-700">
                        Needs improvement
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <CardDescription className="text-purple-700">
                  Based on {feedbackData?.total || 0} customer reviews
                </CardDescription>
              </CardFooter>
            </Card>

            {/* Feedback Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium text-blue-800">
                    Customer Feedback
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-blue-200">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-900 mb-2">
                  {feedbackData?.total || "0"}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          ((feedbackData?.total || 0) / 50) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-blue-700">
                    {Math.min(100, ((feedbackData?.total || 0) / 50) * 100)}%
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <CardDescription className="text-blue-700">
                  Engagements this month
                </CardDescription>
              </CardFooter>
            </Card>

            {/* Fuel Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium text-emerald-800">
                    Fuel Types
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-emerald-200">
                    <Fuel className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-emerald-900 mb-2">
                  {fuelAvailability.length || "0"}
                </div>
                <div className="flex gap-2">
                  {fuelAvailability.map((fuel, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${fuel.color}20`,
                        color: fuel.color,
                      }}
                    >
                      {fuel.fuel_type}
                    </span>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <CardDescription className="text-emerald-700">
                  Currently available in stock
                </CardDescription>
              </CardFooter>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Fuel Availability Line Chart */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800">
                  Fuel Availability Duration
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Hours of availability per fuel type
                  <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    <Clock className="inline h-3 w-3 mr-1" />
                    Last 24 hours
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={fuelAvailability}>
                      <defs>
                        <linearGradient
                          id="colorDuration"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={COLORS.success}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={COLORS.success}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="fuel_type" tick={{ fill: "#6B7280" }} />
                      <YAxis
                        tick={{ fill: "#6B7280" }}
                        label={{
                          value: "Hours",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#6B7280",
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFF",
                          borderColor: "#E5E7EB",
                          borderRadius: "0.5rem",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value) => [
                          `${value} hours`,
                          "Availability",
                        ]}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="availability_duration"
                        name="Availability (Hours)"
                        stroke={COLORS.success}
                        fillOpacity={1}
                        fill="url(#colorDuration)"
                        strokeWidth={2}
                        activeDot={{ r: 6, fill: COLORS.success }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Fuel Availability Pie Chart */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800">
                  Fuel Distribution
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Fuel types by availability
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    <Gauge className="inline h-3 w-3 mr-1" />
                    Percentage
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [
                          `${value} hours`,
                          "Availability",
                        ]}
                        contentStyle={{
                          backgroundColor: "#FFF",
                          borderColor: "#E5E7EB",
                          borderRadius: "0.5rem",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
