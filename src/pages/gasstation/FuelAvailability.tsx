import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CalendarIcon, ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const FuelAvailability = () => {
  const { toast } = useToast();
  const [fuels, setFuels] = useState([]);
  const [filteredFuels, setFilteredFuels] = useState([]);
  const [page, setPage] = useState(1);
  const [fuelAvailability, setFuelAvailability] = useState({
    diesel: false,
    petrol: false,
  });
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedFuel, setSelectedFuel] = useState("all");
  const [stationId, setStationId] = useState("");

  // Fetch station ID
  useEffect(() => {
    const fetchStationId = async () => {
      try {
        const token =
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("authToken");
        const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
        const response = await fetch(
          `http://localhost:5001/api/station/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch station details");
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
  }, []);

  // Fetch fuel availability data
  useEffect(() => {
    if (!stationId) return;

    const fetchFuelAvailability = async () => {
      try {
        const token =
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("authToken");
        const response = await fetch(
          `http://localhost:5001/api/availability/station/${stationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch fuel availability data");
        }

        const data = await response.json();
        const fuelsWithHours = data.data.map((fuel) => ({
          ...fuel,
          available_hrs: (parseFloat(fuel.availability_duration) / (1000 * 60 * 60)).toFixed(2),
        }));
        setFuels(fuelsWithHours);
        setFilteredFuels(fuelsWithHours);

        // Update fuel availability status
        const initialAvailability = {
          diesel: false,
          petrol: false,
        };
        data.data.forEach((fuel) => {
          initialAvailability[fuel.fuel_type.toLowerCase()] = fuel.available;
        });
        setFuelAvailability(initialAvailability);
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchFuelAvailability();
  }, [stationId]);

  const toggleFuel = async (key) => {
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      
      const fuelType = key.toUpperCase();
      const endpoint = fuelAvailability[key] 
        ? `http://localhost:5001/api/availability/${stationId}`
        : `http://localhost:5001/api/availability/isAvailable/${stationId}`;
      
      const method = fuelAvailability[key] ? "DELETE" : "PUT";

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fuel_type: fuelType
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update fuel availability");
      }

      const data = await response.json();
      setFuelAvailability((prev) => ({
        ...prev,
        [key]: !prev[key as keyof typeof prev],
      }));

      toast({
        title: "Success",
        description: data.message,
      });

      // Refresh the data after toggling
      const refreshResponse = await fetch(
        `http://localhost:5001/api/availability/station/${stationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        const fuelsWithHours = refreshData.data.map((fuel) => ({
          ...fuel,
          available_hrs: (parseFloat(fuel.availability_duration) / (1000 * 60 * 60)).toFixed(2),
        }));
        setFuels(fuelsWithHours);
        setFilteredFuels(fuelsWithHours);
      }
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
      const response = await fetch(
        "http://localhost:5001/api/availability/duration",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            start_date: startDate ? format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'") : null,
            end_date: endDate ? format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'") : null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to filter fuel availability data");
      }

      const data = await response.json();
      const filteredData = data.data.map((fuel) => ({
        ...fuel,
        available_hrs: (parseFloat(fuel.total_milliseconds) / (1000 * 60 * 60)).toFixed(2),
      }));

      let result = filteredData;
      if (selectedFuel !== "all") {
        result = filteredData.filter((fuel) => fuel.fuel_type.toLowerCase() === selectedFuel);
      }

      setFilteredFuels(result);
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
      setFilteredFuels(fuels.filter((fuel) => fuel.fuel_type.toLowerCase() === selectedFuel));
    }
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
                {/* Fuel Type Dropdown */}
                <Select value={selectedFuel} onValueChange={setSelectedFuel}>
                  <SelectTrigger className="w-[150px] bg-white">
                    <SelectValue placeholder="Fuel Type">
                      {selectedFuel ? selectedFuel.charAt(0).toUpperCase() + selectedFuel.slice(1) : "Fuel Type"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fuel Types</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="petrol">Petrol</SelectItem>
                  </SelectContent>
                </Select>

                {/* Start Date Picker */}
                <Popover>
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
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* End Date Picker */}
                <Popover>
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
                      onSelect={setEndDate}
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
                    <th className="py-3 px-4 text-left">Available hrs</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFuels.map((fuel, index) => (
                    <tr
                      key={fuel.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4 font-medium">
                        {fuel.fuel_type}
                      </td>
                      <td className="py-3 px-4">{fuel.up_time}</td>
                      <td className="py-3 px-4">
                        {fuel.down_time || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        {fuel.available_hrs ? (
                          <span className="text-fuelGreen-600 font-medium">
                            {fuel.available_hrs}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-500">
                Showing {filteredFuels.length} fuel types
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
                <Button
                  size="sm"
                  className="h-8 w-8 rounded-full bg-fuelGreen-500 hover:bg-fuelGreen-600"
                  onClick={() => setPage(1)}
                >
                  1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setPage(2)}
                >
                  2
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
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