import React, { useState, useEffect } from "react";
import { Eye, Trash2, Search, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface User {
  id: number; // Sequential display ID (per page)
  originalId: string; // Actual user ID from API
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
}

const DriversPage: React.FC = () => {
  const [drivers, setDrivers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<string | null>(null); // Stores original ID
  const { toast } = useToast();
  const itemsPerPage = 4;

  const fetchDrivers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      const response = await fetch(`${API_BASE_URL}/api/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch drivers");
      }

      const responseData = await response.json();
      const data = Array.isArray(responseData.data)
        ? responseData.data
        : [];

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from server");
      }

      // Sort by first name, then last name
      const sortedData = [...data].sort((a, b) => {
        const aFirstName = (a.first_name || '').toLowerCase();
        const bFirstName = (b.first_name || '').toLowerCase();
        const aLastName = (a.last_name || '').toLowerCase();
        const bLastName = (b.last_name || '').toLowerCase();

        if (aFirstName < bFirstName) return -1;
        if (aFirstName > bFirstName) return 1;
        return aLastName.localeCompare(bLastName);
      });

      // Map with original IDs (sequential IDs will be assigned per page)
      const driversData = sortedData
        .map((user: any) => ({
          originalId: user.id,
          firstName: user.first_name || 'Unknown',
          lastName: user.last_name || 'User',
          username: user.username || 'N/A',
          email: user.email || 'No email',
          avatar: user.profile_pic || '/default-avatar.png', // Use profile_pic from response
          role: user.role || ''
        }))
        .filter((user) => user.role.toUpperCase() === "DRIVER");

      setDrivers(driversData);
      setTotalPages(Math.max(1, Math.ceil(driversData.length / itemsPerPage)));

      if (driversData.length === 0) {
        setError("No drivers found in the system.");
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      setError(error.message || "Failed to load drivers. Please try again.");
      toast({
        title: "Error",
        description: error.message || "Failed to fetch drivers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDriver = async () => {
    if (!driverToDelete) return;

    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_BASE_URL}/api/user/${driverToDelete}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete driver");
      }

      await fetchDrivers();

      toast({
        title: "Success",
        description: "Driver deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete driver",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDriverToDelete(null);
    }
  };

  // Filter drivers based on search term
  const filteredDrivers = drivers.filter(driver =>
    Object.values(driver).some(
      value => value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calculate total pages based on filtered results
  const calculatedTotalPages = Math.max(1, Math.ceil(filteredDrivers.length / itemsPerPage));

  // Get current drivers for pagination with sequential IDs per page
  const currentDrivers = filteredDrivers
    .slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
    .map((driver, index) => ({
      ...driver,
      id: (currentPage - 1) * itemsPerPage + index + 1 // Sequential ID per page
    }));

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
    setTotalPages(calculatedTotalPages);
  }, [searchTerm, calculatedTotalPages]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-red-500">{error}</p>
        <Button
          variant="outline"
          className="text-emerald-500 border-emerald-500"
          onClick={fetchDrivers}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the driver from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteDriver}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center mb-5">
        <div className="flex items-center text-emerald-500">
          <DriversIcon className="h-6 w-6 mr-2" />
          <h1 className="text-xl font-medium">Drivers</h1>
        </div>
        <p className="text-gray-400 text-sm ml-2">Drivers management</p>
      </div>

      <div className="bg-[#F1F7F7] p-6 rounded-lg">
        <div className="w-72 relative mb-5">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search driver"
            className="pl-10 bg-white border-none rounded-full h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          {currentDrivers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? "No matching drivers found" : "No drivers available"}
            </div>
          ) : (
            <>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-500 text-white text-left">
                    <th className="py-4 px-4 w-16">ID</th>
                    <th className="py-4 px-4">First Name</th>
                    <th className="py-4 px-4">Last Name</th>
                    <th className="py-4 px-4">Username</th>
                    <th className="py-4 px-4">Email</th>
                    <th className="py-4 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDrivers.map((driver) => (
                    <tr key={driver.originalId} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">{driver.id}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            <img
                              src={driver.avatar}
                              alt={`${driver.firstName} ${driver.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {driver.firstName}
                        </div>
                      </td>
                      <td className="py-4 px-4">{driver.lastName}</td>
                      <td className="py-4 px-4">{driver.username}</td>
                      <td className="py-4 px-4 text-emerald-600">{driver.email}</td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center gap-2">
                          <Link to={`/admin/drivers/${driver.originalId}`}>
                            <Button variant="ghost" size="icon" className="text-emerald-600 hover:bg-emerald-100">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:bg-red-100"
                            onClick={() => {
                              setDriverToDelete(driver.originalId);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredDrivers.length)} of{' '}
                  {filteredDrivers.length} drivers
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    Page {currentPage} of {calculatedTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.min(calculatedTotalPages, p + 1))}
                    disabled={currentPage === calculatedTotalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const DriversIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="6" r="4" />
    <path d="M17 14.5a9 9 0 0 0-10 0" />
    <path d="M10.3 17.5A7.96 7.96 0 0 1 12 17c1.1 0 2.2.3 3.2.8" />
    <path d="M2 18a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1z" />
    <path d="M16 18a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v1z" />
  </svg>
);

export default DriversPage;
