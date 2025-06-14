import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, User, Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: string;
  profile_pic: string;
  verified: boolean;
  created_at: string;
  updated_at: string | null;
}

const Spinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
  </div>
);

export default function ProfilePage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editedUser, setEditedUser] = useState({
    firstName: "",
    lastName: "",
    username: "",
  });
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser =
          localStorage.getItem("userData") ||
          sessionStorage.getItem("userData");

        if (!storedUser) {
          throw new Error("No user data found");
        }

        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        setEditedUser({
          firstName: parsedUser.first_name,
          lastName: parsedUser.last_name,
          username: parsedUser.username,
        });
      } catch (error) {
        console.error("Failed to load user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/profile/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              localStorage.getItem("authToken") ||
              sessionStorage.getItem("authToken")
            }`,
          },
          body: JSON.stringify({
            oldPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: "Success",
        description: "Password changed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/${userData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              localStorage.getItem("authToken") ||
              sessionStorage.getItem("authToken")
            }`,
          },
          body: JSON.stringify({
            first_name: editedUser.firstName,
            last_name: editedUser.lastName,
            username: editedUser.username,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      const updatedUser = {
        ...userData,
        first_name: editedUser.firstName,
        last_name: editedUser.lastName,
        username: editedUser.username,
      };

      const storage = localStorage.getItem("userData")
        ? localStorage
        : sessionStorage;

      storage.setItem("userData", JSON.stringify(updatedUser));
      setUserData(updatedUser);
      window.dispatchEvent(new CustomEvent("userUpdated"));

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        User data not available
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center mb-5 gap-2">
        <div className="flex items-center text-emerald-500">
          <User className="h-6 w-6 mr-2" />
          <h1 className="text-xl font-medium">Profile</h1>
        </div>
        <p className="text-gray-400 text-sm md:ml-2">Profile management</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Profile Display & Edit Section */}
        <div className="bg-[#F1F7F7] p-4 md:p-6 rounded-lg">
          <div className="bg-white rounded-lg p-6 md:p-10">
            <div className="flex justify-end mb-4">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-emerald-500 text-emerald-500 hover:bg-emerald-50 text-sm md:text-base"
                    size="sm"
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleProfileSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="firstName"
                            className="text-sm font-medium mb-1 block"
                          >
                            First Name *
                          </label>
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
                          <label
                            htmlFor="lastName"
                            className="text-sm font-medium mb-1 block"
                          >
                            Last Name *
                          </label>
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
                        <label
                          htmlFor="username"
                          className="text-sm font-medium mb-1 block"
                        >
                          Username *
                        </label>
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
                        <label
                          htmlFor="email"
                          className="text-sm font-medium mb-1 block"
                        >
                          Email
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={userData.email}
                          disabled
                          className="bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="role"
                          className="text-sm font-medium mb-1 block"
                        >
                          Role
                        </label>
                        <Input
                          id="role"
                          name="role"
                          value={userData.role}
                          disabled
                          className="bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        Save changes
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-emerald-100 mb-4">
                <img
                  src={userData.profile_pic}
                  alt={`${userData.first_name} ${userData.last_name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-lg md:text-xl font-medium mb-1 text-center">{`${userData.first_name} ${userData.last_name}`}</h2>
              <p className="text-gray-500 mb-1 text-center">{userData.username}</p>
              <p className="text-gray-500 text-center">{userData.email}</p>
              <p className="text-gray-500 mt-2 px-3 py-1 bg-gray-100 rounded-full text-xs md:text-sm">
                {userData.role}
              </p>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-[#F1F7F7] p-4 md:p-6 rounded-lg">
          <div className="bg-white rounded-lg p-4 md:p-6">
            <h3 className="text-lg font-medium mb-4">Change Password</h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-3 md:space-y-4">
              <div>
                <label
                  htmlFor="oldPassword"
                  className="text-sm font-medium mb-1 block"
                >
                  Old Password*
                </label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    placeholder="Enter your old password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="bg-[#F2FCE2] focus:ring-emerald-200 focus:border-emerald-300 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="text-sm font-medium mb-1 block"
                >
                  New Password*
                </label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="bg-[#F2FCE2] focus:ring-emerald-200 focus:border-emerald-300 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium mb-1 block"
                >
                  Confirm New Password*
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-[#F2FCE2] focus:ring-emerald-100 focus:border-emerald-300 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-center mt-4 md:mt-6">
                <Button
                  type="submit"
                  className="bg-green-500 hover:bg-green-400 text-white w-full"
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
}