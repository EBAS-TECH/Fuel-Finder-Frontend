import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    en_name: "",
    am_name: "",
    email: "",
    phone: "",
    tin_number: "",
    address: "",
    latitude: "",
    longitude: ""
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
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

  // Fetch station data
  useEffect(() => {
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
          setFormData({
            en_name: data.en_name || "",
            am_name: data.am_name || "",
            email: data.user?.email || "",
            phone: data.user?.phone || "",
            tin_number: data.tin_number || "",
            address: data.address || "",
            latitude: data.latitude?.toString() || "",
            longitude: data.longitude?.toString() || "",
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

    fetchStationData();
  }, [navigate, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/station/${station.id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            en_name: formData.en_name,
            am_name: formData.am_name,
            address: formData.address,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            tin_number: formData.tin_number
          })
        }
      );

      if (!response.ok) throw new Error("Failed to update profile");

      const { data } = await response.json();
      setStation(data);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (station) {
      setFormData({
        en_name: station.en_name || "",
        am_name: station.am_name || "",
        email: station.user?.email || "",
        phone: station.user?.phone || "",
        tin_number: station.tin_number || "",
        address: station.address || "",
        latitude: station.latitude?.toString() || "",
        longitude: station.longitude?.toString() || "",
      });
    }
    setIsEditing(false);
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

  const handleDeleteStation = async () => {
    if (!window.confirm("Are you sure you want to delete this station?")) return;

    try {
      const response = await fetch(
        `http://localhost:5001/api/station/${station.id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders()
        }
      );

      if (!response.ok) throw new Error("Failed to delete station");

      toast({
        title: "Success",
        description: "Station deleted successfully",
      });
      
      // Clear user data and redirect
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userId");
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.match('image.*')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image must be less than 2MB",
          variant: "destructive",
        });
        return;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(
          `http://localhost:5001/api/station/${station.id}/logo`,
          {
            method: "POST",
            headers: {
              "Authorization": getAuthHeaders().Authorization,
              "X-User-Id": getAuthHeaders()["X-User-Id"]
            },
            body: formData
          }
        );

        if (!response.ok) throw new Error("Failed to upload logo");

        const { url } = await response.json();
        setStation(prev => ({
          ...prev,
          logo: url
        }));

        toast({
          title: "Success",
          description: "Logo updated successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.onchange = handleFileChange;
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
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
          {isEditing ? (
            <div className="absolute right-6 top-6 space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-fuelGreen-500 border-fuelGreen-500"
                onClick={handleSave}
              >
                Save
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-500 border-red-500"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute right-6 top-6 text-fuelGreen-500 border-fuelGreen-500"
              onClick={() => setIsEditing(true)}
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </Button>
          )}

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              {isUploading ? (
                <div className="w-24 h-24 rounded-full border-4 border-fuelGreen-100 flex items-center justify-center">
                  <svg className="animate-spin h-8 w-8 text-fuelGreen-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <img 
                  src={station.logo || "/default-station-logo.png"} 
                  alt="Station logo" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-fuelGreen-100"
                />
              )}
              {isEditing && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-xs w-full"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Change Logo"}
                </Button>
              )}
            </div>
            
            {/* Station Name */}
            {isEditing ? (
              <>
                <Input
                  name="en_name"
                  value={formData.en_name}
                  onChange={handleInputChange}
                  className="text-xl font-bold text-center mb-2"
                />
                <Input
                  name="am_name"
                  value={formData.am_name}
                  onChange={handleInputChange}
                  className="text-sm text-center"
                />
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-center">{station.en_name}</h2>
                <p className="text-sm text-gray-500 mt-1">{station.am_name}</p>
              </>
            )}
          </div>

          {/* Station Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Field */}
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Email</p>
              {isEditing ? (
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full"
                />
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-fuelGreen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">{formData.email}</span>
                </div>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Phone number</p>
              {isEditing ? (
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full"
                />
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-fuelGreen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-sm">{formData.phone}</span>
                </div>
              )}
            </div>

            {/* TIN Number Field */}
            <div className="space-y-1">
              <p className="text-xs text-gray-500">TIN Number</p>
              {isEditing ? (
                <Input
                  name="tin_number"
                  value={formData.tin_number}
                  onChange={handleInputChange}
                  className="w-full"
                />
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-fuelGreen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm">{station.tin_number}</span>
                </div>
              )}
            </div>

            {/* Address Field */}
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Address</p>
              {isEditing ? (
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full"
                />
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-fuelGreen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">{station.address}</span>
                </div>
              )}
            </div>

            {/* Latitude Field */}
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Latitude</p>
              {isEditing ? (
                <Input
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  className="w-full"
                />
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-fuelGreen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="text-sm">{station.latitude}</span>
                </div>
              )}
            </div>

            {/* Longitude Field */}
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Longitude</p>
              {isEditing ? (
                <Input
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  className="w-full"
                />
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-fuelGreen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="text-sm">{station.longitude}</span>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-6">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDeleteStation}
                className="w-full"
              >
                Delete Station
              </Button>
            </div>
          )}
        </Card>

        {/* Password Change Card */}
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-6">Change Password</h2>
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div className="space-y-2">
              <label htmlFor="old-password" className="text-sm font-medium text-gray-700 block">Old Password<span className="text-red-500">*</span></label>
              <Input 
                type="password" 
                id="old-password" 
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your old password" 
                className="w-full" 
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium text-gray-700 block">New Password<span className="text-red-500">*</span></label>
              <Input 
                type="password" 
                id="new-password" 
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your new password" 
                className="w-full" 
                required
                minLength={8}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700 block">Confirm New Password<span className="text-red-500">*</span></label>
              <Input 
                type="password" 
                id="confirm-password" 
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm your new password" 
                className="w-full" 
                required
                minLength={8}
              />
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
    </div>
  );
};

export default Profile;