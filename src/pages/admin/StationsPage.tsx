import React, { useState, useEffect } from "react";
import { Eye, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

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
  const [activeTab, setActiveTab] = useState<"VERIFIED" | "REJECTED" | "PENDING">("PENDING");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const itemsPerPage = 4;

  // Get auth token from storage
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
        
        if (!response.ok) {
          throw new Error("Failed to fetch stations");
        }
        
        const data = await response.json();
        setStations(data.data);
        setLoading(false);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load stations",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    fetchStations();
  }, [authToken, toast]);

  useEffect(() => {
    // Filter stations based on active tab and search term
    let filtered = stations.filter(station => station.status === activeTab);
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(station => 
        station.en_name.toLowerCase().includes(term) ||
        station.am_name.toLowerCase().includes(term) ||
        station.address.toLowerCase().includes(term) ||
        station.tin_number.toLowerCase().includes(term)
      );
    }
    
    setFilteredStations(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [stations, activeTab, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredStations.length / itemsPerPage);
  const paginatedStations = filteredStations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (stationId: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/station/${stationId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete station");
      }
      
      // Remove the station from local state
      setStations(prev => prev.filter(station => station.id !== stationId));
      
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
    }
  };

  if (loading) {
    return <div className="p-6">Loading stations...</div>;
  }

  return (
    <div>
      <div className="flex items-center mb-5">
        <div className="flex items-center text-emerald-500">
          <Stations className="h-6 w-6 mr-2" />
          <h1 className="text-xl font-medium">Stations</h1>
        </div>
        <p className="text-gray-400 text-sm ml-2">Stations management</p>
      </div>

      <div className="bg-[#F1F7F7] p-6 rounded-lg">
        <Tabs
          defaultValue="PENDING"
          className="mb-5"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "VERIFIED" | "REJECTED" | "PENDING")}
        >
          <TabsList className="grid grid-cols-3 max-w-[400px] bg-transparent gap-2">
            <TabsTrigger
              value="PENDING"
              className={`bg-white border ${
                activeTab === "PENDING"
                  ? "border-emerald-500 text-emerald-500"
                  : "border-transparent"
              } rounded-lg shadow-sm`}
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="VERIFIED"
              className={`bg-white border ${
                activeTab === "VERIFIED"
                  ? "border-emerald-500 text-emerald-500"
                  : "border-transparent"
              } rounded-lg shadow-sm`}
            >
              Approved
            </TabsTrigger>
            <TabsTrigger
              value="REJECTED"
              className={`bg-white border ${
                activeTab === "REJECTED"
                  ? "border-emerald-500 text-emerald-500"
                  : "border-transparent"
              } rounded-lg shadow-sm`}
            >
              Rejected
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

        <div className="bg-white rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-emerald-500 text-white text-left">
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
                          <StationIcon />
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
                        <Link to={`/admin/stations/${station.id}`}>
                          <button className="p-1.5 bg-emerald-100 rounded-md hover:bg-emerald-200">
                            <Eye className="h-4 w-4 text-emerald-600" />
                          </button>
                        </Link>
                        <button 
                          className="p-1.5 bg-red-100 rounded-md hover:bg-red-200"
                          onClick={() => handleDelete(station.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
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

        {/* Pagination */}
        {filteredStations.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredStations.length)} of {filteredStations.length} stations
            </div>
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 rounded-full bg-gray-200 text-gray-600 disabled:opacity-50"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

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
                  <button
                    key={pageNum}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentPage === pageNum
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className="p-1.5 rounded-full bg-gray-200 text-gray-600 disabled:opacity-50"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom icon components
const Stations = (props: any) => {
  return (
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
      <path d="M3 9h18v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
      <path d="M12 3v6" />
    </svg>
  );
};

const StationIcon = () => {
  return (
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
  );
};

const ArrowLeft = (props: any) => {
  return (
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
};

const ArrowRight = (props: any) => {
  return (
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
};