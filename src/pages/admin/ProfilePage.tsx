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
import { Edit, User } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

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

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5001/api/user/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch user data");
        }

        setUserData(data.data);
        setEditedUser({
          firstName: data.data.first_name,
          lastName: data.data.last_name,
          username: data.data.username,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
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
        "http://localhost:5001/api/user/profile/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
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

    // Prepare the update payload with only changed fields
    const updatePayload: Record<string, string> = {};

    if (editedUser.firstName !== userData.first_name) {
      updatePayload.first_name = editedUser.firstName;
    }
    if (editedUser.lastName !== userData.last_name) {
      updatePayload.last_name = editedUser.lastName;
    }
    if (editedUser.username !== userData.username) {
      updatePayload.username = editedUser.username;
    }

    // Don't send request if nothing changed
    if (Object.keys(updatePayload).length === 0) {
      toast({
        title: "No changes",
        description: "No profile changes were made",
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/user/${userData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(updatePayload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      // Update local storage with any changed fields
      const userDataFromStorage = JSON.parse(
        localStorage.getItem("userData") || "{}"
      );
      const updatedUserData = { ...userDataFromStorage };

      if (updatePayload.first_name)
        updatedUserData.first_name = updatePayload.first_name;
      if (updatePayload.last_name)
        updatedUserData.last_name = updatePayload.last_name;
      if (updatePayload.username)
        updatedUserData.username = updatePayload.username;

      localStorage.setItem("userData", JSON.stringify(updatedUserData));

      // Update the displayed user data
      setUserData((prev) =>
        prev
          ? {
              ...prev,
              first_name: updatePayload.first_name || prev.first_name,
              last_name: updatePayload.last_name || prev.last_name,
              username: updatePayload.username || prev.username,
            }
          : null
      );

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        User data not available
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
        {/* Profile Display & Edit Section */}
        <div className="bg-[#F1F7F7] p-6 rounded-lg">
          <div className="bg-white rounded-lg p-10">
            <div className="flex justify-end mb-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-emerald-500 text-emerald-500 hover:bg-emerald-50"
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
                      <div className="grid grid-cols-2 gap-4">
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
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-100 mb-4">
                <img
                  src={userData.profile_pic}
                  alt={`${userData.first_name} ${userData.last_name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-medium mb-1">{`${userData.first_name} ${userData.last_name}`}</h2>
              <p className="text-gray-500 mb-1">{userData.username}</p>
              <p className="text-gray-500">{userData.email}</p>
              <p className="text-gray-500 mt-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                {userData.role}
              </p>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-[#F1F7F7] p-6 rounded-lg">
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Change Password</h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="oldPassword"
                  className="text-sm font-medium mb-1 block"
                >
                  Old Password*
                </label>
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
                <label
                  htmlFor="newPassword"
                  className="text-sm font-medium mb-1 block"
                >
                  New Password*
                </label>
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
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium mb-1 block"
                >
                  Confirm New Password*
                </label>
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
                <Button
                  type="submit"
                  className="bg-[#6FCF97] hover:bg-[#5EB286] text-white w-full"
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
