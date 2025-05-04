import { useState } from "react";
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

// Mock data
const initialFuels = [
  {
    id: 1,
    name: "Diesel",
    startDate: "22 Jan 2024",
    endDate: "29 Jan 2024",
    availableHrs: 11,
    available: true,
  },
  {
    id: 2,
    name: "Gasoline",
    startDate: "22 Jan 2024",
    endDate: "29 Jan 2024",
    availableHrs: 6.5,
    available: false,
  },
  {
    id: 3,
    name: "Premium",
    startDate: "22 Jan 2024",
    endDate: "29 Jan 2024",
    availableHrs: 8,
    available: true,
  },
];

const FuelAvailability = () => {
  const [fuels] = useState(initialFuels);
  const [page, setPage] = useState(1);
  const [fuelAvailability, setFuelAvailability] = useState({
    diesel: true,
    gasoline: false,
    premium: true,
  });
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedFuel, setSelectedFuel] = useState("");

  const toggleFuel = (key: string) => {
    setFuelAvailability((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

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
              <h2 className="font-medium text-fuelGreen-700">Fuel Availability</h2>
              <div className="flex flex-wrap gap-2">
                {/* Fuel Type Dropdown */}
                <Select value={selectedFuel} onValueChange={setSelectedFuel}>
                  <SelectTrigger className="w-[150px] bg-white">
                    <SelectValue placeholder="Fuel Type">
                      {selectedFuel ? selectedFuel : "Fuel Type"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fuel Types</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="gasoline">Gasoline</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
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
                        {startDate ? format(startDate, "dd MMM yyyy") : "Start Date"}
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

                <Button className="bg-fuelGreen-500 hover:bg-fuelGreen-600">
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
                  {fuels.map((fuel) => (
                    <tr key={fuel.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{fuel.id}</td>
                      <td className="py-3 px-4 font-medium">{fuel.name}</td>
                      <td className="py-3 px-4">{fuel.startDate}</td>
                      <td className="py-3 px-4">{fuel.endDate}</td>
                      <td className="py-3 px-4">
                        {fuel.availableHrs === 11 ? (
                          <span className="text-fuelGreen-600 font-medium">11</span>
                        ) : (
                          fuel.availableHrs
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-500">
                Showing {fuels.length} fuel types
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
            <h2 className="text-lg font-medium mb-4 text-fuelGreen-700">Fuel Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="diesel" className="font-medium">Diesel</Label>
                  <p className="text-xs text-gray-500 mt-1">Regular diesel fuel</p>
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
                  <Label htmlFor="gasoline" className="font-medium">Gasoline</Label>
                  <p className="text-xs text-gray-500 mt-1">Regular unleaded</p>
                </div>
                <Switch
                  id="gasoline"
                  checked={fuelAvailability.gasoline}
                  onCheckedChange={() => toggleFuel("gasoline")}
                  className="data-[state=checked]:bg-fuelGreen-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="premium" className="font-medium">Premium</Label>
                  <p className="text-xs text-gray-500 mt-1">High octane fuel</p>
                </div>
                <Switch
                  id="premium"
                  checked={fuelAvailability.premium}
                  onCheckedChange={() => toggleFuel("premium")}
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
                  <p className="text-sm font-medium text-amber-800">Important Notice</p>
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