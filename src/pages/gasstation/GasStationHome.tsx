import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Fuel,
  MessageSquare,
  Activity,
  Users,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Clock,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Color palette
const COLORS = {
  primary: "#10B981",
  light: "#D1FAE5",
  dark: "#065F46",
  accent: "#059669",
  secondary: "#ECFDF5",
  danger: "#EF4444",
  warning: "#F59E0B",
};

// Fuel type colors
const fuelTypeColors = {
  PETROL: "#10B981",
  DIESEL: "#059669",
  PREMIUM: "#047857",
  REGULAR: "#34D399",
};

export default function DashboardPage() {
  const [feedbackData, setFeedbackData] = useState(null);
  const [ratingDistribution, setRatingDistribution] = useState([]);
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

        // Fetch station ID
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
          `${API_BASE_URL}/api/feedback/station/${stationData.data.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const feedbackData = await feedbackResponse.json();

        if (feedbackData.success && feedbackData.data) {
          const totalRatings = feedbackData.data.length;
          const sumRatings = feedbackData.data.reduce(
            (sum, feedback) => sum + feedback.rating,
            0
          );
          const averageRating =
            totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : 0;

          setFeedbackData({
            average_rate: averageRating,
            total: totalRatings,
          });

          // Process rating distribution
          const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

          feedbackData.data.forEach((feedback) => {
            const rating = Math.floor(feedback.rating);
            if (rating >= 1 && rating <= 5) {
              ratingCounts[rating]++;
            }
          });

          setRatingDistribution([
            {
              name: "Very Positive",
              value: ratingCounts[5],
              percentage: totalRatings > 0 ? (ratingCounts[5] / totalRatings) * 100 : 0,
              color: "#10B981",
              stars: 5,
            },
            {
              name: "Positive",
              value: ratingCounts[4],
              percentage: totalRatings > 0 ? (ratingCounts[4] / totalRatings) * 100 : 0,
              color: "#34D399",
              stars: 4,
            },
            {
              name: "Neutral",
              value: ratingCounts[3],
              percentage: totalRatings > 0 ? (ratingCounts[3] / totalRatings) * 100 : 0,
              color: "#F59E0B",
              stars: 3,
            },
            {
              name: "Negative",
              value: ratingCounts[2],
              percentage: totalRatings > 0 ? (ratingCounts[2] / totalRatings) * 100 : 0,
              color: "#F97316",
              stars: 2,
            },
            {
              name: "Very Negative",
              value: ratingCounts[1],
              percentage: totalRatings > 0 ? (ratingCounts[1] / totalRatings) * 100 : 0,
              color: "#EF4444",
              stars: 1,
            },
          ]);
        }

        // Fetch fuel availability
        const availabilityResponse = await fetch(
          `${API_BASE_URL}/api/availability/station/${stationData.data.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const availabilityData = await availabilityResponse.json();

        const processedAvailability = availabilityData.data
          .filter((item) => item.available)
          .map((item) => ({
            fuel_type: item.fuel_type,
            availability_duration: Math.floor(
              parseFloat(item.availability_duration) / 3600
            ),
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

      const response = await fetch(
        "https://fuel-finder-backend.onrender.com/api/station/report/ministry",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            start_date: new Date(stationDetails.created_at).toISOString(),
            end_date: new Date().toISOString(),
          }),
        }
      );

      const data = await response.json();

      if (data.data && Array.isArray(data.data)) {
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

  const barChartData = fuelAvailability.map((item) => ({
    name: item.fuel_type,
    hours: item.availability_duration,
    color: item.color,
  }));

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case "low": return "bg-red-500 text-white";
      case "medium": return "bg-amber-500 text-white";
      case "high": return "bg-emerald-500 text-white";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-emerald-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
            <p className="font-semibold text-emerald-900">{data.name}</p>
          </div>
          <p className="text-sm text-emerald-700">
            {data.value} ratings ({data.percentage.toFixed(1)}%)
          </p>
          <div className="flex items-center mt-1">
            {[...Array(data.stars)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
            ))}
            {[...Array(5 - data.stars)].map((_, i) => (
              <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-6 bg-emerald-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#176016"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <line x1="3" x2="15" y1="22" y2="22" />
              <line x1="4" x2="14" y1="9" y2="9" />
              <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
              <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
            </svg>
            <h1 className="text-2xl md:text-3xl font-bold text-emerald-900">
              Station Dashboard
            </h1>
          </div>
          <p className="text-sm md:text-base text-emerald-700">
            Welcome to your fuel station management hub
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="text-emerald-600 border-emerald-300 hover:bg-emerald-100 w-full md:w-auto"
            onClick={refreshData}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={fetchAISuggestion}
            size="sm"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-3 md:px-4 py-1 md:py-2 rounded-lg shadow-md w-full md:w-auto"
            disabled={aiLoading}
          >
            <Activity className="h-4 md:h-5 w-4 md:w-5 text-white" />
            <span className="font-medium text-white text-sm md:text-base">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Rating Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-400">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xs md:text-sm font-medium text-emerald-800">
                    Customer Rating
                  </CardTitle>
                  <div className="p-1 md:p-2 rounded-lg bg-emerald-200">
                    <Star className="h-4 md:h-5 w-4 md:w-5 text-emerald-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-emerald-900 mb-1 md:mb-2">
                  {feedbackData?.average_rate || "0"}
                  <span className="text-sm md:text-lg text-emerald-600">/5</span>
                </div>
                <div className="flex items-center gap-1">
                  {feedbackData?.average_rate > 3 ? (
                    <>
                      <TrendingUp className="h-3 md:h-4 w-3 md:w-4 text-emerald-500" />
                      <span className="text-xs md:text-sm text-emerald-700">
                        Excellent performance
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 md:h-4 w-3 md:w-4 text-amber-500" />
                      <span className="text-xs md:text-sm text-amber-700">
                        Needs improvement
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <CardDescription className="text-xs md:text-sm text-emerald-700">
                  Based on {feedbackData?.total || 0} customer reviews
                </CardDescription>
              </CardFooter>
            </Card>

            {/* Feedback Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-400">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xs md:text-sm font-medium text-emerald-800">
                    Customer Engagement
                  </CardTitle>
                  <div className="p-1 md:p-2 rounded-lg bg-emerald-200">
                    <Users className="h-4 md:h-5 w-4 md:w-5 text-emerald-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-emerald-900 mb-1 md:mb-2">
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
                    {Math.min(100, ((feedbackData?.total || 0) / 50) * 100)}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <CardDescription className="text-xs md:text-sm text-emerald-700">
                  Engagements this month
                </CardDescription>
              </CardFooter>
            </Card>

            {/* Fuel Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-400">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xs md:text-sm font-medium text-emerald-800">
                    Available Fuel
                  </CardTitle>
                  <div className="p-1 md:p-2 rounded-lg bg-emerald-200">
                    <Fuel className="h-4 md:h-5 w-4 md:w-5 text-emerald-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-emerald-900 mb-1 md:mb-2">
                  {fuelAvailability.length || "0"}
                </div>
                <div className="flex gap-1 md:gap-2 flex-wrap">
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
                <CardDescription className="text-xs md:text-sm text-emerald-700">
                  Currently available in station
                </CardDescription>
              </CardFooter>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Fuel Availability Bar Chart */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-base md:text-lg text-emerald-900">
                  <Clock className="inline mr-2 h-4 md:h-5 w-4 md:w-5 text-emerald-600" />
                  Fuel Availability Hours
                </CardTitle>
                <CardDescription className="text-xs md:text-sm text-emerald-700">
                  Current availability duration by fuel type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#065F46", fontSize: 12 }}
                        axisLine={{ stroke: "#D1FAE5" }}
                        tickLine={{ stroke: "#D1FAE5" }}
                      />
                      <YAxis
                        tick={{ fill: "#065F46", fontSize: 12 }}
                        axisLine={{ stroke: "#D1FAE5" }}
                        tickLine={{ stroke: "#D1FAE5" }}
                        label={{
                          value: "Hours",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#065F46",
                          fontSize: 12,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ECFDF5",
                          borderColor: "#10B981",
                          borderRadius: "0.5rem",
                          color: "#065F46",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value) => [`${value} hours`, "Availability"]}
                        cursor={{ fill: "#D1FAE5" }}
                      />
                      <Bar
                        dataKey="hours"
                        name="Availability (Hours)"
                        barSize={40}
                        radius={[4, 4, 0, 0]}
                      >
                        {barChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="#ECFDF5"
                            strokeWidth={1}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Rating Distribution Pie Chart */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-base md:text-lg text-emerald-900">
                  <Star className="inline mr-2 h-4 md:h-5 w-4 md:w-5 text-emerald-600" />
                  Customer Feedback Distribution
                </CardTitle>
                <CardDescription className="text-xs md:text-sm text-emerald-700">
                  Breakdown of customer feedback ratings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 md:h-80">
                  {ratingDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ratingDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                        >
                          {ratingDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          layout="vertical"
                          align="right"
                          verticalAlign="middle"
                          wrapperStyle={{
                            paddingLeft: "20px",
                          }}
                          formatter={(value, entry, index) => {
                            const { payload } = entry;
                            return (
                              <span className="text-xs md:text-sm text-emerald-800">
                                {payload.name} ({payload.value})
                              </span>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex justify-center items-center h-full text-emerald-700">
                      No rating data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* AI Suggestion Modal */}
      <Dialog open={showAIModal} onOpenChange={setShowAIModal}>
        <DialogContent className="max-w-[95vw] md:max-w-2xl bg-emerald-50 border-emerald-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base md:text-lg text-emerald-900">
              <Activity className="h-4 md:h-5 w-4 md:w-5 text-emerald-600" />
              <span>AI Station Analysis</span>
            </DialogTitle>
          </DialogHeader>

          {aiSuggestion ? (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-medium text-emerald-900 mb-1">
                    {aiSuggestion.name}
                  </h3>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getCategoryColor(
                    aiSuggestion.category
                  )}`}
                >
                  {aiSuggestion.category}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-white p-3 md:p-4 rounded-lg border border-emerald-200">
                  <h4 className="text-xs md:text-sm font-medium text-emerald-600 mb-1">
                    Rating
                  </h4>
                  <p className="text-xl md:text-2xl font-bold text-emerald-900">
                    {aiSuggestion.rating}
                    <span className="text-sm md:text-lg text-emerald-600">/5</span>
                  </p>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-lg border border-emerald-200">
                  <h4 className="text-xs md:text-sm font-medium text-emerald-600 mb-1">
                    Availability
                  </h4>
                  <p className="text-xl md:text-2xl font-bold text-emerald-900">
                    {aiSuggestion.availableHour}
                    <span className="text-sm md:text-lg text-emerald-600"> hours</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white p-3 md:p-4 rounded-lg border border-emerald-200">
                  <h4 className="text-xs md:text-sm font-medium text-emerald-600 mb-2">
                    Detailed Analysis
                  </h4>
                  <p className="text-xs md:text-sm text-emerald-800">{aiSuggestion.reason}</p>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-lg border border-emerald-200">
                  <h4 className="text-xs md:text-sm font-medium text-emerald-600 mb-2">
                    Actionable Recommendations
                  </h4>
                  <p className="text-xs md:text-sm text-emerald-800">{aiSuggestion.suggestion}</p>
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