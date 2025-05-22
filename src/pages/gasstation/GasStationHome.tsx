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
  X,
  Droplet,
  Activity,
  Users,
  RefreshCw,
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
  LabelList,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Green color palette
const COLORS = {
  primary: "#10B981",  // emerald-500
  light: "#D1FAE5",    // emerald-100
  dark: "#065F46",     // emerald-800
  accent: "#059669",   // emerald-600
  secondary: "#ECFDF5", // emerald-50
  danger: "#EF4444",   // red-500
  warning: "#F59E0B",  // amber-500
};

// Define fuel types and their colors
const fuelTypeColors = {
  PETROL: "#8B5CF6",  // purple-500
  DIESEL: "#3B82F6",  // blue-500
};

// Custom bar shape to make it thinner
const ThinBar = (props) => {
  const { x, y, width, height, fill } = props;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={4} // Rounded corners
        ry={4}
      />
    </g>
  );
};

export default function DashboardPage() {
  const [feedbackData, setFeedbackData] = useState(null);
  const [fuelAvailability, setFuelAvailability] = useState([]);
  const [stationId, setStationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stationDetails, setStationDetails] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
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
          `${API_BASE_URL}/api/station/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const stationData = await stationResponse.json();

        if (!stationData.data?.id) {
          throw new Error("No station found for this user");
        }

        setStationId(stationData.data.id);
        setStationDetails(stationData.data);

        // Fetch feedback data
        const feedbackResponse = await fetch(
          `${API_BASE_URL}/api/feedback/rate`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const feedbackData = await feedbackResponse.json();
        setFeedbackData({
          ...feedbackData.data,
          average_rate: parseFloat(feedbackData.data.average_rate).toFixed(1),
        });

        // Fetch fuel availability data
        const availabilityResponse = await fetch(
          `${API_BASE_URL}/api/availability/station/${stationData.data.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const availabilityData = await availabilityResponse.json();

        // Process availability data - only include available fuels
        const processedAvailability = availabilityData.data
          .filter((item) => item.available) // Only include available fuels
          .map((item) => ({
            fuel_type: item.fuel_type,
            availability_duration: Math.floor(
              parseFloat(item.availability_duration) / 3600
            ), // Convert seconds to hours
            available: item.available,
            color: fuelTypeColors[item.fuel_type] || COLORS.primary,
          }));

        setFuelAvailability(processedAvailability);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const fetchAISuggestion = async () => {
    if (!stationId || !stationDetails) return;

    try {
      setAiLoading(true);
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      // Format dates for the API request
      const startDate = new Date(stationDetails.created_at).toISOString();
      const endDate = new Date().toISOString();

      const response = await fetch(
        "https://fuel-finder-backend.onrender.com/api/station/report/ministry",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            start_date: startDate,
            end_date: endDate,
          }),
        }
      );

      const data = await response.json();

      if (data.data && Array.isArray(data.data)) {
        // Find our station in the report
        const stationReport = data.data.find(
          (station) => station.stationId === stationId
        );
        
        if (stationReport) {
          setAiSuggestion(stationReport);
          setShowAIModal(true);
        }
      }
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
    } finally {
      setAiLoading(false);
    }
  };

  // Prepare data for bar chart - only available fuels
  const barChartData = fuelAvailability.map((item) => ({
    name: item.fuel_type,
    hours: item.availability_duration,
    color: item.color,
  }));

  // Prepare data for pie chart - only available fuels
  const pieChartData = fuelAvailability.map((item) => ({
    name: item.fuel_type,
    value: item.availability_duration, // Use hours for value to show distribution
    color: item.color,
  }));

  // Calculate total hours for percentage calculation
  const totalHours = pieChartData.reduce((sum, item) => sum + item.value, 0);

  // Add percentage to pie chart data
  const pieChartDataWithPercentage = pieChartData.map((item) => ({
    ...item,
    percentage: totalHours > 0 ? (item.value / totalHours) * 100 : 0,
  }));

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case "low":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "high":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-6 bg-emerald-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">
            <Droplet className="inline mr-2 h-8 w-8 text-emerald-600" />
            Station Dashboard
          </h1>
          <p className="text-emerald-700">Welcome to your fuel station management hub</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="text-emerald-600 border-emerald-300 hover:bg-emerald-100"
            onClick={refreshData}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={fetchAISuggestion}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg shadow-md"
            disabled={aiLoading}
          >
            <Activity className="h-5 w-5 text-white" />
            <span className="font-medium text-white">
              {aiLoading ? "Analyzing..." : "AI Insights"}
            </span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Rating Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-400">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium text-emerald-800">
                    Customer Rating
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-emerald-200">
                    <Star className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-emerald-900 mb-2">
                  {feedbackData?.average_rate || "0"}
                  <span className="text-lg text-emerald-600">/5</span>
                </div>
                <div className="flex items-center gap-1">
                  {feedbackData?.average_rate > 3 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-emerald-700">
                        Excellent performance
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
                <CardDescription className="text-emerald-700">
                  Based on {feedbackData?.total || 0} customer reviews
                </CardDescription>
              </CardFooter>
            </Card>

            {/* Feedback Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-400">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium text-emerald-800">
                    Customer Engagement
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-emerald-200">
                    <Users className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-emerald-900 mb-2">
                  {feedbackData?.total || "0"}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-emerald-200 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          ((feedbackData?.total || 0) / 50) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-emerald-700">
                    {Math.min(100, ((feedbackData?.total || 0) / 50) * 100)}%
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <CardDescription className="text-emerald-700">
                  Engagements this month
                </CardDescription>
              </CardFooter>
            </Card>

            {/* Fuel Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-400">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium text-emerald-800">
                    Available Fuel
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
                <div className="flex gap-2 flex-wrap">
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
                  Currently available in station
                </CardDescription>
              </CardFooter>
            </Card>
          </div>

          {/* Charts Section */}
          {fuelAvailability.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Fuel Availability Bar Chart */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-emerald-900">
                    <Clock className="inline mr-2 h-5 w-5 text-emerald-600" />
                    Fuel Availability Hours
                  </CardTitle>
                  <CardDescription className="text-emerald-700">
                    Current availability duration by fuel type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={barChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: "#065F46" }}
                          axisLine={{ stroke: "#065F46" }}
                        />
                        <YAxis
                          tick={{ fill: "#065F46" }}
                          axisLine={{ stroke: "#065F46" }}
                          label={{
                            value: "Hours",
                            angle: -90,
                            position: "insideLeft",
                            fill: "#065F46",
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ECFDF5",
                            borderColor: "#10B981",
                            borderRadius: "0.5rem",
                            color: "#065F46",
                          }}
                          formatter={(value) => [
                            `${value} hours`,
                            "Availability",
                          ]}
                        />
                        <Bar
                          dataKey="hours"
                          name="Availability (Hours)"
                          barSize={30}
                          shape={<ThinBar />}
                        >
                          {barChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                          <LabelList
                            dataKey="hours"
                            position="top"
                            fill="#065F46"
                            fontSize={12}
                            fontWeight={500}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Fuel Distribution Pie Chart */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-emerald-900">
                    <Gauge className="inline mr-2 h-5 w-5 text-emerald-600" />
                    Fuel Distribution
                  </CardTitle>
                  <CardDescription className="text-emerald-700">
                    Percentage of total availability by fuel type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartDataWithPercentage}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="percentage"
                          label={({ name, percentage }) =>
                            `${name}: ${percentage.toFixed(1)}%`
                          }
                        >
                          {pieChartDataWithPercentage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => [
                            `${props.payload.percentage.toFixed(1)}% (${props.payload.value}h)`,
                            props.payload.name,
                          ]}
                          contentStyle={{
                            backgroundColor: "#ECFDF5",
                            borderColor: "#10B981",
                            borderRadius: "0.5rem",
                            color: "#065F46",
                          }}
                        />
                        <Legend 
                          formatter={(value, entry, index) => {
                            const item = pieChartDataWithPercentage[index];
                            return `${value} (${item.percentage.toFixed(1)}%)`;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-emerald-900">
                  <AlertCircle className="inline mr-2 h-5 w-5 text-amber-500" />
                  No Fuel Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-emerald-700">
                  There are currently no available fuel types in your station.
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* AI Suggestion Modal */}
      <Dialog open={showAIModal} onOpenChange={setShowAIModal}>
        <DialogContent className="max-w-2xl bg-emerald-50 border-emerald-200">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-emerald-900">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                <span>AI Station Analysis</span>
              </div>
              <button 
                onClick={() => setShowAIModal(false)}
                className="p-1 rounded-full hover:bg-emerald-100"
              >
                <X className="h-5 w-5 text-emerald-600" />
              </button>
            </DialogTitle>
          </DialogHeader>

          {aiSuggestion ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-emerald-900 mb-1">
                    {aiSuggestion.name}
                  </h3>
                  <p className="text-sm text-emerald-700">
                    TIN: {aiSuggestion.tinNumber}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(aiSuggestion.category)}`}>
                  {aiSuggestion.category}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-emerald-200">
                  <h4 className="text-sm font-medium text-emerald-600 mb-1">Rating</h4>
                  <p className="text-2xl font-bold text-emerald-900">
                    {aiSuggestion.rating}
                    <span className="text-lg text-emerald-600">/5</span>
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-emerald-200">
                  <h4 className="text-sm font-medium text-emerald-600 mb-1">Availability</h4>
                  <p className="text-2xl font-bold text-emerald-900">
                    {aiSuggestion.availaleHour}
                    <span className="text-lg text-emerald-600"> hours</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg border border-emerald-200">
                  <h4 className="text-sm font-medium text-emerald-600 mb-2">Analysis</h4>
                  <p className="text-emerald-800">{aiSuggestion.reason}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-emerald-200">
                  <h4 className="text-sm font-medium text-emerald-600 mb-2">Recommendations</h4>
                  <p className="text-emerald-800">{aiSuggestion.suggestion}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}