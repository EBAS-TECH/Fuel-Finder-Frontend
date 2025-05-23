import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  profile_pic: string;
  role: string;
}

interface Feedback {
  id: string;
  user_id: string;
  station_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string | null;
}

interface Station {
  id: string;
  en_name: string;
  logo: string;
  address: string;
  city: string;
  average_rating: number;
  created_at: string;
  updated_at: string | null;
}

export default function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [driver, setDriver] = useState<User | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stations, setStations] = useState<Record<string, Station>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const itemsPerPage = 3;

  const authToken =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const driverResponse = await fetch(`${API_BASE_URL}/api/user/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (!driverResponse.ok)
          throw new Error("Failed to fetch driver details");
        const driverData = await driverResponse.json();
        setDriver(driverData.data);

        const feedbackResponse = await fetch(
          `${API_BASE_URL}/api/feedback/user/${id}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        if (!feedbackResponse.ok) throw new Error("Failed to fetch feedbacks");
        const feedbackData = await feedbackResponse.json();
        setFeedbacks(feedbackData.data);

        const stationsData: Record<string, Station> = {};

        await Promise.all(
          feedbackData.data.map(async (feedback: Feedback) => {
            try {
              const stationResponse = await fetch(
                `${API_BASE_URL}/api/station/${feedback.station_id}`,
                {
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                  },
                }
              );

              if (stationResponse.ok) {
                const stationData = await stationResponse.json();
                stationsData[feedback.station_id] = {
                  id: feedback.station_id,
                  en_name: stationData.data.en_name,
                  logo: stationData.data.logo,
                  address: stationData.data.address,
                  city: stationData.data.city,
                  average_rating: stationData.data.average_rating || 0,
                  created_at: stationData.data.created_at,
                  updated_at: stationData.data.updated_at,
                };
              }
            } catch (err) {
              console.error(
                `Failed to fetch station ${feedback.station_id}:`,
                err
              );
            }
          })
        );

        setStations(stationsData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        toast({
          title: "Error",
          description:
            err instanceof Error ? err.message : "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, authToken, toast]);

  useEffect(() => {
    if (filter.includes("star")) {
      setStarFilter(parseInt(filter.split("-")[0]));
    } else {
      setStarFilter(null);
    }
  }, [filter]);

  const filteredFeedbacks = feedbacks
    .filter((feedback) => {
      if (starFilter !== null && feedback.rating !== starFilter) return false;

      if (dateRange?.from || dateRange?.to) {
        const feedbackDate = new Date(feedback.created_at);
        if (dateRange.from && feedbackDate < dateRange.from) return false;
        if (dateRange.to && feedbackDate > dateRange.to) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sort === "newest")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      if (sort === "oldest")
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      if (sort === "highest") return b.rating - a.rating;
      if (sort === "lowest") return a.rating - b.rating;
      return 0;
    });

  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
  const paginatedFeedbacks = filteredFeedbacks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Star
          key={index}
          className={`h-5 w-5 ${
            index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
          }`}
        />
      ));
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    setIsCalendarOpen(false); // Close the calendar after selection
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!driver) return <div className="p-6">Driver not found</div>;

  return (
    <div>
      <div className="flex items-center mb-5">
        <div className="flex items-center text-emerald-500">
          <User className="h-6 w-6 mr-2" />
          <h1 className="text-xl font-medium">Drivers</h1>
        </div>
        <p className="text-gray-400 text-sm ml-2">Drivers management</p>
      </div>

      <div className="bg-[#F1F7F7] p-6 rounded-lg">
        <Link
          to="/admin/drivers"
          className="flex items-center text-emerald-600 mb-5 hover:underline"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          <span>Driver's Detail</span>
        </Link>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-lg flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border-4 border-emerald-100 mb-5 overflow-hidden">
              <img
                src={driver.profile_pic}
                alt={`${driver.first_name} ${driver.last_name}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/150";
                }}
              />
            </div>
            <h3 className="text-xl font-medium mb-1">{`${driver.first_name} ${driver.last_name}`}</h3>
            <p className="text-gray-500 mb-1">@{driver.username}</p>
            <p className="text-gray-500">{driver.email}</p>
            <p className="text-gray-500 mt-2 capitalize">
              {driver.role.toLowerCase().replace("_", " ")}
            </p>
          </div>

          <div className="col-span-12 md:col-span-8">
            <div className="bg-white rounded-lg p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-medium">
                  Feedbacks ({filteredFeedbacks.length})
                </h3>
                <div className="flex gap-2">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-32 border-none bg-gray-100">
                      <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="1-star">1 Star</SelectItem>
                      <SelectItem value="2-star">2 Stars</SelectItem>
                      <SelectItem value="3-star">3 Stars</SelectItem>
                      <SelectItem value="4-star">4 Stars</SelectItem>
                      <SelectItem value="5-star">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-32 border-none bg-gray-100">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="highest">Highest Rating</SelectItem>
                      <SelectItem value="lowest">Lowest Rating</SelectItem>
                    </SelectContent>
                  </Select>

                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-32 border-none bg-gray-100 justify-start text-left font-normal"
                      >
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "MMM dd")} -{" "}
                              {format(dateRange.to, "MMM dd")}
                            </>
                          ) : (
                            format(dateRange.from, "MMM dd")
                          )
                        ) : (
                          <span>Date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={handleDateRangeSelect}
                        numberOfMonths={1} // Display only one month
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-4">
                {paginatedFeedbacks.length > 0 ? (
                  paginatedFeedbacks.map((feedback) => {
                    const station = stations[feedback.station_id];
                    return (
                      <div
                        key={feedback.id}
                        className="border-l-4 border-emerald-500 pl-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <img
                                src={driver.profile_pic}
                                alt={`${driver.first_name} ${driver.last_name}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://via.placeholder.com/40";
                                }}
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-emerald-700">{`${driver.first_name} ${driver.last_name}`}</h4>
                              <p className="text-xs text-gray-400">
                                {format(
                                  new Date(feedback.created_at),
                                  "dd MMM yyyy"
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {renderStars(feedback.rating)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {feedback.comment}
                        </p>

                        {station && (
                          <div className="flex justify-end items-center gap-3 bg-gray-50 p-2 rounded-lg">
                            <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200">
                              <img
                                src={station.logo}
                                alt={station.en_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://via.placeholder.com/56";
                                }}
                              />
                            </div>
                            <div className="text-right">
                              <h5 className="text-sm font-medium">
                                {station.en_name}
                              </h5>
                              <div className="flex items-center gap-1 justify-end mt-1">
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-md">
                                  {station.average_rating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No feedbacks found matching your criteria
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredFeedbacks.length
                    )}{ " "}
                    of {filteredFeedbacks.length} feedbacks
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="p-1.5 rounded-full bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            currentPage === page
                              ? "bg-emerald-500 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      className="p-1.5 rounded-full bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
