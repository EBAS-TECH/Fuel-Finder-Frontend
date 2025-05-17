import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  Star,
  MapPin,
  Globe,
  Filter,
  X,
  CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function StationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [fuelType, setFuelType] = useState("");
  const [feedbackDate, setFeedbackDate] = useState<Date | undefined>();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);
  const [stationData, setStationData] = useState<any>(null);
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [originalFeedbackData, setOriginalFeedbackData] = useState<any[]>([]);
  const [fuelAvailabilityData, setFuelAvailabilityData] = useState<any[]>([]);
  const [originalFuelAvailabilityData, setOriginalFuelAvailabilityData] = useState<any[]>([]);
  const [aiSummaryData, setAiSummaryData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStationDetails = async () => {
      try {
        const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

        if (!authToken) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_BASE_URL}/api/station/${id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to fetch station details: ${errorData.message || "Unknown error"}`);
        }

        const data = await response.json();
        setStationData(data.data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    const fetchFeedbackData = async () => {
      try {
        const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

        if (!authToken) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_BASE_URL}/api/feedback/station/${id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to fetch feedback data: ${errorData.message || "Unknown error"}`);
        }

        const data = await response.json();
        const feedbackWithUserDetails = await Promise.all(data.data.map(async (feedback: any) => {
          const userResponse = await fetch(`${API_BASE_URL}/api/user/${feedback.user_id}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${authToken}`,
              "Content-Type": "application/json"
            }
          });

          if (!userResponse.ok) {
            const errorData = await userResponse.json();
            throw new Error(`Failed to fetch user details: ${errorData.message || "Unknown error"}`);
          }

          const userData = await userResponse.json();
          return { ...feedback, user: userData.data };
        }));

        setFeedbackData(feedbackWithUserDetails);
        setOriginalFeedbackData(feedbackWithUserDetails);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    const fetchAiSummaryData = async () => {
      try {
        const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

        if (!authToken) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_BASE_URL}/api/station/report/ministry`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            start_date: "2024-01-31T21:00:00.000Z",
            end_date: "2025-05-22T21:00:00.000Z"
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to fetch AI summary data: ${errorData.message || "Unknown error"}`);
        }

        const data = await response.json();
        const stationSummary = data.data.find((item: any) => item.stationId === id);
        setAiSummaryData(stationSummary);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    const fetchFuelAvailabilityData = async () => {
      try {
        const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

        if (!authToken) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_BASE_URL}/api/availability/station/${id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to fetch fuel availability data: ${errorData.message || "Unknown error"}`);
        }

        const data = await response.json();
        setFuelAvailabilityData(data.data);
        setOriginalFuelAvailabilityData(data.data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    fetchStationDetails();
    fetchFeedbackData();
    fetchAiSummaryData();
    fetchFuelAvailabilityData();
  }, [id, toast]);

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Star
          key={index}
          className={`h-6 w-6 ${
            index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
          }`}
        />
      ));
  };

  const calculateAverageRating = () => {
    if (originalFeedbackData.length === 0) return 0;
    const totalRating = originalFeedbackData.reduce(
      (sum, feedback) => sum + feedback.rating,
      0
    );
    return totalRating / originalFeedbackData.length;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    let filtered = [...originalFeedbackData];

    if (filter !== "all") {
      filtered = filtered.filter(feedback => feedback.rating === parseInt(filter));
    }

    if (feedbackDate) {
      filtered = filtered.filter(feedback => {
        const feedbackDateObj = new Date(feedback.created_at);
        return feedbackDateObj.toDateString() === feedbackDate.toDateString();
      });
    }

    setFeedbackData(filtered);
  }, [filter, feedbackDate, originalFeedbackData]);

  useEffect(() => {
    let filtered = [...originalFuelAvailabilityData];

    if (fuelType) {
      filtered = filtered.filter(item => item.fuel_type === fuelType.toUpperCase());
    }

    if (startDate) {
      filtered = filtered.filter(item => new Date(item.up_time) >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(item => new Date(item.down_time) <= endDate);
    }

    setFuelAvailabilityData(filtered);
  }, [fuelType, startDate, endDate, originalFuelAvailabilityData]);

  if (!stationData) {
    return (
      <div className="bg-[#F7F9F9] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner border-4 border-green-500 border-t-transparent rounded-full w-12 h-12 animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading station details...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-5">
        <div className="flex items-center text-green-500">
          <svg
            className="h-6 w-6 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 9h18v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 3v6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h1 className="text-xl font-medium">Stations</h1>
        </div>
        <p className="text-gray-400 text-sm ml-2">Stations management</p>
      </div>

      <div className="bg-[#F1F7F7] p-6 rounded-lg">
        <Link
          to="/ministry-delegate/stations"
          className="flex items-center text-green-500 mb-5 hover:underline"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Station's Detail</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden p-2 border flex items-center justify-center mb-3">
                <img
                  src={stationData.logo || "/lovable-uploads/3b24a52c-5dee-4810-98d3-f9832a4c6d5e.png"}
                  alt={stationData.en_name}
                  className="w-20 h-20 object-contain"
                />
              </div>

              <h2 className="text-lg font-medium text-center mb-1">
                {stationData.en_name}
              </h2>
              <p className="text-center text-sm text-gray-500 mb-3">
                {stationData.am_name}
              </p>

              <div className="flex items-center mb-5">
                {renderStars(Math.floor(calculateAverageRating()))}
                <span className="ml-2">
                  {calculateAverageRating().toFixed(1)} ({originalFeedbackData.length} reviews)
                </span>
              </div>

              <div className="w-full space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="text-green-500 h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">TIN Number</p>
                    <p className="text-sm">{stationData.tin_number || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="text-green-500 h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Latitude</p>
                    <p className="text-sm">
                      {stationData.latitude?.toFixed(6) || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="text-green-500 h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Longitude</p>
                    <p className="text-sm">
                      {stationData.longitude?.toFixed(6) || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="text-green-500 h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-sm">{stationData.address || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm h-full relative">
              <div className="flex justify-between mb-4">
                <Button
                  onClick={() => setIsAiSummaryOpen(true)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
                >
                  AI Summary for station
                </Button>
              </div>

              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-medium">Feedbacks</h3>
                <div className="flex gap-2">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-36 border border-gray-200 text-sm">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <SelectValue placeholder="Filter by Rating" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">
                        <div className="flex items-center gap-1">
                          {Array(5).fill(0).map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      </SelectItem>
                      <SelectItem value="4">
                        <div className="flex items-center gap-1">
                          {Array(4).fill(0).map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          ))}
                          <Star className="h-4 w-4 text-gray-200" />
                        </div>
                      </SelectItem>
                      <SelectItem value="3">
                        <div className="flex items-center gap-1">
                          {Array(3).fill(0).map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          ))}
                          {Array(2).fill(0).map((_, i) => (
                            <Star key={i+3} className="h-4 w-4 text-gray-200" />
                          ))}
                        </div>
                      </SelectItem>
                      <SelectItem value="2">
                        <div className="flex items-center gap-1">
                          {Array(2).fill(0).map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          ))}
                          {Array(3).fill(0).map((_, i) => (
                            <Star key={i+2} className="h-4 w-4 text-gray-200" />
                          ))}
                        </div>
                      </SelectItem>
                      <SelectItem value="1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          {Array(4).fill(0).map((_, i) => (
                            <Star key={i+1} className="h-4 w-4 text-gray-200" />
                          ))}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-36 border border-gray-200 text-sm">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        {feedbackDate ? format(feedbackDate, "MMM dd") : "Filter by Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={feedbackDate}
                        onSelect={(date) => setFeedbackDate(date || undefined)}
                        initialFocus
                      />
                      {feedbackDate && (
                        <div className="p-2 border-t flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFeedbackDate(undefined)}
                          >
                            Clear Date
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-6">
                {feedbackData.slice(0, 3).map((feedback) => (
                  <div key={feedback.id} className="border-l-4 border-green-500 pl-4 mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <img
                            src={feedback.user?.profile_pic || "/lovable-uploads/33aaae15-01dd-4225-9aea-5e05b6b69803.png"}
                            alt={`${feedback.user?.first_name || 'User'} profile`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/default-user.png";
                            }}
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-700">
                            {feedback.user?.first_name || 'Unknown'} {feedback.user?.last_name || 'User'}
                          </h4>
                          <p className="text-xs text-gray-400">
                            {new Date(feedback.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {renderStars(feedback.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{feedback.comment || "No comment"}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div></div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) handlePageChange(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {[1, 2].map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                          isActive={currentPage === page}
                          className={
                            currentPage === page
                              ? "bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
                              : "bg-gray-200 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center"
                          }
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < 2) handlePageChange(currentPage + 1);
                        }}
                        className={currentPage === 2 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Fuel Availability Report</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <Select value={fuelType} onValueChange={setFuelType}>
              <SelectTrigger className="w-32 border border-gray-200">
                <SelectValue placeholder="Fuel Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="petrol">Petrol</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-32 border border-gray-200">
                  {startDate ? format(startDate, "MMM dd, yyyy") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-32 border border-gray-200">
                  {endDate ? format(endDate, "MMM dd, yyyy") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button
              onClick={() => {
                setFuelType("");
                setStartDate(undefined);
                setEndDate(undefined);
              }}
              variant="outline"
              className="text-gray-600 px-4"
            >
              Clear
            </Button>
          </div>
          <Table className="w-full border border-gray-100">
            <TableHeader>
              <TableRow>
                <TableHead className="bg-green-500 text-white font-normal w-16">ID</TableHead>
                <TableHead className="bg-green-500 text-white font-normal">Fuel Name</TableHead>
                <TableHead className="bg-green-500 text-white font-normal">Start Date</TableHead>
                <TableHead className="bg-green-500 text-white font-normal">End Date</TableHead>
                <TableHead className="bg-green-500 text-white font-normal text-center">Available hrs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fuelAvailabilityData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.fuel_type}</TableCell>
                  <TableCell>{new Date(item.up_time).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(item.down_time).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">
                    {Math.floor(parseFloat(item.availability_duration) / 3600).toFixed(1)}
                  </TableCell>
                </TableRow>
              ))}
              {fuelAvailabilityData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing 1 - {fuelAvailabilityData.length} of {fuelAvailabilityData.length}
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`p-1.5 rounded-full ${
                      currentPage === 1 ? "bg-gray-100 text-gray-400" : "bg-gray-200 text-gray-600"
                    }`}
                    disabled={currentPage === 1}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                </PaginationItem>
                <PaginationItem>
                  <button
                    onClick={() => handlePageChange(1)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentPage === 1 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    1
                  </button>
                </PaginationItem>
                <PaginationItem>
                  <button
                    onClick={() => handlePageChange(2)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentPage === 2 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    2
                  </button>
                </PaginationItem>
                <PaginationItem>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={`p-1.5 rounded-full ${
                      currentPage === 2 ? "bg-gray-100 text-gray-400" : "bg-gray-200 text-gray-600"
                    }`}
                    disabled={currentPage === 2}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>

      <Dialog open={isAiSummaryOpen} onOpenChange={setIsAiSummaryOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-white">
          <div className="p-6 relative">
            <button
              onClick={() => setIsAiSummaryOpen(false)}
              className="absolute right-4 top-4"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-medium text-green-500 mb-2">
              AI Summary
            </h2>

            <div className="flex flex-col items-center mt-6 mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
                <img
                  src={stationData.logo || "/lovable-uploads/3b24a52c-5dee-4810-98d3-f9832a4c6d5e.png"}
                  alt={stationData.en_name}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-lg font-medium">
                {stationData.en_name}
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-green-600 font-medium">Rank :</p>
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${
                    aiSummaryData?.category === "High" ? "bg-green-500" :
                    aiSummaryData?.category === "Low" ? "bg-red-500" : "bg-yellow-500"
                  }`}></div>
                  <p className="font-medium">{aiSummaryData?.category || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex flex-col">
                <p className="text-green-600 font-medium mb-1">Reason :</p>
                <p className="text-gray-600">
                  {aiSummaryData?.reason || "No reason provided"}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
