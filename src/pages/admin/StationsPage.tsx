import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Trash2,
  Search,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Station {
  id: string;
  en_name: string;
  am_name: string;
  tin_number: string;
  user_id: string;
  address: string;
  availability: boolean;
  status: "PENDING" | "VERIFIED" | "NOT-VERIFIED";
  created_at: string;
  updated_at: string | null;
  latitude: number;
  longitude: number;
  user?: {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    role: string;
  };
}

export default function StationsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "PENDING" | "VERIFIED" | "NOT-VERIFIED"
  >("PENDING");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [editForm, setEditForm] = useState({
    en_name: "",
    am_name: "",
    tin_number: "",
    address: "",
    latitude: 0,
    longitude: 0,
    user: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      role: "GAS_STATION",
      password: "123456", // Default password as per your API
    },
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stationToDelete, setStationToDelete] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  const itemsPerPage = 4;

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      redirectToLogin();
    } else {
      fetchStations();
    }
  }, []);

  useEffect(() => {
    filterStations();
  }, [stations, activeTab, searchTerm]);

  const getAuthToken = (): string | null => {
    return (
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    );
  };

  const redirectToLogin = () => {
    navigate("/login");
    toast({
      title: "Authentication required",
      description: "Please login to access this page",
      variant: "destructive",
    });
  };

  const handleAuthError = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    redirectToLogin();
    toast({
      title: "Session expired",
      description: "Please login again",
      variant: "destructive",
    });
  };

  const fetchStations = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        redirectToLogin();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/station/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch stations");
      }

      const data = await response.json();
      console.log("Fetched stations:", data.data);

      const stationsWithUserDetails = await Promise.all(
        data.data.map(async (station: Station) => {
          const userResponse = await fetch(
            `${API_BASE_URL}/api/user/${station.user_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!userResponse.ok) {
            throw new Error(
              `Failed to fetch user details for station ${station.id}`
            );
          }

          const userData = await userResponse.json();
          return { ...station, user: userData.data };
        })
      );

      setStations(stationsWithUserDetails);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch stations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterStations = () => {
    let filtered = [...stations];

    // Filter by status
    filtered = filtered.filter((station) => {
      if (activeTab === "PENDING") return station.status === "PENDING";
      if (activeTab === "VERIFIED") return station.status === "VERIFIED";
      if (activeTab === "NOT-VERIFIED")
        return station.status === "NOT-VERIFIED";
      return true;
    });

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (station) =>
          station.en_name.toLowerCase().includes(term) ||
          station.am_name.toLowerCase().includes(term) ||
          station.tin_number.toLowerCase().includes(term) ||
          station.address.toLowerCase().includes(term) ||
          (station.user?.username.toLowerCase().includes(term) ?? false) ||
          (station.user?.email.toLowerCase().includes(term) ?? false)
      );
    }

    setFilteredStations(filtered);
    setCurrentPage(1);
  };

  const handleEditStation = (station: Station) => {
    setCurrentStation(station);
    setEditForm({
      en_name: station.en_name,
      am_name: station.am_name,
      tin_number: station.tin_number,
      address: station.address,
      latitude: station.latitude,
      longitude: station.longitude,
      user: {
        first_name: station.user?.first_name || "",
        last_name: station.user?.last_name || "",
        username: station.user?.username || "",
        email: station.user?.email || "",
        role: "GAS_STATION",
        password: "123456",
      },
    });
    setIsEditing(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStation) return;

    try {
      const token = getAuthToken();
      if (!token) {
        redirectToLogin();
        return;
      }

      const response = await fetch(
        `https://fuel-finder-backend.onrender.com/api/station/update/${currentStation.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user: {
              first_name: editForm.user.first_name,
              last_name: editForm.user.last_name,
              username: editForm.user.username,
              password: editForm.user.password,
              email: editForm.user.email,
              role: editForm.user.role,
            },
            en_name: editForm.en_name,
            am_name: editForm.am_name,
            user_id: currentStation.user_id,
            tin_number: editForm.tin_number,
            latitude: editForm.latitude,
            longitude: editForm.longitude,
            address: editForm.address,
          }),
        }
      );

      if (response.status === 401) {
        handleAuthError();
        return;
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message || "Failed to update station"
        );
      }

      toast({
        title: "Success",
        description: "Station updated successfully",
      });
      fetchStations();
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update station",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (station: Station) => {
    setStationToDelete({
      id: station.id,
      name: station.en_name,
      email: station.user?.email || "N/A",
    });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!stationToDelete) return;

    try {
      const token = getAuthToken();
      if (!token) {
        redirectToLogin();
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/station/${stationToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to delete station");
      }

      toast({
        title: "Success",
        description: "Station deleted successfully",
      });
      fetchStations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete station",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const totalPages = Math.ceil(filteredStations.length / itemsPerPage);
  const paginatedStations = filteredStations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      <div className="mb-5">
        <div className="flex items-start">
          <div className="flex items-center text-green-500 mr-2 h-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#12e22b"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-fuel-icon lucide-fuel"
            >
              <line x1="3" x2="15" y1="22" y2="22" />
              <line x1="4" x2="14" y1="9" y2="9" />
              <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
              <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-medium text-green-500 leading-tight">
              Stations
            </h1>
            <p className="text-gray-400 text-sm leading-tight mt-0">
              Stations management
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[#F1F7F7] p-6 rounded-lg">
        
        <div className="flex justify-between items-center mb-5">
          <Tabs
            defaultValue="PENDING"
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "PENDING" | "VERIFIED" | "NOT-VERIFIED")
            }
          >
            <TabsList className="grid grid-cols-3 max-w-[400px] bg-transparent gap-2">
              <TabsTrigger
                value="PENDING"
                className={`bg-white border ${
                  activeTab === "PENDING"
                    ? "border-green-500 text-green-500"
                    : "border-transparent"
                } rounded-lg shadow-sm`}
              >
                Pending
              </TabsTrigger>
              <TabsTrigger
                value="VERIFIED"
                className={`bg-white border ${
                  activeTab === "VERIFIED"
                    ? "border-green-500 text-green-500"
                    : "border-transparent"
                } rounded-lg shadow-sm`}
              >
                Approved
              </TabsTrigger>
              <TabsTrigger
                value="NOT-VERIFIED"
                className={`bg-white border ${
                  activeTab === "NOT-VERIFIED"
                    ? "border-green-500 text-green-500"
                    : "border-transparent"
                } rounded-lg shadow-sm`}
              >
                Rejected
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="w-72 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search station"
              className="pl-10 bg-white border-none rounded-[12px] h-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden">
            <Table className="w-full border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-green-500 text-white py-3 px-4 w-16 font-medium">
                    ID
                  </TableHead>
                  <TableHead className="bg-green-500 text-white py-3 px-4 font-medium">
                    Station Name
                  </TableHead>
                  <TableHead className="bg-green-500 text-white py-3 px-4 font-medium">
                    Username
                  </TableHead>
                  <TableHead className="bg-green-500 text-white py-3 px-4 font-medium">
                    Email
                  </TableHead>
                  <TableHead className="bg-green-500 text-white py-3 px-4 font-medium">
                    Address
                  </TableHead>
                  <TableHead className="bg-green-500 text-white py-3 px-4 font-medium">
                    Status
                  </TableHead>
                  <TableHead className="bg-green-500 text-white py-3 px-4 text-center font-medium">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStations.length > 0 ? (
                  paginatedStations.map((station, index) => (
                    <TableRow
                      key={station.id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/admin/stations/${station.id}`)}
                    >
                      <TableCell className="py-3 px-4 text-base">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-base">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                            <div className="w-6 h-6 flex items-center justify-center text-xs font-medium text-gray-600">
                              {station.en_name.charAt(0)}
                            </div>
                          </div>
                          {station.en_name}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-base">
                        {station.user?.username || "N/A"}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-green-500 text-base">
                        {station.user?.email || "N/A"}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-base">
                        {station.address}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-base">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            station.status === "VERIFIED"
                              ? "bg-green-100 text-green-800"
                              : station.status === "NOT-VERIFIED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {station.status === "NOT-VERIFIED"
                            ? "REJECTED"
                            : station.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div
                          className="flex justify-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigate(`/admin/stations/${station.id}`)
                            }
                          >
                            <Eye className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStation(station);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(station);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-4 text-center text-gray-500 text-base"
                    >
                      No stations found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {filteredStations.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredStations.length)} of{" "}
              {filteredStations.length}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
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
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Station Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Edit Station</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="en_name" className="text-base">
                    English Name
                  </Label>
                  <Input
                    id="en_name"
                    value={editForm.en_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, en_name: e.target.value })
                    }
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="am_name" className="text-base">
                    Amharic Name
                  </Label>
                  <Input
                    id="am_name"
                    value={editForm.am_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, am_name: e.target.value })
                    }
                    className="text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tin_number" className="text-base">
                    TIN Number
                  </Label>
                  <Input
                    id="tin_number"
                    value={editForm.tin_number}
                    onChange={(e) =>
                      setEditForm({ ...editForm, tin_number: e.target.value })
                    }
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-base">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={editForm.address}
                    onChange={(e) =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                    className="text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-base">
                    Latitude
                  </Label>
                  <Input
                    id="latitude"
                    type="number"
                    value={editForm.latitude}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        latitude: parseFloat(e.target.value),
                      })
                    }
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-base">
                    Longitude
                  </Label>
                  <Input
                    id="longitude"
                    type="number"
                    value={editForm.longitude}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        longitude: parseFloat(e.target.value),
                      })
                    }
                    className="text-base"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-4 text-base">User Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-base">
                      First Name
                    </Label>
                    <Input
                      id="first_name"
                      value={editForm.user.first_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          user: {
                            ...editForm.user,
                            first_name: e.target.value,
                          },
                        })
                      }
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-base">
                      Last Name
                    </Label>
                    <Input
                      id="last_name"
                      value={editForm.user.last_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          user: { ...editForm.user, last_name: e.target.value },
                        })
                      }
                      className="text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-base">
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={editForm.user.username}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          user: { ...editForm.user, username: e.target.value },
                        })
                      }
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.user.email}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          user: { ...editForm.user, email: e.target.value },
                        })
                      }
                      className="text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="text-base"
              >
                Cancel
              </Button>
              <Button type="submit" className="text-base">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Delete Station</DialogTitle>
            <DialogDescription>Are you absolutely sure?</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone. This will permanently delete the
              station from our servers.
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Name:</span>
                <span>{stationToDelete?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Email:</span>
                <span className="text-gray-600">{stationToDelete?.email}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}