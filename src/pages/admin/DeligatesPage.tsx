import React, { useState, useEffect } from "react";
import { Edit, Trash2, Search, Plus, AlertTriangle, ArrowLeft, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Delegate {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  profile_pic: string;
  displayId: number;
}

interface DeleteDialogState {
  open: boolean;
  delegateId: string | null;
  delegateName: string;
}

export default function DelegatesPage() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDelegate, setSelectedDelegate] = useState<Delegate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    delegateId: null,
    delegateName: "",
  });

  // Form states
  const [newDelegate, setNewDelegate] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
  });

  // Fetch delegates on component mount and when dialog closes
  useEffect(() => {
    fetchDelegates();
  }, [isDialogOpen, deleteDialog.open]);

  const fetchDelegates = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/user`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch delegates");
      }

      const data = await response.json();
      if (data.status === 200 && data.message === "Users fetched successfully") {
        const ministryDelegates = data.data
          .filter((user: any) => user.role === "MINISTRY_DELEGATE")
          .map((delegate: any, index: number) => ({
            ...delegate,
            displayId: index + 1
          }));
        setDelegates(ministryDelegates);
      } else {
        throw new Error("Failed to fetch delegates");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch delegates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (selectedDelegate) {
      setSelectedDelegate({ ...selectedDelegate, [name]: value });
    } else {
      setNewDelegate({ ...newDelegate, [name]: value });
    }
  };

  const handleCreateDelegate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newDelegate,
          role: "MINISTRY_DELEGATE"
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Optimistic update: Add the new delegate to the local state
        setDelegates(prevDelegates => [
          ...prevDelegates,
          {
            ...newDelegate,
            id: data.id, // Assuming the API returns the ID of the newly created delegate
            displayId: prevDelegates.length + 1,
            profile_pic: '/default-avatar.png', // Default avatar
          }
        ]);

        toast({
          title: "Success",
          description: "Delegate created successfully",
        });
        setIsDialogOpen(false);
        setNewDelegate({
          first_name: "",
          last_name: "",
          username: "",
          email: "",
          password: "",
        });
      } else {
        throw new Error(data.message || "Failed to create delegate");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create delegate",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDelegate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelegate) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/user/${selectedDelegate.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: selectedDelegate.first_name,
          last_name: selectedDelegate.last_name,
          username: selectedDelegate.username,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Optimistic update: Update the delegate in the local state
        setDelegates(prevDelegates =>
          prevDelegates.map(delegate =>
            delegate.id === selectedDelegate.id
              ? { ...delegate, ...selectedDelegate }
              : delegate
          )
        );

        toast({
          title: "Success",
          description: "Delegate updated successfully",
        });
        setSelectedDelegate(null);
      } else {
        throw new Error(data.message || "Failed to update delegate");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update delegate",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (delegate: Delegate) => {
    setDeleteDialog({
      open: true,
      delegateId: delegate.id,
      delegateName: `${delegate.first_name} ${delegate.last_name}`,
    });
  };

  const confirmDeleteDelegate = async () => {
    if (!deleteDialog.delegateId) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/user/${deleteDialog.delegateId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Optimistic update: Remove the delegate from the local state
        setDelegates(prevDelegates =>
          prevDelegates.filter(delegate => delegate.id !== deleteDialog.delegateId)
        );

        toast({
          title: "Success",
          description: "Delegate deleted successfully",
        });
      } else {
        throw new Error(data.message || "Failed to delete delegate");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete delegate",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setDeleteDialog({
        open: false,
        delegateId: null,
        delegateName: "",
      });
    }
  };

  const filteredDelegates = delegates.filter(
    (delegate) =>
      delegate.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delegate.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delegate.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delegate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const delegatesPerPage = 5;
  const totalPages = Math.ceil(filteredDelegates.length / delegatesPerPage);
  const paginatedDelegates = filteredDelegates.slice(
    (currentPage - 1) * delegatesPerPage,
    currentPage * delegatesPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="flex items-center mb-5">
        <div className="flex items-center text-emerald-500">
          <DelegateIcon className="h-6 w-6 mr-2" />
          <h1 className="text-xl font-medium">Delegates</h1>
        </div>
        <p className="text-gray-400 text-sm ml-2">Delegates management</p>
      </div>

      <div className="bg-[#F1F7F7] p-6 rounded-lg">
        <div className="flex justify-between items-center mb-5">
          <div className="w-72 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search delegate"
              className="pl-10 bg-white border-none rounded-full h-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-500 hover:bg-green-400 text-white">
                <Plus className="h-4 w-4 mr-2" /> Add Delegate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Delegate</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateDelegate}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        First Name *
                      </label>
                      <Input
                        name="first_name"
                        placeholder="Enter first name"
                        value={newDelegate.first_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Last Name *
                      </label>
                      <Input
                        name="last_name"
                        placeholder="Enter last name"
                        value={newDelegate.last_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Username *
                    </label>
                    <Input
                      name="username"
                      placeholder="Enter username"
                      value={newDelegate.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Email *
                    </label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Enter email"
                      value={newDelegate.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Password *
                    </label>
                    <Input
                      name="password"
                      type="password"
                      placeholder="Enter password"
                      value={newDelegate.password}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-green-500 hover:bg-emerald-400 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Adding..." : "Add Delegate"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={!!selectedDelegate} onOpenChange={(open) => !open && setSelectedDelegate(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Delegate</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateDelegate}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      First Name *
                    </label>
                    <Input
                      name="first_name"
                      placeholder="Enter first name"
                      value={selectedDelegate?.first_name || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Last Name *
                    </label>
                    <Input
                      name="last_name"
                      placeholder="Enter last name"
                      value={selectedDelegate?.last_name || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Username *
                  </label>
                  <Input
                    name="username"
                    placeholder="Enter username"
                    value={selectedDelegate?.username || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Enter email"
                    value={selectedDelegate?.email || ""}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedDelegate(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-500 hover:bg-emerald-400 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Delegate"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({...prev, open}))}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-medium text-red-500 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Confirm Deletion
              </DialogTitle>
            </DialogHeader>
            <p className="text-gray-700">
              Are you sure you want to delete delegate <span className="font-semibold">{deleteDialog.delegateName}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4 mt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteDialog(prev => ({...prev, open: false}))}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteDelegate}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="bg-white rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-green-500 text-white text-left">
                <th className="py-4 px-4 w-16">#</th>
                <th className="py-4 px-4">First Name</th>
                <th className="py-4 px-4">Last Name</th>
                <th className="py-4 px-4">Username</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !delegates.length ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Loading delegates...
                  </td>
                </tr>
              ) : paginatedDelegates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No delegates found
                  </td>
                </tr>
              ) : (
                paginatedDelegates.map((delegate) => (
                  <tr
                    key={delegate.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-4 px-4">{delegate.displayId}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {delegate.profile_pic ? (
                            <img
                              src={delegate.profile_pic}
                              alt={`${delegate.first_name} ${delegate.last_name}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {delegate.first_name.charAt(0)}{delegate.last_name.charAt(0)}
                            </span>
                          )}
                        </div>
                        {delegate.first_name}
                      </div>
                    </td>
                    <td className="py-4 px-4">{delegate.last_name}</td>
                    <td className="py-4 px-4">{delegate.username}</td>
                    <td className="py-4 px-4 text-emerald-500">
                      {delegate.email}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-2">
                        <button
                          className="p-1.5 bg-emerald-100 rounded-md hover:bg-emerald-200"
                          onClick={() => setSelectedDelegate(delegate)}
                        >
                          <Edit className="h-4 w-4 text-emerald-600" />
                        </button>
                        <button
                          className="p-1.5 bg-red-100 rounded-md hover:bg-red-200"
                          onClick={() => handleDeleteClick(delegate)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * delegatesPerPage + 1} -{" "}
              {Math.min(currentPage * delegatesPerPage, filteredDelegates.length)} of{" "}
              {filteredDelegates.length}
            </div>
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 rounded-full bg-gray-200 text-gray-600 disabled:opacity-50"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentPage === page
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="p-1.5 rounded-full bg-gray-200 text-gray-600 disabled:opacity-50"
                onClick={() => handlePageChange(currentPage + 1)}
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

const DelegateIcon = (props: any) => {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
};
