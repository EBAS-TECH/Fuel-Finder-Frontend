import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import gasStationsImage from "@/assets/gas-stations.png";

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
  const [originalUser, setOriginalUser] = useState({
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

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");

    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(userId && { "X-User-Id": userId }),
    };
  };

  // Function to fetch station data
  const fetchStationData = async () => {
    try {
      const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
      if (!userId) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:5001/api/station/user/${userId}`,
        {
          headers: getAuthHeaders()
        }
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
        setOriginalUser({
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

  // Fetch station data on component mount
  useEffect(() => {
    fetchStationData();
  }, [navigate, toast]);

  // Listen for user update events from other components
  useEffect(() => {
    // Define the event handler
    const handleUserUpdated = () => {
      fetchStationData();
    };

    // Add event listener
    window.addEventListener("userUpdated", handleUserUpdated);

    // Clean up
    return () => {
      window.removeEventListener("userUpdated", handleUserUpdated);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSave = async () => {
    // Check if any changes have been made
    const isChanged =
      editedUser.first_name !== originalUser.first_name ||
      editedUser.last_name !== originalUser.last_name ||
      editedUser.username !== originalUser.username;

    if (!isChanged) {
      toast({
        title: "No Changes",
        description: "Please make changes to your profile before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
      const response = await fetch(
        `http://localhost:5001/api/user/${userId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            first_name: editedUser.first_name,
            last_name: editedUser.last_name,
            username: editedUser.username,
          })
        }
      );

      if (!response.ok) throw new Error("Failed to update profile");

      const { data } = await response.json();

      // Update the station state with new user data
      setStation(prev => ({
        ...prev,
        user: data
      }));

      // Update user data in storage
      const storage = localStorage.getItem("userData") ? localStorage : sessionStorage;
      const storedUser = JSON.parse(storage.getItem("userData") || "{}");

      const updatedUser = {
        ...storedUser,
        first_name: editedUser.first_name,
        last_name: editedUser.last_name,
        username: editedUser.username,
      };

      storage.setItem("userData", JSON.stringify(updatedUser));

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("userUpdated"));

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5001/api/user/profile/change-password",
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }

      toast({
        title: "Success",
        description: "Password changed successfully",
      });

      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuelGreen-500"></div>
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
    <div className="p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <svg className="w-6 h-6 text-fuelGreen-500 inline-block mr-2" viewBox="0 0 24 24" fill="none">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-xl font-semibold text-fuelGreen-500 inline-block">Profile</h1>
          <p className="text-gray-500 ml-8">Profile Management</p>
        </div>
        {station.status === "VERIFIED" && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Verified
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Station Profile Card */}
        <Card className="p-6 relative">
          <Button
            variant="outline"
            size="sm"
            className="absolute right-6 top-6 text-fuelGreen-500 border-fuelGreen-500"
            onClick={handleEditClick}
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit
          </Button>

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <img
                src={gasStationsImage}
                alt="Station logo"
                className="w-24 h-24 rounded-full object-cover border-4 border-fuelGreen-100"
              />
            </div>

            {/* Station Name */}
            <h2 className="text-xl font-bold text-center">{station.en_name}</h2>
            <p className="text-sm text-gray-500 mt-1">{station.am_name}</p>
          </div>

          {/* Station Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Field */}
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Email</p>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-fuelGreen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">{station.user?.email}</span>
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Phone number</p>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-fuelGreen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm">{station.user?.phone}</span>
              </div>
            </div>

            {/* TIN Number Field */}
            <div className="space-y-1">
              <p className="text-xs text-gray-500">TIN Number</p>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-fuelGreen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm">{station.tin_number}</span>
              </div>
            </div>

            {/* Address Field */}
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Address</p>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-fuelGreen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">{station.address}</span>
              </div>
            </div>

            {/* Latitude Field */}
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Latitude</p>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-fuelGreen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="text-sm">{station.latitude}</span>
              </div>
            </div>

            {/* Longitude Field */}
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Longitude</p>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-fuelGreen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="text-sm">{station.longitude}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Password Change Card */}
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-6">Change Password</h2>
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div className="space-y-2">
              <label htmlFor="old-password" className="text-sm font-medium text-gray-700 block">Old Password<span className="text-red-500">*</span></label>
              <div className="relative">
                <Input
                  type={showPassword.oldPassword ? "text" : "password"}
                  id="old-password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your old password"
                  className="w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("oldPassword")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword.oldPassword ? (
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium text-gray-700 block">New Password<span className="text-red-500">*</span></label>
              <div className="relative">
                <Input
                  type={showPassword.newPassword ? "text" : "password"}
                  id="new-password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your new password"
                  className="w-full"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("newPassword")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword.newPassword ? (
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700 block">Confirm New Password<span className="text-red-500">*</span></label>
              <div className="relative">
                <Input
                  type={showPassword.confirmPassword ? "text" : "password"}
                  id="confirm-password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm your new password"
                  className="w-full"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword.confirmPassword ? (
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-fuelGreen-500 hover:bg-fuelGreen-600 mt-4"
              disabled={!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            >
              Update Password
            </Button>
          </form>
        </Card>
      </div>

      {/* Dialog for Editing User Profile */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="first_name" className="text-sm font-medium text-gray-700 block">First Name</label>
              <Input
                id="first_name"
                name="first_name"
                value={editedUser.first_name}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="last_name" className="text-sm font-medium text-gray-700 block">Last Name</label>
              <Input
                id="last_name"
                name="last_name"
                value={editedUser.last_name}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700 block">Username</label>
              <Input
                id="username"
                name="username"
                value={editedUser.username}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 border-red-500"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-fuelGreen-500 border-fuelGreen-500"
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
