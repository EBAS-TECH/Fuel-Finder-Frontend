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
  ChevronDown,
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
} from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

// Define fuel types and their colors
const fuelTypeColors = {
  PETROL: COLORS.primary,
  DIESEL: COLORS.lightBlue,
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Station Dashboard
          </h1>
          <p className="text-gray-600">Here's your station overview</p>
        </div>
        <Button
          onClick={fetchAISuggestion}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-full"
          disabled={aiLoading}
        >
          <Zap className="h-5 w-5 text-white" />
          <span className="font-medium text-white">
            {aiLoading ? "Loading..." : "Get AI Suggestions"}
          </span>
        </Button>
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
                    Available Fuel Types
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

          {/* Charts Section - Only shown if there's available fuel */}
          {fuelAvailability.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Fuel Availability Bar Chart */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800">
                    Fuel Availability Duration
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Hours of availability for available fuel types
                    <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      <Clock className="inline h-3 w-3 mr-1" />
                      Current Status
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={barChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        layout="vertical" // Makes bars horizontal
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                        <XAxis 
                          type="number" 
                          tick={{ fill: "#6B7280" }}
                          axisLine={false}
                        />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          tick={{ fill: "#6B7280" }}
                          axisLine={false}
                          width={80}
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
                        <Bar
                          dataKey="hours"
                          name="Availability (Hours)"
                          radius={[0, 4, 4, 0]} // Rounded corners on right side only
                          barSize={30} // Thinner bars
                        >
                          {barChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Fuel Distribution Pie Chart */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800">
                    Fuel Distribution
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Percentage distribution of available fuel types
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      <Gauge className="inline h-3 w-3 mr-1" />
                      Current stock
                    </span>
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
                            `${props.payload.percentage.toFixed(1)}% (${props.payload.value} hours)`,
                            props.payload.name,
                          ]}
                          contentStyle={{
                            backgroundColor: "#FFF",
                            borderColor: "#E5E7EB",
                            borderRadius: "0.5rem",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
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
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800">
                  No Fuel Currently Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  There are currently no available fuel types in your station.
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* AI Suggestion Modal */}
      <Dialog open={showAIModal} onOpenChange={setShowAIModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-600" />
                <span>AI Station Analysis</span>
              </div>
              <button 
                onClick={() => setShowAIModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </DialogTitle>
          </DialogHeader>

          {aiSuggestion ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {aiSuggestion.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    TIN: {aiSuggestion.tinNumber}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(aiSuggestion.category)}`}>
                  {aiSuggestion.category}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Rating</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {aiSuggestion.rating}
                    <span className="text-lg text-gray-500">/5</span>
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Availability</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {aiSuggestion.availaleHour}
                    <span className="text-lg text-gray-500"> hours</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Analysis</h4>
                  <p className="text-gray-600">{aiSuggestion.reason}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Recommendations</h4>
                  <p className="text-gray-600">{aiSuggestion.suggestion}</p>
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