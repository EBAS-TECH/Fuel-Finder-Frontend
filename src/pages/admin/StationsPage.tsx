import React, { useState, useEffect } from "react";
import { Eye, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
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

interface Station {
  id: string;
  en_name: string;
  am_name: string;
  tin_number: string;
  user_id: string;
  address: string;
  availability: boolean;
  status: "VERIFIED" | "REJECTED" | "PENDING";
  created_at: string;
  updated_at: string | null;
  latitude: number;
  longitude: number;
}

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"VERIFIED" | "REJECTED" | "PENDING">("VERIFIED");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stationToDelete, setStationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const itemsPerPage = 4;

  // Get auth token using localStorage (like in Login component)
  const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5001/api/station/", {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (!response.ok) throw new Error("Failed to fetch stations");
        
        const data = await response.json();
        setStations(data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load stations",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchStations();
    } else {
      navigate("/login");
    }
  }, [authToken, toast, navigate]);

  useEffect(() => {
    const filtered = stations
      .filter(station => station.status === activeTab)
      .filter(station => {
        const term = searchTerm.toLowerCase();
        return (
          station.en_name.toLowerCase().includes(term) ||
          station.am_name.toLowerCase().includes(term) ||
          station.address.toLowerCase().includes(term) ||
          station.tin_number.toLowerCase().includes(term)
        );
      });
    
    setFilteredStations(filtered);
    setCurrentPage(1);
  }, [stations, activeTab, searchTerm]);

  const totalPages = Math.ceil(filteredStations.length / itemsPerPage);
  const paginatedStations = filteredStations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteClick = (stationId: string) => {
    setStationToDelete(stationId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!stationToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:5001/api/station/${stationToDelete}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete station");
      }

      // Remove only the deleted station from state
      setStations(prevStations => prevStations.filter(station => station.id !== stationToDelete));
      
      toast({
        title: "Success",
        description: "Station deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete station",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setStationToDelete(null);
    }
  };

  const handleViewStation = (stationId: string) => {
    navigate(`/admin/stations/${stationId}`);
  };

  if (loading) {
    return <div className="p-6">Loading stations...</div>;
  }

  return (
    <div className="p-6">
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this station and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center mb-5">
        <div className="flex items-center text-emerald-500">
          <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9h18v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 3v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-xl font-medium">Stations</h1>
        </div>
        <p className="text-gray-400 text-sm ml-2">Stations management</p>
      </div>

      <div className="bg-[#F1F7F7] p-6 rounded-lg">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "VERIFIED" | "REJECTED" | "PENDING")}
          className="mb-5"
        >
          <TabsList className="grid grid-cols-3 max-w-[400px] bg-transparent gap-2">
            <TabsTrigger
              value="VERIFIED"
              className={`bg-white ${
                activeTab === "VERIFIED" ? "border-emerald-500 text-emerald-500" : "border-transparent"
              } rounded-lg shadow-sm border`}
            >
              Verified
            </TabsTrigger>
            <TabsTrigger
              value="REJECTED"
              className={`bg-white ${
                activeTab === "REJECTED" ? "border-emerald-500 text-emerald-500" : "border-transparent"
              } rounded-lg shadow-sm border`}
            >
              Rejected
            </TabsTrigger>
            <TabsTrigger
              value="PENDING"
              className={`bg-white ${
                activeTab === "PENDING" ? "border-emerald-500 text-emerald-500" : "border-transparent"
              } rounded-lg shadow-sm border`}
            >
              Pending
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="w-72 relative mb-5">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search station"
            className="pl-10 bg-white border-none rounded-full h-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-green-500 text-white text-left">
                <th className="py-4 px-4 w-16">#</th>
                <th className="py-4 px-4">Station Name</th>
                <th className="py-4 px-4">TIN Number</th>
                <th className="py-4 px-4">Address</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStations.length > 0 ? (
                paginatedStations.map((station, index) => (
                  <tr key={station.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
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
                            <path d="M3 9h18v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                            <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                            <path d="M12 3v6" />
                          </svg>
                        </div>
                        {station.en_name}
                      </div>
                    </td>
                    <td className="py-4 px-4">{station.tin_number}</td>
                    <td className="py-4 px-4">{station.address}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        station.status === "VERIFIED" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : station.status === "REJECTED" 
                            ? "bg-red-100 text-red-800" 
                            : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {station.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewStation(station.id)}
                          className="hover:bg-emerald-100"
                        >
                          <Eye className="h-4 w-4 text-emerald-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(station.id)}
                          className="hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No stations found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredStations.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredStations.length)} of {filteredStations.length} stations
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
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
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="icon"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
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
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}