import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FuelAvailability {
  id: string;
  station_id: string;
  fuel_type: string;
  up_time: string;
  down_time: string | null;
  available: boolean;
  availability_duration: string | null;
  available_hrs?: string;
}

const FuelAvailability = () => {
  const { toast } = useToast();
  const [fuels, setFuels] = useState<FuelAvailability[]>([]);
  const [filteredFuels, setFilteredFuels] = useState<FuelAvailability[]>([]);
  const [page, setPage] = useState(1);
  const [fuelAvailability, setFuelAvailability] = useState({
    diesel: false,
    petrol: false,
  });
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedFuel, setSelectedFuel] = useState("all");
  const [stationId, setStationId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Constants for pagination
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(filteredFuels.length / ITEMS_PER_PAGE);
  const paginatedFuels = filteredFuels.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Fetch station ID
  useEffect(() => {
    const fetchStationId = async () => {
      try {
        const token =
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("authToken");
        const userId =
          localStorage.getItem("userId") || sessionStorage.getItem("userId");

        if (!token || !userId) {
          throw new Error("Authentication credentials not found");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/station/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to fetch station details"
          );
        }

        const data = await response.json();
        setStationId(data.data.id);
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchStationId();
  }, [toast]);

  // Fetch fuel availability data
  const fetchFuelAvailability = async () => {
    if (!stationId) return;

    setIsLoading(true);
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/availability/station/${stationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to fetch fuel availability data"
        );
      }

      const data = await response.json();

      if (!data.data) {
        throw new Error("Invalid data structure from API");
      }

      // Process the data to keep only the most recent record for each fuel type
      const latestRecords = data.data.reduce(
        (acc: FuelAvailability[], current: FuelAvailability) => {
          const existingIndex = acc.findIndex(
            (item) => item.fuel_type === current.fuel_type
          );
          if (existingIndex === -1) {
            acc.push(current);
          } else {
            // Replace if current record is more recent
            if (
              new Date(current.up_time) > new Date(acc[existingIndex].up_time)
            ) {
              acc[existingIndex] = current;
            }
          }
          return acc;
        },
        []
      );

      const fuelsWithHours = latestRecords.map((fuel: FuelAvailability) => ({
        ...fuel,
        available_hrs: fuel.availability_duration
          ? (parseFloat(fuel.availability_duration) / (1000 * 60 * 60)).toFixed(2)
          : "0.00",
      }));

      setFuels(fuelsWithHours);
      setFilteredFuels(fuelsWithHours);

      // Update current fuel status
      const currentStatus = {
        diesel: fuelsWithHours.some(
          (f) => f.fuel_type === "DIESEL" && f.available
        ),
        petrol: fuelsWithHours.some(
          (f) => f.fuel_type === "PETROL" && f.available
        ),
      };
      setFuelAvailability(currentStatus);
    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelAvailability();
  }, [stationId, toast]);

  const toggleFuel = async (fuelType: string) => {
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${API_BASE_URL}/api/availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          station_id: stationId,
          fuel_type: fuelType.toUpperCase(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update fuel availability"
        );
      }

      const data = await response.json();

      // Update the fuels state with the new data
      setFuels((prevFuels) => {
        const existingIndex = prevFuels.findIndex(
          (f) => f.fuel_type === fuelType.toUpperCase()
        );

        if (existingIndex >= 0) {
          const updatedFuels = [...prevFuels];
          updatedFuels[existingIndex] = {
            ...updatedFuels[existingIndex],
            available: data.data.available,
            down_time: data.data.down_time,
            availability_duration: data.data.availability_duration,
            available_hrs: data.data.availability_duration
              ? (
                  parseFloat(data.data.availability_duration) /
                  (1000 * 60 * 60)
                ).toFixed(2)
              : "0.00",
          };
          return updatedFuels;
        } else {
          // If it's a new record (shouldn't happen but just in case)
          return [
            ...prevFuels,
            {
              id: data.data.id,
              station_id: stationId,
              fuel_type: fuelType.toUpperCase(),
              up_time: data.data.up_time,
              down_time: data.data.down_time,
              available: data.data.available,
              availability_duration: data.data.availability_duration,
              available_hrs: data.data.availability_duration
                ? (
                    parseFloat(data.data.availability_duration) /
                    (1000 * 60 * 60)
                  ).toFixed(2)
                : "0.00",
            },
          ];
        }
      });

      // Update filtered fuels as well
      setFilteredFuels((prev) => {
        const existingIndex = prev.findIndex(
          (f) => f.fuel_type === fuelType.toUpperCase()
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            available: data.data.available,
            down_time: data.data.down_time,
            availability_duration: data.data.availability_duration,
            available_hrs: data.data.availability_duration
              ? (
                  parseFloat(data.data.availability_duration) /
                  (1000 * 60 * 60)
                ).toFixed(2)
              : "0.00",
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: data.data.id,
              station_id: stationId,
              fuel_type: fuelType.toUpperCase(),
              up_time: data.data.up_time,
              down_time: data.data.down_time,
              available: data.data.available,
              availability_duration: data.data.availability_duration,
              available_hrs: data.data.availability_duration
                ? (
                    parseFloat(data.data.availability_duration) /
                    (1000 * 60 * 60)
                  ).toFixed(2)
                : "0.00",
            },
          ];
        }
      });

      // Update the toggle status
      setFuelAvailability((prev) => ({
        ...prev,
        [fuelType.toLowerCase()]: data.data.available,
      }));

      toast({
        title: "Success",
        description: data.message,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filterFuelAvailability = async () => {
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/availability/duration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            start_date: startDate ? format(startDate, "yyyy-MM-dd") : null,
            end_date: endDate ? format(endDate, "yyyy-MM-dd") : null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to filter fuel availability"
        );
      }

      const data = await response.json();

      // Process the data to create a similar structure as before
      const processedData = data.data.map((item) => ({
        id: `${item.fuel_type}-${Date.now()}`, // Generate a unique ID
        station_id: stationId,
        fuel_type: item.fuel_type,
        up_time: format(
          startDate || new Date(),
          "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        ),
        down_time: format(
          endDate || new Date(),
          "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        ),
        available: true, // Assuming the fuel was available during the period
        availability_duration: item.total_milliseconds,
        available_hrs: (
          parseFloat(item.total_milliseconds) /
          (1000 * 60 * 60) // Convert milliseconds to hours
        ).toFixed(2),
      }));

      let filteredData = processedData;

      if (selectedFuel !== "all") {
        filteredData = filteredData.filter(
          (fuel) => fuel.fuel_type.toLowerCase() === selectedFuel.toLowerCase()
        );
      }

      setFilteredFuels(filteredData);
      setPage(1); // Reset to first page when filtering
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (selectedFuel === "all") {
      setFilteredFuels(fuels);
    } else {
      setFilteredFuels(
        fuels.filter(
          (fuel) => fuel.fuel_type.toLowerCase() === selectedFuel.toLowerCase()
        )
      );
    }
    setPage(1); // Reset to first page when changing fuel type filter
  }, [selectedFuel, fuels]);

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <div className="flex-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-6 h-6 text-fuelGreen-500 inline-block mr-2"
          >
            <rect
              x="3"
              y="6"
              width="18"
              height="15"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            ></rect>
            <path d="M3 10H21" stroke="currentColor" strokeWidth="2"></path>
            <path d="M8 14H16" stroke="currentColor" strokeWidth="2"></path>
            <path
              d="M8 3L8 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            ></path>
            <path
              d="M16 3L16 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            ></path>
          </svg>
          <h1 className="text-xl font-semibold text-fuelGreen-500 inline-block">
            Fuel Availability
          </h1>
          <p className="text-gray-500 ml-8">
            Availability of fuel at your station
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 flex items-center justify-between flex-wrap gap-3 bg-fuelGreen-50">
              <h2 className="font-medium text-fuelGreen-700">
                Fuel Availability
              </h2>
              <div className="flex flex-wrap gap-2">
                <Select value={selectedFuel} onValueChange={setSelectedFuel}>
                  <SelectTrigger className="w-[150px] bg-white">
                    <SelectValue placeholder="Fuel Type">
                      {selectedFuel === "all"
                        ? "All Fuel Types"
                        : selectedFuel.charAt(0).toUpperCase() +
                          selectedFuel.slice(1)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fuel Types</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="petrol">Petrol</SelectItem>
                  </SelectContent>
                </Select>

                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-[150px] justify-between text-left font-normal"
                    >
                      <span className="text-muted-foreground">
                        {startDate
                          ? format(startDate, "dd MMM yyyy")
                          : "Start Date"}
                      </span>
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setStartDateOpen(false); // Close popover after selection
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-[150px] justify-between text-left font-normal"
                    >
                      <span className="text-muted-foreground">
                        {endDate ? format(endDate, "dd MMM yyyy") : "End Date"}
                      </span>
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setEndDateOpen(false); // Close popover after selection
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Button
                  className="bg-fuelGreen-500 hover:bg-fuelGreen-600"
                  onClick={filterFuelAvailability}
                >
                  Filter
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-fuelGreen-500 text-white">
                  <tr>
                    <th className="py-3 px-4 text-left">ID</th>
                    <th className="py-3 px-4 text-left">Fuel Name</th>
                    <th className="py-3 px-4 text-left">Start Date</th>
                    <th className="py-3 px-4 text-left">End Date</th>
                    <th className="py-3 px-4 text-left">Available Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredFuels.length > 0 ? (
                    (filteredFuels.length > ITEMS_PER_PAGE
                      ? paginatedFuels
                      : filteredFuels
                    ).map((fuel, index) => (
                      <tr
                        key={fuel.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          {(page - 1) * ITEMS_PER_PAGE + index + 1}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {fuel.fuel_type}
                        </td>
                        <td className="py-3 px-4">
                          {fuel.up_time
                            ? format(
                                new Date(fuel.up_time),
                                "dd MMM yyyy HH:mm"
                              )
                            : "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          {fuel.down_time
                            ? format(
                                new Date(fuel.down_time),
                                "dd MMM yyyy HH:mm"
                              )
                            : "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-fuelGreen-600 font-medium">
                            {fuel.available_hrs} hrs
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-4 text-center text-gray-500"
                      >
                        No fuel availability records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredFuels.length > ITEMS_PER_PAGE && (
              <div className="p-4 flex items-center justify-between border-t">
                <div className="text-sm text-gray-500">
                  Showing {paginatedFuels.length} of {filteredFuels.length} fuel
                  types
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span className="sr-only">Previous</span>
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNumber) => (
                      <Button
                        key={pageNumber}
                        size="sm"
                        className={`h-8 w-8 rounded-full ${
                          page === pageNumber
                            ? "bg-fuelGreen-500 hover:bg-fuelGreen-600"
                            : "bg-white"
                        }`}
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span className="sr-only">Next</span>
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card className="p-4">
            <h2 className="text-lg font-medium mb-4 text-fuelGreen-700">
              Fuel Status
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="diesel" className="font-medium">
                    Diesel
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Regular diesel fuel
                  </p>
                </div>
                <Switch
                  id="diesel"
                  checked={fuelAvailability.diesel}
                  onCheckedChange={() => toggleFuel("diesel")}
                  className="data-[state=checked]:bg-fuelGreen-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="petrol" className="font-medium">
                    Petrol
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">Regular unleaded</p>
                </div>
                <Switch
                  id="petrol"
                  checked={fuelAvailability.petrol}
                  onCheckedChange={() => toggleFuel("petrol")}
                  className="data-[state=checked]:bg-fuelGreen-500"
                />
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-md border border-amber-100 flex items-start gap-3">
                <div className="bg-amber-200 text-amber-800 rounded-full p-1 mt-0.5">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Important Notice
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Remember to keep your fuel status updated for customers.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FuelAvailability;