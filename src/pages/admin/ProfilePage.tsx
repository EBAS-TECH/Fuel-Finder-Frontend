import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Camera, Edit, User } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Sample user data
const userData = {
  firstName: "Bereket",
  lastName: "Nigussie",
  username: "bekel123",
  email: "email123@gmail.com",
  avatar: "/lovable-uploads/86065143-bd67-4268-aa7e-f5d5b4fac7e6.png"
};

export default function ProfilePage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editedUser, setEditedUser] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    username: userData.username,
    email: userData.email
  });
  const [avatar, setAvatar] = useState(userData.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would normally update the password in the database
    console.log("Password change:", { oldPassword, newPassword, confirmPassword });
    // Reset form fields
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully",
    });
  };
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would normally update the profile in the database
    console.log("Profile update:", editedUser);
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully",
    });
  };
  
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the image to your server
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
      
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated",
      });
    }
  };

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
        {/* Profile Display & Edit Section */}
        <div className="bg-[#F1F7F7] p-6 rounded-lg">
          <div className="bg-white rounded-lg p-6">
            <div className="flex justify-end mb-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-emerald-500 text-emerald-500 hover:bg-emerald-50">
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleProfileSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="firstName" className="text-sm font-medium mb-1 block">First Name *</label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={editedUser.firstName}
                            onChange={handleProfileChange}
                            required
                            className="bg-[#F2FCE2] focus:ring-emerald-200 focus:border-emerald-300"
                          />
                        </div>
                        <div>
                          <label htmlFor="lastName" className="text-sm font-medium mb-1 block">Last Name *</label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={editedUser.lastName}
                            onChange={handleProfileChange}
                            required
                            className="bg-[#F2FCE2] focus:ring-emerald-200 focus:border-emerald-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="username" className="text-sm font-medium mb-1 block">Username *</label>
                        <Input
                          id="username"
                          name="username"
                          value={editedUser.username}
                          onChange={handleProfileChange}
                          required
                          className="bg-[#F2FCE2] focus:ring-emerald-200 focus:border-emerald-300"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="text-sm font-medium mb-1 block">Email *</label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={editedUser.email}
                          onChange={handleProfileChange}
                          required
                          className="bg-[#F2FCE2] focus:ring-emerald-200 focus:border-emerald-300"
                        />
                      </div>
                      <div>
                        <label htmlFor="avatar" className="text-sm font-medium mb-1 block">Profile Picture</label>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-100">
                            <img 
                              src={avatar}
                              alt={`${editedUser.firstName} ${editedUser.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={handleAvatarClick}
                            className="border-emerald-500 text-emerald-500 hover:bg-emerald-50"
                          >
                            <Camera className="h-4 w-4 mr-2" /> Change Picture
                          </Button>
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            accept="image/*" 
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                        Save changes
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-100 mb-4 relative">
                <img 
                  src={avatar}
                  alt={`${userData.firstName} ${userData.lastName}`}
                  className="w-full h-full object-cover"
                />
                <div 
                  className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  <Camera className="h-4 w-4" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              
              <h2 className="text-xl font-medium mb-1">{`${userData.firstName} ${userData.lastName}`}</h2>
              <p className="text-gray-500 mb-1">{userData.username}</p>
              <p className="text-gray-500">{userData.email}</p>
            </div>
          </div>
        </div>
        
        {/* Change Password Section */}
        <div className="bg-[#F1F7F7] p-6 rounded-lg">
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Change Password</h3>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="oldPassword" className="text-sm font-medium mb-1 block">Old Password*</label>
                <Input
                  id="oldPassword"
                  type="password"
                  placeholder="Enter your old password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="bg-[#F2FCE2] focus:ring-emerald-200 focus:border-emerald-300"
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="text-sm font-medium mb-1 block">New Password*</label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="bg-[#F2FCE2] focus:ring-emerald-200 focus:border-emerald-300"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="text-sm font-medium mb-1 block">Confirm New Password*</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-[#F2FCE2] focus:ring-emerald-200 focus:border-emerald-300"
                />
              </div>
              
              <div className="flex justify-center mt-6">
                <Button type="submit" className="bg-[#6FCF97] hover:bg-[#5EB286] text-white w-full">
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
