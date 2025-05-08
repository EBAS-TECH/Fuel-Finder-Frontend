import React, { useState, useEffect } from "react";
import { Search, Pencil, Trash2, X, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

interface FuelPrice {
  id: string;
  fuel_type: string;
  price: number;
  created_at: string;
  updated_at: string | null;
}

export default function FuelPricePage() {
  const [fuelPrices, setFuelPrices] = useState<FuelPrice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTypeDialog, setDeleteTypeDialog] = useState({
    open: false,
    fuelType: "",
  });

  // Form state
  const [editId, setEditId] = useState<string | null>(null);
  const [fuelType, setFuelType] = useState("PETROL");
  const [price, setPrice] = useState("");
  const [sinceDate, setSinceDate] = useState<Date | undefined>(new Date());
  const [effectiveUpto, setEffectiveUpto] = useState<Date | undefined>(new Date());

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  };

  // Check if user is authenticated
  const checkAuth = () => {
    const token = getAuthToken();
    if (!token) {
      // Redirect to login if not authenticated
      window.location.href = "/login";
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!checkAuth()) return;

    const fetchFuelPrices = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const response = await fetch("http://localhost:5001/api/price", {
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

    fetchFuelPrices();
  }, []);

  // Filtered fuel types based on search
  const filteredFuelPrices = fuelPrices.filter(fuel =>
    fuel.fuel_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFuelPrice = () => {
    if (!checkAuth()) return;

    setEditId(null);
    setFuelType("PETROL");
    setPrice("");
    setSinceDate(new Date());
    setEffectiveUpto(new Date());
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleEditFuelPrice = (fuel: FuelPrice) => {
    if (!checkAuth()) return;

    setEditId(fuel.id);
    setFuelType(fuel.fuel_type);
    setPrice(fuel.price.toString());
    setSinceDate(new Date(fuel.created_at));
    setEffectiveUpto(fuel.updated_at ? new Date(fuel.updated_at) : new Date());
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDeleteFuelPriceByType = async (fuelType: string) => {
    if (!checkAuth()) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`http://localhost:5001/api/price/${fuelType}`, {
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

      setFuelPrices(fuelPrices.filter(fuel => fuel.fuel_type !== fuelType));
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

    if (!price || !sinceDate || !effectiveUpto) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("User not authenticated");
      }

      if (isEditMode && editId) {
        // Update existing fuel price
        const response = await fetch(`http://localhost:5001/api/price/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            fuel_type: fuelType,
            price: priceValue
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to update fuel price");
        }

        setFuelPrices(fuelPrices.map(fuel =>
          fuel.id === editId
            ? { ...fuel, fuel_type: fuelType, price: priceValue }
            : fuel
        ));

        toast({
          title: "Success",
          description: "Fuel price updated successfully",
        });
      } else {
        // Create new fuel price
        const response = await fetch("http://localhost:5001/api/price", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            fuel_type: fuelType,
            price: priceValue
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to create fuel price");
        }

        setFuelPrices([...fuelPrices, data.data]);
        toast({
          title: "Success",
          description: "Fuel price created successfully",
        });
      }

      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save fuel price",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div>
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
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search fuel type"
              className="pl-10 bg-white border-none focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={handleAddFuelPrice}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Add Fuel Type
          </Button>
        </div>

        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-green-500 text-white font-normal w-16 text-center">ID</TableHead>
                <TableHead className="bg-green-500 text-white font-normal">Fuel Type Name</TableHead>
                <TableHead className="bg-green-500 text-white font-normal">Fuel Price (Br/L)</TableHead>
                <TableHead className="bg-green-500 text-white font-normal">Since</TableHead>
                <TableHead className="bg-green-500 text-white font-normal">Effective Upto</TableHead>
                <TableHead className="bg-green-500 text-white font-normal text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFuelPrices.map((fuel, index) => (
                <TableRow key={fuel.id}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell>{fuel.fuel_type}</TableCell>
                  <TableCell>{fuel.price.toFixed(2)}</TableCell>
                  <TableCell>{format(new Date(fuel.created_at), "MMM yyyy")}</TableCell>
                  <TableCell>
                    {fuel.updated_at ? format(new Date(fuel.updated_at), "MMM yyyy") : "Current"}
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
                        title="Delete all prices for this fuel type"
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

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Showing 1 - {filteredFuelPrices.length} of {filteredFuelPrices.length}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className={`p-1.5 rounded-full ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-600'}`}
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
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPage === 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(1, currentPage + 1))}
              className={`p-1.5 rounded-full ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-600'}`}
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
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Fuel Type Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium text-green-500">
              {isEditMode ? "Edit Fuel Price" : "Add Fuel Price"}
            </DialogTitle>
          </DialogHeader>
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            onClick={() => setIsDialogOpen(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          <form onSubmit={handleFormSubmit}>
            <div className="space-y-4 py-2">
              <div>
                <label htmlFor="fuelType" className="block text-sm font-medium mb-1">
                  Fuel Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="fuelType"
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full p-2 border rounded-md bg-[#F2FCE2] focus:ring-green-200 focus:border-green-300"
                >
                  <option value="PETROL">Petrol</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="LPG">LPG</option>
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium mb-1">
                  Price (Br/L) <span className="text-red-500">*</span>
                </label>
                <Input
                  id="price"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-[#F2FCE2] focus:ring-green-200 focus:border-green-300"
                  required
                  type="number"
                  step="0.01"
                />
              </div>

              <div>
                <label htmlFor="sinceDate" className="block text-sm font-medium mb-1">
                  Price Since <span className="text-red-500">*</span>
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !sinceDate && "text-muted-foreground"
                      )}
                    >
                      {sinceDate ? format(sinceDate, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={sinceDate}
                      onSelect={setSinceDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label htmlFor="effectiveDate" className="block text-sm font-medium mb-1">
                  Price Effective Upto <span className="text-red-500">*</span>
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !effectiveUpto && "text-muted-foreground"
                      )}
                    >
                      {effectiveUpto ? format(effectiveUpto, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={effectiveUpto}
                      onSelect={setEffectiveUpto}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {isEditMode ? "Update Fuel Price" : "Add Fuel Price"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete by type confirmation dialog */}
      <Dialog open={deleteTypeDialog.open} onOpenChange={(open) => setDeleteTypeDialog(prev => ({...prev, open}))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium text-red-500 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-700">
            Are you sure you want to delete ALL price entries for <span className="font-semibold">{deleteTypeDialog.fuelType}</span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteTypeDialog(prev => ({...prev, open: false}))}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeDeleteByType}
            >
              Delete All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
