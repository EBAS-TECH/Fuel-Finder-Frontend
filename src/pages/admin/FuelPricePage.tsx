import React, { useState, useEffect } from "react";
import { Search, Pencil, Trash2, X, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FuelPrice {
  id: string;
  fuel_type: string;
  price: number;
  created_at: string;
  effective_upto: string | null;
}

const Spinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
  </div>
);

export default function FuelPricePage() {
  const [fuelPrices, setFuelPrices] = useState<FuelPrice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTypeDialog, setDeleteTypeDialog] = useState({
    open: false,
    fuelType: "",
  });

  // Form state
  const [fuelType, setFuelType] = useState("PETROL");
  const [price, setPrice] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [error, setError] = useState("");

  const getAuthToken = () => {
    return localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  };

  const checkAuth = () => {
    const token = getAuthToken();
    if (!token) {
      window.location.href = "/login";
      return false;
    }
    return true;
  };

  const fetchFuelPrices = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/price`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch fuel prices");
      }

      setFuelPrices(data.data);
    } catch (error: any) {
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
    if (!checkAuth()) return;
    fetchFuelPrices();
  }, []);

  const filteredFuelPrices = fuelPrices.filter(fuel =>
    fuel.fuel_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fuelTypeExists = (type: string) => {
    return fuelPrices.some(fuel => fuel.fuel_type === type);
  };

  const handleAddFuelPrice = () => {
    if (!checkAuth()) return;

    setFuelType("PETROL");
    setPrice("");
    setStartDate(new Date());
    setEndDate(null);
    setIsEditMode(false);
    setIsDialogOpen(true);
    setError("");
  };

  const handleEditFuelPrice = (fuel: FuelPrice) => {
    if (!checkAuth()) return;

    setFuelType(fuel.fuel_type);
    setPrice(fuel.price.toString());
    setStartDate(new Date(fuel.created_at));
    setEndDate(fuel.effective_upto ? new Date(fuel.effective_upto) : null);
    setIsEditMode(true);
    setIsDialogOpen(true);
    setError("");
  };

  const handleDeleteFuelPriceByType = async (fuelType: string) => {
    if (!checkAuth()) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/price/${fuelType}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete fuel price");
      }

      await fetchFuelPrices(); // Refresh data after deletion

      toast({
        title: "Success",
        description: `All ${fuelType} prices deleted successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const confirmDeleteByType = (type: string) => {
    setDeleteTypeDialog({
      open: true,
      fuelType: type,
    });
  };

  const executeDeleteByType = async () => {
    await handleDeleteFuelPriceByType(deleteTypeDialog.fuelType);
    setDeleteTypeDialog({
      open: false,
      fuelType: "",
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkAuth()) return;

    if (!price || !startDate) {
      setError("Please fill all required fields");
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue)) {
      setError("Please enter a valid price");
      return;
    }

    if (!isEditMode && fuelTypeExists(fuelType)) {
      setError(`${fuelType} price already exists. Please edit the existing one.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("User not authenticated");
      }

      const payload = {
        fuel_type: fuelType,
        price: priceValue,
        created_at: startDate.toISOString(),
        effective_upto: endDate?.toISOString() || null
      };

      const url = isEditMode
        ? `${API_BASE_URL}/api/price/${fuelType}`
        : `${API_BASE_URL}/api/price`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${isEditMode ? 'update' : 'create'} fuel price`);
      }

      await fetchFuelPrices(); // Refresh data after successful operation

      toast({
        title: "Success",
        description: `Fuel price ${isEditMode ? 'updated' : 'created'} successfully`,
      });

      setIsDialogOpen(false); // Close the dialog
    } catch (error: any) {
      setError(error.message || "Failed to save fuel price");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div>
      {/* Header and search section */}
      <div className="flex items-center mb-5">
        <div className="flex items-center text-green-500">
          <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 10h.01M16 10h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-xl font-medium">Fuel Price</h1>
        </div>
        <p className="text-gray-400 text-sm ml-2">Fuel Price Management</p>
      </div>

      <div className="bg-[#F1F7F7] p-6 rounded-lg">
        <div className="flex justify-end items-center mb-4 gap-4">
  <div className="relative w-64">
    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <Input
      placeholder="Search fuel type"
      className="pl-10 bg-white border rounded-lg h-9 focus:ring-green-500"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>
  
  <Button
    onClick={handleAddFuelPrice}
    className="bg-green-500 hover:bg-green-600 text-white whitespace-nowrap border border-green-500 rounded-lg shadow-sm"
  >
    Add Fuel Type
  </Button>
</div>

        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-green-500 text-white font-normal w-16 text-center">ID</TableHead>
                <TableHead className="bg-green-500 text-white font-normal">Fuel Type</TableHead>
                <TableHead className="bg-green-500 text-white font-normal">Price (Br/L)</TableHead>
                <TableHead className="bg-green-500 text-white font-normal">Start Date</TableHead>
                <TableHead className="bg-green-500 text-white font-normal">End Date</TableHead>
                <TableHead className="bg-green-500 text-white font-normal text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFuelPrices.map((fuel, index) => (
                <TableRow key={fuel.id}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell>{fuel.fuel_type}</TableCell>
                  <TableCell>{fuel.price.toFixed(2)}</TableCell>
                  <TableCell>{format(new Date(fuel.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    {fuel.effective_upto ? format(new Date(fuel.effective_upto), "MMM d, yyyy") : "N/A"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditFuelPrice(fuel)}
                        className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDeleteByType(fuel.fuel_type)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2.5} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium text-green-500">
              {isEditMode ? "Edit Fuel Price" : "Add Fuel Price"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit}>
            <div className="space-y-4 py-2">
              {/* Fuel Type Select */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Fuel Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full p-2 border rounded-md bg-[#eef6e2] focus:ring-green-200 focus:border-green-300"
                  disabled={isEditMode}
                >
                  <option value="PETROL">Petrol</option>
                  <option value="DIESEL">Diesel</option>
                </select>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

              {/* Price Input */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price (Br/L) <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-[#F2FCE2] focus:ring-green-200 focus:border-green-300"
                  required
                  type="number"
                  step="0.01"
                />
              </div>

              {/* Start Date Picker */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date Picker */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  End Date (Optional)
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate || undefined}
                      onSelect={setEndDate}
                      initialFocus
                    />
                    {endDate && (
                      <div className="p-2 border-t">
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() => setEndDate(null)}
                        >
                          Clear date
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : isEditMode ? "Update" : "Create"} Fuel Price
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteTypeDialog.open} onOpenChange={(open) => setDeleteTypeDialog({...deleteTypeDialog, open})}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium text-red-500 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-700">
            Are you sure you want to delete all prices for <span className="font-semibold">{deleteTypeDialog.fuelType}</span>?
          </p>
          <div className="flex justify-end space-x-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteTypeDialog({...deleteTypeDialog, open: false})}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeDeleteByType}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}