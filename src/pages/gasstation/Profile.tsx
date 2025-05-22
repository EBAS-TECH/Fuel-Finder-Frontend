import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Eye, EyeOff, User, MapPin, FileText, Navigation } from "lucide-react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedUser, setEditedUser] = useState({
    first_name: "",
    last_name: "",
    username: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState({
    first_name: "",
    last_name: "",
    username: ""
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");

    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(userId && { "X-User-Id": userId }),
    };
  };

  const fetchStationData = async () => {
    try {
      const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
      if (!userId) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/station/user/${userId}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) throw new Error("Failed to fetch station data");

      const { data } = await response.json();
      if (data) {
        setStation(data);
        setEditedUser({
          first_name: data.user?.first_name || "",
          last_name: data.user?.last_name || "",
          username: data.user?.username || "",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStationData();
  }, [navigate, toast]);

  useEffect(() => {
    const handleUserUpdated = () => fetchStationData();
    window.addEventListener("userUpdated", handleUserUpdated);
    return () => window.removeEventListener("userUpdated", handleUserUpdated);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors = {
      first_name: !editedUser.first_name.trim() ? "First name is required" : "",
      last_name: !editedUser.last_name.trim() ? "Last name is required" : "",
      username: !editedUser.username.trim() ? "Username is required" : 
               editedUser.username.length < 3 ? "Username must be at least 3 characters" : ""
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
      const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          first_name: editedUser.first_name,
          last_name: editedUser.last_name,
          username: editedUser.username,
        })
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const { data } = await response.json();
      setStation(prev => ({ ...prev, user: data }));

      const storage = localStorage.getItem("userData") ? localStorage : sessionStorage;
      const storedUser = JSON.parse(storage.getItem("userData") || "{}");
      storage.setItem("userData", JSON.stringify({
        ...storedUser,
        first_name: editedUser.first_name,
        last_name: editedUser.last_name,
        username: editedUser.username,
      }));

      window.dispatchEvent(new CustomEvent("userUpdated"));
      toast({ title: "Success", description: "Profile updated successfully" });
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile/change-password`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }

      toast({ title: "Success", description: "Password changed successfully" });
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="p-6 text-center">
        <p>No station data available</p>
        <Button onClick={() => navigate("/login")} className="mt-4">
          Login to view profile
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-5">
        <div className="flex items-center text-emerald-500">
          <User className="h-6 w-6 mr-2" />
          <h1 className="text-xl font-medium">Profile</h1>
        </div>
        <p className="text-gray-400 text-sm ml-2">Profile management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#F1F7F7] p-6 rounded-lg">
          <div className="bg-white rounded-lg p-6">
            <div className="flex justify-end mb-2">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-emerald-500 text-emerald-500 hover:bg-emerald-50">
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="first_name" className="text-sm font-medium mb-1 block">
                          First Name *
                        </label>
                        <Input
                          id="first_name"
                          name="first_name"
                          value={editedUser.first_name}
                          onChange={handleInputChange}
                          required
                          className="bg-[#F2FCE2] focus:ring-emerald-200 focus:border-emerald-300"
                        />
                        {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                      </div>
                      <div>
                        <label htmlFor="last_name" className="text-sm font-medium mb-1 block">
                          Last Name *
                        </label>
                        <Input
                          id="last_name"
                          name="last_name"
                          value={editedUser.last_name}
                          onChange={handleInputChange}
                          required
                          className="bg-[#F2FCE2] focus:ring-emerald-200 focus:border-emerald-300"
                        />
                        {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="username" className="text-sm font-medium mb-1 block">
                        Username *
                      </label>
                      <Input
                        id="username"
                        name="username"
                        value={editedUser.username}
                        onChange={handleInputChange}
                        required
                        className="bg-[#F2FCE2] focus:ring-emerald-200 focus:border-emerald-300"
                      />
                      {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      onClick={handleSave}
                    >
                      Save changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-100 mb-4">
                {station.logo && (
                  <img
                    src={station.logo}
                    alt="Station logo"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <h2 className="text-xl font-medium mb-1">{station.en_name}</h2>
              <p className="text-gray-500 mb-1">{station.am_name}</p>
              {station.status === "VERIFIED" && (
                <p className="text-emerald-500 mt-2 px-3 py-1 bg-emerald-100 rounded-full text-sm">
                  Verified
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">TIN Number</p>
                <div className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-emerald-500" />
                  <span className="text-sm">{station.tin_number}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500">Address</p>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-emerald-500" />
                  <span className="text-sm">{station.address}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500">Latitude</p>
                <div className="flex items-center">
                  <Navigation className="w-5 h-5 mr-2 text-emerald-500" />
                  <span className="text-sm">{station.latitude}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500">Longitude</p>
                <div className="flex items-center">
                  <Navigation className="w-5 h-5 mr-2 text-emerald-500" />
                  <span className="text-sm">{station.longitude}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#F1F7F7] p-6 rounded-lg">
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Change Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="oldPassword" className="text-sm font-medium mb-1 block">
                  Old Password*
                </label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    type={showPassword.oldPassword ? "text" : "password"}
                    placeholder="Enter your old password"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    name="oldPassword"
                    required
                    className="bg-[#F2FCE2] focus:ring-emerald-200 focus:border-emerald-300 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => togglePasswordVisibility("oldPassword")}
                  >
                    {showPassword.oldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="text-sm font-medium mb-1 block">
                  New Password*
                </label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword.newPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    name="newPassword"
                    required
                    className="bg-[#F2FCE2] focus:ring-emerald-200 focus:border-emerald-300 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => togglePasswordVisibility("newPassword")}
                  >
                    {showPassword.newPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="text-sm font-medium mb-1 block">
                  Confirm New Password*
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword.confirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    name="confirmPassword"
                    required
                    className="bg-[#F2FCE2] focus:ring-emerald-200 focus:border-emerald-300 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                  >
                    {showPassword.confirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <Button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white w-full"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;