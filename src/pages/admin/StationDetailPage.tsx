import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Star, Mail, MapPin, Globe, Filter } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";

interface Station {
  id: string;
  en_name: string;
  am_name: string;
  email?: string;
  address: string;
  latitude: number;
  longitude: number;
  username?: string;
  status: "VERIFIED" | "REJECTED" | "PENDING";
  tin_number: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  availability: boolean;
}

interface Feedback {
  id: string;
  user_id: string;
  station_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  reviewer?: string;
}

interface FuelAvailability {
  id: string;
  fuelName: string;
  startDate: string;
  endDate: string;
  availableQty: string;
}

export default function StationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("Stars");
  const [sort, setSort] = useState("Date");
  const [fuelType, setFuelType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [station, setStation] = useState<Station | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [fuelAvailability, setFuelAvailability] = useState<FuelAvailability[]>(
    []
  );

  const authToken =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  useEffect(() => {
    const fetchStationData = async () => {
      try {
        setLoading(true);

        // Check if we have cached station data
        const cachedStation =
          localStorage.getItem(`station_${id}`) ||
          sessionStorage.getItem(`station_${id}`);

        if (cachedStation) {
          setStation(JSON.parse(cachedStation));
        }

        // Fetch station details
        const stationResponse = await fetch(
          `http://localhost:5001/api/station/${id}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!stationResponse.ok)
          throw new Error("Failed to fetch station details");

        const stationData = await stationResponse.json();
        setStation(stationData.data);

        // Cache the station data
        if (localStorage.getItem("authToken")) {
          localStorage.setItem(
            `station_${id}`,
            JSON.stringify(stationData.data)
          );
        } else {
          sessionStorage.setItem(
            `station_${id}`,
            JSON.stringify(stationData.data)
          );
        }

        // Fetch feedbacks using user_id from station data
        if (stationData.data.user_id) {
          const feedbackResponse = await fetch(
            `http://localhost:5001/api/feedback/user/${stationData.data.user_id}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          if (feedbackResponse.ok) {
            const feedbackData = await feedbackResponse.json();
            const feedbacksWithReviewer = feedbackData.data.map(
              (fb: Feedback) => ({
                ...fb,
                reviewer: fb.user_id, // Using user_id as reviewer name for now
              })
            );
            setFeedbacks(feedbacksWithReviewer);
          }
        }

        // For now, using sample fuel availability data
        setFuelAvailability([
          {
            id: "1",
            fuelName: "Diesel",
            startDate: "22 Jan 2024",
            endDate: "29 Jan 2024",
            availableQty: "11",
          },
          {
            id: "2",
            fuelName: "Gasoline",
            startDate: "22 Jan 2024",
            endDate: "29 Jan 2024",
            availableQty: "6.5",
          },
        ]);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to load station data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (authToken && id) {
      fetchStationData();
    } else {
      navigate("/login");
    }
  }, [id, authToken, navigate, toast]);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusChange = async (
    newStatus: "VERIFIED" | "REJECTED" | "PENDING"
  ) => {
    if (!station) return;

    try {
      const response = await fetch(
        `http://localhost:5001/api/station/verify-station/${station.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update station status");
      }

      // Update local station status
      const updatedStation = { ...station, status: newStatus };
      setStation(updatedStation);

      // Update cached data
      if (localStorage.getItem("authToken")) {
        localStorage.setItem(`station_${id}`, JSON.stringify(updatedStation));
      } else {
        sessionStorage.setItem(`station_${id}`, JSON.stringify(updatedStation));
      }

      toast({
        title: "Success",
        description: `Station status updated to ${newStatus}`,
      });

      // Navigate back to stations list if status changed from PENDING
      if (station.status === "PENDING" && newStatus !== "PENDING") {
        navigate("/admin/stations");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsDialogOpen(false);
    }
  };

  if (loading || !station) {
    return <div className="p-6">Loading station details...</div>;
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
          to="/admin/stations"
          className="flex items-center text-green-500 mb-5 hover:underline"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Station's Detail</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Station info card */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden p-2 border flex items-center justify-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400"
                >
                  <path d="M3 9h18v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                  <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                  <path d="M12 3v6" />
                </svg>
              </div>

              <h2 className="text-lg font-medium text-center mb-1">
                {station.en_name}
              </h2>
              <p className="text-center text-sm text-gray-500 mb-3">
                {station.am_name}
              </p>

              <div className="flex items-center mb-5">
                {renderStars(3)}
                <span className="ml-2">3.0</span>
              </div>

              <div className="w-full space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="text-green-500 h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm">{station.email || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="text-green-500 h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-sm">{station.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="text-green-500 h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">TIN Number</p>
                    <p className="text-sm">{station.tin_number}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="text-green-500 h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Coordinates</p>
                    <p className="text-sm">
                      {station.latitude.toFixed(6)},{" "}
                      {station.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback section */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm h-full relative">
              {/* Status dropdown at the top */}
              <div className="flex justify-end mb-4">
                <Select
                  value={station.status}
                  onValueChange={(value) =>
                    handleStatusChange(
                      value as "VERIFIED" | "REJECTED" | "PENDING"
                    )
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="VERIFIED">Verified</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-medium">Feedbacks</h3>
                <div className="flex gap-2">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-28 border border-gray-200 text-sm">
                      <SelectValue placeholder="Stars" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stars">Stars</SelectItem>
                      <SelectItem value="Newest">Newest</SelectItem>
                      <SelectItem value="Oldest">Oldest</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-28 border border-gray-200 text-sm">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Date">Date</SelectItem>
                      <SelectItem value="Rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-6">
                {feedbacks.length > 0 ? (
                  feedbacks.slice(0, 3).map((feedback) => (
                    <div
                      key={feedback.id}
                      className="border-l-4 border-green-500 pl-4 mb-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
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
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-green-700">
                              {feedback.reviewer}
                            </h4>
                            <p className="text-xs text-gray-400">
                              {new Date(feedback.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {renderStars(feedback.rating)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {feedback.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No feedbacks available for this station
                  </p>
                )}
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
                          if (currentPage > 1)
                            handlePageChange(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "opacity-50" : ""}
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
                          if (currentPage < 2)
                            handlePageChange(currentPage + 1);
                        }}
                        className={currentPage === 2 ? "opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section with fuel availability */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Fuel Availability Report</h3>

          <div className="flex flex-wrap gap-2 mb-4">
            <Select value={fuelType} onValueChange={setFuelType}>
              <SelectTrigger className="w-32 border border-gray-200">
                <SelectValue placeholder="Fuel Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="gasoline">Gasoline</SelectItem>
              </SelectContent>
            </Select>

            <Select value={startDate} onValueChange={setStartDate}>
              <SelectTrigger className="w-32 border border-gray-200">
                <SelectValue placeholder="Start Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="22-jan-2024">22 Jan 2024</SelectItem>
                <SelectItem value="23-jan-2024">23 Jan 2024</SelectItem>
              </SelectContent>
            </Select>

            <Select value={endDate} onValueChange={setEndDate}>
              <SelectTrigger className="w-32 border border-gray-200">
                <SelectValue placeholder="End Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="29-jan-2024">29 Jan 2024</SelectItem>
                <SelectItem value="30-jan-2024">30 Jan 2024</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-green-500 hover:bg-green-600 text-white px-4">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <Table className="w-full border border-gray-100">
            <TableHeader>
              <TableRow>
                <TableHead className="bg-green-500 text-white font-normal w-16">
                  ID
                </TableHead>
                <TableHead className="bg-green-500 text-white font-normal">
                  Fuel Name
                </TableHead>
                <TableHead className="bg-green-500 text-white font-normal">
                  Start Date
                </TableHead>
                <TableHead className="bg-green-500 text-white font-normal">
                  End Date
                </TableHead>
                <TableHead className="bg-green-500 text-white font-normal text-center">
                  Available hrs
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fuelAvailability.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.fuelName}</TableCell>
                  <TableCell>{item.startDate}</TableCell>
                  <TableCell>{item.endDate}</TableCell>
                  <TableCell className="text-center">
                    {item.availableQty}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing 1 - {fuelAvailability.length} of {fuelAvailability.length}
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`p-1.5 rounded-full ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400"
                        : "bg-gray-200 text-gray-600"
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
                      currentPage === 1
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    1
                  </button>
                </PaginationItem>
                <PaginationItem>
                  <button
                    onClick={() => handlePageChange(2)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentPage === 2
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    2
                  </button>
                </PaginationItem>
                <PaginationItem>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={`p-1.5 rounded-full ${
                      currentPage === 2
                        ? "bg-gray-100 text-gray-400"
                        : "bg-gray-200 text-gray-600"
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
    </div>
  );
}
