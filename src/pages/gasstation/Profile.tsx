import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Profile = () => {
  const initialStationData = {
    name: "Total Energies around Mexico Square",
    amharicName: "ቶታል ኢነርጂ የሜክሲኮ አደባባይ አካባቢ",
    email: "email123@gmail.com",
    phone: "1234567890",
    license: "A03420",
    username: "totalenergies123",
    location: "Around Mexico Sq.",
    longitude: "38.73840",
    logo: "/lovable-uploads/efa8087f-86d0-4e0f-9ec8-ed4ea94e5ba7.png",
  };

  const [stationData, setStationData] = useState(initialStationData);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log("Saved data:", stationData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setStationData(initialStationData);
    setIsEditing(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Password change submitted:", passwordData);
    setPasswordData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.match('image.*')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }

      // Validate file size (e.g., 2MB max)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be less than 2MB');
        return;
      }

      setIsUploading(true);

      try {
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        
        // In a real app, you would upload the file to your server here
        // const uploadedUrl = await uploadFileToServer(file);
        
        // For demo purposes, we'll use the preview URL
        setStationData(prev => ({
          ...prev,
          logo: previewUrl
        }));
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Error uploading image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const triggerFileInput = () => {
    // Create a temporary file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    
    fileInput.onchange = (e: Event) => {
      handleFileChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
    };
    
    // Trigger click event
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <div className="flex-1">
          <svg className="w-6 h-6 text-fuelGreen-500 inline-block mr-2" viewBox="0 0 24 24" fill="none">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-xl font-semibold text-fuelGreen-500 inline-block">Profile</h1>
          <p className="text-gray-500 ml-8">Profile Management</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
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
                  src={stationData.logo} 
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
            
            {isEditing ? (
              <>
                <Input
                  name="name"
                  value={stationData.name}
                  onChange={handleInputChange}
                  className="text-xl font-bold text-center mb-2"
                />
                <Input
                  name="amharicName"
                  value={stationData.amharicName}
                  onChange={handleInputChange}
                  className="text-sm text-center"
                />
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-center">{stationData.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{stationData.amharicName}</p>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Email</p>
              {isEditing ? (
                <Input
                  name="email"
                  value={stationData.email}
                  onChange={handleInputChange}
                  className="w-full"
                />
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-fuelGreen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">{stationData.email}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">Tel number</p>
              {isEditing ? (
                <Input
                  name="phone"
                  value={stationData.phone}
                  onChange={handleInputChange}
                  className="w-full"
                />
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-fuelGreen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-sm">{stationData.phone}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">Username</p>
              {isEditing ? (
                <Input
                  name="username"
                  value={stationData.username}
                  onChange={handleInputChange}
                  className="w-full"
                />
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-fuelGreen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm">{stationData.username}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">Location</p>
              {isEditing ? (
                <Input
                  name="location"
                  value={stationData.location}
                  onChange={handleInputChange}
                  className="w-full"
                />
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-fuelGreen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">{stationData.location}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">License</p>
              {isEditing ? (
                <Input
                  name="license"
                  value={stationData.license}
                  onChange={handleInputChange}
                  className="w-full"
                />
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-fuelGreen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm">{stationData.license}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">Longitude</p>
              {isEditing ? (
                <Input
                  name="longitude"
                  value={stationData.longitude}
                  onChange={handleInputChange}
                  className="w-full"
                />
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-fuelGreen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="text-sm">{stationData.longitude}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

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
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-fuelGreen-500 hover:bg-fuelGreen-600 mt-4"
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